import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  useCreateRoleConstraintMutation,
  useGetRoleByIdQuery,
  useRemoveRoleConstraintMutation,
  useUpdateRoleConstraintMutation,
} from '@/hooks/api/roles';
import { Button, ButtonVariants } from '@/ui/Button';
import { FormElement } from '@/ui/FormElement';
import { Input } from '@/ui/Input';
import { Stack } from '@/ui/Stack';

interface ConstraintsSectionProps {
  roleId: string;
}

export const ConstraintsSection = ({ roleId }: ConstraintsSectionProps) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [constraintValue, setConstraintValue] = useState('');

  const { data: role } = useGetRoleByIdQuery(roleId);
  const createConstraintMutation = useCreateRoleConstraintMutation();
  const updateConstraintMutation = useUpdateRoleConstraintMutation();
  const removeConstraintMutation = useRemoveRoleConstraintMutation();

  const currentConstraint = role?.constraints?.v3;
  const hasConstraint = !!currentConstraint;

  const handleEdit = () => {
    setConstraintValue(currentConstraint || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (hasConstraint) {
        await updateConstraintMutation.mutateAsync({
          roleId,
          constraint: constraintValue,
        });
      } else {
        await createConstraintMutation.mutateAsync({
          roleId,
          constraint: constraintValue,
        });
      }
      setIsEditing(false);
    } catch (error) {
      // Handle error
    }
  };

  const handleRemove = async () => {
    try {
      await removeConstraintMutation.mutateAsync({ roleId });
    } catch (error) {
      // Handle error
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setConstraintValue('');
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">
        {t('roles.form.constraints.title')}
      </h3>

      {!isEditing ? (
        <Stack spacing={3}>
          <div>
            <p className="text-sm text-gray-700 mb-2">
              {t('roles.form.constraints.current')}
            </p>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded">
              {currentConstraint || t('roles.form.constraints.none')}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant={ButtonVariants.SECONDARY} onClick={handleEdit}>
              {hasConstraint
                ? t('roles.form.constraints.edit')
                : t('roles.form.constraints.add')}
            </Button>
            {hasConstraint && (
              <Button
                variant={ButtonVariants.DANGER}
                onClick={handleRemove}
                disabled={removeConstraintMutation.isPending}
              >
                {t('roles.form.constraints.remove')}
              </Button>
            )}
          </div>
        </Stack>
      ) : (
        <Stack spacing={3}>
          <FormElement
            label={t('roles.form.constraints.value_label')}
            id="constraint-value"
            Component={
              <Input
                value={constraintValue}
                onChange={(e) => setConstraintValue(e.target.value)}
                placeholder={t('roles.form.constraints.placeholder')}
              />
            }
          />
          <div className="flex space-x-2">
            <Button
              variant={ButtonVariants.PRIMARY}
              onClick={handleSave}
              disabled={
                createConstraintMutation.isPending ||
                updateConstraintMutation.isPending
              }
            >
              {t('roles.form.save')}
            </Button>
            <Button variant={ButtonVariants.SECONDARY} onClick={handleCancel}>
              {t('roles.form.cancel')}
            </Button>
          </div>
        </Stack>
      )}
    </div>
  );
};
