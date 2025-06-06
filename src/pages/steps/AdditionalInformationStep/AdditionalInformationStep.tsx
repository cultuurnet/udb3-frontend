import { mapValues, sortBy } from 'lodash';
import { useRouter } from 'next/router';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

import { AudienceTypes } from '@/constants/AudienceType';
import { Scope, ScopeTypes } from '@/constants/OfferType';
import { useGetOfferByIdQuery } from '@/hooks/api/offers';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { CultuurKuurStep } from '@/pages/steps/AdditionalInformationStep/CultuurKuurStep';
import { LabelsStep } from '@/pages/steps/AdditionalInformationStep/LabelsStep';
import { PhysicalLocationStep } from '@/pages/steps/AdditionalInformationStep/PhysicalLocationStep';
import { Offer } from '@/types/Offer';
import type { Values } from '@/types/Values';
import { parseSpacing } from '@/ui/Box';
import { Icon, Icons } from '@/ui/Icon';
import { getInlineProps, Inline, InlineProps } from '@/ui/Inline';
import { getStackProps, Stack, StackProps } from '@/ui/Stack';
import { Tabs } from '@/ui/Tabs';
import { Text } from '@/ui/Text';
import { getValueFromTheme } from '@/ui/theme';
import { hasCultuurkuurOrganizerLabel } from '@/utils/hasCultuurkuurOrganizerLabel';

import { AudienceStep } from '../AudienceStep';
import { StepsConfiguration } from '../Steps';
import { BookingInfoStep } from './BookingInfoStep';
import { ContactInfoStep } from './ContactInfoStep';
import { DescriptionStep } from './DescriptionStep';
import { FormScore } from './FormScore';
import { MediaStep } from './MediaStep';
import { OrganizerStep } from './OrganizerStep';
import { PriceInformation } from './PriceInformation';

const getGlobalValue = getValueFromTheme('global');

const AdditionalInformationStepVariant = {
  MOVIE: 'movie',
  EVENT: 'event',
  PLACE: 'place',
  ORGANIZER: 'organizer',
} as const;

const Fields = {
  DESCRIPTION: 'description',
  ORGANIZER: 'organizer',
  CONTACT_INFO: 'contact_info',
  BOOKING_INFO: 'booking_info',
  PRICE_INFO: 'price_info',
  MEDIA: 'media',
  AUDIENCE: 'audience',
  LABELS: 'labels',
  LOCATION: 'location',
  CULTUURKUUR: 'cultuurkuur',
};

type Field = Values<typeof Fields>;

type TabContentProps = {
  offerId?: string;
  scope?: Scope;
  field?: string;
  onSuccessfulChange: (
    data?: any,
  ) => typeof data extends any ? void : Promise<void>;
  onValidationChange?: (status: ValidationStatus, field: string) => void;
};

type TabConfig = {
  field: Field;
  titleKey?: string;
  TabContent: FC<TabContentProps & { [prop: string]: unknown }>;
  shouldShowOn?: Values<typeof AdditionalInformationStepVariant>[];
  shouldInvalidate: boolean;
  stepProps?: Record<string, unknown>;
};

const tabConfigurations: TabConfig[] = [
  {
    field: Fields.DESCRIPTION,
    TabContent: DescriptionStep,
    shouldInvalidate: true,
  },
  {
    field: Fields.MEDIA,
    TabContent: MediaStep,
    shouldInvalidate: true,
  },
  {
    field: Fields.PRICE_INFO,
    TabContent: PriceInformation,
    shouldInvalidate: true,
    shouldShowOn: [
      AdditionalInformationStepVariant.EVENT,
      AdditionalInformationStepVariant.PLACE,
      AdditionalInformationStepVariant.MOVIE,
    ],
  },
  {
    field: Fields.ORGANIZER,
    TabContent: OrganizerStep,
    shouldInvalidate: true,
    shouldShowOn: [
      AdditionalInformationStepVariant.EVENT,
      AdditionalInformationStepVariant.PLACE,
      AdditionalInformationStepVariant.MOVIE,
    ],
  },
  {
    field: Fields.CONTACT_INFO,
    TabContent: ContactInfoStep,
    shouldInvalidate: false,
  },
  {
    field: Fields.BOOKING_INFO,
    TabContent: BookingInfoStep,
    shouldInvalidate: false,
    shouldShowOn: [
      AdditionalInformationStepVariant.EVENT,
      AdditionalInformationStepVariant.PLACE,
      AdditionalInformationStepVariant.MOVIE,
    ],
  },
  {
    field: Fields.LOCATION,
    TabContent: PhysicalLocationStep,
    titleKey: 'create.additionalInformation.location.title_organizer',
    shouldInvalidate: false,
    shouldShowOn: [AdditionalInformationStepVariant.ORGANIZER],
  },
  {
    field: Fields.LABELS,
    TabContent: LabelsStep,
    shouldInvalidate: false,
    shouldShowOn: [
      AdditionalInformationStepVariant.EVENT,
      AdditionalInformationStepVariant.ORGANIZER,
    ],
  },
  {
    field: Fields.AUDIENCE,
    TabContent: AudienceStep,
    shouldInvalidate: true,
    shouldShowOn: [
      AdditionalInformationStepVariant.EVENT,
      AdditionalInformationStepVariant.MOVIE,
    ],
  },
  {
    field: Fields.CULTUURKUUR,
    TabContent: CultuurKuurStep,
    shouldInvalidate: true,
    shouldShowOn: [AdditionalInformationStepVariant.ORGANIZER],
  },
];

type TabTitleProps = InlineProps & {
  scope: Scope;
  field: Field;
  titleKey?: string;
  validationStatus: ValidationStatus;
};

const TabTitle = ({
  scope,
  field,
  validationStatus,
  titleKey,
  ...props
}: TabTitleProps) => {
  const { t } = useTranslation();

  const title = titleKey
    ? t(titleKey)
    : t(`create.additionalInformation.${field}.title`);

  return (
    <Inline spacing={3} {...getInlineProps(props)}>
      {validationStatus === ValidationStatus.SUCCESS && (
        <Icon
          name={Icons.CHECK_CIRCLE}
          color={getGlobalValue('successColor')}
        />
      )}
      {validationStatus === ValidationStatus.WARNING && (
        <Icon
          name={Icons.EXCLAMATION_CIRCLE}
          color={getGlobalValue('warningIcon')}
        />
      )}
      <Text>
        {scope === ScopeTypes.ORGANIZERS && field === Fields.MEDIA
          ? t('organizers.create.step2.pictures.title')
          : title}
      </Text>
    </Inline>
  );
};

type Props = StackProps & {
  offerId: string;
  scope: Scope;
  onChangeSuccess: (field: Field) => void;
  variant?: Values<typeof AdditionalInformationStepVariant>;
  labels?: string[];
};

const organizerTabOrder = [
  Fields.CONTACT_INFO,
  Fields.DESCRIPTION,
  Fields.MEDIA,
  Fields.LOCATION,
  Fields.LABELS,
  Fields.CULTUURKUUR,
];

export const ValidationStatus = {
  NONE: 'none',
  WARNING: 'warning',
  SUCCESS: 'success',
} as const;

export type ValidationStatus = Values<typeof ValidationStatus>;

const initialValidatedFields: Record<Field, ValidationStatus> = {
  description: ValidationStatus.NONE,
  audience: ValidationStatus.NONE,
  contact_info: ValidationStatus.NONE,
  media: ValidationStatus.NONE,
  organizer: ValidationStatus.NONE,
  price_info: ValidationStatus.NONE,
  booking_info: ValidationStatus.NONE,
  contact_point: ValidationStatus.NONE,
};

const AdditionalInformationStep = ({
  offerId,
  scope,
  onChangeSuccess,
  variant,
  labels,
  ...props
}: Props) => {
  const { asPath, ...router } = useRouter();
  const containerRef = useRef(null);
  const entry = useIntersectionObserver(containerRef, {
    freezeOnceVisible: true,
  });
  const isVisible = !!entry?.isIntersecting;

  const queryClient = useQueryClient();

  const invalidateOfferQuery = useCallback(
    async (field: Field, shouldInvalidate: boolean) => {
      if (shouldInvalidate) {
        await queryClient.invalidateQueries([scope, { id: offerId }]);
      }
      onChangeSuccess?.(field);
    },
    [scope, offerId, queryClient, onChangeSuccess],
  );

  const isOrganizer = scope === ScopeTypes.ORGANIZERS;
  const [tab, setTab] = useState(
    isOrganizer ? Fields.CONTACT_INFO : Fields.DESCRIPTION,
  );

  const getOfferByIdQuery = useGetOfferByIdQuery(
    { id: offerId, scope },
    { refetchOnWindowFocus: false },
  );

  const offer: Offer | undefined = getOfferByIdQuery.data;

  const isCultuurkuurEvent =
    offer?.audience?.audienceType === AudienceTypes.EDUCATION;

  const [, hash] = asPath.split('#');

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    // no scroll to when it's already visible on the screen
    if (isVisible) {
      return;
    }

    containerRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [isVisible]);

  useEffect(() => {
    if (isOrganizer) {
      handleScroll();
    }

    if (!hash || !Object.values(Fields).some((field) => hash === field)) return;
    setTab(hash);
    handleScroll();
  }, [hash, isOrganizer, handleScroll]);

  const handleSelectTab = (tab: string) => {
    router.push({ hash: tab }, undefined, { shallow: true });
  };

  const [validatedFields, setValidatedFields] = useState(
    initialValidatedFields,
  );

  const handleValidationChange = useCallback(
    (status: ValidationStatus, field: string) => {
      setValidatedFields((prev) => ({
        ...prev,
        [field]: status,
      }));
    },
    [],
  );

  const orderedTabs = useMemo(
    () =>
      scope !== ScopeTypes.ORGANIZERS
        ? tabConfigurations
        : sortBy(tabConfigurations, (tabConfig) =>
            organizerTabOrder.indexOf(tabConfig.field),
          ),
    [scope],
  );

  return (
    <Stack ref={containerRef} {...getStackProps(props)}>
      <Tabs
        activeKey={tab}
        onSelect={handleSelectTab}
        css={`
          .tab-content {
            padding-top: ${parseSpacing(4)};
          }
        `}
      >
        {orderedTabs.map(
          ({
            shouldShowOn,
            field,
            titleKey,
            shouldInvalidate,
            TabContent,
            stepProps,
          }) => {
            if (
              field === Fields.CULTUURKUUR &&
              !hasCultuurkuurOrganizerLabel(labels)
            ) {
              return null;
            }

            const shouldShowTab = shouldShowOn
              ? shouldShowOn.includes(variant)
              : true;

            if (!shouldShowTab) return null;

            if (field === 'audience' && isCultuurkuurEvent) return null;

            return (
              <Tabs.Tab
                key={field}
                eventKey={field}
                title={
                  <TabTitle
                    scope={scope}
                    field={field}
                    titleKey={titleKey}
                    validationStatus={validatedFields[field]}
                  />
                }
              >
                <TabContent
                  minHeight={isOrganizer ? '600px' : '450px'}
                  offerId={offerId}
                  scope={scope}
                  field={field}
                  onValidationChange={handleValidationChange}
                  onSuccessfulChange={() =>
                    invalidateOfferQuery(field, shouldInvalidate)
                  }
                  {...props}
                  {...stepProps}
                />
              </Tabs.Tab>
            );
          },
        )}
      </Tabs>
      <FormScore
        offerId={offerId}
        scope={scope}
        completedFields={mapValues(
          validatedFields,
          (value) => value === ValidationStatus.SUCCESS,
        )}
      />
    </Stack>
  );
};

const additionalInformationStepConfiguration: StepsConfiguration = {
  Component: AdditionalInformationStep,
  title: ({ t, scope }) => t(`create.additionalInformation.title.${scope}`),
  variant: AdditionalInformationStepVariant.EVENT,
};

export type { Field, TabContentProps };

export {
  additionalInformationStepConfiguration,
  AdditionalInformationStepVariant,
};
