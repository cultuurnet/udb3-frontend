import { useQueryClient } from '@tanstack/react-query';
import {
  differenceInYears,
  format,
  isBefore,
  parse,
  startOfDay,
} from 'date-fns';
import { FormEvent, ReactNode, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { css } from 'styled-components';

import { AgeRanges } from '@/constants/AgeRange';
import { AudienceType, AudienceTypes } from '@/constants/AudienceType';
import { OfferTypes, Scope } from '@/constants/OfferType';
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
import { Icon, Icons, IconVariants } from '@/ui/Icon';
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
import { FormDataUnion, StepProps } from './Steps';

const AgeInputModes = {
  AGE: 'age',
  DATE_OF_BIRTH: 'date_of_birth',
} as const;

type AgeInputMode = Values<typeof AgeInputModes>;

type ActiveModal =
  | { kind: 'departurePlaces' }
  | { kind: 'ageRange'; newValue: string; previousValue: string }
  | { kind: 'inputMode'; newMode: AgeInputMode };

const MAX_AGE = 120;
const BOA_MIN_AGE = 2;
const BOA_MAX_AGE = 16;
const AGE_PATTERN = /^\d+$/;
const DECIMAL_SEPARATOR_PATTERN = /[.,]/;

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
    DECIMAL_SEPARATOR_PATTERN.test(min) ||
    DECIMAL_SEPARATOR_PATTERN.test(max)
  ) {
    return 'create.name_and_age.age.error_decimal';
  }

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

const isAllAges = (typicalAgeRange: string) =>
  typicalAgeRange === '-' || typicalAgeRange === '0-';

const findPresetKey = (typicalAgeRange: string | undefined): string | null => {
  if (!typicalAgeRange) return null;
  if (isAllAges(typicalAgeRange)) return 'ALL';
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
  if (isAllAges(typicalAgeRange)) return false;

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

type ChildrenOnlyContext = {
  scope?: Scope;
  audienceType?: AudienceType;
  typicalAgeRange?: string;
  birthdateRange?: BirthdateRange;
  childrenOnly?: boolean;
};

const shouldShowChildrenOnlySection = ({
  scope,
  audienceType,
  typicalAgeRange,
  birthdateRange,
  childrenOnly,
}: ChildrenOnlyContext) =>
  scope === OfferTypes.EVENTS &&
  audienceType !== AudienceTypes.EDUCATION &&
  (!!typicalAgeRange || !!birthdateRange?.from) &&
  isValidAgeRange(typicalAgeRange) &&
  (childrenOnly === true ||
    overlapsWithBoaAgeRange(typicalAgeRange) ||
    birthdateRangeFitsBoa(birthdateRange));

const isChildrenOnlyValueMissing = (
  { scope, audience, nameAndAgeRange, childrenOnly }: Partial<FormDataUnion>,
  isBoaEnabled?: boolean,
) =>
  !!isBoaEnabled &&
  typeof childrenOnly !== 'boolean' &&
  shouldShowChildrenOnlySection({
    scope,
    audienceType: audience?.audienceType,
    typicalAgeRange: nameAndAgeRange?.typicalAgeRange,
    birthdateRange: nameAndAgeRange?.birthdateRange,
  });

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

  const [minBirthDate, setMinBirthDate] = useState<Date>(
    from ? parse(from, 'yyyy-MM-dd', new Date()) : new Date(),
  );
  const [maxBirthDate, setMaxBirthDate] = useState<Date>(
    to ? parse(to, 'yyyy-MM-dd', new Date()) : new Date(),
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

const presetKeys = Object.keys(AgeRanges).filter(
  (key) => AgeRanges[key].apiLabel,
);

type AgeRangePickerProps = {
  onPresetClick: (apiLabel: string) => void;
};

const AgeRangePicker = ({ onPresetClick }: AgeRangePickerProps) => {
  const { t } = useTranslation();

  return (
    <Inline
      spacing={3}
      flexWrap="wrap"
      css={`
        row-gap: 0.5rem;
      `}
    >
      {presetKeys.map((key) => (
        <Button
          key={key}
          className="tw:w-auto tw:inline-flex"
          variant={ButtonVariants.SECONDARY_TOGGLE}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onPresetClick(AgeRanges[key].apiLabel)}
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
      ))}
    </Inline>
  );
};

type AgeRangeInputsProps = {
  minAge: string;
  maxAge: string;
  selectedCategoryLabel: string;
  errorKey: string | null;
  isPlaceScope: boolean;
  showSelectedCategory: boolean;
  childrenOnlySection: ReactNode;
  onClear: () => void;
  onAgeCommit: (min: string, max: string) => void;
  onPresetClick: (apiLabel: string) => void;
};

const AgeRangeInputs = ({
  minAge,
  maxAge,
  selectedCategoryLabel,
  errorKey,
  isPlaceScope,
  showSelectedCategory,
  childrenOnlySection,
  onClear,
  onAgeCommit,
  onPresetClick,
}: AgeRangeInputsProps) => {
  const { t } = useTranslation();

  const indent = isPlaceScope ? 0 : 5;
  const hasAgeValue = !!minAge || !!maxAge;

  if (showSelectedCategory) {
    return (
      <Stack spacing={2} maxWidth="40rem">
        <Inline alignItems="center" spacing={3} paddingLeft={indent}>
          <Icon name={Icons.CHECK_CIRCLE} variant={IconVariants.SUCCESS} />
          <Text>{selectedCategoryLabel}</Text>
          <Button variant={ButtonVariants.LINK} onClick={onClear}>
            {t('create.name_and_age.age.change_age')}
          </Button>
        </Inline>
        {childrenOnlySection}
      </Stack>
    );
  }

  return (
    <Stack spacing={4} maxWidth="40rem">
      <Stack spacing={3} paddingLeft={indent}>
        <Text fontWeight="bold">
          {t('create.name_and_age.age.input_range_title')}
        </Text>
        <Inline spacing={3}>
          <Input
            // The key resets the field when the stored value changes elsewhere
            key={`min-${minAge}`}
            type="numeric"
            defaultValue={minAge}
            placeholder={t('create.name_and_age.age.from')}
            aria-label={t('create.name_and_age.age.from')}
            className="tw:max-w-32"
            onBlur={(e) => onAgeCommit(getInputValue(e), maxAge)}
          />
          <Input
            key={`max-${maxAge}`}
            type="numeric"
            defaultValue={maxAge}
            placeholder={t('create.name_and_age.age.till')}
            aria-label={t('create.name_and_age.age.till')}
            className="tw:max-w-32"
            onBlur={(e) => onAgeCommit(minAge, getInputValue(e))}
          />
        </Inline>
        {errorKey && <Text color="red">{t(errorKey)}</Text>}
      </Stack>
      {childrenOnlySection}
      {!hasAgeValue && (
        <Stack spacing={3} paddingLeft={indent}>
          <Text>{t('create.name_and_age.age.or_choose_category')}</Text>
          <AgeRangePicker onPresetClick={onPresetClick} />
        </Stack>
      )}
    </Stack>
  );
};

type ChildrenOnlySectionProps = {
  childrenOnly?: boolean;
  isPending: boolean;
  error: string | null;
  onToggle: (value: boolean) => void;
};

const getSelectedAudience = (childrenOnly?: boolean) => {
  if (childrenOnly === true) return 'children-only';
  if (childrenOnly === false) return 'with-family';
  return '';
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
        selected={getSelectedAudience(childrenOnly)}
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

type ConfirmModalProps = {
  name: string;
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const ConfirmModal = ({
  name,
  visible,
  onClose,
  onConfirm,
}: ConfirmModalProps) => {
  const { t } = useTranslation();
  const key = `create.name_and_age.age.confirm_modal.${name}`;

  return (
    <Modal
      variant={ModalVariants.QUESTION}
      size={ModalSizes.MD}
      visible={visible}
      title={t(`${key}.title`)}
      confirmTitle={t(`${key}.confirm`)}
      cancelTitle={t(`${key}.cancel`)}
      confirmButtonVariant={ButtonVariants.DANGER}
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <Box padding={4}>
        <Text>{t(`${key}.body`)}</Text>
      </Box>
    </Modal>
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
  formState,
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

  const hasAgeRange = !!watchedTypicalAgeRange;
  const hasBirthdateRange = !!watchedBirthdateRange?.from;

  const defaultMode = hasBirthdateRange
    ? AgeInputModes.DATE_OF_BIRTH
    : AgeInputModes.AGE;

  const [selectedMode, setSelectedMode] = useState<AgeInputMode | null>(null);
  const activeTab = selectedMode ?? defaultMode;

  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null);
  // "Wijzig leeftijd" empties the fields without touching the saved age.
  const [isAgeCleared, setIsAgeCleared] = useState(false);
  // A manually entered age keeps the fields open, even when it matches a category.
  const [isAgeManuallyEntered, setIsAgeManuallyEntered] = useState(false);
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

  const onMutationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: [scope, { id: offerId }] });
    toast.trigger('basic_info');
  };

  const changeChildrenOnlyMutation = useChangeChildrenOnlyMutation({
    onSuccess: onMutationSuccess,
    onError: onChildrenOnlyMutationError,
  });

  const changeDeparturePlacesMutation = useChangeDeparturePlacesMutation({
    onSuccess: onMutationSuccess,
    onError: onChildrenOnlyMutationError,
  });

  const changeTypicalAgeRangeMutation = useChangeOfferTypicalAgeRangeMutation({
    onSuccess: onMutationSuccess,
  });

  const changeBirthdateRangeMutation = useChangeOfferBirthdateRangeMutation({
    onSuccess: onMutationSuccess,
  });

  const isChildrenOnlyPending =
    changeChildrenOnlyMutation.isPending ||
    changeDeparturePlacesMutation.isPending;

  const commitTypicalAgeRange = (value: string) => {
    const previousValue = watchedTypicalAgeRange ?? '';
    const [min = '', max = ''] = value.split('-');
    setValue('nameAndAgeRange.typicalAgeRange', value, { shouldDirty: true });

    // An empty range is never sent: clearing the fields only updates the form.
    if (!value) return;

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

  const handleAgeClear = () => {
    setIsAgeCleared(true);
    setIsAgeManuallyEntered(false);
  };

  const commitAgeRange = (newMin: string, newMax: string) => {
    if (isAgeCleared && !newMin && !newMax) return;
    setIsAgeCleared(false);
    setIsAgeManuallyEntered(true);
    commitTypicalAgeRange(buildAgeRangeString(newMin, newMax));
  };

  const handlePresetClick = (apiLabel: string) => {
    setIsAgeCleared(false);
    setIsAgeManuallyEntered(false);
    commitTypicalAgeRange(apiLabel);
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

  const applyModeChange = (mode: AgeInputMode) => {
    setSelectedMode(mode);
    setIsAgeCleared(false);
    setIsAgeManuallyEntered(false);

    if (mode === AgeInputModes.AGE) {
      setValue('nameAndAgeRange.birthdateRange', undefined, {
        shouldDirty: true,
      });
    } else {
      setValue('nameAndAgeRange.typicalAgeRange', undefined, {
        shouldDirty: true,
      });
    }
  };

  const handleModeChange = (newMode: string) => {
    const mode = newMode as AgeInputMode;
    if (mode === activeTab) return;

    const hasActiveTabValue =
      activeTab === AgeInputModes.AGE ? hasAgeRange : hasBirthdateRange;

    if (hasActiveTabValue) {
      setActiveModal({ kind: 'inputMode', newMode: mode });
      return;
    }

    applyModeChange(mode);
  };

  const handleInputModeModalConfirm = () => {
    if (activeModal?.kind !== 'inputMode') return;
    applyModeChange(activeModal.newMode);
    setActiveModal(null);
  };

  const applyChildrenOnlyChange = async (value: boolean) => {
    const previousValue = childrenOnly;
    setChildrenOnlyMutationError(null);
    setValue('childrenOnly', value, { shouldValidate: true });
    if (!offerId) return;
    try {
      await changeChildrenOnlyMutation.mutateAsync({
        eventId: offerId,
        childrenOnly: value,
      });
    } catch (error) {
      setValue('childrenOnly', previousValue, { shouldValidate: true });
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

  const resetChildrenOnlyAudience = async () => {
    await applyChildrenOnlyChange(false);
    if (offerId && event?.departurePlaces?.length) {
      await changeDeparturePlacesMutation.mutateAsync({
        eventId: offerId,
        departurePlaces: [],
      });
    }
  };

  const handleAgeRangeModalConfirm = async () => {
    if (isChildrenOnlyPending) return;
    if (activeModal?.kind !== 'ageRange') return;
    const { newValue } = activeModal;
    try {
      await resetChildrenOnlyAudience();
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
      await resetChildrenOnlyAudience();
    } catch {
      return;
    }
    setActiveModal(null);
  };

  const showBirthdateOption = scope === OfferTypes.EVENTS;

  const showChildrenOnlySection =
    !isAgeCleared &&
    shouldShowChildrenOnlySection({
      scope,
      audienceType,
      typicalAgeRange: watchedTypicalAgeRange,
      birthdateRange: watchedBirthdateRange,
      childrenOnly,
    });

  const childrenOnlyValidationError = formState.errors.childrenOnly
    ? t('create.name_and_age.age.children_only.error')
    : null;

  const childrenOnlyError =
    childrenOnlyMutationError ?? childrenOnlyValidationError;

  const selectedPreset = findPresetKey(watchedTypicalAgeRange);
  const isAgeInputMode =
    !showBirthdateOption || activeTab === AgeInputModes.AGE;
  const showSelectedCategory =
    !!selectedPreset && !isAgeCleared && !isAgeManuallyEntered;

  const selectedCategoryLabel = selectedPreset
    ? `${t(`create.name_and_age.age.${selectedPreset.toLowerCase()}`)} ${
        AgeRanges[selectedPreset].label ?? ''
      }`.trim()
    : '';

  const displayedMinAge = isAgeCleared ? '' : minAge;
  const displayedMaxAge = isAgeCleared ? '' : maxAge;

  const childrenOnlySection = showChildrenOnlySection ? (
    <ChildrenOnlySection
      childrenOnly={childrenOnly}
      isPending={isChildrenOnlyPending}
      error={childrenOnlyError}
      onToggle={handleChildrenOnlyToggle}
    />
  ) : null;

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
            className="tw:max-w-160 tw:mb-8"
          />
        )}
        {isAgeInputMode ? (
          <AgeRangeInputs
            minAge={displayedMinAge}
            maxAge={displayedMaxAge}
            selectedCategoryLabel={selectedCategoryLabel}
            errorKey={isAgeCleared ? null : validateAgeRange(minAge, maxAge)}
            isPlaceScope={scope === OfferTypes.PLACES}
            showSelectedCategory={showSelectedCategory}
            childrenOnlySection={childrenOnlySection}
            onClear={handleAgeClear}
            onAgeCommit={commitAgeRange}
            onPresetClick={handlePresetClick}
          />
        ) : (
          <>
            <BirthdatePickers
              from={watchedBirthdateRange?.from}
              to={watchedBirthdateRange?.to}
              onCommit={commitBirthdateRange}
            />
            {childrenOnlySection}
          </>
        )}
      </Stack>

      <ConfirmModal
        name="input_mode"
        visible={activeModal?.kind === 'inputMode'}
        onClose={() => setActiveModal(null)}
        onConfirm={handleInputModeModalConfirm}
      />

      <ConfirmModal
        name="age_range"
        visible={activeModal?.kind === 'ageRange'}
        onClose={handleAgeRangeModalClose}
        onConfirm={handleAgeRangeModalConfirm}
      />

      <ConfirmModal
        name="departure_places"
        visible={activeModal?.kind === 'departurePlaces'}
        onClose={() => setActiveModal(null)}
        onConfirm={handleDeparturePlacesModalConfirm}
      />
      {toast.component}
    </Stack>
  );
};

export { AgeRangeStep, isChildrenOnlyValueMissing, isValidAgeRange };
