import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { PermissionType } from '@/constants/PermissionTypes';
import {
  useCreateRoleMutation,
  useUpdateRoleNameMutation,
} from '@/hooks/api/roles';
import { Role } from '@/types/Role';
import { Button, ButtonVariants } from '@/ui/Button';
import { Inline } from '@/ui/Inline';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';
import { Tabs } from '@/ui/Tabs';
import { getGlobalBorderRadius, getValueFromTheme } from '@/ui/theme';

import { ConstraintsSection } from './constraintsSection';
import { LabelsSection } from './labelsSection';
import { PermissionsSection } from './permissionsSection';
import { RoleNameField } from './roleNameField';
import { createRoleSchema, RoleFormDataInferred } from './roleSchema';
import { UsersSection } from './usersSection';

type FormData = {
  name: string;
  permissions: PermissionType[];
  users: any[];
  labels: any[];
  constraints?: {
    v3?: string;
  };
};

type RoleFormProps = {
  role?: Role;
};

export const RoleForm = ({ role }: RoleFormProps = {}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('permissions');

  const isEditMode = !!role;
  const roleId = role?.uuid;

  const form = useForm<RoleFormDataInferred>({
    resolver: yupResolver(createRoleSchema(t)),
    defaultValues: {
      name: role?.name || '',
      permissions: role?.permissions || [],
      users: [],
      labels: [],
      constraints: role?.constraints,
    },
    mode: 'onChange',
  });

  const getGlobalValue = getValueFromTheme('global');
  const createRoleMutation = useCreateRoleMutation();
  const updateRoleNameMutation = useUpdateRoleNameMutation();

  const onSubmit = useCallback(
    async (data: RoleFormDataInferred) => {
      setIsSubmitting(true);
      try {
        if (!isEditMode) {
          const result = await createRoleMutation.mutateAsync({
            name: data.name,
          });
          router.push(`/manage/roles/${result.roleId}/edit`);
        } else if (roleId) {
          if (role?.name !== data.name) {
            await updateRoleNameMutation.mutateAsync({
              roleId,
              name: data.name,
            });
          }
        }
      } catch (error) {
        // Handle error appropriately
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isEditMode,
      roleId,
      role,
      createRoleMutation,
      updateRoleNameMutation,
      router,
    ],
  );

  const handleCancel = () => {
    router.push('/manage/roles');
  };

  const pageTitle = isEditMode
    ? t('roles.form.edit_title')
    : t('roles.form.create_title');

  return (
    <Page>
      <Page.Title>{pageTitle}</Page.Title>
      <Page.Content>
        <FormProvider {...form}>
          <form>
            <Stack
              spacing={3}
              maxWidth="48rem"
              backgroundColor="white"
              padding={4}
              borderRadius={getGlobalBorderRadius}
              css={`
                box-shadow: ${getGlobalValue('boxShadow.medium')};
              `}
            >
              <RoleNameField isEditMode={isEditMode} currentName={role?.name} />

              {isEditMode && roleId && <ConstraintsSection roleId={roleId} />}

              {isEditMode && roleId && (
                <Tabs
                  activeKey={activeTab}
                  onSelect={(key) => setActiveTab(key as string)}
                  className="role-form-tabs"
                >
                  <Tabs.Tab
                    eventKey="permissions"
                    title={t('roles.form.permissions.title')}
                  >
                    <div className="bg-white rounded-lg p-6">
                      <PermissionsSection roleId={roleId} />
                    </div>
                  </Tabs.Tab>
                  <Tabs.Tab
                    eventKey="users"
                    title={t('roles.form.users.title')}
                  >
                    <div className="bg-white rounded-lg p-6">
                      <UsersSection roleId={roleId} />
                    </div>
                  </Tabs.Tab>
                  <Tabs.Tab
                    eventKey="labels"
                    title={t('roles.form.labels.title')}
                  >
                    <div className="bg-white rounded-lg p-6">
                      <LabelsSection roleId={roleId} />
                    </div>
                  </Tabs.Tab>
                </Tabs>
              )}

              {!isEditMode && (
                <Inline marginTop={5} spacing={3}>
                  <Button
                    title="submit"
                    variant={ButtonVariants.PRIMARY}
                    disabled={!form.formState.isValid || isSubmitting}
                    onClick={form.handleSubmit(onSubmit)}
                  >
                    {isSubmitting
                      ? t('roles.form.saving')
                      : t('roles.form.create')}
                  </Button>
                  <Button title="cancel" onClick={handleCancel}>
                    {t('roles.form.cancel')}
                  </Button>
                </Inline>
              )}
            </Stack>
          </form>
        </FormProvider>
      </Page.Content>
    </Page>
  );
};
