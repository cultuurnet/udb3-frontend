import getConfig from 'next/config';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { AudienceTypes } from '@/constants/AudienceType';
import {
  CULTUURKUUR_EDUCATION_LABELS_ERROR,
  CULTUURKUUR_LOCATION_LABELS_ERROR,
  CULTUURKUUR_THEME_ERROR,
  CULTUURKUUR_TYPE_ERROR,
} from '@/constants/Cultuurkuur';
import { ErrorCodes } from '@/constants/ErrorCodes';
import { OfferType, OfferTypes } from '@/constants/OfferType';
import { useGetEventByIdQuery } from '@/hooks/api/events';
import { useGetPlaceByIdQuery } from '@/hooks/api/places';
import { useGetTypesByScopeQuery } from '@/hooks/api/types';
import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import {
  locationStepConfiguration,
  useEditLocation,
} from '@/pages/steps/LocationStep';
import { Event } from '@/types/Event';
import { hasLegacyLocation } from '@/types/Offer';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Button, ButtonVariants } from '@/ui/Button';
import { Inline } from '@/ui/Inline';
import { Link, LinkVariants } from '@/ui/Link';
import { Page } from '@/ui/Page';
import { Text } from '@/ui/Text';
import { getValueFromTheme } from '@/ui/theme';
import { Toast } from '@/ui/Toast';
import {
  getEducationLabels,
  getLocationLabels,
} from '@/utils/cultuurkuurLabels';
import { CustomValidationError, FetchError } from '@/utils/fetchFromApi';
import { getUniqueLabels } from '@/utils/getUniqueLabels';
import { parseOfferId } from '@/utils/parseOfferId';

import { useToast } from '../manage/movies/useToast';
import { DUPLICATE_STATUS_CODE } from '../PlaceAddModal';
import { calendarStepConfiguration } from './CalendarStep';
import { useAddOffer } from './hooks/useAddOffer';
import { useEditField } from './hooks/useEditField';
import { FooterStatus, useFooterStatus } from './hooks/useFooterStatus';
import { useParseStepConfiguration } from './hooks/useParseStepConfiguration';
import { usePublishOffer } from './hooks/usePublishOffer';
import { PublishLaterModal } from './modals/PublishLaterModal';
import { Steps, StepsConfiguration } from './Steps';

const getValue = getValueFromTheme('createPage');

const useRerenderTriggerStepsForm = () => {
  const router = useRouter();

  const [rerenderTrigger, setRerenderTrigger] = useState(
    Math.random().toString(),
  );

  // retrigger when ther users goes from edit to create page
  useEffect(() => {
    const handleRouteChange = (
      newPathname: string,
      options: Record<string, unknown>,
    ) => {
      if (options.shallow === true) {
        return;
      }

      if (
        !['/create', '/manage/movies/create'].some((prefix) =>
          newPathname.startsWith(prefix),
        )
      ) {
        return;
      }

      setRerenderTrigger(Math.random().toString());
    };

    router.events.on('beforeHistoryChange', handleRouteChange);

    return () => router.events.off('beforeHistoryChange', handleRouteChange);
  }, [router.asPath, router.events]);

  return rerenderTrigger;
};

type StepsFormProps = {
  configurations: Array<StepsConfiguration>;
  convertFormDataToOffer: (data: any) => any;
  convertOfferToFormData: (event: any) => any;
  toastConfiguration: any;
  title: string;
  scope: OfferType;
  label?: string;
};

const StepsForm = ({
  scope,
  configurations,
  convertFormDataToOffer,
  convertOfferToFormData,
  toastConfiguration,
  title,
  label,
}: StepsFormProps) => {
  const { t } = useTranslation();
  const { form } = useParseStepConfiguration(configurations);
  const [isDuplicateButtonDisabled, setIsDuplicateButtonDisabled] =
    useState(true);
  const [fetchErrors, setFetchErrors] = useState<Record<string, FetchError>>();
  const { publicRuntimeConfig } = getConfig();
  const eventName = publicRuntimeConfig.hotjarEventName;
  const missingFieldName = publicRuntimeConfig.hotjarMissingFieldName;
  const { handleSubmit, reset } = form;

  const { query, push, pathname, reload } = useRouter();

  // eventId is set after adding (saving) the event
  // or when entering the page from the edit route
  const offerId = useMemo(
    () => ((query.eventId as string) || (query.placeId as string)) ?? '',
    [query.eventId, query.placeId],
  );

  const isMovieForm = pathname.startsWith('/manage/movies');

  const toast = useToast(toastConfiguration);

  const useGetOfferQuery =
    scope === OfferTypes.EVENTS ? useGetEventByIdQuery : useGetPlaceByIdQuery;

  const offerQuery = useGetOfferQuery(
    {
      id: offerId,
    },
    {
      enabled: !!scope && !!offerId,
    },
  );

  const offer = offerQuery?.data;

  const stableReset = useCallback(reset, [reset]);

  useEffect(() => {
    if (offerQuery.isSuccess && offerQuery.data) {
      stableReset(convertOfferToFormData(offerQuery.data), {
        keepDirty: true,
        keepDirtyValues: true,
      });
    }
  }, [
    offerQuery.isSuccess,
    offerQuery.data,
    stableReset,
    convertOfferToFormData,
  ]);

  const publishOffer = usePublishOffer({
    scope,
    id: offerId,
    onSuccess: () => {
      const scopePath = scope === OfferTypes.EVENTS ? 'event' : 'place';

      const params =
        eventName && missingFieldName && !offer?.[`${missingFieldName}`]
          ? { hj: eventName }
          : {};

      const searchParams = new URLSearchParams(params);

      push(`/${scopePath}/${offerId}/preview?${searchParams.toString()}`);
    },
  });

  const editLocation = useEditLocation({
    scope,
    offerId,
    onSuccess: () => reload(),
    mainLanguage: offer?.mainLanguage,
  });

  const migrateOffer = async (data) => {
    await editLocation(data);
    reload();
  };
  const [isReactEventPreviewFeatureFlagEnabled] = useFeatureFlag(
    FeatureFlags.REACT_EVENT_PREVIEW,
  );

  const doneEditingLink = isReactEventPreviewFeatureFlagEnabled
    ? `/events/${offerId}?edited=true`
    : `/event/${offerId}/preview?edited=true`;

  const footerStatus = useFooterStatus({ offer, form });

  const isOnDuplicatePage = footerStatus === FooterStatus.DUPLICATE;

  const initialOffer = isOnDuplicatePage ? offer : undefined;

  const isCultuurkuurEvent =
    offer?.audience?.audienceType === AudienceTypes.EDUCATION;

  const isCultuurkuurEventTypeSelected =
    form.getValues('typeAndTheme.type') || offer?.terms?.length > 0;

  const labels = getUniqueLabels(offer);

  const CULTUURKUUR_LOCATION_ID = publicRuntimeConfig.cultuurKuurLocationId;

  const locationId = parseOfferId((offer as Event)?.location?.['@id'] ?? '');

  const hasCultuurkuurLocationLabels =
    CULTUURKUUR_LOCATION_ID !== locationId
      ? true
      : getLocationLabels(labels).length > 0;

  const hasCultuurkuurEducationLabels = getEducationLabels(labels).length > 0;

  const getTypesByScopeQuery = useGetTypesByScopeQuery({
    scope,
  });

  const eventTypes = getTypesByScopeQuery.data;

  const hasEventThemes =
    eventTypes
      ?.filter((eventType) =>
        offer?.terms?.some((term) => term.id === eventType.id),
      )
      .map((eventType) => eventType.otherSuggestedTerms ?? [])
      .flat().length > 0;

  const hasSelectedThemes = eventTypes?.some((eventType) =>
    eventType.otherSuggestedTerms?.some((suggestedTerm) =>
      offer?.terms?.some((term) => term.id === suggestedTerm.id),
    ),
  );

  const isCultuurkuurThemeSelected = !hasEventThemes || hasSelectedThemes;

  const isButtonDisabled =
    isCultuurkuurEvent &&
    (!hasCultuurkuurEducationLabels ||
      !hasCultuurkuurLocationLabels ||
      !isCultuurkuurEventTypeSelected ||
      !isCultuurkuurThemeSelected);

  const addOffer = useAddOffer({
    onSuccess: async (scope, offerId) => {
      setFetchErrors(undefined);
      const url = isMovieForm
        ? `/manage/movies/${offerId}/edit`
        : `/${scope}/${offerId}/edit`;
      await push(url, undefined, { scroll: false });
      // TODO: Remove need for full reload, see III-6173
      reload();
    },
    onError: (error) => {
      const newErrors: Record<string, any> = {};

      const { status, message } = error;

      const parsedMessage = (() => {
        try {
          return JSON.parse(message);
        } catch {
          return message;
        }
      })();

      if (
        status === DUPLICATE_STATUS_CODE ||
        parsedMessage?.includes(CULTUURKUUR_EDUCATION_LABELS_ERROR) ||
        parsedMessage?.includes(ErrorCodes.DUPLICATE_PLACE_ERROR)
      ) {
        newErrors.nameAndAgeRange = error;
      }

      if (parsedMessage?.includes(CULTUURKUUR_LOCATION_LABELS_ERROR)) {
        newErrors.location = error;
      }

      if (parsedMessage?.includes(CULTUURKUUR_TYPE_ERROR)) {
        newErrors.typeAndTheme = error;
      }

      if (parsedMessage?.includes(CULTUURKUUR_THEME_ERROR)) {
        newErrors.typeAndTheme = error;
      }

      if (Object.keys(newErrors).length) {
        setFetchErrors(newErrors);
      }
    },
    convertFormDataToOffer,
    label,
    initialOffer,
  });

  const handleChangeSuccess = (editedField: string) => {
    setFetchErrors(undefined);
    toast.trigger(editedField);
  };

  const { handleChange, fieldLoading } = useEditField({
    scope,
    offerId,
    handleSubmit,
    onSuccess: handleChangeSuccess,
    onError: (error: CustomValidationError) => {
      const newErrors: Record<string, any> = {};

      const { message, body } = error;

      if (
        message.includes(ErrorCodes.DUPLICATE_PLACE_ERROR) &&
        body.type === 'Location'
      ) {
        newErrors.location = error;
      }
      if (
        message.includes(ErrorCodes.DUPLICATE_PLACE_ERROR) &&
        body.type === 'NameAndAgeRange'
      ) {
        newErrors.nameAndAgeRange = error;
      }
      setFetchErrors(newErrors);
    },
  });

  const [isPublishLaterModalVisible, setIsPublishLaterModalVisible] =
    useState(false);

  // scroll effect
  useEffect(() => {
    if (footerStatus === FooterStatus.HIDDEN) {
      return;
    }

    const main = document.querySelector('main');
    main.scroll({ left: 0, top: main.scrollHeight, behavior: 'smooth' });
  }, [footerStatus]);

  const publishLaterButton = (
    <Button
      variant={ButtonVariants.SECONDARY}
      onClick={() => setIsPublishLaterModalVisible(true)}
      key="publishLater"
      disabled={isButtonDisabled}
    >
      {t('create.actions.publish_later')}
    </Button>
  );

  const pageTitle = isOnDuplicatePage ? t('create.duplicate.title') : title;

  const onDuplicateEditFieldChange = () => {
    setIsDuplicateButtonDisabled(false);
  };

  const onChange = isOnDuplicatePage
    ? onDuplicateEditFieldChange
    : handleChange;

  const needsLocationMigration = hasLegacyLocation(offer);

  const stepConfigurations = useMemo(() => {
    if (needsLocationMigration) return [locationStepConfiguration];

    if (isOnDuplicatePage) return [calendarStepConfiguration];

    return configurations;
  }, [needsLocationMigration, isOnDuplicatePage, configurations]);

  return (
    <Page>
      {!needsLocationMigration && (
        <Page.Title spacing={3} alignItems="center">
          {pageTitle}
        </Page.Title>
      )}

      <Page.Content spacing={5} alignItems="flex-start">
        {isOnDuplicatePage && (
          <Alert variant={AlertVariants.PRIMARY}>
            {t('create.duplicate.alert')}
          </Alert>
        )}
        <Toast
          variant="success"
          body={toast.message}
          visible={!!toast.message}
          onClose={() => toast.clear()}
        />
        {needsLocationMigration && (
          <Alert variant={AlertVariants.DANGER} marginY={5}>
            <Trans
              i18nKey="create.migration.alert"
              components={{
                boldText: <Text fontWeight="bold" />,
              }}
            />
          </Alert>
        )}
        <Steps
          configurations={stepConfigurations}
          onChange={onChange}
          fieldLoading={fieldLoading}
          onChangeSuccess={handleChangeSuccess}
          offerId={offerId}
          mainLanguage={offer?.mainLanguage}
          scope={scope}
          form={form}
          errors={fetchErrors}
        />
      </Page.Content>
      {footerStatus !== FooterStatus.HIDDEN && (
        <Page.Footer>
          <Inline spacing={3} alignItems="center">
            {footerStatus === FooterStatus.DUPLICATE && (
              <Button
                disabled={isDuplicateButtonDisabled}
                variant={ButtonVariants.SUCCESS}
                onClick={handleSubmit(addOffer)}
              >
                {t('create.duplicate.title')}
              </Button>
            )}
            {footerStatus === FooterStatus.PUBLISH && [
              <Button
                variant={ButtonVariants.SUCCESS}
                disabled={isButtonDisabled}
                onClick={() => {
                  publishOffer();
                }}
                key="publish"
              >
                {t('create.actions.publish')}
              </Button>,
              publishLaterButton,
              <Text
                key="info"
                color={getValue('footer.color')}
                fontSize="0.9rem"
              >
                {t('create.footer.auto_save')}
              </Text>,
            ]}
            {footerStatus === FooterStatus.MANUAL_SAVE && (
              <Button onClick={handleSubmit(addOffer)}>
                {t('create.actions.save')}
              </Button>
            )}
            {footerStatus === FooterStatus.CONTINUE && (
              <Button onClick={handleSubmit(migrateOffer)}>
                {t('create.migration.continue')}
              </Button>
            )}
            {footerStatus === FooterStatus.AUTO_SAVE && (
              <Inline spacing={3} alignItems="center">
                <Link
                  href={doneEditingLink}
                  variant={LinkVariants.BUTTON_SUCCESS}
                >
                  <Text>{t('create.footer.done_editing')}</Text>
                </Link>
                {publishLaterButton}
                <Text color={getValue('footer.color')} fontSize="0.9rem">
                  {t('create.footer.auto_save')}
                </Text>
              </Inline>
            )}
          </Inline>
          <PublishLaterModal
            scope={scope}
            offerId={offerId}
            offer={offer}
            visible={isPublishLaterModalVisible}
            onClose={() => setIsPublishLaterModalVisible(false)}
          />
        </Page.Footer>
      )}
    </Page>
  );
};

export { StepsForm, useRerenderTriggerStepsForm };
