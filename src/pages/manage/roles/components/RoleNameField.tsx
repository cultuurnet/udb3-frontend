import { useEffect, useState } from 'react';
import {
  Control,
  Controller,
  FieldErrors,
  UseFormClearErrors,
  UseFormSetError,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useIsRoleNameUnique } from '@/hooks/api/roles';
import { RoleValidationInformation } from '@/types/Role';
import { Button, ButtonVariants } from '@/ui/Button';
import { FormElement } from '@/ui/FormElement';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';

interface RoleNameFieldProps {
  control: Control<any>;
  formState: {
    errors: FieldErrors<any>;
    isSubmitting: boolean;
  };
  watch: UseFormWatch<any>;
  setError: UseFormSetError<any>;
  clearErrors: UseFormClearErrors<any>;
  setValue: UseFormSetValue<any>;
  isEditMode?: boolean;
  currentName?: string;
}

const RoleNameDisplay = ({
  name,
  onEdit,
}: {
  name: string;
  onEdit: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <FormElement
      label={t('roles.form.name_label')}
      id="role-name-display"
      Component={
        <Inline spacing={2} alignItems="center">
          <Text>{name}</Text>
          <Button variant={ButtonVariants.LINK} onClick={onEdit}>
            {t('roles.form.name_edit')}
          </Button>
        </Inline>
      }
    />
  );
};

const RoleNameInput = ({
  control,
  formState: { errors, isSubmitting },
  showButtons = false,
  onCancel,
}: {
  control: Control<any>;
  formState: {
    errors: FieldErrors<any>;
    isSubmitting: boolean;
  };
  showButtons?: boolean;
  onCancel?: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <Stack spacing={3}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <FormElement
            label={t('roles.form.name_label')}
            id="role-name"
            error={errors.name?.message as string}
            maxLength={RoleValidationInformation.MAX_LENGTH}
            Component={
              <Input
                {...field}
                id="role-name"
                disabled={isSubmitting}
                maxLength={RoleValidationInformation.MAX_LENGTH}
              />
            }
          />
        )}
      />

      {showButtons && (
        <Inline marginTop={4} spacing={2}>
          <Button
            type="submit"
            variant={ButtonVariants.PRIMARY}
            disabled={!!errors.name || isSubmitting}
          >
            {isSubmitting ? t('roles.form.saving') : t('roles.form.save')}
          </Button>
          <Button
            type="button"
            variant={ButtonVariants.SECONDARY}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t('roles.form.cancel')}
          </Button>
        </Inline>
      )}
    </Stack>
  );
};

export const RoleNameField = ({
  control,
  formState: { errors },
  watch,
  setError,
  clearErrors,
  setValue,
  isEditMode = false,
  currentName,
}: RoleNameFieldProps) => {
  const { t } = useTranslation();

  const [isEditing, setIsEditing] = useState(!isEditMode);
  const watchedName = watch('name');
  const { isUnique, isLoading } = useIsRoleNameUnique({
    name: watchedName,
    currentName: currentName,
  });

  useEffect(() => {
    if (watchedName && watchedName.trim().length >= 3) {
      if (!isLoading && !isUnique) {
        setError('name', {
          type: 'unique',
          message: t('roles.form.errors.name_not_unique'),
        });
      } else if (!isLoading && isUnique && errors.name?.type === 'unique') {
        clearErrors('name');
      }
    } else if (
      watchedName &&
      watchedName.trim().length < 3 &&
      errors.name?.type === 'unique'
    ) {
      clearErrors('name');
    }
  }, [
    watchedName,
    isUnique,
    isLoading,
    setError,
    clearErrors,
    t,
    errors.name?.type,
  ]);

  const handleCancel = () => {
    if (currentName) {
      setValue('name', currentName);
    }
    setIsEditing(false);
  };

  if (!isEditMode) {
    return (
      <RoleNameInput
        control={control}
        formState={{ errors, isSubmitting: false }}
      />
    );
  }

  return isEditing ? (
    <RoleNameInput
      control={control}
      formState={{ errors, isSubmitting: false }}
      showButtons
      onCancel={handleCancel}
    />
  ) : (
    <RoleNameDisplay name={watchedName} onEdit={() => setIsEditing(true)} />
  );
};
