import { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useIsRoleNameUnique } from '@/hooks/api/roles';
import { RoleValidationInformation } from '@/types/Role';
import { Button, ButtonVariants } from '@/ui/Button';
import { FormElement } from '@/ui/FormElement';
import { Input } from '@/ui/Input';

interface RoleNameFieldProps {
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
        <div className="flex items-center space-x-2">
          <span className="text-gray-900">{name}</span>
          <button
            type="button"
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {t('roles.form.name_edit')}
          </button>
        </div>
      }
    />
  );
};

const RoleNameInput = ({
  showButtons = false,
  onCancel,
}: {
  showButtons?: boolean;
  onCancel?: () => void;
}) => {
  const { t } = useTranslation();
  const {
    control,
    formState: { errors, isSubmitting },
  } = useFormContext();

  return (
    <div className="space-y-3">
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
                placeholder={t('roles.form.name_placeholder')}
                disabled={isSubmitting}
                maxLength={RoleValidationInformation.MAX_LENGTH}
              />
            }
          />
        )}
      />

      {showButtons && (
        <div className="flex space-x-2">
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
        </div>
      )}
    </div>
  );
};

export const RoleNameField = ({
  isEditMode = false,
  currentName,
}: RoleNameFieldProps) => {
  const { t } = useTranslation();
  const {
    formState: { errors },
    watch,
    setError,
    clearErrors,
    setValue,
  } = useFormContext();

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
    return <RoleNameInput />;
  }

  return isEditing ? (
    <RoleNameInput showButtons onCancel={handleCancel} />
  ) : (
    <RoleNameDisplay name={watchedName} onEdit={() => setIsEditing(true)} />
  );
};
