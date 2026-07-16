import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { AudienceType, AudienceTypes } from '@/constants/AudienceType';
import {
  useChangeAudienceMutation,
  useGetEventByIdQuery,
} from '@/hooks/api/events';
import { ValidationStatus } from '@/pages/steps/AdditionalInformationStep/AdditionalInformationStep';
import { Event } from '@/types/Event';
import { RadioButtonGroup } from '@/ui/RadioButtonGroup';
import { getStackProps, Stack, StackProps } from '@/ui/Stack';
import { Text } from '@/ui/Text';

import { TabContentProps } from './AdditionalInformationStep';

type Props = StackProps & TabContentProps;

type FormData = { audienceType: string };

const schema = yup.object({
  audienceType: yup
    .mixed<AudienceType>()
    .oneOf(Object.values(AudienceTypes))
    .required(),
});

const AudienceStep = ({
  offerId,
  field,
  onSuccessfulChange,
  onValidationChange,
  ...props
}: Props) => {
  const { t } = useTranslation();

  const { control, setValue } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const watchedAudienceType = useWatch({ control, name: 'audienceType' });

  const getEventByIdQuery = useGetEventByIdQuery({ id: offerId });

  const event: Event | undefined = getEventByIdQuery.data;

  useEffect(() => {
    const newAudienceType =
      event?.audience?.audienceType ?? AudienceTypes.EVERYONE;
    setValue('audienceType', newAudienceType);

    onValidationChange(ValidationStatus.SUCCESS, field);
  }, [field, event?.audience?.audienceType, setValue, onValidationChange]);

  const addAudienceMutation = useChangeAudienceMutation({
    onSuccess: onSuccessfulChange,
  });

  const handleOnChangeAudience = async (audienceType: AudienceType) => {
    setValue('audienceType', audienceType);

    await addAudienceMutation.mutateAsync({
      eventId: offerId,
      audienceType,
    });
  };

  return (
    <Stack {...getStackProps(props)}>
      <Stack spacing={3} marginBottom={3}>
        <Text fontWeight="bold">
          {t('create.additionalInformation.audience.title')}
        </Text>
        <RadioButtonGroup
          name="audienceType"
          selected={watchedAudienceType}
          onValueChange={(value) =>
            handleOnChangeAudience(value as AudienceType)
          }
          items={Object.values(AudienceTypes)
            .filter((type) => type !== AudienceTypes.EDUCATION)
            .map((type) => ({
              value: type,
              label: t(`create.additionalInformation.audience.${type}`),
              content: type !== AudienceTypes.EVERYONE && (
                <Text variant="muted" maxWidth="30%">
                  {t(`create.additionalInformation.audience.help.${type}`)}
                </Text>
              ),
            }))}
        />
      </Stack>
    </Stack>
  );
};
export { AudienceStep };
