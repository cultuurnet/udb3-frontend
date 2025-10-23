import { useTranslation } from 'react-i18next';

import { useGetRoleUsersQuery } from '@/hooks/api/roles';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { getGlobalBorderRadius, getValueFromTheme } from '@/ui/theme';

interface UsersSectionProps {
  roleId: string;
}

export const UsersSection = ({ roleId }: UsersSectionProps) => {
  const { t } = useTranslation();
  const getGlobalValue = getValueFromTheme('global');

  const { data: users } = useGetRoleUsersQuery(roleId);

  console.table(users);

  // TODO: Implement user management logic
  // This would use useGetRoleUsersQuery, useAddUserToRoleMutation, useRemoveUserFromRoleMutation
  // and useGetUserByEmailQuery (to be implemented)

  return (
    <Stack
      backgroundColor="white"
      padding={4}
      borderRadius={getGlobalBorderRadius}
      css={`
        box-shadow: ${getGlobalValue('boxShadow.medium')};
        border-top-left-radius: 0;
      `}
    >
      <Text>
        {t('roles.form.users.placeholder_message')} (Role ID: {roleId})
      </Text>
    </Stack>
  );
};
