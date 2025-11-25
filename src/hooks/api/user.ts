import jwt_decode from 'jwt-decode';

import type { Headers } from '@/hooks/api/types/Headers';
import { PermissionTypes } from '@/layouts/Sidebar';
import { Values } from '@/types/Values';
import { FetchError, fetchFromApi } from '@/utils/fetchFromApi';

import { Cookies, useCookiesWithOptions } from '../useCookiesWithOptions';
import {
  ExtendQueryOptions,
  prefetchAuthenticatedQuery,
  queryOptions,
  ServerSideQueryOptions,
  useAuthenticatedQuery,
} from './authenticated-query';

type User = {
  sub: string;
  given_name: string;
  family_name: string;
  nickname: string;
  name: string;
  picture: string;
  locale: string;
  updated_at: string;
  email: string;
  email_verified: boolean;
  'https://publiq.be/uitidv1id': string;
  'https://publiq.be/hasMuseumpasSubscription': boolean;
  'https://publiq.be/first_name': string;
  exp: number;
};

type decodedAccessToken = {
  'https://publiq.be/publiq-apis': string;
  'https://publiq.be/client-name': string;
  'https://publiq.be/email': string;
  'https://publiq.be/uitidv1id': string;
  iss: string;
  sub: string;
  aud: string[];
  iat: number;
  exp: number;
  azp: string;
  scope: string;
};

const getUser = async (cookies: Cookies) => {
  if (!cookies.idToken || !cookies.token) {
    throw new FetchError(401, 'Unauthorized');
  }

  let userInfo: User;
  let decodedAccessToken: decodedAccessToken;

  try {
    userInfo = jwt_decode(cookies.idToken);
    decodedAccessToken = jwt_decode(cookies.token);
  } catch (error) {
    throw new FetchError(401, 'Unauthorized');
  }

  if (Date.now() >= decodedAccessToken.exp * 1000) {
    throw new FetchError(401, 'Unauthorized');
  }

  return userInfo;
};

const createGetUserQueryOptions = (cookies: Cookies) =>
  queryOptions({
    queryKey: ['user'],
    queryFn: () => getUser(cookies),
  });

const useGetUserQuery = () => {
  const { cookies } = useCookiesWithOptions(['idToken']);

  return useAuthenticatedQuery(createGetUserQueryOptions(cookies));
};

export const prefetchGetUserQuery = ({
  req,
  queryClient,
  cookies,
}: ServerSideQueryOptions & {
  cookies: Cookies;
}) =>
  prefetchAuthenticatedQuery({
    req,
    queryClient,
    ...createGetUserQueryOptions(cookies),
  });

const getPermissions = async ({ headers }) => {
  const res = await fetchFromApi({
    path: '/user/permissions/',
    options: {
      headers,
    },
  });
  return (await res.json()) as Values<typeof PermissionTypes>[];
};

const createGetPermissionsQueryOptions = () =>
  queryOptions({
    queryKey: ['user', 'permissions'],
    queryFn: getPermissions,
  });

const useGetPermissionsQuery = (configuration = {}) =>
  useAuthenticatedQuery({
    ...createGetPermissionsQueryOptions(),
    ...configuration,
  });

const prefetchGetPermissionsQuery = ({
  req,
  queryClient,
}: ServerSideQueryOptions) =>
  prefetchAuthenticatedQuery({
    req,
    queryClient,
    ...createGetPermissionsQueryOptions(),
  });

type Role = {
  uuid: string;
  name: string;
  permissions: Values<typeof PermissionTypes>[];
  constraints?: { v3?: string };
};

const getRoles = async ({ headers }) => {
  const res = await fetchFromApi({
    path: '/user/roles/',
    options: {
      headers,
    },
  });
  return (await res.json()) as Role[];
};

const useGetRolesQuery = (
  configuration: ExtendQueryOptions<typeof getRoles> = {},
) =>
  useAuthenticatedQuery({
    queryKey: ['user', 'roles'],
    queryFn: getRoles,
    ...configuration,
  });

const prefetchGetRolesQuery = ({ req, queryClient }: ServerSideQueryOptions) =>
  prefetchAuthenticatedQuery({
    req,
    queryClient,
    queryKey: ['user', 'roles'],
    queryFn: getRoles,
  });

type SearchUser = {
  uuid: string;
  email: string;
  username: string;
};

type UserById = {
  uuid: string;
  email: string;
  username: string;
  // Add other fields as needed
};

const getUserById = async ({
  headers,
  id,
}: {
  headers: Headers;
  id: string;
}) => {
  const res = await fetchFromApi({
    path: `/users/${id}`,
    options: { headers },
  });
  return (await res.json()) as UserById;
};

const createGetUserByIdQueryOptions = ({ id }: { id: string }) =>
  queryOptions({
    queryKey: ['users', { id }],
    queryFn: getUserById,
    queryArguments: { id },
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

const useGetUserByIdQuery = (
  { id }: { id: string },
  configuration?: ExtendQueryOptions<typeof getUserById>,
) => {
  const options = createGetUserByIdQueryOptions({ id });
  return useAuthenticatedQuery({
    ...options,
    ...(configuration || {}),
    enabled: options.enabled !== false && configuration?.enabled !== false,
  });
};

const prefetchGetUserByIdQuery = ({
  req,
  queryClient,
  id,
}: ServerSideQueryOptions & { id: string }) =>
  prefetchAuthenticatedQuery({
    req,
    queryClient,
    ...createGetUserByIdQueryOptions({ id }),
  });

const getUserByEmail = async ({
  headers,
  email,
}: {
  headers: Headers;
  email: string;
}) => {
  const res = await fetchFromApi({
    path: `/users/emails/${encodeURIComponent(email)}`,
    options: {
      headers,
    },
  });
  return (await res.json()) as SearchUser;
};

const createGetUserByEmailQueryOptions = (email: string) =>
  queryOptions({
    queryKey: ['users', 'getByEmail', email],
    queryFn: getUserByEmail,
    queryArguments: { email },
  });

const useGetUserByEmailQuery = (email: string, configuration = {}) =>
  useAuthenticatedQuery({
    ...createGetUserByEmailQueryOptions(email),
    ...configuration,
  });

export {
  getUserByEmail,
  prefetchGetPermissionsQuery,
  prefetchGetRolesQuery,
  prefetchGetUserByIdQuery,
  useGetPermissionsQuery,
  useGetRolesQuery,
  useGetUserByEmailQuery,
  useGetUserByIdQuery,
  useGetUserQuery,
};
export type { SearchUser, User, UserById };
