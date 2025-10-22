import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface UsersSectionProps {
  roleId: string;
}

export const UsersSection = ({ roleId }: UsersSectionProps) => {
  const { t } = useTranslation();
  const [emailInput, setEmailInput] = useState('');

  // TODO: Implement user management logic
  // This would use useGetRoleUsersQuery, useAddUserToRoleMutation, useRemoveUserFromRoleMutation
  // and useGetUserByEmailQuery (to be implemented)

  return (
    <div>
      <p className="text-gray-500">
        {t('roles.form.users.placeholder_message')} (Role ID: {roleId})
      </p>
    </div>
  );
};
