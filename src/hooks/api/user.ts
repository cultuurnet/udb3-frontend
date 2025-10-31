import jwt_decode from 'jwt-decode';

import { PermissionTypes } from '@/layouts/Sidebar';
import { RoleUser } from '@/types/Role';
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

const getUserByEmail = async ({
  headers,
  email,
}: {
  headers: any;
  email: string;
}) => {
  const res = await fetchFromApi({
    path: `/users/emails/${encodeURIComponent(email)}`,
    options: { headers },
  });
  return (await res.json()) as RoleUser;
};

const useGetUserByEmailQuery = (email: string) => {
  const trimmedEmail = (email || '').trim();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

  return useAuthenticatedQuery({
    queryKey: ['users', 'email', trimmedEmail],
    queryFn: getUserByEmail,
    queryArguments: { email: trimmedEmail },
    enabled: !!trimmedEmail && isValidEmail,
  });
};

export {
  getUserByEmail,
  prefetchGetPermissionsQuery,
  useGetPermissionsQuery,
  useGetRolesQuery,
  useGetUserByEmailQuery,
  useGetUserQuery,
};
export type { User };
