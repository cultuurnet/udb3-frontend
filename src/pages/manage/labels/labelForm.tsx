import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { LabelValidationInformation } from '@/types/Offer';
import { Button, ButtonVariants } from '@/ui/Button';
import { CheckboxWithLabel } from '@/ui/CheckboxWithLabel';
import { FormElement } from '@/ui/FormElement';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Stack } from '@/ui/Stack';
import { getGlobalBorderRadius, getValueFromTheme } from '@/ui/theme';

type Props = {
  mode: 'create' | 'edit';
  name: string;
  setName: (value: string) => void;
  isVisible: boolean;
  setIsVisible: (value: boolean) => void;
  isPrivate: boolean;
  setIsPrivate: (value: boolean) => void;
  nameError?: string;
  maxNameLength?: number;
  touched?: boolean;
  setTouched?: (value: boolean) => void;
  isSubmitting?: boolean;
  onCancel: () => void;
  // Edit mode specifics
  nameChanged?: boolean;
  onSave?: () => Promise<void> | void;
  onCreateRenamed?: () => Promise<void> | void;
  footer?: ReactNode;
};
const getGlobalValue = getValueFromTheme('global');

const LabelForm = ({
  mode,
  name,
  setName,
  isVisible,
  setIsVisible,
  isPrivate,
  setIsPrivate,
  nameError,
  maxNameLength = LabelValidationInformation.MAX_LENGTH,
  touched = false,
  setTouched = () => {},
  isSubmitting = false,
  onCancel,
  nameChanged = false,
  onSave = () => {},
  onCreateRenamed = () => {},
  footer,
}: Props) => {
  const { t } = useTranslation();

  return (
    <Stack
      spacing={3}
      maxWidth="48rem"
      backgroundColor="white"
      padding={4}
      borderRadius={getGlobalBorderRadius}
      css={`
        box-shadow: ${getGlobalValue('boxShadow.medium')};
      `}
    >
      <FormElement
        id="label-name"
        label={t('labels.form.fields.name')}
        error={nameError}
        maxLength={maxNameLength}
        Component={
          <Input
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            onBlur={() => setTouched(true)}
          />
        }
      />
      <CheckboxWithLabel
        id="label-visible"
        name="isVisible"
        checked={isVisible}
        onToggle={(e) => setIsVisible(e.currentTarget.checked)}
      >
        {t('labels.form.fields.is_visible')}
      </CheckboxWithLabel>
      <CheckboxWithLabel
        id="label-private"
        name="isPrivate"
        checked={isPrivate}
        onToggle={(e) => setIsPrivate(e.currentTarget.checked)}
      >
        {t('labels.form.fields.is_private')}
      </CheckboxWithLabel>

      <Inline spacing={3}>
        {mode === 'edit' && (
          <Button
            variant={ButtonVariants.PRIMARY}
            disabled={(nameChanged && !!nameError) || isSubmitting}
            onClick={() => onSave()}
          >
            {nameChanged
              ? t('labels.form.actions.create')
              : t('labels.form.actions.save')}
          </Button>
        )}
        {mode === 'create' && (
          <Button
            variant={ButtonVariants.PRIMARY}
            disabled={!!nameError || isSubmitting || !touched}
            onClick={() => onCreateRenamed()}
          >
            {t('labels.form.actions.create')}
          </Button>
        )}
        <Button onClick={onCancel}>{t('labels.form.actions.cancel')}</Button>
      </Inline>
      {footer}
    </Stack>
  );
};

export default LabelForm;
