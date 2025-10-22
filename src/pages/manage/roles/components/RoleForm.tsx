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
import { Stack } from '@/ui/Stack';
import { Tabs } from '@/ui/Tabs';

import { ConstraintsSection } from './ConstraintsSection';
import { LabelsSection } from './LabelsSection';
import { PermissionsSection } from './PermissionsSection';
import { RoleNameField } from './RoleNameField';
import { createRoleSchema, RoleFormDataInferred } from './roleSchema';
import { UsersSection } from './UsersSection';

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
        console.error('Role operation failed:', error);
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

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack spacing={6}>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">
              {!isEditMode
                ? t('roles.form.create_title')
                : t('roles.form.edit_title')}
            </h2>
            <RoleNameField isEditMode={isEditMode} currentName={role?.name} />
          </div>

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
              <Tabs.Tab eventKey="users" title={t('roles.form.users.title')}>
                <div className="bg-white rounded-lg p-6">
                  <UsersSection roleId={roleId} />
                </div>
              </Tabs.Tab>
              <Tabs.Tab eventKey="labels" title={t('roles.form.labels.title')}>
                <div className="bg-white rounded-lg p-6">
                  <LabelsSection roleId={roleId} />
                </div>
              </Tabs.Tab>
            </Tabs>
          )}

          {!isEditMode && (
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant={ButtonVariants.SECONDARY}
                onClick={() => router.push('/manage/roles')}
              >
                {t('roles.form.cancel')}
              </Button>
              <Button
                type="submit"
                variant={ButtonVariants.PRIMARY}
                disabled={!form.formState.isValid || isSubmitting}
              >
                {isSubmitting ? t('roles.form.saving') : t('roles.form.create')}
              </Button>
            </div>
          )}
        </Stack>
      </form>
    </FormProvider>
  );
};
