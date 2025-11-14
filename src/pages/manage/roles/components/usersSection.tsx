import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import {
  useAddUserToRoleMutation,
  useGetRoleUsersQuery,
  useRemoveUserFromRoleMutation,
} from '@/hooks/api/roles';
import { useHeaders } from '@/hooks/api/useHeaders';
import { getUserByEmail } from '@/hooks/api/user';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Button, ButtonVariants } from '@/ui/Button';
import { FormElement } from '@/ui/FormElement';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Stack } from '@/ui/Stack';
import { Table } from '@/ui/Table';
import { Text } from '@/ui/Text';
import { getGlobalBorderRadius, getValueFromTheme } from '@/ui/theme';

interface UsersSectionProps {
  roleId: string;
}

const addUserSchema = yup.object({
  email: yup
    .string()
    .trim()
    .required('E-mailadres is verplicht')
    .email('Voer een geldig e-mailadres in'),
});

type AddUserFormData = yup.InferType<typeof addUserSchema>;

export const UsersSection = ({ roleId }: UsersSectionProps) => {
  const { t } = useTranslation();
  const headers = useHeaders();
  const getGlobalValue = getValueFromTheme('global');
  const getTabsValue = getValueFromTheme('tabs');

  const {
    data: users = [],
    refetch,
    isLoading: loadingUsers,
  } = useGetRoleUsersQuery(roleId);
  const addUserMutation = useAddUserToRoleMutation();
  const removeUserMutation = useRemoveUserFromRoleMutation();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<AddUserFormData>({
    resolver: yupResolver(addUserSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: AddUserFormData) => {
    try {
      const userToAdd = await getUserByEmail({
        headers,
        email: data.email,
      });

      const userAlreadyInRole = users.some(
        (user) => user.uuid === userToAdd.uuid,
      );
      if (userAlreadyInRole) {
        setError('email', {
          type: 'manual',
          message: t('roles.form.users.user_already_in_role'),
        });
        return;
      }

      await addUserMutation.mutateAsync({
        roleId,
        userId: userToAdd.uuid,
      });

      reset();
      refetch();
    } catch (error) {
      if (error?.status === 404 || error?.message === 'Not Found') {
        setError('email', {
          type: 'manual',
          message: t('roles.form.users.user_not_found'),
        });
      } else {
        setError('email', {
          type: 'manual',
          message: t('roles.form.users.add_user_error'),
        });
      }
    }
  };

  const handleRemoveUser = useCallback(
    async (userId: string) => {
      try {
        await removeUserMutation.mutateAsync({
          roleId,
          userId,
        });
        refetch();
      } catch (error) {}
    },
    [removeUserMutation, roleId, refetch],
  );

  const columns = useMemo(
    () => [
      {
        Header: t('roles.form.users.table.email'),
        accessor: 'email',
      },
      {
        Header: t('roles.form.users.table.actions'),
        accessor: 'actions',
        Cell: ({ row }) => (
          <Button
            variant={ButtonVariants.LINK}
            onClick={() => handleRemoveUser(row.original.uuid)}
            disabled={removeUserMutation.isPending}
          >
            {t('roles.form.users.remove_membership')}
          </Button>
        ),
      },
    ],
    [t, handleRemoveUser, removeUserMutation.isPending],
  );

  return (
    <Stack
      className="role-users-section"
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
      <Inline spacing={2}>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <FormElement
              id="add-user-email"
              label={t('roles.form.users.add_user_label')}
              labelPosition="left"
              alignItems={'start'}
              error={errors.email?.message}
              Component={
                <Input
                  {...field}
                  minWidth={'22rem'}
                  type="email"
                  placeholder={t('roles.form.users.email_placeholder')}
                />
              }
            />
          )}
        />
        <Button
          marginLeft={3}
          maxHeight={'fit-content'}
          variant={ButtonVariants.PRIMARY}
          onClick={handleSubmit(onSubmit)}
          disabled={addUserMutation.isPending}
        >
          {t('roles.form.users.add')}
        </Button>
      </Inline>

      {loadingUsers && <Text>{t('roles.form.users.loading')}</Text>}

      {!loadingUsers && users.length > 0 && (
        <Table striped columns={columns} data={users} />
      )}

      {!loadingUsers && users.length === 0 && (
        <Alert variant={AlertVariants.PRIMARY} marginTop={4}>
          {t('roles.form.users.no_users_message')}
        </Alert>
      )}
    </Stack>
  );
};
