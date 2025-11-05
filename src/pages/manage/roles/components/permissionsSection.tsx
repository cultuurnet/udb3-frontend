import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  CorePermissionTypes,
  PermissionType,
} from '@/constants/PermissionTypes';
import {
  useAddPermissionToRoleMutation,
  useGetRoleByIdQuery,
  useRemovePermissionFromRoleMutation,
} from '@/hooks/api/roles';
import { CheckboxWithLabel } from '@/ui/CheckboxWithLabel';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Stack } from '@/ui/Stack';
import { getGlobalBorderRadius, getValueFromTheme } from '@/ui/theme';

interface PermissionsSectionProps {
  roleId: string;
}

export const PermissionsSection = ({ roleId }: PermissionsSectionProps) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingPermissions, setPendingPermissions] = useState<{
    [key: string]: boolean;
  }>({});
  const getGlobalValue = getValueFromTheme('global');
  const getTabsValue = getValueFromTheme('tabs');

  const { data: role } = useGetRoleByIdQuery(roleId);
  const addPermissionMutation = useAddPermissionToRoleMutation();
  const removePermissionMutation = useRemovePermissionFromRoleMutation();

  const availablePermissions = Object.values(CorePermissionTypes).map(
    (permission) => ({
      key: permission,
      name: t(`permissions.${permission}`),
    }),
  );

  const serverPermissions = useMemo(
    () => role?.permissions || [],
    [role?.permissions],
  );

  const filteredPermissions = availablePermissions.filter((permission) =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handlePermissionChange = async (
    permission: PermissionType,
    isChecked: boolean,
  ) => {
    setPendingPermissions((prev) => ({
      ...prev,
      [permission]: isChecked,
    }));

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
      setPendingPermissions((prev) => {
        const newState = { ...prev };
        delete newState[permission];
        return newState;
      });
    }
  };

  useEffect(() => {
    setPendingPermissions((prev) => {
      const newState = { ...prev };
      let hasChanges = false;

      Object.keys(prev).forEach((permission) => {
        const pendingValue = prev[permission];
        const serverHasPermission = serverPermissions.includes(
          permission as PermissionType,
        );

        if (pendingValue === serverHasPermission) {
          delete newState[permission];
          hasChanges = true;
        }
      });

      return hasChanges ? newState : prev;
    });
  }, [serverPermissions]);

  return (
    <Stack
      backgroundColor="white"
      padding={4}
      borderRadius={getGlobalBorderRadius}
      css={`
        box-shadow: ${getGlobalValue('boxShadow.medium')};
        border-top-left-radius: 0;
        border: 1px solid ${getTabsValue('borderColor')};
        margin-top: -1px;
      `}
    >
      <Inline alignItems="center" spacing={4}>
        <Stack flex={1}>
          <Input
            placeholder={t('roles.form.permissions.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Stack>
      </Inline>

      <Stack marginLeft={1} marginTop={3} spacing={2}>
        {filteredPermissions.map((permission) => {
          const isChecked =
            permission.key in pendingPermissions
              ? pendingPermissions[permission.key]
              : serverPermissions.includes(permission.key);

          return (
            <CheckboxWithLabel
              key={permission.key}
              id={`permission-${permission.key}`}
              name={`permission-${permission.key}`}
              checked={isChecked}
              onToggle={() =>
                handlePermissionChange(permission.key, !isChecked)
              }
            >
              {permission.name}
            </CheckboxWithLabel>
          );
        })}
      </Stack>
    </Stack>
  );
};
