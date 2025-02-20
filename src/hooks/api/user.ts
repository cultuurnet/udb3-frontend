import jwt_decode from 'jwt-decode';

import { PermissionTypes } from '@/layouts/Sidebar';
import { Values } from '@/types/Values';
import { FetchError, fetchFromApi, isErrorObject } from '@/utils/fetchFromApi';

import { Cookies, useCookiesWithOptions } from '../useCookiesWithOptions';
import {
  ExtendQueryOptions,
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

  const userInfo = jwt_decode(cookies.idToken) as User;
  const decodedAccessToken = jwt_decode(cookies.token) as decodedAccessToken;

  if (Date.now() >= decodedAccessToken.exp * 1000) {
    throw new FetchError(401, 'Unauthorized');
  }

  return userInfo;
};

const useGetUserQuery = () => {
  const { cookies } = useCookiesWithOptions(['idToken']);

  return useAuthenticatedQuery<User>({
    queryKey: ['user'],
    queryFn: () => getUser(cookies),
  });
};

const useGetUserQueryServerSide = (
  { req }: ServerSideQueryOptions = {},
  configuration = {},
) => {
  const cookies = req.cookies;

  return useAuthenticatedQuery({
    queryKey: ['user'],
    queryFn: () => getUser(cookies),
    ...configuration,
  });
};

const getPermissions = async ({ headers }) => {
  const res = await fetchFromApi({
    path: '/user/permissions/',
    options: {
      headers,
    },
  });
  return (await res.json()) as Values<typeof PermissionTypes>[];
};

const useGetPermissionsQuery = (configuration = {}) =>
  useAuthenticatedQuery({
    queryKey: ['user', 'permissions'],
    queryFn: getPermissions,
    ...configuration,
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

export {
  useGetPermissionsQuery,
  useGetRolesQuery,
  useGetUserQuery,
  useGetUserQueryServerSide,
};
export type { User };
