import { fetchFromApi } from '@/utils/fetchFromApi';
import { useAuthenticatedQuery } from './authenticated-query';
import type { UseAuthenticatedQueryOptions } from './authenticated-query';

const getUser = async ({ headers }) => {
  const res = await fetchFromApi({
    path: '/user',
    options: {
      headers,
    },
  });
  return await res.json();
};

const useGetUser = async (configuration?: UseAuthenticatedQueryOptions) =>
  await useAuthenticatedQuery({
    queryKey: ['user'],
    queryFn: getUser,
    ...(configuration ?? {}),
  });

const getPermissions = async ({ headers }) => {
  const res = await fetchFromApi({
    path: '/user/permissions/',
    options: {
      headers,
    },
  });
  return await res.json();
};

const useGetPermissions = async (
  configuration?: UseAuthenticatedQueryOptions,
) =>
  await useAuthenticatedQuery({
    queryKey: ['user', 'permissions'],
    queryFn: getPermissions,
    ...(configuration ?? {}),
  });

const getRoles = async ({ headers }) => {
  const res = await fetchFromApi({
    path: '/user/roles/',
    options: {
      headers,
    },
  });
  return await res.json();
};

const useGetRoles = async (configuration?: UseAuthenticatedQueryOptions) =>
  await useAuthenticatedQuery({
    queryKey: ['user', 'roles'],
    queryFn: getRoles,
    ...(configuration ?? {}),
  });

export { useGetUser, useGetPermissions, useGetRoles };
