import { useQueryClient } from '@tanstack/react-query';
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
import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Event } from '@/types/Event';
import { Values } from '@/types/Values';
import { Box } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
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

const getValue = getValueFromTheme('ageRange');

type AgeRangeStepProps = StackProps & StepProps;

const validateAgeRange = (min: string, max: string): string | null => {
  const minNum = min ? parseInt(min, 10) : undefined;
  const maxNum = max ? parseInt(max, 10) : undefined;

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
  setValue,
  ...props
}: AgeRangeStepProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [inputMode, setInputMode] = useState<AgeInputMode>(AgeInputModes.AGE);
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [pendingAudienceChange, setPendingAudienceChange] =
    useState<AudienceType | null>(null);
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

  const typicalAgeRange = useWatch({
    control,
    name: 'nameAndAgeRange.typicalAgeRange',
  }) as string | undefined;

  const getEventByIdQuery = useGetEventByIdQuery(
    { id: offerId ?? '' },
    { enabled: !!offerId },
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

  const useInitializeAgeRangeFields = (field: Field) => {
    useEffect(() => {
      if (!field.value?.typicalAgeRange) return;
      const [min, max] = field.value.typicalAgeRange.split('-');
      setMinAge(min ?? '');
      setMaxAge(max ?? '');
    }, [field.value?.typicalAgeRange]);
  };

  const commitAgeRange = (field: Field, newMin: string, newMax: string) => {
    if (validateAgeRange(newMin, newMax)) return;

    const value = !newMin && !newMax ? '' : `${newMin}-${newMax}`;
    field.onChange({ ...field.value, typicalAgeRange: value });
    onChange({ ...field.value, typicalAgeRange: value });
  };

  const handlePresetClick = (field: Field, apiLabel: string) => {
    const [min, max] = apiLabel.split('-');
    setMinAge(min ?? '');
    setMaxAge(max ?? '');
    field.onChange({ ...field.value, typicalAgeRange: apiLabel });
    onChange({ ...field.value, typicalAgeRange: apiLabel });
  };

  const applyAudienceChange = async (newType: AudienceType) => {
    setAudienceMutationError(null);
    setValue('audience', { audienceType: newType });
    if (!offerId) return;
    await changeAudienceMutation.mutateAsync({
      eventId: offerId,
      audienceType: newType,
    });
  };

  const handleAudienceClick = (newType: AudienceType) => {
    if (newType === audienceType) return;
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
    audienceType !== AudienceTypes.EDUCATION &&
    overlapsWithBoaAgeRange(typicalAgeRange);

  return (
    <Stack {...getStackProps(props)}>
      <Controller
        name={'nameAndAgeRange'}
        control={control}
        render={({ field }) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useInitializeAgeRangeFields(field);

          const selectedPreset = findPresetKey(field.value?.typicalAgeRange);
          const errorKey = validateAgeRange(minAge, maxAge);

          return (
            <Stack spacing={2}>
              <Text fontWeight="bold" paddingBottom={3}>
                {t(`create.name_and_age.age.title_boa`)}
              </Text>
              <ToggleGroup
                name="age-input-mode"
                value={inputMode}
                onChange={(newMode: string) =>
                  setInputMode(newMode as AgeInputMode)
                }
                options={Object.values(AgeInputModes).map((mode) => ({
                  value: mode,
                  label: t(`create.name_and_age.age.input_mode.${mode}`),
                }))}
                maxWidth="40rem"
                css={`
                  margin-bottom: 2rem;
                `}
              />
              {inputMode === AgeInputModes.DATE_OF_BIRTH ? null : (
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
    </Stack>
  );
};

export { AgeRangeStep };
