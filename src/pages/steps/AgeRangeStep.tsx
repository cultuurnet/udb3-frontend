import { useQueryClient } from '@tanstack/react-query';
import { format, isBefore, parse, startOfDay } from 'date-fns';
import { FormEvent, useEffect, useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { css } from 'styled-components';

import { AgeRanges } from '@/constants/AgeRange';
import { AudienceType, AudienceTypes } from '@/constants/AudienceType';
import { OfferTypes } from '@/constants/OfferType';
import {
  useChangeAudienceMutation,
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
import { Label, LabelVariants } from '@/ui/Label';
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
  const [pendingAudienceChange, setPendingAudienceChange] =
    useState<AudienceType | null>(null);
  const [isMembersWarningModalVisible, setIsMembersWarningModalVisible] =
    useState(false);
  const [pendingAgeRangeChange, setPendingAgeRangeChange] = useState<{
    newValue: string;
    previousValue: string;
  } | null>(null);
  const [audienceMutationError, setAudienceMutationError] = useState<
    string | null
  >(null);

  const invalidateOfferQuery = () => {
    if (!offerId) return;
    queryClient.invalidateQueries({
      queryKey: [OfferTypes.EVENTS, { id: offerId }],
    });
  };

  const audienceType = useWatch({
    control,
    name: 'audience.audienceType',
  }) as AudienceType | undefined;

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

  const changeAudienceMutation = useChangeAudienceMutation({
    onSuccess: invalidateOfferQuery,
    onError: () => {
      setAudienceMutationError(
        t('create.name_and_age.age.audience.mutation_error'),
      );
    },
  });

  const changeDeparturePlacesMutation = useChangeDeparturePlacesMutation({
    onSuccess: invalidateOfferQuery,
    onError: () => {
      setAudienceMutationError(
        t('create.name_and_age.age.audience.mutation_error'),
      );
    },
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
    const previousValue = field.value?.typicalAgeRange ?? '';

    field.onChange({ ...field.value, typicalAgeRange: value });

    if (validateAgeRange(min, max)) return;

    if (
      audienceType === AudienceTypes.CHILDREN_ONLY &&
      !overlapsWithBoaAgeRange(value)
    ) {
      setPendingAgeRangeChange({ newValue: value, previousValue });
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

  const applyAudienceChange = async (newType: AudienceType) => {
    const previousType = audienceType;
    setAudienceMutationError(null);
    setValue('audience', { audienceType: newType });
    if (!offerId) return;
    try {
      await changeAudienceMutation.mutateAsync({
        eventId: offerId,
        audienceType: newType,
      });
    } catch (error) {
      // Revert the optimistic form update so the radio reflects the
      // backend state again.
      setValue('audience', { audienceType: previousType });
      throw error;
    }
  };

  const handleAudienceClick = (newType: AudienceType) => {
    if (newType === audienceType) return;
    if (
      newType === AudienceTypes.CHILDREN_ONLY &&
      audienceType === AudienceTypes.MEMBERS
    ) {
      setIsMembersWarningModalVisible(true);
      return;
    }
    const isSwitchingAwayFromChildrenOnly =
      audienceType === AudienceTypes.CHILDREN_ONLY &&
      newType !== AudienceTypes.CHILDREN_ONLY;
    const hasDeparturePlaces = !!event?.departurePlaces?.length;
    if (isSwitchingAwayFromChildrenOnly && hasDeparturePlaces) {
      setPendingAudienceChange(newType);
      return;
    }
    applyAudienceChange(newType).catch(() => undefined);
  };

  const showChildrenOnlySection =
    isEvent &&
    audienceType !== AudienceTypes.EDUCATION &&
    overlapsWithBoaAgeRange(watchedTypicalAgeRange);

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
                      return;
                    }

                    const previousBirthdateRange = field.value?.birthdateRange;

                    field.onChange({
                      ...field.value,
                      birthdateRange: undefined,
                    });
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
                    {showChildrenOnlySection && (
                      <Stack
                        spacing={2}
                        marginTop={4}
                        paddingTop={4}
                        css={`
                          border-top: 1px solid ${colors.grey3};
                        `}
                      >
                        <Text fontWeight="bold">
                          {t('create.name_and_age.age.audience.question')}
                        </Text>
                        <RadioButtonWithLabel
                          id="audience-children-only"
                          name="age-audience-type"
                          checked={audienceType === AudienceTypes.CHILDREN_ONLY}
                          label={t(
                            'create.name_and_age.age.audience.children_only',
                          )}
                          onChange={() =>
                            handleAudienceClick(AudienceTypes.CHILDREN_ONLY)
                          }
                        />
                        <RadioButtonWithLabel
                          id="audience-with-family"
                          name="age-audience-type"
                          checked={audienceType !== AudienceTypes.CHILDREN_ONLY}
                          label={t(
                            'create.name_and_age.age.audience.with_family',
                          )}
                          onChange={() =>
                            handleAudienceClick(AudienceTypes.EVERYONE)
                          }
                        />
                        {audienceMutationError && (
                          <Text color="red">{audienceMutationError}</Text>
                        )}
                      </Stack>
                    )}
                  </Stack>
                )}
              </Stack>

              <Modal
                variant={ModalVariants.QUESTION}
                size={ModalSizes.MD}
                visible={pendingAgeRangeChange !== null}
                title={t(
                  'create.name_and_age.age.audience.age_range_warning_modal.title',
                )}
                confirmTitle={t(
                  'create.name_and_age.age.audience.age_range_warning_modal.confirm',
                )}
                cancelTitle={t(
                  'create.name_and_age.age.audience.age_range_warning_modal.cancel',
                )}
                confirmButtonVariant={ButtonVariants.DANGER}
                onClose={() => {
                  if (!pendingAgeRangeChange) return;
                  const { previousValue } = pendingAgeRangeChange;
                  field.onChange({
                    ...field.value,
                    typicalAgeRange: previousValue,
                  });
                  const [min, max] = previousValue.split('-');
                  setMinAge(min ?? '');
                  setMaxAge(max ?? '');
                  setPendingAgeRangeChange(null);
                }}
                onConfirm={async () => {
                  if (!pendingAgeRangeChange) return;
                  try {
                    await applyAudienceChange(AudienceTypes.EVERYONE);
                    if (offerId && event?.departurePlaces?.length) {
                      await changeDeparturePlacesMutation.mutateAsync({
                        eventId: offerId,
                        departurePlaces: [],
                      });
                    }
                    onChange({
                      ...field.value,
                      typicalAgeRange: pendingAgeRangeChange.newValue,
                    });
                  } catch {
                    return;
                  }
                  setPendingAgeRangeChange(null);
                }}
              >
                <Box padding={4}>
                  <Text>
                    {t(
                      'create.name_and_age.age.audience.age_range_warning_modal.body',
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
        visible={pendingAudienceChange !== null}
        title={t(
          'create.name_and_age.age.audience.departure_places_warning_modal.title',
        )}
        confirmTitle={t(
          'create.name_and_age.age.audience.departure_places_warning_modal.confirm',
        )}
        cancelTitle={t(
          'create.name_and_age.age.audience.departure_places_warning_modal.cancel',
        )}
        confirmButtonVariant={ButtonVariants.DANGER}
        onClose={() => setPendingAudienceChange(null)}
        onConfirm={async () => {
          if (!pendingAudienceChange) return;
          try {
            await applyAudienceChange(pendingAudienceChange);
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
          setPendingAudienceChange(null);
        }}
      >
        <Box padding={4}>
          <Text>
            {t(
              'create.name_and_age.age.audience.departure_places_warning_modal.body',
            )}
          </Text>
        </Box>
      </Modal>

      <Modal
        variant={ModalVariants.QUESTION}
        size={ModalSizes.MD}
        visible={isMembersWarningModalVisible}
        title={t(
          'create.name_and_age.age.audience.members_warning_modal.title',
        )}
        confirmTitle={t(
          'create.name_and_age.age.audience.members_warning_modal.confirm',
        )}
        cancelTitle={t(
          'create.name_and_age.age.audience.members_warning_modal.cancel',
        )}
        confirmButtonVariant={ButtonVariants.DANGER}
        onClose={() => setIsMembersWarningModalVisible(false)}
        onConfirm={async () => {
          try {
            await applyAudienceChange(AudienceTypes.CHILDREN_ONLY);
          } catch {
            return;
          }
          setIsMembersWarningModalVisible(false);
        }}
      >
        <Box padding={4}>
          <Text>
            {t('create.name_and_age.age.audience.members_warning_modal.body')}
          </Text>
        </Box>
      </Modal>
    </Stack>
  );
};

export { AgeRangeStep, isValidAgeRange };
