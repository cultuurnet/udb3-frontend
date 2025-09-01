import { useRouter } from 'next/router';
import { Controller } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { AudienceTypes } from '@/constants/AudienceType';
import { CULTUURKUUR_EDUCATION_LABELS_ERROR } from '@/constants/Cultuurkuur';
import { ErrorCodes } from '@/constants/ErrorCodes';
import { OfferTypes } from '@/constants/OfferType';
import {
  useCultuurkuurLabelsPickerProps,
  useGetEducationLevelsQuery,
} from '@/hooks/api/cultuurkuur';
import {
  useChangeOfferNameMutation,
  useChangeOfferTypicalAgeRangeMutation,
} from '@/hooks/api/offers';
import { CultuurkuurLabelsPicker } from '@/pages/steps/CultuurkuurLabelsPicker';
import { isLocationSet } from '@/pages/steps/LocationStep';
import { Place } from '@/types/Place';
import { AlertVariants } from '@/ui/Alert';
import { parseSpacing } from '@/ui/Box';
import { Link } from '@/ui/Link';
import { Stack } from '@/ui/Stack';
import { Text, TextVariants } from '@/ui/Text';
import { DuplicatePlaceErrorBody } from '@/utils/fetchFromApi';
import { parseOfferId } from '@/utils/parseOfferId';

import { AlertDuplicatePlace } from '../AlertDuplicatePlace';
import { AgeRangeStep } from './AgeRangeStep';
import { UseEditArguments } from './hooks/useEditField';
import { NameStep } from './NameStep';
import {
  FormDataUnion,
  getStepProps,
  StepProps,
  StepsConfiguration,
} from './Steps';

const numberHyphenNumberRegex = /^(\d*-)?\d*$/;

const useEditNameAndAgeRange = ({
  scope,
  onSuccess,
  offerId,
  mainLanguage,
}: UseEditArguments) => {
  const changeNameMutation = useChangeOfferNameMutation({
    onSuccess: () => onSuccess('basic_info'),
  });

  const changeTypicalAgeRangeMutation = useChangeOfferTypicalAgeRangeMutation({
    onSuccess: () => onSuccess('basic_info'),
  });

  return async ({ nameAndAgeRange }: FormDataUnion) => {
    const { name, typicalAgeRange } = nameAndAgeRange;

    if (typicalAgeRange) {
      await changeTypicalAgeRangeMutation.mutateAsync({
        eventId: offerId,
        typicalAgeRange,
        scope,
      });
    }

    await changeNameMutation.mutateAsync({
      id: offerId,
      lang: mainLanguage,
      name: name[mainLanguage],
      scope,
    });
  };
};

const NameAndAgeRangeStep = ({
  offerId,
  control,
  name,
  scope,
  error,
  watch,
  setValue,
  ...props
}: StepProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  const errorBody = error?.body as DuplicatePlaceErrorBody;
  const errorMessage = error?.message;

  const getPlaceIdFromDuplicatePlaceError = (errorMessage: string) => {
    if (errorMessage?.includes(ErrorCodes.DUPLICATE_PLACE_ERROR)) {
      const parsedMessage = JSON.parse(errorMessage);
      const placeUri = parsedMessage.find((message: string) =>
        message.includes('/place'),
      );
      return parseOfferId(placeUri);
    }

    return undefined;
  };

  const duplicatePlaceId = errorBody?.duplicatePlaceUri
    ? parseOfferId(errorBody.duplicatePlaceUri)
    : getPlaceIdFromDuplicatePlaceError(errorMessage);

  const duplicatePlaceQuery = (error?.body as DuplicatePlaceErrorBody)?.query
    ? error.body.query
    : undefined;

  const goToLocationDetailPage = (place: Place) => {
    const placeId = parseOfferId(place['@id']);
    router.push(`/place/${placeId}/preview`);
  };

  const isCultuurkuurEvent =
    scope === OfferTypes.EVENTS &&
    watch('audience.audienceType') === AudienceTypes.EDUCATION;

  const levels = useGetEducationLevelsQuery();
  const labelsPickerProps = useCultuurkuurLabelsPickerProps(
    { scope, offerId, setValue, watch },
    levels,
  );

  const isNewEventWithoutLabels =
    error?.message.includes(CULTUURKUUR_EDUCATION_LABELS_ERROR) &&
    !labelsPickerProps.hasEducationLabels;

  const isExistingEventWithoutLabels =
    offerId && !labelsPickerProps.hasEducationLabels;

  const isEducationLabelErrorVisible =
    isCultuurkuurEvent &&
    (isNewEventWithoutLabels || isExistingEventWithoutLabels);

  return (
    <Controller
      control={control}
      name={name}
      render={() => {
        return (
          <Stack spacing={4} maxWidth={parseSpacing(11)}>
            <NameStep
              {...getStepProps(props)}
              name={name}
              scope={scope}
              control={control}
            />
            {!isCultuurkuurEvent && (
              <AgeRangeStep
                {...getStepProps(props)}
                name={name}
                control={control}
              />
            )}
            {isCultuurkuurEvent && !levels.isLoading && (
              <>
                <Text fontWeight="bold" marginBottom={3}>
                  {t(`create.name_and_age.age.title`)}
                </Text>
                <CultuurkuurLabelsPicker
                  labelsKey="education"
                  {...labelsPickerProps}
                />
                <Text
                  variant={TextVariants.MUTED}
                  maxWidth={parseSpacing(9)}
                  marginTop={3}
                >
                  <Trans
                    i18nKey={'create.name_and_age.cultuurkuur.info'}
                    components={{
                      link1: (
                        <Link
                          css={`
                            text-decoration: underline;
                          `}
                          href={t('create.name_and_age.cultuurkuur.link')}
                        />
                      ),
                    }}
                  ></Trans>
                </Text>
                {isEducationLabelErrorVisible && (
                  <Text variant={TextVariants.ERROR}>
                    {t('cultuurkuur_modal.overview.error_education_levels')}
                  </Text>
                )}
              </>
            )}
            <AlertDuplicatePlace
              variant={AlertVariants.DANGER}
              placeId={duplicatePlaceId}
              query={duplicatePlaceQuery}
              labelKey="create.name_and_age.name.duplicate_place"
              onSelectPlace={goToLocationDetailPage}
            />
          </Stack>
        );
      }}
    />
  );
};

const nameAndAgeRangeStepConfiguration: StepsConfiguration<'nameAndAgeRange'> =
  {
    Component: NameAndAgeRangeStep,
    name: 'nameAndAgeRange',
    title: ({ t }) => t('create.name_and_age.title'),
    validation: yup.object().shape({
      name: yup.object().shape({}).required(),
      typicalAgeRange: yup.string().matches(numberHyphenNumberRegex),
    }),
    shouldShowStep: ({ watch, formState }) => {
      const location = watch('location');
      const scope = watch('scope');

      return isLocationSet(scope, location, formState);
    },
  };

export { nameAndAgeRangeStepConfiguration, useEditNameAndAgeRange };
