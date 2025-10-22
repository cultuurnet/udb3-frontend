import { PermissionType } from '@/constants/PermissionTypes';
import {
  PaginationOptions,
  prefetchAuthenticatedQuery,
  queryOptions,
  ServerSideQueryOptions,
  useAuthenticatedMutation,
  useAuthenticatedQuery,
} from '@/hooks/api/authenticated-query';
import type { Headers } from '@/hooks/api/types/Headers';
import { PaginatedData } from '@/types/PaginatedData';
import { Role, RoleLabel, RoleUser } from '@/types/Role';
import { fetchFromApi } from '@/utils/fetchFromApi';

const prefetchGetRolesQuery = ({
  req,
  queryClient,
  name,
  paginationOptions,
}: ServerSideQueryOptions & PaginationOptions & { name?: string }) =>
  prefetchAuthenticatedQuery({
    req,
    queryClient,
    ...createGetRolesQueryOptions({
      name,
      paginationOptions,
    }),
  });

const getRoles = async ({
  headers,
  name,
  start,
  limit,
}: {
  headers: Headers;
  name: string;
  start: string;
  limit: string;
}) => {
  const searchParams = new URLSearchParams({
    query: name,
    limit: limit,
    start: start,
  });
  const res = await fetchFromApi({
    path: '/roles/',
    searchParams,
    options: {
      headers,
    },
  });
  return (await res.json()) as PaginatedData<Role[]>;
};

const createGetRolesQueryOptions = ({
  name = '',
  paginationOptions = { start: 0, limit: 10 },
}: PaginationOptions & { name?: string }) =>
  queryOptions({
    queryKey: ['roles'],
    queryFn: getRoles,
    queryArguments: {
      name,
      start: `${paginationOptions.start}`,
      limit: `${paginationOptions.limit}`,
    },
  });

const useGetRolesByQuery = ({
  name,
  paginationOptions = { start: 0, limit: 10 },
}: PaginationOptions & { name: string }) => {
  const options = createGetRolesQueryOptions({
    name,
    paginationOptions,
  });

  return useAuthenticatedQuery({
    ...options,
  });
};

const deleteRole = async ({ headers, id }: { headers: Headers; id: string }) =>
  fetchFromApi({
    path: `/roles/${id}`,
    options: { headers, method: 'DELETE' },
  });

const useDeleteRoleMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: deleteRole,
    mutationKey: 'roles-delete',
    ...configuration,
  });

// Get single role
const prefetchGetRoleByIdQuery = ({
  req,
  queryClient,
  id,
}: ServerSideQueryOptions & { id: string }) =>
  prefetchAuthenticatedQuery({
    req,
    queryClient,
    queryKey: ['roles', id],
    queryFn: getRole,
    queryArguments: { id },
  });

const getRole = async ({ headers, id }: { headers: Headers; id: string }) => {
  const res = await fetchFromApi({
    path: `/roles/${id}`,
    options: { headers },
  });
  return (await res.json()) as Role;
};

const useGetRoleByIdQuery = (id: string) => {
  return useAuthenticatedQuery({
    queryKey: ['roles', id],
    queryFn: getRole,
    queryArguments: { id },
    enabled: !!id,
  });
};

// Create role
const createRole = async ({
  headers,
  name,
}: {
  headers: Headers;
  name: string;
}) => {
  const res = await fetchFromApi({
    path: '/roles/',
    options: {
      headers,
      method: 'POST',
      body: JSON.stringify({ name }),
    },
  });
  return (await res.json()) as { roleId: string };
};

const useCreateRoleMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: createRole,
    mutationKey: 'roles-create',
    ...configuration,
  });

// Update role name
const updateRoleName = async ({
  headers,
  roleId,
  name,
}: {
  headers: Headers;
  roleId: string;
  name: string;
}) => {
  return fetchFromApi({
    path: `/roles/${roleId}/name`,
    options: {
      headers,
      method: 'PUT',
      body: JSON.stringify({ name }),
    },
  });
};

const useUpdateRoleNameMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: updateRoleName,
    mutationKey: 'roles-update-name',
    ...configuration,
  });

// Role permissions
const getRolePermissions = async ({
  headers,
  roleId,
}: {
  headers: Headers;
  roleId: string;
}) => {
  const res = await fetchFromApi({
    path: `/roles/${roleId}/permissions/`,
    options: { headers },
  });
  return (await res.json()) as PermissionType[];
};

const addPermissionToRole = async ({
  headers,
  roleId,
  permission,
}: {
  headers: Headers;
  roleId: string;
  permission: PermissionType;
}) => {
  return fetchFromApi({
    path: `/roles/${roleId}/permissions/${permission}`,
    options: {
      headers,
      method: 'PUT',
    },
  });
};

const removePermissionFromRole = async ({
  headers,
  roleId,
  permission,
}: {
  headers: Headers;
  roleId: string;
  permission: PermissionType;
}) => {
  return fetchFromApi({
    path: `/roles/${roleId}/permissions/${permission}`,
    options: {
      headers,
      method: 'DELETE',
    },
  });
};

const useAddPermissionToRoleMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: addPermissionToRole,
    mutationKey: 'roles-add-permission',
    ...configuration,
  });

const useRemovePermissionFromRoleMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: removePermissionFromRole,
    mutationKey: 'roles-remove-permission',
    ...configuration,
  });

// Role users
const getRoleUsers = async ({
  headers,
  roleId,
}: {
  headers: Headers;
  roleId: string;
}) => {
  const res = await fetchFromApi({
    path: `/roles/${roleId}/users/`,
    options: { headers },
  });
  return (await res.json()) as RoleUser[];
};

const addUserToRole = async ({
  headers,
  roleId,
  userId,
}: {
  headers: Headers;
  roleId: string;
  userId: string;
}) => {
  return fetchFromApi({
    path: `/roles/${roleId}/users/${userId}`,
    options: {
      headers,
      method: 'PUT',
    },
  });
};

const removeUserFromRole = async ({
  headers,
  roleId,
  userId,
}: {
  headers: Headers;
  roleId: string;
  userId: string;
}) => {
  return fetchFromApi({
    path: `/roles/${roleId}/users/${userId}`,
    options: {
      headers,
      method: 'DELETE',
    },
  });
};

const useGetRoleUsersQuery = (roleId: string) => {
  return useAuthenticatedQuery({
    queryKey: ['roles', roleId, 'users'],
    queryFn: getRoleUsers,
    queryArguments: { roleId },
    enabled: !!roleId,
  });
};

const useAddUserToRoleMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: addUserToRole,
    mutationKey: 'roles-add-user',
    ...configuration,
  });

const useRemoveUserFromRoleMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: removeUserFromRole,
    mutationKey: 'roles-remove-user',
    ...configuration,
  });

// Role labels
const getRoleLabels = async ({
  headers,
  roleId,
}: {
  headers: Headers;
  roleId: string;
}) => {
  const res = await fetchFromApi({
    path: `/roles/${roleId}/labels/`,
    options: { headers },
  });
  return (await res.json()) as RoleLabel[];
};

const addLabelToRole = async ({
  headers,
  roleId,
  labelId,
}: {
  headers: Headers;
  roleId: string;
  labelId: string;
}) => {
  return fetchFromApi({
    path: `/roles/${roleId}/labels/${labelId}`,
    options: {
      headers,
      method: 'PUT',
    },
  });
};

const removeLabelFromRole = async ({
  headers,
  roleId,
  labelId,
}: {
  headers: Headers;
  roleId: string;
  labelId: string;
}) => {
  return fetchFromApi({
    path: `/roles/${roleId}/labels/${labelId}`,
    options: {
      headers,
      method: 'DELETE',
    },
  });
};

const useGetRoleLabelsQuery = (roleId: string) => {
  return useAuthenticatedQuery({
    queryKey: ['roles', roleId, 'labels'],
    queryFn: getRoleLabels,
    queryArguments: { roleId },
    enabled: !!roleId,
  });
};

const useAddLabelToRoleMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: addLabelToRole,
    mutationKey: 'roles-add-label',
    ...configuration,
  });

const useRemoveLabelFromRoleMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: removeLabelFromRole,
    mutationKey: 'roles-remove-label',
    ...configuration,
  });

// Role constraints
const createRoleConstraint = async ({
  headers,
  roleId,
  constraint,
}: {
  headers: Headers;
  roleId: string;
  constraint: string;
}) => {
  return fetchFromApi({
    path: `/roles/${roleId}/constraint`,
    options: {
      headers,
      method: 'POST',
      body: JSON.stringify({ v3: constraint }),
    },
  });
};

const updateRoleConstraint = async ({
  headers,
  roleId,
  constraint,
}: {
  headers: Headers;
  roleId: string;
  constraint: string;
}) => {
  return fetchFromApi({
    path: `/roles/${roleId}/constraint`,
    options: {
      headers,
      method: 'PUT',
      body: JSON.stringify({ v3: constraint }),
    },
  });
};

const removeRoleConstraint = async ({
  headers,
  roleId,
}: {
  headers: Headers;
  roleId: string;
}) => {
  return fetchFromApi({
    path: `/roles/${roleId}/constraint`,
    options: {
      headers,
      method: 'DELETE',
    },
  });
};

const useCreateRoleConstraintMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: createRoleConstraint,
    mutationKey: 'roles-create-constraint',
    ...configuration,
  });

const useUpdateRoleConstraintMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: updateRoleConstraint,
    mutationKey: 'roles-update-constraint',
    ...configuration,
  });

const useRemoveRoleConstraintMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: removeRoleConstraint,
    mutationKey: 'roles-remove-constraint',
    ...configuration,
  });

// Check if role name is unique (based on existing label implementation)
const useIsRoleNameUnique = ({
  name,
  currentName,
}: {
  name: string;
  currentName?: string;
}) => {
  const trimmedName = (name || '').trim();
  const enabled = trimmedName.length >= 3; // Minimum role name length
  const { data, isLoading } = useGetRolesByQuery({
    name: trimmedName,
    paginationOptions: { start: 0, limit: 1 },
  });
  const isSameAsCurrent =
    currentName && currentName.toLowerCase() === trimmedName.toLowerCase();
  const isRoleAlreadyUsed = (data?.member ?? []).find(
    (r: Role) => (r?.name ?? '').toLowerCase() === trimmedName.toLowerCase(),
  );
  return {
    isUnique: isSameAsCurrent ? true : !isRoleAlreadyUsed,
    isLoading: enabled && isLoading,
  };
};

export {
  prefetchGetRoleByIdQuery,
  prefetchGetRolesQuery,
  useAddLabelToRoleMutation,
  useAddPermissionToRoleMutation,
  useAddUserToRoleMutation,
  useCreateRoleConstraintMutation,
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useGetRoleByIdQuery,
  useGetRoleLabelsQuery,
  useGetRolesByQuery,
  useGetRoleUsersQuery,
  useIsRoleNameUnique,
  useRemoveLabelFromRoleMutation,
  useRemovePermissionFromRoleMutation,
  useRemoveRoleConstraintMutation,
  useRemoveUserFromRoleMutation,
  useUpdateRoleConstraintMutation,
  useUpdateRoleNameMutation,
};
