import { dehydrate } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  useAddUserToRoleMutation,
  useGetRolesByQuery,
  useRemoveUserFromRoleMutation,
} from '@/hooks/api/roles';
import {
  prefetchGetRolesQuery as prefetchGetUserRolesQuery,
  prefetchGetUserByIdQuery,
  useGetRolesQuery,
  useGetUserByIdQuery,
  User,
  UserById,
} from '@/hooks/api/user';
import { Role } from '@/types/Role';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Box } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { FormElement } from '@/ui/FormElement';
import { Inline } from '@/ui/Inline';
import { Link } from '@/ui/Link';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';
import { Table } from '@/ui/Table';
import { Text } from '@/ui/Text';
import { getGlobalBorderRadius, getValueFromTheme } from '@/ui/theme';
import { Title } from '@/ui/Title';
import { Toast } from '@/ui/Toast';
import { Typeahead } from '@/ui/Typeahead';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

const getGlobalValue = getValueFromTheme('global');

const UserEditpage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const userId = router.query.userId as string | undefined;

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [removeError, setRemoveError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeaheadKey, setTypeaheadKey] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const addUserToRoleMutation = useAddUserToRoleMutation();
  const removeUserFromRoleMutation = useRemoveUserFromRoleMutation();

  const userQuery = useGetUserByIdQuery(
    { id: userId as string },
    { enabled: !!userId },
  );

  const user: User | UserById | undefined = useMemo(
    () => userQuery.data ?? undefined,
    [userQuery.data],
  );

  const userRolesQuery = useGetRolesQuery();

  const userRoles = useMemo(() => {
    if (!user || !userRolesQuery.data) return [];
    return userRolesQuery.data;
  }, [user, userRolesQuery.data]);

  const rolesQuery = useGetRolesByQuery({
    name: searchTerm,
    paginationOptions: { start: 0, limit: 50 },
  });

  const availableRoles = useMemo(() => {
    if (!rolesQuery.data?.member) return [];

    const userRoleIds = userRoles.map((role) => role.uuid);
    return rolesQuery.data.member.filter(
      (role) => !userRoleIds.includes(role.uuid),
    );
  }, [rolesQuery.data?.member, userRoles]);

  const rolesToTableData = (roles: Role[]) =>
    roles.map((role) => ({
      name: role.name,
      options: role,
    }));

  const handleDeleteClick = (role: Role) => {
    setSelectedRole(role);
    setShowRemoveModal(true);
  };

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleRemoveConfirm = async () => {
    try {
      setRemoveError('');
      await removeUserFromRoleMutation.mutateAsync({
        roleId: selectedRole!.uuid,
        userId: user!.uuid,
      });
      await userRolesQuery.refetch();
      showSuccessToast(
        t('users.edit.success.role_deleted', {
          roleName: selectedRole?.name,
        }),
      );
      setShowRemoveModal(false);
      setSelectedRole(null);
    } catch (error) {
      setRemoveError(t('users.edit.roles.remove_modal.error'));
    }
  };

  const handleAddRole = async (role: Role) => {
    if (!user || !role) return;

    try {
      await addUserToRoleMutation.mutateAsync({
        roleId: role.uuid,
        userId: user!.uuid,
      });
      await userRolesQuery.refetch();
      showSuccessToast(
        t('users.edit.success.role_added', {
          roleName: role?.name,
        }),
      );
      setSearchTerm('');
      setTypeaheadKey((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to add role:', error);
    }
  };

  const handleRemoveCancel = () => {
    setRemoveError('');
    setShowRemoveModal(false);
    setSelectedRole(null);
  };

  const columns = useMemo(
    () => [
      {
        Header: t('users.edit.table.name'),
        accessor: 'name',
        Cell: ({ row }: { row: { original: { options: Role } } }) => (
          <Link href={`/manage/roles/${row.original.options.uuid}/edit`}>
            {row.original.options.name}
          </Link>
        ),
      },
      {
        Header: t('users.edit.table.options'),
        accessor: 'options',
        Cell: ({ row }: { row: { original: { options: Role } } }) => {
          return (
            <Inline>
              <Button
                variant={ButtonVariants.LINK}
                onClick={() => handleDeleteClick(row.original.options)}
              >
                {t('users.edit.actions.delete')}
              </Button>
            </Inline>
          );
        },
      },
    ],
    [t],
  );

  return (
    <Page>
      <Page.Title>{t('users.edit.title')}</Page.Title>
      <Page.Content>
        <Toast
          variant="success"
          body={toastMessage}
          visible={showToast}
          onClose={() => setShowToast(false)}
        />
        <Modal
          variant={ModalVariants.QUESTION}
          visible={showRemoveModal}
          title={'Zeker dat je deze rol wilt verwijderen?'}
          onClose={handleRemoveCancel}
          onConfirm={handleRemoveConfirm}
          confirmTitle={'ja ik ben zeker'}
          cancelTitle={'neen annuleer'}
          size={ModalSizes.MD}
          confirmButtonVariant={ButtonVariants.DANGER}
        >
          <Box padding={4}>
            <Stack spacing={4}>
              <Text>
                {/* <Trans
                i18nKey="users.edit.roles.remove_modal.message"
                values={{ roleName: selectedRole?.name }}
                components={{ br: <br />, strong: <strong /> }}
              /> */}
                Verwijder rol met naam: <strong>{selectedRole?.name}</strong>
              </Text>
              {removeError && (
                <Alert variant={AlertVariants.DANGER} fullWidth>
                  {removeError}
                </Alert>
              )}
            </Stack>
          </Box>
        </Modal>
        <Stack spacing={5}>
          <Stack
            backgroundColor="white"
            padding={4}
            borderRadius={getGlobalBorderRadius}
          >
            <Inline>
              <Text>
                {t('users.edit.email_label')}: {user?.email}
              </Text>
            </Inline>
            <Inline>
              <Text>
                {t('users.edit.name_label')}: {user?.username}
              </Text>
            </Inline>
          </Stack>
          <Stack>
            <Inline marginBottom={5}>
              <FormElement
                id="role-typeahead-form-input"
                label={t('users.edit.add_role')}
                width="40%"
                Component={
                  <Typeahead
                    key={typeaheadKey}
                    id="role-typeahead"
                    placeholder={t('users.edit.search_placeholder')}
                    onInputChange={setSearchTerm}
                    options={availableRoles}
                    labelKey={'name'}
                    onChange={(roles: Role[]) => {
                      if (roles.length === 0) {
                        return;
                      }
                      handleAddRole(roles[0]);
                    }}
                    isLoading={rolesQuery.isLoading}
                  />
                }
              />
            </Inline>
            <Stack
              backgroundColor="white"
              padding={4}
              borderRadius={getGlobalBorderRadius}
              css={`
                box-shadow: ${getGlobalValue('boxShadow.medium')};
              `}
            >
              <Title marginBottom={2}>{t('users.edit.table.title')}</Title>

              <Inline
                spacing={5}
                css={`
                  & table th:first-child {
                    min-width: 27em;
                  }
                `}
                className="table-responsive"
              >
                <Table
                  striped
                  bordered
                  hover
                  columns={columns}
                  data={rolesToTableData(userRoles)}
                />
              </Inline>
            </Stack>
          </Stack>
        </Stack>
      </Page.Content>
    </Page>
  );
};

export const getServerSideProps = getApplicationServerSideProps(
  async ({ req, query, queryClient, cookies }) => {
    const { userId } = query as { userId: string };

    await prefetchGetUserByIdQuery({ req, queryClient, id: userId });
    await prefetchGetUserRolesQuery({ req, queryClient });

    return {
      props: {
        cookies,
        dehydratedState: dehydrate(queryClient),
      },
    };
  },
);

export default UserEditpage;
