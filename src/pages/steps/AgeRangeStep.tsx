import { format, isBefore, parse, startOfDay } from 'date-fns';
import { FormEvent, useEffect, useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { css } from 'styled-components';

import { AgeRanges } from '@/constants/AgeRange';
import { useDeleteOfferBirthdateRangeMutation } from '@/hooks/api/offers';
import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Values } from '@/types/Values';
import { Button, ButtonVariants } from '@/ui/Button';
import { DatePicker } from '@/ui/DatePicker';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Label, LabelVariants } from '@/ui/Label';
import { getStackProps, Stack, StackProps } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { getValueFromTheme } from '@/ui/theme';
import { ToggleGroup } from '@/ui/ToggleGroup';

import { AgeRangeStepLegacy } from './AgeRangeStepLegacy';
import { Field, StepProps } from './Steps';

const AgeInputModes = {
  AGE: 'age',
  DATE_OF_BIRTH: 'date_of_birth',
} as const;

type AgeInputMode = Values<typeof AgeInputModes>;

const MAX_AGE = 120;
const AGE_PATTERN = /^\d+$/;

const getValue = getValueFromTheme('ageRange');

type AgeRangeStepProps = StackProps & StepProps;

const parseAge = (value: string): number | undefined =>
  value === '' ? undefined : Number(value);

const validateAgeRange = (min: string, max: string): string | null => {
  if (
    (min !== '' && !AGE_PATTERN.test(min)) ||
    (max !== '' && !AGE_PATTERN.test(max))
  ) {
    return 'create.name_and_age.age.error_invalid';
  }

  const minNum = parseAge(min);
  const maxNum = parseAge(max);

  if (
    (minNum !== undefined && minNum > MAX_AGE) ||
    (maxNum !== undefined && maxNum > MAX_AGE)
  ) {
    return 'create.name_and_age.age.error_max_age';
  }

  if (minNum !== undefined && maxNum !== undefined && maxNum < minNum) {
    return 'create.name_and_age.age.error_max_lower_than_min';
  }

  return null;
};

const isValidAgeRange = (typicalAgeRange: string | undefined): boolean => {
  if (!typicalAgeRange) return true;
  const [min, max] = typicalAgeRange.split('-');
  return validateAgeRange(min ?? '', max ?? '') === null;
};

const findPresetKey = (typicalAgeRange: string | undefined): string | null => {
  if (!typicalAgeRange) return null;
  if (typicalAgeRange === '0-' || typicalAgeRange === '-') return 'ALL';
  return (
    Object.keys(AgeRanges).find(
      (key) => AgeRanges[key].apiLabel === typicalAgeRange,
    ) ?? null
  );
};

const AgeRangeStep = (props: AgeRangeStepProps) => {
  const [isBoaEnabled] = useFeatureFlag(FeatureFlags.BOA);

  if (!isBoaEnabled) {
    return <AgeRangeStepLegacy {...props} />;
  }

  return <AgeRangeStepBoa {...props} />;
};

const AgeRangeStepBoa = ({
  control,
  onChange,
  offerId,
  scope,
  ...props
}: AgeRangeStepProps) => {
  const { t } = useTranslation();
  const deleteBirthdateRangeMutation = useDeleteOfferBirthdateRangeMutation();

  const [inputMode, setInputMode] = useState<AgeInputMode>(AgeInputModes.AGE);
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [minBirthDate, setMinBirthDate] = useState<Date | undefined>(undefined);
  const [maxBirthDate, setMaxBirthDate] = useState<Date | undefined>(undefined);

  const watchedTypicalAgeRange = useWatch({
    control,
    name: 'nameAndAgeRange.typicalAgeRange',
  });
  const watchedBirthdateRange = useWatch({
    control,
    name: 'nameAndAgeRange.birthdateRange',
  });

  useEffect(() => {
    if (!watchedTypicalAgeRange) return;

    const [min, max] = watchedTypicalAgeRange.split('-');
    setMinAge(min ?? '');
    setMaxAge(max ?? '');
  }, [watchedTypicalAgeRange]);

  useEffect(() => {
    if (!watchedBirthdateRange?.from || !watchedBirthdateRange?.to) return;

    setMinBirthDate(
      parse(watchedBirthdateRange.from, 'yyyy-MM-dd', new Date()),
    );
    setMaxBirthDate(parse(watchedBirthdateRange.to, 'yyyy-MM-dd', new Date()));
    setInputMode(AgeInputModes.DATE_OF_BIRTH);
  }, [watchedBirthdateRange]);

  const commitTypicalAgeRange = (
    field: Field,
    value: string,
    min: string,
    max: string,
  ) => {
    field.onChange({ ...field.value, typicalAgeRange: value });

    if (validateAgeRange(min, max)) return;

    onChange({ ...field.value, typicalAgeRange: value });
  };

  const commitAgeRange = (field: Field, newMin: string, newMax: string) => {
    const value = !newMin && !newMax ? '' : `${newMin}-${newMax}`;
    commitTypicalAgeRange(field, value, newMin, newMax);
  };

  const handlePresetClick = (field: Field, apiLabel: string) => {
    const [min, max] = apiLabel.split('-');
    setMinAge(min ?? '');
    setMaxAge(max ?? '');

    commitTypicalAgeRange(field, apiLabel, min ?? '', max ?? '');
  };

  const commitBirthdateRange = (
    field: Field,
    newMin: Date | undefined,
    newMax: Date | undefined,
  ) => {
    setMinBirthDate(newMin);
    setMaxBirthDate(newMax);

    const nextValue = {
      ...field.value,
      birthdateRange:
        newMin && newMax && !isBefore(startOfDay(newMax), startOfDay(newMin))
          ? {
              from: format(newMin, 'yyyy-MM-dd'),
              to: format(newMax, 'yyyy-MM-dd'),
            }
          : undefined,
    };

    field.onChange(nextValue);
    onChange(nextValue);
  };

  return (
    <Stack {...getStackProps(props)}>
      <Controller
        name={'nameAndAgeRange'}
        control={control}
        render={({ field }) => {
          const selectedPreset = findPresetKey(field.value?.typicalAgeRange);
          const errorKey = validateAgeRange(minAge, maxAge);

          return (
            <Stack spacing={2}>
              <Text fontWeight="bold">
                {t(`create.name_and_age.age.title`)}
              </Text>
              <ToggleGroup
                name="age-input-mode"
                value={inputMode}
                onChange={(newMode: string) => {
                  const next = newMode as AgeInputMode;
                  setInputMode(next);

                  if (next === AgeInputModes.DATE_OF_BIRTH) {
                    setMinBirthDate((current) => current ?? new Date());
                    setMaxBirthDate((current) => current ?? new Date());
                    return;
                  }

                  const previousBirthdateRange = field.value?.birthdateRange;

                  field.onChange({ ...field.value, birthdateRange: undefined });
                  onChange({ ...field.value, birthdateRange: undefined });

                  if (offerId && previousBirthdateRange) {
                    deleteBirthdateRangeMutation.mutate(
                      { eventId: offerId, scope },
                      {
                        onError: () => {
                          field.onChange({
                            ...field.value,
                            birthdateRange: previousBirthdateRange,
                          });
                          setInputMode(AgeInputModes.DATE_OF_BIRTH);
                        },
                      },
                    );
                  }
                }}
                options={Object.values(AgeInputModes).map((mode) => ({
                  value: mode,
                  label: t(`create.name_and_age.age.input_mode.${mode}`),
                }))}
                maxWidth="40rem"
                css={`
                  margin-bottom: 1rem;
                `}
              />
              {inputMode === AgeInputModes.DATE_OF_BIRTH ? (
                <Stack spacing={3} maxWidth="40rem">
                  <Text fontWeight="bold">
                    {t('create.name_and_age.age.birth_date.title')}
                  </Text>
                  <Inline spacing={3} alignItems="flex-end">
                    <Stack spacing={2}>
                      <Label
                        variant={LabelVariants.BOLD}
                        htmlFor="age-birth-date-min"
                      >
                        {t('create.name_and_age.age.birth_date.from')}
                      </Label>
                      <DatePicker
                        id="age-birth-date-min"
                        selected={minBirthDate}
                        onChange={(date) =>
                          commitBirthdateRange(field, date, maxBirthDate)
                        }
                      />
                    </Stack>
                    <Stack spacing={2}>
                      <Label
                        variant={LabelVariants.BOLD}
                        htmlFor="age-birth-date-max"
                      >
                        {t('create.name_and_age.age.birth_date.to')}
                      </Label>
                      <DatePicker
                        id="age-birth-date-max"
                        selected={maxBirthDate}
                        onChange={(date) =>
                          commitBirthdateRange(field, minBirthDate, date)
                        }
                      />
                    </Stack>
                  </Inline>
                  {minBirthDate &&
                    maxBirthDate &&
                    isBefore(
                      startOfDay(maxBirthDate),
                      startOfDay(minBirthDate),
                    ) && (
                      <Text color="red">
                        {t(
                          'create.name_and_age.age.birth_date.error_max_before_min',
                        )}
                      </Text>
                    )}
                </Stack>
              ) : (
                <Stack spacing={3} maxWidth="40rem">
                  <Text fontWeight="bold">
                    {t('create.name_and_age.age.input_range_title')}
                  </Text>
                  <Inline spacing={3}>
                    <Input
                      type="numeric"
                      value={minAge}
                      placeholder={t('create.name_and_age.age.from')}
                      aria-label={t('create.name_and_age.age.from')}
                      maxWidth="8rem"
                      onChange={(event: FormEvent<HTMLInputElement>) => {
                        setMinAge((event.target as HTMLInputElement).value);
                      }}
                      onBlur={(event: FormEvent<HTMLInputElement>) => {
                        commitAgeRange(
                          field,
                          (event.target as HTMLInputElement).value,
                          maxAge,
                        );
                      }}
                    />
                    <Input
                      type="numeric"
                      value={maxAge}
                      placeholder={t('create.name_and_age.age.till')}
                      aria-label={t('create.name_and_age.age.till')}
                      maxWidth="8rem"
                      onChange={(event: FormEvent<HTMLInputElement>) => {
                        setMaxAge((event.target as HTMLInputElement).value);
                      }}
                      onBlur={(event: FormEvent<HTMLInputElement>) => {
                        commitAgeRange(
                          field,
                          minAge,
                          (event.target as HTMLInputElement).value,
                        );
                      }}
                    />
                  </Inline>
                  {errorKey && <Text color="red">{t(errorKey)}</Text>}
                  <Inline
                    spacing={3}
                    flexWrap="wrap"
                    css={`
                      row-gap: 0.5rem;
                    `}
                  >
                    {Object.keys(AgeRanges)
                      .filter((key) => AgeRanges[key].apiLabel)
                      .map((key) => {
                        const apiLabel = AgeRanges[key].apiLabel!;
                        return (
                          <Button
                            key={key}
                            width="auto"
                            active={selectedPreset === key}
                            display="inline-flex"
                            variant={ButtonVariants.SECONDARY_TOGGLE}
                            onClick={() => handlePresetClick(field, apiLabel)}
                            css={`
                              &.btn {
                                padding: 0.3rem 0.7rem;
                                box-shadow: ${({ theme }) =>
                                  theme.components.global.boxShadow.heavy};
                              }
                            `}
                          >
                            {t(`create.name_and_age.age.${key.toLowerCase()}`)}
                            <Text
                              css={css`
                                color: ${getValue('rangeTextColor')};
                                font-size: 0.9rem;
                              `}
                            >
                              &nbsp; {AgeRanges[key].label ?? ''}
                            </Text>
                          </Button>
                        );
                      })}
                  </Inline>
                </Stack>
              )}
            </Stack>
          );
        }}
      />
    </Stack>
  );
};

export { AgeRangeStep, isValidAgeRange };
