import { useQueryClient } from '@tanstack/react-query';
import {
  differenceInYears,
  format,
  isBefore,
  parse,
  startOfDay,
} from 'date-fns';
import { FormEvent, useState } from 'react';
import { useWatch } from 'react-hook-form';
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
import {
  useChangeOfferBirthdateRangeMutation,
  useChangeOfferTypicalAgeRangeMutation,
} from '@/hooks/api/offers';
import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { useToast } from '@/hooks/useToast';
import { Event } from '@/types/Event';
import { BirthdateRange } from '@/types/Offer';
import { Values } from '@/types/Values';
import { Box } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { DatePicker } from '@/ui/DatePicker';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { RadioButtonGroup } from '@/ui/RadioButtonGroup';
import { getStackProps, Stack, StackProps } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { colors, getValueFromTheme } from '@/ui/theme';
import { ToggleGroup } from '@/ui/ToggleGroup';

import { AgeRangeStepLegacy } from './AgeRangeStepLegacy';
import { StepProps } from './Steps';

const AgeInputModes = {
  AGE: 'age',
  DATE_OF_BIRTH: 'date_of_birth',
} as const;

type AgeInputMode = Values<typeof AgeInputModes>;

type ActiveModal =
  | { kind: 'departurePlaces' }
  | { kind: 'ageRange'; newValue: string; previousValue: string };

const MAX_AGE = 120;
const BOA_MIN_AGE = 2;
const BOA_MAX_AGE = 16;
const AGE_PATTERN = /^\d+$/;

const getValue = getValueFromTheme('ageRange');

const getInputValue = (e: FormEvent<HTMLInputElement>) =>
  (e.target as HTMLInputElement).value;

const buildAgeRangeString = (min: string, max: string) =>
  !min && !max ? '' : `${min}-${max}`;

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

const buildBirthdateRange = (
  min: Date,
  max: Date,
): BirthdateRange | undefined => {
  if (isBefore(startOfDay(max), startOfDay(min))) return undefined;
  return {
    from: format(min, 'yyyy-MM-dd'),
    to: format(max, 'yyyy-MM-dd'),
  } as BirthdateRange;
};

type BirthdatePickersProps = {
  from: string | undefined;
  to: string | undefined;
  onCommit: (min: Date | undefined, max: Date | undefined) => void;
};

const BirthdatePickers = ({ from, to, onCommit }: BirthdatePickersProps) => {
  const { t } = useTranslation();

  const [minBirthDate, setMinBirthDate] = useState<Date | undefined>(
    from ? parse(from, 'yyyy-MM-dd', new Date()) : undefined,
  );
  const [maxBirthDate, setMaxBirthDate] = useState<Date | undefined>(
    to ? parse(to, 'yyyy-MM-dd', new Date()) : undefined,
  );

  const isInvalidRange =
    minBirthDate &&
    maxBirthDate &&
    isBefore(startOfDay(maxBirthDate), startOfDay(minBirthDate));

  return (
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
            onChange={(date: Date) => {
              setMinBirthDate(date);
              onCommit(date, maxBirthDate);
            }}
          />
        </Stack>
        <Stack spacing={2}>
          <Label htmlFor="age-birth-date-max">
            {t('create.name_and_age.age.birth_date.to')}
          </Label>
          <DatePicker
            id="age-birth-date-max"
            selected={maxBirthDate}
            onChange={(date: Date) => {
              setMaxBirthDate(date);
              onCommit(minBirthDate, date);
            }}
          />
        </Stack>
      </Inline>
      {isInvalidRange && (
        <Text color="red">
          {t('create.name_and_age.age.birth_date.error_max_before_min')}
        </Text>
      )}
    </Stack>
  );
};

type AgeRangeInputsProps = {
  minAge: string;
  maxAge: string;
  selectedPreset: string | null;
  errorKey: string | null;
  isPlaceScope: boolean;
  onAgeChange: (min: string, max: string) => void;
  onAgeCommit: (min: string, max: string) => void;
  onPresetClick: (apiLabel: string) => void;
};

const AgeRangeInputs = ({
  minAge,
  maxAge,
  selectedPreset,
  errorKey,
  isPlaceScope,
  onAgeChange,
  onAgeCommit,
  onPresetClick,
}: AgeRangeInputsProps) => {
  const { t } = useTranslation();

  return (
    <Stack spacing={3} maxWidth="40rem" paddingLeft={isPlaceScope ? 0 : 5}>
      <Text fontWeight={isPlaceScope ? 'normal' : 'bold'}>
        {t('create.name_and_age.age.input_range_title')}
      </Text>
      <Inline spacing={3}>
        <Input
          type="numeric"
          value={minAge}
          placeholder={t('create.name_and_age.age.from')}
          aria-label={t('create.name_and_age.age.from')}
          maxWidth="8rem"
          onChange={(e) => onAgeChange(getInputValue(e), maxAge)}
          onBlur={(e) => onAgeCommit(getInputValue(e), maxAge)}
        />
        <Input
          type="numeric"
          value={maxAge}
          placeholder={t('create.name_and_age.age.till')}
          aria-label={t('create.name_and_age.age.till')}
          maxWidth="8rem"
          onChange={(e) => onAgeChange(minAge, getInputValue(e))}
          onBlur={(e) => onAgeCommit(minAge, getInputValue(e))}
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
                onClick={() => onPresetClick(apiLabel)}
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
  );
};

type ChildrenOnlySectionProps = {
  childrenOnly: boolean;
  isPending: boolean;
  error: string | null;
  onToggle: (value: boolean) => void;
};

const ChildrenOnlySection = ({
  childrenOnly,
  isPending,
  error,
  onToggle,
}: ChildrenOnlySectionProps) => {
  const { t } = useTranslation();

  return (
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
      <RadioButtonGroup
        name="children-only-toggle"
        disabled={isPending}
        selected={childrenOnly === true ? 'children-only' : 'with-family'}
        onValueChange={(value) => onToggle(value === 'children-only')}
        items={[
          {
            value: 'children-only',
            id: 'children-only',
            label: t('create.name_and_age.age.children_only.children_only'),
          },
          {
            value: 'with-family',
            id: 'with-family',
            label: t('create.name_and_age.age.children_only.with_family'),
          },
        ]}
      />
      {error && <Text color="red">{error}</Text>}
    </Stack>
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
  setValue,
  ...props
}: AgeRangeStepProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const toast = useToast({
    messages: { basic_info: t('create.toast.success.basic_info') },
  });

  const audienceType = useWatch({ control, name: 'audience.audienceType' });
  const childrenOnly = useWatch({ control, name: 'childrenOnly' });
  const watchedTypicalAgeRange = useWatch({
    control,
    name: 'nameAndAgeRange.typicalAgeRange',
  });
  const watchedBirthdateRange = useWatch({
    control,
    name: 'nameAndAgeRange.birthdateRange',
  });

  const [minAge = '', maxAge = ''] = (watchedTypicalAgeRange ?? '').split('-');

  const [activeTab, setActiveTab] = useState<AgeInputMode>(AgeInputModes.AGE);

  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null);
  const [childrenOnlyMutationError, setChildrenOnlyMutationError] = useState<
    string | null
  >(null);

  const getEventByIdQuery = useGetEventByIdQuery(
    { id: offerId ?? '' },
    { enabled: !!offerId && scope === OfferTypes.EVENTS },
  );
  const event: Event | undefined = getEventByIdQuery.data;

  const onChildrenOnlyMutationError = () =>
    setChildrenOnlyMutationError(
      t('create.name_and_age.age.children_only.mutation_error'),
    );

  const changeChildrenOnlyMutation = useChangeChildrenOnlyMutation({
    onSuccess: () => {
      if (!offerId) return;
      queryClient.invalidateQueries({
        queryKey: [OfferTypes.EVENTS, { id: offerId }],
      });
      toast.trigger('basic_info');
    },
    onError: onChildrenOnlyMutationError,
  });

  const changeDeparturePlacesMutation = useChangeDeparturePlacesMutation({
    onSuccess: () => {
      if (!offerId) return;
      queryClient.invalidateQueries({
        queryKey: [OfferTypes.EVENTS, { id: offerId }],
      });
      toast.trigger('basic_info');
    },
    onError: onChildrenOnlyMutationError,
  });

  const invalidateOffer = () =>
    queryClient.invalidateQueries({ queryKey: [scope, { id: offerId }] });

  const onMutationSuccess = () => {
    invalidateOffer();
    toast.trigger('basic_info');
  };

  const changeTypicalAgeRangeMutation = useChangeOfferTypicalAgeRangeMutation({
    onSuccess: onMutationSuccess,
  });

  const changeBirthdateRangeMutation = useChangeOfferBirthdateRangeMutation({
    onSuccess: onMutationSuccess,
  });

  const isChildrenOnlyPending =
    changeChildrenOnlyMutation.isPending ||
    changeDeparturePlacesMutation.isPending;

  const commitTypicalAgeRange = (value: string, min: string, max: string) => {
    const previousValue = watchedTypicalAgeRange ?? '';
    setValue('nameAndAgeRange.typicalAgeRange', value, { shouldDirty: true });

    if (validateAgeRange(min, max)) return;

    if (childrenOnly && !overlapsWithBoaAgeRange(value)) {
      setActiveModal({ kind: 'ageRange', newValue: value, previousValue });
      return;
    }

    if (!offerId) {
      onChange(undefined);
      return;
    }

    changeTypicalAgeRangeMutation.mutate({
      eventId: offerId,
      typicalAgeRange: value,
      scope,
    });
  };

  const updateAgeRange = (newMin: string, newMax: string) => {
    setValue(
      'nameAndAgeRange.typicalAgeRange',
      buildAgeRangeString(newMin, newMax),
      { shouldDirty: true },
    );
  };

  const commitAgeRange = (newMin: string, newMax: string) =>
    commitTypicalAgeRange(buildAgeRangeString(newMin, newMax), newMin, newMax);

  const handlePresetClick = (apiLabel: string) => {
    const [min, max] = apiLabel.split('-');
    commitTypicalAgeRange(apiLabel, min ?? '', max ?? '');
  };

  const commitBirthdateRange = (
    newMin: Date | undefined,
    newMax: Date | undefined,
  ) => {
    if (!newMin || !newMax) return;

    const birthdateRange = buildBirthdateRange(newMin, newMax);
    if (!birthdateRange) return;

    setValue('nameAndAgeRange.birthdateRange', birthdateRange, {
      shouldDirty: true,
    });

    if (!offerId) {
      onChange(undefined);
      return;
    }

    changeBirthdateRangeMutation.mutate({
      eventId: offerId,
      birthdateRange,
      scope,
    });
  };

  const handleModeChange = (newMode: string) => {
    setActiveTab(newMode as AgeInputMode);
    if (
      newMode === AgeInputModes.DATE_OF_BIRTH &&
      !watchedBirthdateRange?.from
    ) {
      const today = new Date();
      commitBirthdateRange(today, today);
    }
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

  const handleChildrenOnlyToggle = (value: boolean) => {
    if (isChildrenOnlyPending) return;
    if (value === childrenOnly) return;
    if (!value && event?.departurePlaces?.length) {
      setActiveModal({ kind: 'departurePlaces' });
      return;
    }
    applyChildrenOnlyChange(value).catch(() => undefined);
  };

  const handleAgeRangeModalClose = () => {
    if (activeModal?.kind !== 'ageRange') return;
    setValue('nameAndAgeRange.typicalAgeRange', activeModal.previousValue, {
      shouldDirty: true,
    });
    setActiveModal(null);
  };

  const handleAgeRangeModalConfirm = async () => {
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
      if (offerId) {
        await changeTypicalAgeRangeMutation.mutateAsync({
          eventId: offerId,
          typicalAgeRange: newValue,
          scope,
        });
      } else {
        onChange(undefined);
      }
    } catch {
      return;
    }
    setActiveModal(null);
  };

  const handleDeparturePlacesModalConfirm = async () => {
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
      return;
    }
    setActiveModal(null);
  };

  const showBirthdateOption = scope === OfferTypes.EVENTS;

  const showChildrenOnlySection =
    scope === OfferTypes.EVENTS &&
    audienceType !== AudienceTypes.EDUCATION &&
    (childrenOnly ||
      overlapsWithBoaAgeRange(watchedTypicalAgeRange) ||
      birthdateRangeFitsBoa(watchedBirthdateRange));

  return (
    <Stack {...getStackProps(props)}>
      <Stack spacing={2}>
        <Text fontWeight="bold" paddingBottom={3}>
          {t('create.name_and_age.age.title_boa')}
        </Text>
        {showBirthdateOption && (
          <ToggleGroup
            name="age-input-mode"
            value={activeTab}
            onChange={handleModeChange}
            options={Object.values(AgeInputModes).map((mode) => ({
              value: mode,
              label: t(`create.name_and_age.age.input_mode.${mode}`),
            }))}
            maxWidth="40rem"
            css={`
              margin-bottom: 2rem;
            `}
          />
        )}
        {showBirthdateOption && activeTab === AgeInputModes.DATE_OF_BIRTH && (
          <BirthdatePickers
            from={watchedBirthdateRange?.from}
            to={watchedBirthdateRange?.to}
            onCommit={commitBirthdateRange}
          />
        )}
        {(!showBirthdateOption || activeTab === AgeInputModes.AGE) && (
          <AgeRangeInputs
            minAge={minAge}
            maxAge={maxAge}
            selectedPreset={findPresetKey(watchedTypicalAgeRange)}
            errorKey={validateAgeRange(minAge, maxAge)}
            isPlaceScope={scope === OfferTypes.PLACES}
            onAgeChange={updateAgeRange}
            onAgeCommit={commitAgeRange}
            onPresetClick={handlePresetClick}
          />
        )}
        {showChildrenOnlySection && (
          <ChildrenOnlySection
            childrenOnly={childrenOnly}
            isPending={isChildrenOnlyPending}
            error={childrenOnlyMutationError}
            onToggle={handleChildrenOnlyToggle}
          />
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
        onClose={handleAgeRangeModalClose}
        onConfirm={handleAgeRangeModalConfirm}
      >
        <Box padding={4}>
          <Text>
            {t(
              'create.name_and_age.age.children_only.age_range_warning_modal.body',
            )}
          </Text>
        </Box>
      </Modal>

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
        onClose={() => setActiveModal(null)}
        onConfirm={handleDeparturePlacesModalConfirm}
      >
        <Box padding={4}>
          <Text>
            {t(
              'create.name_and_age.age.children_only.departure_places_warning_modal.body',
            )}
          </Text>
        </Box>
      </Modal>
      {toast.component}
    </Stack>
  );
};

export { AgeRangeStep, isValidAgeRange };
