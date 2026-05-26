import { format, isBefore, parse, startOfDay } from 'date-fns';
import { FormEvent, useEffect, useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { css } from 'styled-components';

import { AgeRanges } from '@/constants/AgeRange';
import { useDeleteOfferBirthdateRangeMutation } from '@/hooks/api/offers';
import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Values } from '@/types/Values';
import { Alert, AlertVariants } from '@/ui/Alert';
import { parseSpacing } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { DatePicker } from '@/ui/DatePicker';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Label, LabelVariants } from '@/ui/Label';
import { getStackProps, Stack, StackProps } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { getValueFromTheme } from '@/ui/theme';
import { ToggleGroup } from '@/ui/ToggleGroup';

import { Field, StepProps } from './Steps';

const AgeInputModes = {
  AGE: 'age',
  DATE_OF_BIRTH: 'date_of_birth',
} as const;

type AgeInputMode = Values<typeof AgeInputModes>;

const getValue = getValueFromTheme('ageRange');

type AgeRangeStepProps = StackProps & StepProps;

const AgeRangeStep = ({
  formState: { errors },
  control,
  onChange,
  offerId,
  scope,
  ...props
}: AgeRangeStepProps) => {
  const { t } = useTranslation();
  const [isBoaEnabled] = useFeatureFlag(FeatureFlags.BOA);
  const deleteBirthdateRangeMutation = useDeleteOfferBirthdateRangeMutation();

  const [inputMode, setInputMode] = useState<AgeInputMode>(AgeInputModes.AGE);
  const [isCustomAgeRange, setIsCustomAgeRange] = useState(false);
  const [customMinAgeRange, setCustomMinAgeRange] = useState('');
  const [customMaxAgeRange, setCustomMaxAgeRange] = useState('');
  const [customAgeRangeError, setCustomAgeRangeError] = useState('');
  const [minBirthDate, setMinBirthDate] = useState<Date | undefined>(undefined);
  const [maxBirthDate, setMaxBirthDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    setMinBirthDate((current) => current ?? new Date());
    setMaxBirthDate((current) => current ?? new Date());
  }, []);

  const isCustomAgeRangeSelected = (typicalAgeRange: string): boolean => {
    return !Object.keys(AgeRanges).some(
      (key) =>
        AgeRanges[key].apiLabel && AgeRanges[key].apiLabel === typicalAgeRange,
    );
  };

  const resetCustomAgeRange = (): void => {
    setCustomMinAgeRange('');
    setCustomMaxAgeRange('');
    setIsCustomAgeRange(false);
    setCustomAgeRangeError('');
  };

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

    if (watchedTypicalAgeRange === '0-') {
      setIsCustomAgeRange(false);
      resetCustomAgeRange();
      return;
    }

    if (isCustomAgeRangeSelected(watchedTypicalAgeRange)) {
      const [min, max] = watchedTypicalAgeRange.split('-');
      setCustomMinAgeRange(min ?? '');
      setCustomMaxAgeRange(max ?? '');
      setIsCustomAgeRange(true);
      return;
    }

    resetCustomAgeRange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedTypicalAgeRange]);

  useEffect(() => {
    if (!watchedBirthdateRange?.from || !watchedBirthdateRange?.to) return;

    setMinBirthDate(
      parse(watchedBirthdateRange.from, 'yyyy-MM-dd', new Date()),
    );
    setMaxBirthDate(parse(watchedBirthdateRange.to, 'yyyy-MM-dd', new Date()));
    setInputMode(AgeInputModes.DATE_OF_BIRTH);
  }, [watchedBirthdateRange]);

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

  const getSelectedAgeRange = (typicalAgeRange: string): string => {
    const foundAgeRange = Object.keys(AgeRanges).find((key: string) => {
      return (
        AgeRanges[key].apiLabel && AgeRanges[key].apiLabel === typicalAgeRange
      );
    });

    if (typicalAgeRange === '0-') {
      return 'ALL';
    }

    if (isCustomAgeRange) {
      return 'CUSTOM';
    }

    if (!foundAgeRange) return 'NONE';

    return foundAgeRange;
  };

  const handleSubmitCustomAgeRange = (field: Field) => {
    if (parseInt(customMinAgeRange) > parseInt(customMaxAgeRange)) {
      setCustomAgeRangeError(
        t('create.name_and_age.age.error_max_lower_than_min'),
      );
      return;
    }

    setCustomAgeRangeError('');

    const customAgeRange =
      !customMinAgeRange && !customMaxAgeRange
        ? ''
        : `${customMinAgeRange}-${customMaxAgeRange}`;

    field.onChange({
      ...field.value,
      typicalAgeRange: customAgeRange,
    });

    onChange({
      ...field.value,
      typicalAgeRange: customAgeRange,
    });
  };

  const handleMinAgeRangeChange = (field: Field, value: string) => {
    setCustomMinAgeRange(value);
    handleSubmitCustomAgeRange(field);
  };

  const handleMaxAgeRangeChange = (field: Field, value: string) => {
    setCustomMaxAgeRange(value);

    if (!customMinAgeRange) {
      setCustomAgeRangeError(t('create.name_and_age.age.error_no_min_age'));
      return;
    }

    handleSubmitCustomAgeRange(field);
  };

  return (
    <Stack {...getStackProps(props)}>
      <Controller
        name={'nameAndAgeRange'}
        control={control}
        render={({ field }) => {
          const selectedAgeRange = getSelectedAgeRange(
            field.value?.typicalAgeRange,
          );

          return (
            <Stack spacing={2}>
              <Text fontWeight="bold">
                {t(`create.name_and_age.age.title`)}
              </Text>
              {isBoaEnabled && (
                <ToggleGroup
                  name="age-input-mode"
                  value={inputMode}
                  onChange={(newMode: string) => {
                    const next = newMode as AgeInputMode;
                    setInputMode(next);

                    if (next === AgeInputModes.DATE_OF_BIRTH) return;

                    field.onChange({
                      ...field.value,
                      birthdateRange: undefined,
                    });
                    onChange({
                      ...field.value,
                      birthdateRange: undefined,
                    });
                    if (offerId && field.value?.birthdateRange) {
                      deleteBirthdateRangeMutation.mutate({
                        eventId: offerId,
                        scope,
                      });
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
              )}
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
                <>
                  <Inline
                    spacing={3}
                    flexWrap="wrap"
                    maxWidth="40rem"
                    css={`
                      row-gap: ${parseSpacing(3.5)()};
                    `}
                  >
                    {Object.keys(AgeRanges).map((key: string) => {
                      const apiLabel = AgeRanges[key].apiLabel;
                      return (
                        <Button
                          key={key}
                          width="auto"
                          active={selectedAgeRange === key}
                          display="inline-flex"
                          variant={ButtonVariants.SECONDARY_TOGGLE}
                          onClick={() => {
                            setIsCustomAgeRange(key === 'CUSTOM');

                            field.onChange({
                              ...field.value,
                              typicalAgeRange: apiLabel,
                            });

                            onChange({
                              ...field.value,
                              typicalAgeRange: apiLabel,
                            });
                          }}
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
                  <Inline>
                    {isCustomAgeRange && (
                      <Stack spacing={3}>
                        <Inline spacing={3}>
                          <Stack>
                            <Text fontWeight="bold">
                              {t('create.name_and_age.age.from')}
                            </Text>
                            <Input
                              marginRight={3}
                              type="numeric"
                              value={customMinAgeRange}
                              placeholder={t('create.name_and_age.age.from')}
                              onChange={(event) => {
                                const value = (event.target as HTMLInputElement)
                                  .value;
                                setCustomMinAgeRange(value);
                              }}
                              onBlur={(event: FormEvent<HTMLInputElement>) => {
                                const value = (event.target as HTMLInputElement)
                                  .value;
                                handleMinAgeRangeChange(field, value);
                              }}
                            />
                          </Stack>
                          <Stack>
                            <Text fontWeight="bold">
                              {t('create.name_and_age.age.till')}
                            </Text>
                            <Input
                              marginRight={3}
                              type="numeric"
                              value={customMaxAgeRange}
                              placeholder={t('create.name_and_age.age.till')}
                              onChange={(event) => {
                                const value = (event.target as HTMLInputElement)
                                  .value;
                                setCustomMaxAgeRange(value);
                              }}
                              onBlur={(event: FormEvent<HTMLInputElement>) => {
                                const value = (event.target as HTMLInputElement)
                                  .value;
                                handleMaxAgeRangeChange(field, value);
                              }}
                            />
                          </Stack>
                        </Inline>
                        {customAgeRangeError && (
                          <Alert variant={AlertVariants.DANGER}>
                            {customAgeRangeError}
                          </Alert>
                        )}
                      </Stack>
                    )}
                  </Inline>
                  {errors.nameAndAgeRange?.typicalAgeRange && (
                    <Text color="red">
                      {t(
                        `create.name_and_age.validation_messages.age_range.${errors.nameAndAgeRange?.typicalAgeRange.type}`,
                      )}
                    </Text>
                  )}
                </>
              )}
            </Stack>
          );
        }}
      />
    </Stack>
  );
};

export { AgeRangeStep };
