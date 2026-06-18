import { useQueryClient } from '@tanstack/react-query';
import {
  differenceInYears,
  format,
  isBefore,
  parse,
  startOfDay,
} from 'date-fns';
import { FormEvent, useEffect, useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { css } from 'styled-components';

import { AgeRanges } from '@/constants/AgeRange';
import { AudienceTypes } from '@/constants/AudienceType';
import { OfferTypes } from '@/constants/OfferType';
import {
  useChangeChildrenOnlyMutation,
  useChangeDeparturePlacesMutation,
  useGetEventByIdQuery,
} from '@/hooks/api/events';
import { useDeleteOfferBirthdateRangeMutation } from '@/hooks/api/offers';
import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Event } from '@/types/Event';
import { Values } from '@/types/Values';
import { Box } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { DatePicker } from '@/ui/DatePicker';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { RadioButtonWithLabel } from '@/ui/RadioButtonWithLabel';
import { getStackProps, Stack, StackProps } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { colors, getValueFromTheme } from '@/ui/theme';
import { ToggleGroup } from '@/ui/ToggleGroup';

import { AgeRangeStepLegacy } from './AgeRangeStepLegacy';
import { Field, StepProps } from './Steps';

const AgeInputModes = {
  AGE: 'age',
  DATE_OF_BIRTH: 'date_of_birth',
} as const;

type AgeInputMode = Values<typeof AgeInputModes>;

const MAX_AGE = 120;
const BOA_MIN_AGE = 2;
const BOA_MAX_AGE = 12;
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

const overlapsWithBoaAgeRange = (
  typicalAgeRange: string | undefined,
): boolean => {
  if (!typicalAgeRange) return false;
  // "Alle leeftijden" is not children-specific
  if (typicalAgeRange === '-' || typicalAgeRange === '0-') return false;

  const [minStr, maxStr] = typicalAgeRange.split('-');
  const min = minStr ? parseInt(minStr, 10) : undefined;
  const max = maxStr ? parseInt(maxStr, 10) : undefined;

  if (min !== undefined && min > BOA_MAX_AGE) return false;
  if (max !== undefined && max < BOA_MIN_AGE) return false;
  return true;
};

const birthdateRangeFitsBoa = (
  birthdateRange: { from?: string; to?: string } | undefined,
): boolean => {
  if (!birthdateRange?.from || !birthdateRange?.to) return false;

  const now = new Date();
  // `from` is the earliest birthdate (oldest person) and `to` is the latest
  // birthdate (youngest person), so the age window is [today-to, today-from].
  const maxAge = differenceInYears(
    now,
    parse(birthdateRange.from, 'yyyy-MM-dd', now),
  );
  const minAge = differenceInYears(
    now,
    parse(birthdateRange.to, 'yyyy-MM-dd', now),
  );

  if (Number.isNaN(minAge) || Number.isNaN(maxAge)) return false;
  // Both ages must sit entirely inside [BOA_MIN_AGE, BOA_MAX_AGE] — not just
  // touch it. An audience marked "kinderen alleen" must be uniformly within
  // the children window, not partially adult or partially infant.
  return minAge >= BOA_MIN_AGE && maxAge <= BOA_MAX_AGE;
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
  setValue,
  ...props
}: AgeRangeStepProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const deleteBirthdateRangeMutation = useDeleteOfferBirthdateRangeMutation();

  const isEvent = scope === OfferTypes.EVENTS;

  const [inputMode, setInputMode] = useState<AgeInputMode>(AgeInputModes.AGE);
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [minBirthDate, setMinBirthDate] = useState<Date | undefined>(undefined);
  const [maxBirthDate, setMaxBirthDate] = useState<Date | undefined>(undefined);
  type ActiveModal =
    | { kind: 'departurePlaces' }
    | { kind: 'ageRange'; newValue: string; previousValue: string };
  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null);
  const closeModal = () => setActiveModal(null);
  const [childrenOnlyMutationError, setChildrenOnlyMutationError] = useState<
    string | null
  >(null);

  const audienceType = useWatch({
    control,
    name: 'audience.audienceType',
  });

  const childrenOnly = useWatch({
    control,
    name: 'childrenOnly',
  }) as boolean;

  const watchedTypicalAgeRange = useWatch({
    control,
    name: 'nameAndAgeRange.typicalAgeRange',
  });
  const watchedBirthdateRange = useWatch({
    control,
    name: 'nameAndAgeRange.birthdateRange',
  });

  const getEventByIdQuery = useGetEventByIdQuery(
    { id: offerId ?? '' },
    { enabled: !!offerId && isEvent },
  );
  const event: Event | undefined = getEventByIdQuery.data;

  const changeChildrenOnlyMutation = useChangeChildrenOnlyMutation({
    onSuccess: () => {
      if (!offerId) return;
      queryClient.invalidateQueries({
        queryKey: [OfferTypes.EVENTS, { id: offerId }],
      });
    },
    onError: () => {
      setChildrenOnlyMutationError(
        t('create.name_and_age.age.children_only.mutation_error'),
      );
    },
  });

  const changeDeparturePlacesMutation = useChangeDeparturePlacesMutation({
    onSuccess: () => {
      if (!offerId) return;
      queryClient.invalidateQueries({
        queryKey: [OfferTypes.EVENTS, { id: offerId }],
      });
    },
    onError: () => {
      setChildrenOnlyMutationError(
        t('create.name_and_age.age.children_only.mutation_error'),
      );
    },
  });

  const isChildrenOnlyPending =
    changeChildrenOnlyMutation.isPending ||
    changeDeparturePlacesMutation.isPending;

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
    const previousValue = field.value?.typicalAgeRange ?? '';

    field.onChange({ ...field.value, typicalAgeRange: value });

    if (validateAgeRange(min, max)) return;

    if (childrenOnly && !overlapsWithBoaAgeRange(value)) {
      setActiveModal({ kind: 'ageRange', newValue: value, previousValue });
      return;
    }

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

  const applyChildrenOnlyChange = async (value: boolean) => {
    const previousValue = childrenOnly;
    setChildrenOnlyMutationError(null);
    setValue('childrenOnly', value);
    if (!offerId) return;
    try {
      await changeChildrenOnlyMutation.mutateAsync({
        eventId: offerId,
        childrenOnly: value,
      });
    } catch (error) {
      setValue('childrenOnly', previousValue);
      throw error;
    }
  };

  const handleChildrenOnlyClick = (value: boolean) => {
    if (isChildrenOnlyPending) return;
    if (value === childrenOnly) return;
    if (!value && event?.departurePlaces?.length) {
      setActiveModal({ kind: 'departurePlaces' });
      return;
    }
    applyChildrenOnlyChange(value).catch(() => undefined);
  };

  const showChildrenOnlySection =
    isEvent &&
    audienceType !== AudienceTypes.EDUCATION &&
    (childrenOnly ||
      overlapsWithBoaAgeRange(watchedTypicalAgeRange) ||
      birthdateRangeFitsBoa(watchedBirthdateRange));

  return (
    <Stack {...getStackProps(props)}>
      <Controller
        name={'nameAndAgeRange'}
        control={control}
        render={({ field }) => {
          const selectedPreset = findPresetKey(field.value?.typicalAgeRange);
          const errorKey = validateAgeRange(minAge, maxAge);

          return (
            <>
              <Stack spacing={2}>
                <Text fontWeight="bold" paddingBottom={3}>
                  {t(`create.name_and_age.age.title_boa`)}
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

                      // Create flow: give the destination tab a clean slate
                      // — clear the other side's age data and reset audience
                      // so the children-only section also resets.
                      if (!offerId) {
                        field.onChange({
                          ...field.value,
                          typicalAgeRange: '',
                        });
                        setMinAge('');
                        setMaxAge('');
                        setValue('childrenOnly', false);
                      }
                      return;
                    }

                    const previousBirthdateRange = field.value?.birthdateRange;

                    field.onChange({
                      ...field.value,
                      birthdateRange: undefined,
                    });

                    if (!offerId) {
                      // Same clean-slate treatment on the way back to AGE.
                      setMinBirthDate(undefined);
                      setMaxBirthDate(undefined);
                      setValue('childrenOnly', false);
                      return;
                    }

                    if (!previousBirthdateRange) {
                      return;
                    }

                    deleteBirthdateRangeMutation.mutate(
                      { eventId: offerId, scope },
                      {
                        onSuccess: () => {
                          onChange({
                            ...field.value,
                            birthdateRange: undefined,
                          });
                        },
                        onError: () => {
                          field.onChange({
                            ...field.value,
                            birthdateRange: previousBirthdateRange,
                          });
                          setInputMode(AgeInputModes.DATE_OF_BIRTH);
                        },
                      },
                    );
                  }}
                  options={Object.values(AgeInputModes).map((mode) => ({
                    value: mode,
                    label: t(`create.name_and_age.age.input_mode.${mode}`),
                  }))}
                  maxWidth="40rem"
                  css={`
                    margin-bottom: 2rem;
                  `}
                />
                {inputMode === AgeInputModes.DATE_OF_BIRTH ? (
                  <Stack spacing={3} maxWidth="40rem" paddingLeft={5}>
                    <Text fontWeight="bold">
                      {t('create.name_and_age.age.birth_date.title')}
                    </Text>
                    <Inline spacing={3} alignItems="flex-end">
                      <Stack spacing={2}>
                        <Label htmlFor="age-birth-date-min">
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
                        <Label htmlFor="age-birth-date-max">
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
                  <Stack spacing={3} maxWidth="40rem" paddingLeft={5}>
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
                              {t(
                                `create.name_and_age.age.${key.toLowerCase()}`,
                              )}
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
                {showChildrenOnlySection && (
                  <Stack
                    spacing={2}
                    marginTop={4}
                    paddingTop={4}
                    paddingLeft={5}
                    css={`
                      border-top: 1px solid ${colors.grey3};
                    `}
                  >
                    <Text fontWeight="bold">
                      {t('create.name_and_age.age.children_only.question')}
                    </Text>
                    <RadioButtonWithLabel
                      id="children-only"
                      name="children-only-toggle"
                      checked={childrenOnly === true}
                      disabled={isChildrenOnlyPending}
                      label={t(
                        'create.name_and_age.age.children_only.children_only',
                      )}
                      onChange={() => handleChildrenOnlyClick(true)}
                    />
                    <RadioButtonWithLabel
                      id="with-family"
                      name="children-only-toggle"
                      checked={childrenOnly !== true}
                      disabled={isChildrenOnlyPending}
                      label={t(
                        'create.name_and_age.age.children_only.with_family',
                      )}
                      onChange={() => handleChildrenOnlyClick(false)}
                    />
                    {childrenOnlyMutationError && (
                      <Text color="red">{childrenOnlyMutationError}</Text>
                    )}
                  </Stack>
                )}
              </Stack>

              <Modal
                variant={ModalVariants.QUESTION}
                size={ModalSizes.MD}
                visible={activeModal?.kind === 'ageRange'}
                title={t(
                  'create.name_and_age.age.children_only.age_range_warning_modal.title',
                )}
                confirmTitle={t(
                  'create.name_and_age.age.children_only.age_range_warning_modal.confirm',
                )}
                cancelTitle={t(
                  'create.name_and_age.age.children_only.age_range_warning_modal.cancel',
                )}
                confirmButtonVariant={ButtonVariants.DANGER}
                onClose={() => {
                  if (activeModal?.kind !== 'ageRange') return;
                  const { previousValue } = activeModal;
                  field.onChange({
                    ...field.value,
                    typicalAgeRange: previousValue,
                  });
                  const [min, max] = previousValue.split('-');
                  setMinAge(min ?? '');
                  setMaxAge(max ?? '');
                  closeModal();
                }}
                onConfirm={async () => {
                  if (isChildrenOnlyPending) return;
                  if (activeModal?.kind !== 'ageRange') return;
                  const { newValue } = activeModal;
                  try {
                    await applyChildrenOnlyChange(false);
                    if (offerId && event?.departurePlaces?.length) {
                      await changeDeparturePlacesMutation.mutateAsync({
                        eventId: offerId,
                        departurePlaces: [],
                      });
                    }
                    setValue('nameAndAgeRange.typicalAgeRange', newValue, {
                      shouldDirty: true,
                    });
                    onChange({
                      ...field.value,
                      typicalAgeRange: newValue,
                    });
                  } catch {
                    return;
                  }
                  closeModal();
                }}
              >
                <Box padding={4}>
                  <Text>
                    {t(
                      'create.name_and_age.age.children_only.age_range_warning_modal.body',
                    )}
                  </Text>
                </Box>
              </Modal>
            </>
          );
        }}
      />

      <Modal
        variant={ModalVariants.QUESTION}
        size={ModalSizes.MD}
        visible={activeModal?.kind === 'departurePlaces'}
        title={t(
          'create.name_and_age.age.children_only.departure_places_warning_modal.title',
        )}
        confirmTitle={t(
          'create.name_and_age.age.children_only.departure_places_warning_modal.confirm',
        )}
        cancelTitle={t(
          'create.name_and_age.age.children_only.departure_places_warning_modal.cancel',
        )}
        confirmButtonVariant={ButtonVariants.DANGER}
        onClose={closeModal}
        onConfirm={async () => {
          if (isChildrenOnlyPending) return;
          if (activeModal?.kind !== 'departurePlaces') return;
          try {
            await applyChildrenOnlyChange(false);
            if (offerId) {
              await changeDeparturePlacesMutation.mutateAsync({
                eventId: offerId,
                departurePlaces: [],
              });
            }
          } catch {
            // Failure already surfaced inline via the mutation's onError —
            // bail out and keep the modal open so the user can retry.
            return;
          }
          closeModal();
        }}
      >
        <Box padding={4}>
          <Text>
            {t(
              'create.name_and_age.age.children_only.departure_places_warning_modal.body',
            )}
          </Text>
        </Box>
      </Modal>
    </Stack>
  );
};

export { AgeRangeStep, isValidAgeRange };
