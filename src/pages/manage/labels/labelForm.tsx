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
  useGetLabelByIdQuery,
  useIsLabelNameUnique,
  useUpdateLabelPrivacyMutation,
  useUpdateLabelVisibilityMutation,
} from '@/hooks/api/labels';
import { useHeaders } from '@/hooks/api/useHeaders';
import {
  LabelPrivacyTypes,
  LabelValidationInformation,
  LabelVisibilityTypes,
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

const LabelForm = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const labelId = router.query.labelId as string | undefined;
  const success = router.query.success as string | undefined;
  const successName = router.query.name as string | undefined;

  const headers = useHeaders();

  const isEditMode = !!labelId;

  const { data: label } = useGetLabelByIdQuery(
    { id: labelId! },
    { enabled: isEditMode },
  );

  const [successMessage, setSuccessMessage] = useState('');

  const createValidationSchema = () => {
    return yup.object({
      name: yup
        .string()
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
        name: '',
        isVisible: true,
        isPrivate: false,
      },
      mode: 'onChange',
    });

  const watchedName = watch('name');
  const { isUnique } = useIsLabelNameUnique({
    name: watchedName,
    currentName: label?.name,
  });

  // After creation of a label, show a success message and clean up the URL.
  useEffect(() => {
    if (success === 'created' && successName && labelId) {
      setSuccessMessage(
        t('labels.edit.success_created', {
          name: successName,
        }),
      );
      router.replace(`/manage/labels/${labelId}/edit`, undefined, {
        shallow: true,
      });
    }
  }, [success, successName, labelId, router, t]);

  useEffect(() => {
    if (isEditMode && label) {
      reset({
        name: label.name || '',
        isVisible: label.visibility !== LabelVisibilityTypes.INVISIBLE,
        isPrivate: label.privacy === LabelPrivacyTypes.PRIVATE,
      });
    } else if (!isEditMode) {
      reset({
        name: '',
        isVisible: true,
        isPrivate: false,
      });
    }
  }, [isEditMode, label, reset]);

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

    try {
      if (!isEditMode) {
        await createLabelMutation.mutateAsync({
          headers,
          name: data.name.trim(),
          isVisible: data.isVisible,
          isPrivate: data.isPrivate,
        });
        router.push('/manage/labels');
        return;
      }

      if (!label) return;

      if (nameChanged) {
        const response = await createLabelMutation.mutateAsync({
          headers,
          name: data.name.trim(),
          isVisible: data.isVisible,
          isPrivate: data.isPrivate,
          parentId: labelId,
        });

        if (response.uuid) {
          router.push(
            `/manage/labels/${
              response.uuid
            }/edit?success=created&name=${encodeURIComponent(
              data.name.trim(),
            )}`,
          );
        } else {
          router.push('/manage/labels');
        }
        return;
      }

      const visibilityChanged =
        (label.visibility !== LabelVisibilityTypes.INVISIBLE) !==
        data.isVisible;
      const privacyChanged =
        (label.privacy === LabelPrivacyTypes.PRIVATE) !== data.isPrivate;

      if (visibilityChanged) {
        await updateVisibilityMutation.mutateAsync({
          headers,
          id: labelId,
          makeVisible: data.isVisible,
        });
      }
      if (privacyChanged) {
        await updatePrivacyMutation.mutateAsync({
          headers,
          id: labelId,
          makePrivate: data.isPrivate,
        });
      }

      setSuccessMessage(
        t('labels.edit.success_updated', {
          name: label.name,
        }),
      );
    } catch (error) {
      // Error handling is managed by the mutation hooks
    }
  };

  const handleCancel = () => {
    router.push('/manage/labels');
  };

  const pageTitle = isEditMode
    ? t('labels.edit.title', 'Edit label')
    : t('labels.create.title', 'Create label');

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

// Form fields component (internal)
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

  // Calculate if form should be disabled
  const isFormDisabled =
    mode === 'edit'
      ? (nameChanged && (!isUnique || !!formState.errors.name)) || isSubmitting
      : !formState.isValid || isSubmitting;

  const buttonText =
    mode === 'edit' && nameChanged
      ? t('labels.form.actions.create')
      : mode === 'edit'
        ? t('labels.form.actions.save')
        : t('labels.form.actions.create');

  const nameError =
    formState.errors.name?.message ||
    (nameChanged && !isUnique && t('labels.form.errors.name_unique'));

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
        maxLength={LabelValidationInformation.MAX_LENGTH}
        Component={<Input {...register('name')} />}
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

      <Inline spacing={3}>
        <Button
          variant={ButtonVariants.PRIMARY}
          disabled={isFormDisabled}
          onClick={handleSubmit(onSubmit)}
        >
          {buttonText}
        </Button>
        <Button onClick={onCancel}>{t('labels.form.actions.cancel')}</Button>
      </Inline>
      {footer}
    </Stack>
  );
};

export default LabelFormFields;
export { type FormData, LabelForm };
