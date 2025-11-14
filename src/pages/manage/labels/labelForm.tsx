import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react';
import {
  Control,
  Controller,
  FieldErrors,
  useForm,
  UseFormHandleSubmit,
  UseFormRegister,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import {
  useCreateLabelMutation,
  useIsLabelNameUnique,
  useUpdateLabelPrivacyMutation,
  useUpdateLabelVisibilityMutation,
} from '@/hooks/api/labels';
import { useHeaders } from '@/hooks/api/useHeaders';
import {
  Label,
  LabelPrivacyOptions,
  LabelValidationInformation,
  LabelVisibilityOptions,
} from '@/types/Offer';
import { Alert, AlertVariants } from '@/ui/Alert';
import { BackButton } from '@/ui/BackButton';
import { Button, ButtonVariants } from '@/ui/Button';
import { CheckboxWithLabel } from '@/ui/CheckboxWithLabel';
import { FormElement } from '@/ui/FormElement';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';
import { Text, TextVariants } from '@/ui/Text';
import { getGlobalBorderRadius, getValueFromTheme } from '@/ui/theme';

type FormData = {
  name: string;
  isVisible: boolean;
  isPrivate: boolean;
};

type LabelFormProps = {
  label?: Label;
};

const LabelForm = ({ label }: LabelFormProps = {}) => {
  const { t } = useTranslation();
  const router = useRouter();

  const headers = useHeaders();

  const isEditMode = !!label;

  const [successMessage, setSuccessMessage] = useState('');
  const [hasNameConflictError, setHasNameConflictError] = useState(false);

  const createValidationSchema = () => {
    return yup.object({
      name: yup
        .string()
        .trim()
        .required(t('labels.form.errors.name_required'))
        .min(
          LabelValidationInformation.MIN_LENGTH,
          t('labels.form.errors.name_min', {
            count: LabelValidationInformation.MIN_LENGTH,
          }),
        )
        .max(
          LabelValidationInformation.MAX_LENGTH,
          t('labels.form.errors.name_max', {
            count: LabelValidationInformation.MAX_LENGTH,
          }),
        )
        .test(
          'no-semicolon',
          t('labels.form.errors.semicolon'),
          (value) =>
            !value || !LabelValidationInformation.SEMICOLON_REGEX.test(value),
        ),
      isVisible: yup.boolean().default(true),
      isPrivate: yup.boolean().default(false),
    });
  };

  const { control, register, handleSubmit, formState, setValue, reset, watch } =
    useForm<FormData>({
      criteriaMode: 'all',
      resolver: yupResolver(createValidationSchema()),
      defaultValues: {
        name: label?.name || '',
        isVisible: label
          ? label.visibility !== LabelVisibilityOptions.INVISIBLE
          : true,
        isPrivate: label
          ? label.privacy === LabelPrivacyOptions.PRIVATE
          : false,
      },
      mode: 'onChange',
    });

  const watchedName = watch('name');

  // Reset name conflict error when user starts typing
  const [nameWhenErrorOccurred, setNameWhenErrorOccurred] = useState('');

  useEffect(() => {
    if (hasNameConflictError && watchedName !== nameWhenErrorOccurred) {
      setHasNameConflictError(false);
    }
  }, [watchedName, hasNameConflictError, nameWhenErrorOccurred]);

  const { isUnique } = useIsLabelNameUnique({
    name: watchedName,
  });

  const updateVisibilityMutation = useUpdateLabelVisibilityMutation();
  const updatePrivacyMutation = useUpdateLabelPrivacyMutation();
  const createLabelMutation = useCreateLabelMutation();

  const isSubmitting =
    updateVisibilityMutation.isPending ||
    updatePrivacyMutation.isPending ||
    createLabelMutation.isPending;

  const onSubmit = async (data: FormData) => {
    setSuccessMessage('');
    setHasNameConflictError(false);

    if (!isUnique && !isEditMode) {
      return;
    }

    if (!isEditMode) {
      try {
        await createLabelMutation.mutateAsync({
          headers,
          name: data.name.trim(),
          isVisible: data.isVisible,
          isPrivate: data.isPrivate,
        });
        router.push(
          `/manage/labels?success=created&name=${encodeURIComponent(data.name.trim())}`,
        );
        return;
      } catch (error) {
        setHasNameConflictError(true);
        setNameWhenErrorOccurred(data.name.trim());
        return;
      }
    }

    if (!label) return;

    const currentlyVisible =
      label.visibility !== LabelVisibilityOptions.INVISIBLE;
    const visibilityChanged = currentlyVisible !== data.isVisible;
    if (visibilityChanged) {
      await updateVisibilityMutation.mutateAsync({
        headers,
        id: label.uuid,
        isVisible: data.isVisible,
      });
    }

    const currentlyPrivate = label.privacy === LabelPrivacyOptions.PRIVATE;
    const privacyChanged = currentlyPrivate !== data.isPrivate;
    if (privacyChanged) {
      await updatePrivacyMutation.mutateAsync({
        headers,
        id: label.uuid,
        isPrivate: data.isPrivate,
      });
    }

    setSuccessMessage(
      t('labels.overview.success_updated', {
        name: label.name,
      }),
    );
  };

  const pageTitle = isEditMode
    ? t('labels.edit.title')
    : t('labels.create.title');

  return (
    <Page>
      <Page.Title>{pageTitle}</Page.Title>
      <Page.Content>
        <Stack spacing={4}>
          {successMessage && (
            <Alert variant={AlertVariants.SUCCESS} fullWidth>
              {successMessage}
            </Alert>
          )}
          <LabelFormFields
            mode={isEditMode ? 'edit' : 'create'}
            control={control}
            register={register}
            handleSubmit={handleSubmit}
            formState={formState}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            isUnique={isUnique}
            hasNameConflictError={hasNameConflictError}
            watchedName={watchedName}
          />
          <BackButton />
        </Stack>
      </Page.Content>
    </Page>
  );
};

type LabelFormFieldsProps = {
  mode: 'create' | 'edit';
  control: Control<FormData>;
  register: UseFormRegister<FormData>;
  handleSubmit: UseFormHandleSubmit<FormData>;
  formState: {
    errors: FieldErrors<FormData>;
    isValid: boolean;
    isDirty: boolean;
    isSubmitting: boolean;
  };
  isSubmitting?: boolean;
  onSubmit: (data: FormData) => Promise<void> | void;
  isUnique: boolean;
  hasNameConflictError: boolean;
  watchedName?: string;
  footer?: ReactNode;
};
const getGlobalValue = getValueFromTheme('global');

const LabelFormFields = ({
  mode,
  control,
  register,
  handleSubmit,
  formState,
  isSubmitting = false,
  onSubmit,
  isUnique,
  hasNameConflictError,
  watchedName,
  footer,
}: LabelFormFieldsProps) => {
  const { t } = useTranslation();

  const isFormDisabled =
    mode === 'edit'
      ? isSubmitting
      : !formState.isValid || !isUnique || hasNameConflictError || isSubmitting;

  const buttonText =
    mode === 'edit'
      ? t('labels.form.actions.save')
      : t('labels.form.actions.create');

  const nameError = (() => {
    const errors = [];

    if (formState.errors.name && formState.errors.name.types) {
      Object.values(formState.errors.name.types).forEach((error) => {
        if (typeof error === 'string') {
          errors.push(error);
        }
      });
    }

    if ((!isUnique || hasNameConflictError) && mode === 'create') {
      errors.push(t('labels.form.errors.name_unique'));
    }

    if (errors.length === 0) return undefined;

    return (
      <ul className="name-errors">
        {errors.map((error, index) => (
          <li key={`${error}-${index}`}>{error}</li>
        ))}
      </ul>
    );
  })();

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
      {mode === 'edit' ? (
        <FormElement
          label={t('labels.form.fields.name')}
          id="label-name-display"
          Component={
            <Inline spacing={2}>
              <Text variant={TextVariants.MUTED}>{watchedName}</Text>
            </Inline>
          }
        />
      ) : (
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <FormElement
              id="label-name"
              label={t('labels.form.fields.name')}
              error={nameError}
              maxLength={LabelValidationInformation.MAX_LENGTH}
              marginBottom={5}
              Component={<Input {...field} />}
            />
          )}
        />
      )}
      <Controller
        name="isVisible"
        control={control}
        render={({ field }) => (
          <CheckboxWithLabel
            id="label-visible"
            name="isVisible"
            checked={field.value}
            onToggle={(e) => field.onChange(e.currentTarget.checked)}
          >
            {t('labels.form.fields.is_visible')}
          </CheckboxWithLabel>
        )}
      />
      <Controller
        name="isPrivate"
        control={control}
        render={({ field }) => (
          <CheckboxWithLabel
            id="label-private"
            name="isPrivate"
            checked={field.value}
            onToggle={(e) => field.onChange(e.currentTarget.checked)}
          >
            {t('labels.form.fields.is_private')}
          </CheckboxWithLabel>
        )}
      />
      <Inline marginTop={5} spacing={3}>
        <Button
          title="submit"
          variant={ButtonVariants.PRIMARY}
          disabled={isFormDisabled}
          onClick={handleSubmit(onSubmit)}
        >
          {buttonText}
        </Button>
      </Inline>
      {footer}
    </Stack>
  );
};

export { type FormData, LabelForm };
