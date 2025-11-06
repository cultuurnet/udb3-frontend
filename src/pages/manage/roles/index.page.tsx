import { dehydrate } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import Router from 'next/router';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { QueryStatus } from '@/hooks/api/authenticated-query';
import {
  prefetchGetRolesQuery,
  useDeleteRoleMutation,
  useGetRolesByQuery,
} from '@/hooks/api/roles';
import { Role } from '@/types/Role';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Box } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { FormElement } from '@/ui/FormElement';
import { Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Link } from '@/ui/Link';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { Page } from '@/ui/Page';
import { Pagination } from '@/ui/Pagination';
import { Spinner } from '@/ui/Spinner';
import { Stack } from '@/ui/Stack';
import { Table } from '@/ui/Table';
import { Text } from '@/ui/Text';
import { getGlobalBorderRadius, getValueFromTheme } from '@/ui/theme';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

const rolesPerPage = 10;
const getGlobalValue = getValueFromTheme('global');
const getTableValue = getValueFromTheme('selectionTable');

const RolesOverviewPage = () => {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState('');
  const [currentPageRoles, setCurrentPageRoles] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const deleteRoleMutation = useDeleteRoleMutation({
    onSuccess: () => {
      setSuccessMessage(
        t('roles.overview.success_deleted', { name: roleToDelete?.name }),
      );
      setShowDeleteModal(false);
      setRoleToDelete(null);
      setDeleteError('');
      rolesQuery.refetch();
    },
    onError: () => {
      setDeleteError(t('roles.overview.delete.error'));
    },
  });

  const rolesToTableData = (roles: Role[]) =>
    roles.map((role) => ({
      name: role.name,
      options: role,
    }));

  const rolesQuery = useGetRolesByQuery({
    name: searchInput,
    paginationOptions: {
      start: (currentPageRoles - 1) * rolesPerPage,
      limit: rolesPerPage,
    },
  });

  const totalRoles = rolesQuery.data?.totalItems ?? 0;

  const actions = [
    {
      iconName: Icons.PLUS,
      title: t('roles.overview.create'),
      onClick: () => Router.push('/manage/roles/create'),
      disabled: false,
    },
  ];

  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role);
    setShowDeleteModal(true);
    setDeleteError('');
  };

  const handleDeleteConfirm = () => {
    if (roleToDelete) {
      deleteRoleMutation.mutate({ id: roleToDelete.uuid });
    }
  };

  const handleDeleteCancel = () => {
    setRoleToDelete(null);
    setShowDeleteModal(false);
    setDeleteError('');
  };

  const columns = useMemo(
    () => [
      {
        Header: t('roles.overview.table.name'),
        accessor: 'name',
        Cell: ({ cell }: { cell: { value: string } }) => (
          <Text>{cell.value}</Text>
        ),
      },
      {
        Header: t('roles.overview.table.options'),
        accessor: 'options',
        Cell: ({ cell }: { cell: { value: Role } }) => {
          return (
            <Inline>
              <Link
                marginTop={0.5}
                paddingRight={2.5}
                href={`/manage/roles/${cell.value.uuid}`}
              >
                {t('roles.overview.table.edit')}
              </Link>
              <Text>|</Text>
              <Button
                variant={ButtonVariants.LINK}
                onClick={() => handleDeleteClick(cell.value)}
              >
                {t('roles.overview.table.delete')}
              </Button>
            </Inline>
          );
        },
      },
    ],
    [t],
  );

  const roles: Role[] = useMemo(
    () => rolesQuery.data?.member ?? [],
    [rolesQuery.data?.member],
  );

  const handleInputSearch = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const searchTerm: string = event.target.value.trim();
      if (searchTerm.length > 2 || searchTerm.length === 0) {
        setSuccessMessage('');
        setCurrentPageRoles(1);
        setSearchInput(searchTerm);
      }
    },
    [],
  );

  return (
    <Page>
      <Page.Title>{t('roles.overview.title')}</Page.Title>
      <Page.Content spacing={5}>
        <Stack spacing={4}>
          <FormElement
            id="roles-overview-search"
            label={t('roles.overview.search.label')}
            Component={
              <Input
                placeholder={t('roles.overview.search.placeholder')}
                onChange={debounce(handleInputSearch, 275)}
              />
            }
          />
          {successMessage && (
            <Alert variant={AlertVariants.SUCCESS} fullWidth={true}>
              {successMessage}
            </Alert>
          )}
          {rolesQuery.status === QueryStatus.SUCCESS && roles.length === 0 && (
            <Alert variant={AlertVariants.WARNING} fullWidth={true}>
              {t('roles.overview.no_results')}
            </Alert>
          )}
          {rolesQuery.status === QueryStatus.ERROR && (
            <Alert variant={AlertVariants.WARNING} fullWidth={true}>
              {t('roles.overview.something_wrong', {
                error: rolesQuery.error?.message,
              })}
            </Alert>
          )}
        </Stack>

        <Stack
          backgroundColor="white"
          padding={4}
          borderRadius={getGlobalBorderRadius}
          css={`
            box-shadow: ${getGlobalValue('boxShadow.medium')};
          `}
        >
          <Inline
            alignItems="center"
            paddingBottom={4}
            css={`
              border-bottom: 2px solid ${getTableValue('borderColor')};
            `}
          >
            <Inline spacing={3}>
              {actions.map(({ iconName, title, onClick, disabled }) => (
                <Button
                  key={title}
                  variant={ButtonVariants.PRIMARY}
                  onClick={onClick}
                  disabled={disabled}
                  iconName={iconName}
                  spacing={3}
                >
                  {title}
                </Button>
              ))}
            </Inline>
          </Inline>
          {rolesQuery.status === QueryStatus.LOADING && <Spinner />}
          {rolesQuery.status === QueryStatus.SUCCESS && roles.length > 0 && (
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
                data={rolesToTableData(roles)}
              />
            </Inline>
          )}
        </Stack>

        <Pagination
          currentPage={currentPageRoles}
          totalItems={totalRoles}
          perPage={rolesPerPage}
          onChangePage={setCurrentPageRoles}
        />

        <Modal
          variant={ModalVariants.QUESTION}
          visible={showDeleteModal}
          title={t('roles.overview.delete.title')}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          confirmTitle={t('roles.overview.delete.confirm')}
          cancelTitle={t('roles.overview.delete.cancel')}
          confirmLoading={deleteRoleMutation.isPending}
          size={ModalSizes.MD}
        >
          <Box padding={4}>
            <Stack spacing={4}>
              <Text>
                {t('roles.overview.delete.message', {
                  name: roleToDelete?.name,
                })}
              </Text>
              {deleteError && (
                <Alert variant={AlertVariants.DANGER} fullWidth={true}>
                  {deleteError}
                </Alert>
              )}
            </Stack>
          </Box>
        </Modal>
      </Page.Content>
    </Page>
  );
};

export const getServerSideProps = getApplicationServerSideProps(
  async ({ req, cookies, queryClient }) => {
    await prefetchGetRolesQuery({
      req,
      queryClient,
      paginationOptions: { limit: rolesPerPage, start: 0 },
    });

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        cookies,
      },
    };
  },
);

export default RolesOverviewPage;
