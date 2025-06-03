import { useRouter } from 'next/router';
import { Controller } from 'react-hook-form';
import * as yup from 'yup';

import { AudienceTypes } from '@/constants/AudienceType';
import { OfferTypes } from '@/constants/OfferType';
import {
  useCultuurkuurLabelsPickerProps,
  useGetEducationLevelsQuery,
} from '@/hooks/api/cultuurkuur';
import {
  useChangeOfferNameMutation,
  useChangeOfferTypicalAgeRangeMutation,
} from '@/hooks/api/offers';
import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { CultuurkuurLabelsPicker } from '@/pages/steps/CultuurkuurLabelsPicker';
import { isLocationSet } from '@/pages/steps/LocationStep';
import { Place } from '@/types/Place';
import { AlertVariants } from '@/ui/Alert';
import { parseSpacing } from '@/ui/Box';
import { Stack } from '@/ui/Stack';
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
import { useTranslation } from 'react-i18next';
import { Text } from '@/ui/Text';

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

const NameAndAgeRangeStep = ({ control, name, error, ...props }: StepProps) => {
  const { scope } = props;
  const { t } = useTranslation();
  const router = useRouter();
  const [isCultuurkuurFeatureFlagEnabled] = useFeatureFlag(
    FeatureFlags.CULTUURKUUR,
  );

  const duplicatePlaceId =
    (error?.body as DuplicatePlaceErrorBody) && error.body.duplicatePlaceUri
      ? parseOfferId(error.body.duplicatePlaceUri)
      : undefined;

  const duplicatePlaceQuery = (error?.body as DuplicatePlaceErrorBody)?.query
    ? error.body.query
    : undefined;

  const goToLocationDetailPage = (place: Place) => {
    const placeId = parseOfferId(place['@id']);
    router.push(`/place/${placeId}/preview`);
  };

  const isCultuurkuurEvent =
    scope === OfferTypes.EVENTS &&
    props.watch('audience.audienceType') === AudienceTypes.EDUCATION;

  const levels = useGetEducationLevelsQuery();
  const labelsPickerProps = useCultuurkuurLabelsPickerProps(props, levels);

  return (
    <Controller
      control={control}
      name={name}
      render={() => {
        return (
          <Stack spacing={4} maxWidth={parseSpacing(11)}>
            <NameStep {...getStepProps(props)} name={name} control={control} />
            {!isCultuurkuurEvent && (
              <AgeRangeStep
                {...getStepProps(props)}
                name={name}
                control={control}
              />
            )}
            {isCultuurkuurFeatureFlagEnabled &&
              isCultuurkuurEvent &&
              !levels.isLoading && (
                <>
                  <Text fontWeight="bold" marginBottom={2}>
                    {t(`create.name_and_age.age.title`)}
                  </Text>
                  <CultuurkuurLabelsPicker
                    labelsKey="education"
                    {...labelsPickerProps}
                  />
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
