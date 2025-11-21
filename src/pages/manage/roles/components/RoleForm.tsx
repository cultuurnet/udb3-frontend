import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import {
  Control,
  FieldErrors,
  useForm,
  UseFormClearErrors,
  UseFormHandleSubmit,
  UseFormSetError,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { PermissionType, PermissionTypes } from '@/constants/PermissionTypes';
import {
  useCreateRoleMutation,
  useUpdateRoleNameMutation,
} from '@/hooks/api/roles';
import { RoleValidationInformation } from '@/types/Role';
import { Role } from '@/types/Role';
import { BackButton } from '@/ui/BackButton';
import { Button, ButtonVariants } from '@/ui/Button';
import { Inline } from '@/ui/Inline';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';
import { Tabs } from '@/ui/Tabs';

import { ConstraintsSection } from './ConstraintsSection';
import { DeleteRoleModal } from './DeleteRoleModal';
import { LabelsSection } from './LabelsSection';
import { PermissionsSection } from './PermissionsSection';
import { RoleNameField } from './RoleNameField';
import { UsersSection } from './UsersSection';

const createRoleSchema = (t: (key: string) => string) =>
  yup.object({
    name: yup
      .string()
      .trim()
      .required(t('roles.form.errors.name_required'))
      .min(
        RoleValidationInformation.MIN_LENGTH,
        t('roles.form.errors.name_min_length'),
      )
      .max(
        RoleValidationInformation.MAX_LENGTH,
        t('roles.form.errors.name_max_length'),
      ),

    permissions: yup
      .array()
      .of(yup.mixed<PermissionType>().oneOf(Object.values(PermissionTypes)))
      .default([]),
    users: yup
      .array()
      .of(
        yup.object({
          uuid: yup.string().required(),
          email: yup.string().email().required(),
          username: yup.string().optional(),
        }),
      )
      .default([]),

    labels: yup
      .array()
      .of(
        yup.object({
          uuid: yup.string().required(),
          name: yup.string().required(),
          privacy: yup
            .mixed<'public' | 'private'>()
            .oneOf(['public', 'private'])
            .optional(),
        }),
      )
      .default([]),

    constraints: yup
      .object({
        v3: yup.string().optional(),
      })
      .optional(),
  });

type RoleFormDataInferred = yup.InferType<ReturnType<typeof createRoleSchema>>;

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

  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

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

  const handleDelete = () => {
    if (role) {
      setRoleToDelete(role);
    }
  };

  const handleDeleteModalClose = () => {
    setRoleToDelete(null);
  };

  const handleRoleDeleted = () => {
    router.push('/manage/roles');
  };

  const pageTitle = isEditMode
    ? t('roles.form.edit_title')
    : t('roles.form.create_title');

  return (
    <Page>
      <Page.Title>{pageTitle}</Page.Title>
      <Page.Actions>
        {isEditMode && (
          <Button variant={ButtonVariants.LINK} onClick={handleDelete}>
            {t('roles.form.delete')}
          </Button>
        )}
      </Page.Actions>
      <Page.Content>
        <RoleFormFields
          mode={isEditMode ? 'edit' : 'create'}
          control={form.control}
          handleSubmit={form.handleSubmit}
          formState={form.formState}
          watch={form.watch}
          setError={form.setError}
          clearErrors={form.clearErrors}
          setValue={form.setValue}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onCancel={handleCancel}
          onDelete={handleDelete}
          role={role}
          roleId={roleId}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <DeleteRoleModal
          role={roleToDelete}
          onClose={handleDeleteModalClose}
          onDeleted={handleRoleDeleted}
        />
      </Page.Content>
    </Page>
  );
};

type RoleFormFieldsProps = {
  mode: 'create' | 'edit';
  control: Control<RoleFormDataInferred>;
  handleSubmit: UseFormHandleSubmit<RoleFormDataInferred>;
  formState: {
    isValid: boolean;
    isDirty: boolean;
    errors: FieldErrors<RoleFormDataInferred>;
    isSubmitting: boolean;
  };
  watch: UseFormWatch<RoleFormDataInferred>;
  setError: UseFormSetError<RoleFormDataInferred>;
  clearErrors: UseFormClearErrors<RoleFormDataInferred>;
  setValue: UseFormSetValue<RoleFormDataInferred>;
  isSubmitting: boolean;
  onSubmit: (data: RoleFormDataInferred) => Promise<void>;
  onCancel: () => void;
  onDelete: () => void;
  role?: Role;
  roleId?: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
};

const RoleFormFields = ({
  mode,
  control,
  handleSubmit,
  formState,
  watch,
  setError,
  clearErrors,
  setValue,
  isSubmitting,
  onSubmit,
  onCancel,
  onDelete,
  role,
  roleId,
  activeTab,
  onTabChange,
}: RoleFormFieldsProps) => {
  const { t } = useTranslation();
  const isEditMode = mode === 'edit';

  return (
    <Stack spacing={3}>
      <RoleNameField
        control={control}
        formState={formState}
        watch={watch}
        setError={setError}
        clearErrors={clearErrors}
        setValue={setValue}
        isEditMode={isEditMode}
        currentName={role?.name}
        onSubmit={handleSubmit(onSubmit)}
      />

      {isEditMode && roleId && <ConstraintsSection roleId={roleId} />}

      {isEditMode && roleId && (
        <Stack marginTop={3}>
          <Tabs
            activeKey={activeTab}
            onSelect={(key) => onTabChange(key as string)}
          >
            <Tabs.Tab
              eventKey="permissions"
              title={t('roles.form.permissions.title')}
            >
              <PermissionsSection roleId={roleId} />
            </Tabs.Tab>
            <Tabs.Tab eventKey="users" title={t('roles.form.users.title')}>
              <UsersSection roleId={roleId} />
            </Tabs.Tab>
            <Tabs.Tab eventKey="labels" title={t('roles.form.labels.title')}>
              <LabelsSection roleId={roleId} />
            </Tabs.Tab>
          </Tabs>
        </Stack>
      )}

      {!isEditMode && (
        <Inline marginTop={4} spacing={3}>
          <Button
            title="submit"
            variant={ButtonVariants.PRIMARY}
            disabled={!formState.isValid || isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            {isSubmitting ? t('roles.form.saving') : t('roles.form.create')}
          </Button>
        </Inline>
      )}

      <Inline marginTop={4} spacing={3}>
        <BackButton marginTop={0} onClick={onCancel} />
      </Inline>
    </Stack>
  );
};
