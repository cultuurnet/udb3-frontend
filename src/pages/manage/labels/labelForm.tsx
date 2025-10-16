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
import { Button, ButtonVariants } from '@/ui/Button';
import { CheckboxWithLabel } from '@/ui/CheckboxWithLabel';
import { FormElement } from '@/ui/FormElement';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';
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

  const success = router.query.success as string | undefined;
  const successName = router.query.name as string | undefined;

  const headers = useHeaders();

  const isEditMode = !!label;

  const [successMessage, setSuccessMessage] = useState('');

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
  const { isUnique } = useIsLabelNameUnique({
    name: watchedName,
    currentName: label?.name,
  });

  useEffect(() => {
    if (success === 'created' && successName && label.uuid) {
      setSuccessMessage(
        t('labels.overview.success_created', {
          name: successName,
        }),
      );
      router.replace(`/manage/labels/${label.uuid}/edit`, undefined, {
        shallow: true,
      });
    }
  }, [success, successName, label, router, t]);

  const nameChanged =
    isEditMode && label?.name && watchedName.trim() !== label.name;

  const updateVisibilityMutation = useUpdateLabelVisibilityMutation();
  const updatePrivacyMutation = useUpdateLabelPrivacyMutation();
  const createLabelMutation = useCreateLabelMutation();

  const isSubmitting =
    updateVisibilityMutation.isPending ||
    updatePrivacyMutation.isPending ||
    createLabelMutation.isPending;

  const onSubmit = async (data: FormData) => {
    setSuccessMessage('');

    if (!isUnique && (!isEditMode || nameChanged)) {
      return;
    }

    if (!isEditMode) {
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
    }

    if (!label) return;

    if (nameChanged) {
      const response = await createLabelMutation.mutateAsync({
        headers,
        name: data.name.trim(),
        isVisible: data.isVisible,
        isPrivate: data.isPrivate,
        parentId: label.uuid,
      });

      if (response.uuid) {
        router.push(
          `/manage/labels/${
            response.uuid
          }/edit?success=created&name=${encodeURIComponent(data.name.trim())}`,
        );
      } else {
        router.push('/manage/labels');
      }
      return;
    }

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

  const handleCancel = () => {
    router.push('/manage/labels');
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
            nameChanged={nameChanged}
            onSubmit={onSubmit}
            onCancel={handleCancel}
            isUnique={isUnique}
          />
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
  nameChanged?: boolean;
  onSubmit: (data: FormData) => Promise<void> | void;
  onCancel: () => void;
  isUnique: boolean;
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
  nameChanged = false,
  onSubmit,
  onCancel,
  isUnique,
  footer,
}: LabelFormFieldsProps) => {
  const { t } = useTranslation();

  const isFormDisabled =
    mode === 'edit'
      ? (nameChanged && (!isUnique || !!formState.errors.name)) || isSubmitting
      : !formState.isValid || !isUnique || isSubmitting;

  const buttonText =
    mode === 'edit' && nameChanged
      ? t('labels.form.actions.create')
      : mode === 'edit'
        ? t('labels.form.actions.save')
        : t('labels.form.actions.create');

  const nameError =
    formState.errors.name?.message ||
    (!isUnique && t('labels.form.errors.name_unique'));

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
        <Button title="cancel" onClick={onCancel}>
          {t('labels.form.actions.cancel')}
        </Button>
      </Inline>
      {footer}
    </Stack>
  );
};

export { type FormData, LabelForm };
