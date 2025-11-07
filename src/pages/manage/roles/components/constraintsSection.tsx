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
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Stack } from '@/ui/Stack';
import { Text, TextVariants } from '@/ui/Text';
import { Title } from '@/ui/Title';

interface ConstraintsSectionProps {
  roleId: string;
}

export const ConstraintsSection = ({ roleId }: ConstraintsSectionProps) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [constraintValue, setConstraintValue] = useState('');

  const { data: role, refetch } = useGetRoleByIdQuery(roleId);
  const createConstraintMutation = useCreateRoleConstraintMutation();
  const updateConstraintMutation = useUpdateRoleConstraintMutation();
  const removeConstraintMutation = useRemoveRoleConstraintMutation();

  const currentConstraint = role?.constraints?.v3;
  const displayValue = constraintValue || currentConstraint;
  const hasConstraint = !!displayValue;
  const hasServerConstraint = !!currentConstraint;
  const isConstraintValueEmpty = !constraintValue.trim();

  const handleEdit = () => {
    setConstraintValue(currentConstraint || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setIsEditing(false);

      if (hasServerConstraint) {
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

      await refetch();
    } catch (error) {
      setConstraintValue(currentConstraint || '');
      setIsEditing(true);
    }
  };
  const handleRemove = async () => {
    try {
      await removeConstraintMutation.mutateAsync({ roleId });

      setConstraintValue('');
      await refetch();
    } catch (error) {
      setConstraintValue(currentConstraint || '');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setConstraintValue('');
  };

  return (
    <Stack marginBottom={4} spacing={4} className="role-constraints-section">
      <Title marginTop={4} size={3}>
        {t('roles.form.constraints.title')}
      </Title>

      {!isEditing ? (
        <Inline spacing={5}>
          {displayValue && (
            <Inline spacing={2}>
              <Text variant={TextVariants.MUTED}>{displayValue}</Text>
            </Inline>
          )}
          <Inline spacing={2}>
            {hasConstraint ? (
              <Inline>
                <Button variant={ButtonVariants.LINK} onClick={handleEdit}>
                  {t('roles.form.constraints.edit')}
                </Button>
                <Button
                  variant={ButtonVariants.LINK}
                  onClick={handleRemove}
                  disabled={removeConstraintMutation.isPending}
                >
                  {t('roles.form.constraints.remove')}
                </Button>
              </Inline>
            ) : (
              <Button
                variant={ButtonVariants.LINK}
                onClick={handleEdit}
                disabled={removeConstraintMutation.isPending}
              >
                {t('roles.form.constraints.add')}
              </Button>
            )}
          </Inline>
        </Inline>
      ) : (
        <Stack spacing={3}>
          <FormElement
            id="constraint-value"
            Component={
              <Input
                value={constraintValue}
                onChange={(e) => setConstraintValue(e.target.value)}
              />
            }
          />
          <Inline marginTop={3} spacing={2}>
            <Button
              variant={ButtonVariants.PRIMARY}
              onClick={handleSave}
              disabled={
                isConstraintValueEmpty ||
                createConstraintMutation.isPending ||
                updateConstraintMutation.isPending
              }
            >
              {t('roles.form.save')}
            </Button>
            <Button variant={ButtonVariants.PRIMARY} onClick={handleCancel}>
              {t('roles.form.cancel')}
            </Button>
          </Inline>
        </Stack>
      )}
    </Stack>
  );
};
