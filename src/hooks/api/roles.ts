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
import { Role } from '@/types/Role';
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

export { prefetchGetRolesQuery, useDeleteRoleMutation, useGetRolesByQuery };
