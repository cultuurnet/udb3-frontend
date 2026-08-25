import { FormEvent } from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { SupportedLanguage } from '@/i18n/index';
import { FormElement } from '@/ui/FormElement';
import { Input } from '@/ui/Input';
import { getStackProps, Stack, StackProps } from '@/ui/Stack';

import { StepProps } from './Steps';

type NameStepProps = StackProps & StepProps;

const NameStep = ({
  formState: { errors },
  control,
  scope,
  onChange,
  setValue,
  mainLanguage,
  ...props
}: NameStepProps) => {
  const { t, i18n } = useTranslation();

  const language = (mainLanguage ?? i18n.language) as SupportedLanguage;
  const nameAndAgeRange = useWatch({ control, name: 'nameAndAgeRange' });

  const updateName = (event: FormEvent<HTMLInputElement>) => {
    setValue(
      'nameAndAgeRange',
      {
        ...nameAndAgeRange,
        name: {
          [language]: (event.target as HTMLInputElement).value,
        } as Record<SupportedLanguage, string>,
      },
      { shouldDirty: true, shouldValidate: true },
    );
  };

  return (
    <Stack {...getStackProps(props)}>
      <Stack spacing={2}>
        <FormElement
          label={t(`create.name_and_age.name.title_${scope}`)}
          className="tw:flex-2"
          id="event-name"
          maxLength={90}
          Component={
            <Input
              value={nameAndAgeRange?.name?.[language] || ''}
              onChange={updateName}
              onBlur={(event: FormEvent<HTMLInputElement>) => {
                updateName(event);
                onChange(undefined);
              }}
            />
          }
          info={t(`create.name_and_age.name.tip_${scope}`)}
          error={
            errors.nameAndAgeRange?.name &&
            t('create.name_and_age.validation_messages.name.required')
          }
        />
      </Stack>
    </Stack>
  );
};

export { NameStep };
