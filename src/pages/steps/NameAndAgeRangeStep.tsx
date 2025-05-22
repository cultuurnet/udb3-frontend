import { useRouter } from 'next/router';
import { Controller } from 'react-hook-form';
import * as yup from 'yup';

import { AudienceTypes } from '@/constants/AudienceType';
import { OfferTypes } from '@/constants/OfferType';
import { useGetEducationLevelsQuery } from '@/hooks/api/cultuurkuur';
import {
  useBulkUpdateOfferLabelsMutation,
  useChangeOfferNameMutation,
  useChangeOfferTypicalAgeRangeMutation,
} from '@/hooks/api/offers';
import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { CultuurkuurLabelsPicker } from '@/pages/steps/CultuurkuurLabelsPicker';
import { isLocationSet } from '@/pages/steps/LocationStep';
import { Place } from '@/types/Place';
import { AlertVariants } from '@/ui/Alert';
import { parseSpacing } from '@/ui/Box';
import { FormElement } from '@/ui/FormElement';
import { LabelsCheckboxTree } from '@/ui/LabelsCheckboxTree';
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
import { useMemo, useState } from 'react';
import { getUniqueLabels } from '@/utils/getUniqueLabels';
import { useGetEntityByIdAndScope } from '@/hooks/api/scope';
import { Offer } from '@/types/Offer';
import { Organizer } from '@/types/Organizer';
import { useQueryClient } from 'react-query';

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
  const { scope, offerId, getValues } = props;
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

  const levels = useGetEducationLevelsQuery();
  const isCultuurkuurEvent =
    scope === OfferTypes.EVENTS &&
    props.watch('audience.audienceType') === AudienceTypes.EDUCATION;

  const getEntityByIdQuery = useGetEntityByIdAndScope({
    id: offerId,
    scope: scope,
  });

  const entity: Offer | Organizer | undefined = getEntityByIdQuery.data;
  const formLabels = props.watch('labels');
  const labels = useMemo(
    () => (entity ? getUniqueLabels(entity) : formLabels) ?? [],
    [entity, formLabels],
  );

  const queryClient = useQueryClient();
  const updateLabels = useBulkUpdateOfferLabelsMutation({
    onSuccess: async () => await queryClient.invalidateQueries('events'),
  });

  const handleCultuurkuurLabelsChange = (newLabels: string[]) =>
    offerId
      ? updateLabels.mutate({ scope, offerId, labels: newLabels })
      : props.setValue('labels', newLabels);

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
                <CultuurkuurLabelsPicker
                  {...getStepProps(props)}
                  translationKey="education"
                  data={levels.data}
                  selected={labels}
                  onConfirm={handleCultuurkuurLabelsChange}
                />
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
