import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PermissionType, PermissionTypes } from '@/constants/PermissionTypes';
import {
  useAddPermissionToRoleMutation,
  useGetRoleByIdQuery,
  useRemovePermissionFromRoleMutation,
} from '@/hooks/api/roles';
import { CheckboxWithLabel } from '@/ui/CheckboxWithLabel';
import { Input } from '@/ui/Input';
import { Stack } from '@/ui/Stack';

interface PermissionsSectionProps {
  roleId: string;
}

export const PermissionsSection = ({ roleId }: PermissionsSectionProps) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: role } = useGetRoleByIdQuery(roleId);
  const addPermissionMutation = useAddPermissionToRoleMutation();
  const removePermissionMutation = useRemovePermissionFromRoleMutation();

  const availablePermissions = Object.values(PermissionTypes).map(
    (permission) => ({
      key: permission,
      name: t(`permissions.${permission}`),
    }),
  );

  const currentPermissions = role?.permissions || [];

  const filteredPermissions = availablePermissions.filter((permission) =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handlePermissionChange = async (
    permission: PermissionType,
    isChecked: boolean,
  ) => {
    try {
      if (isChecked) {
        await addPermissionMutation.mutateAsync({
          roleId,
          permission,
        });
      } else {
        await removePermissionMutation.mutateAsync({
          roleId,
          permission,
        });
      }
    } catch (error) {
      // Handle error
    }
  };

  return (
    <Stack spacing={4}>
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder={t('roles.form.permissions.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500">
          {currentPermissions.length} {t('roles.form.permissions.selected')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
        {filteredPermissions.map((permission) => {
          const isChecked = currentPermissions.includes(permission.key);
          return (
            <CheckboxWithLabel
              key={permission.key}
              id={`permission-${permission.key}`}
              name={`permission-${permission.key}`}
              checked={isChecked}
              onToggle={() =>
                handlePermissionChange(permission.key, !isChecked)
              }
              disabled={
                addPermissionMutation.isPending ||
                removePermissionMutation.isPending
              }
            >
              {permission.name}
            </CheckboxWithLabel>
          );
        })}
      </div>
    </Stack>
  );
};
