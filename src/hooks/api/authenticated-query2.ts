import {
  QueryFunctionContext,
  QueryKey,
  useQuery,
  UseQueryOptions,
} from 'react-query';

import { FetchError } from '@/utils/fetchFromApi';
import { isTokenValid } from '@/utils/isTokenValid';

import { useCookiesWithOptions } from '../useCookiesWithOptions';
import { Headers } from './types/Headers';
import { useHeaders } from './useHeaders';
import { useRouter } from 'next/router';

type QueryArguments = Record<string, string>;

type GenerateUniqueQueryKeyArguments = {
  queryKey: QueryKey;
  queryArguments: QueryArguments;
};

type GeneratedQueryKey = readonly [QueryKey, QueryArguments];

type AuthenticatedQueryFunctionContext = QueryFunctionContext<GeneratedQueryKey> & {
  headers: Headers;
};

const isUnAuthorized = (status: number) => [401, 403].includes(status);

const generateQueryKey = ({
  queryKey,
  queryArguments,
}: GenerateUniqueQueryKeyArguments): GeneratedQueryKey => {
  if (Object.keys(queryArguments ?? {}).length > 0) {
    return [queryKey, queryArguments];
  }

  return [queryKey, {}];
};

type GetPreparedOptionsArguments<TQueryFnData, TError> = {
  options: UseAuthenticatedQueryOptions<TQueryFnData, TError>;
  isTokenPresent: boolean;
  headers: Headers;
};

const getPreparedOptions = <TQueryFnData = unknown, TError = unknown>({
  options,
  isTokenPresent,
  headers,
}: GetPreparedOptionsArguments<TQueryFnData, TError>): UseQueryOptions<
  TQueryFnData,
  TError,
  TQueryFnData,
  GeneratedQueryKey
> => {
  const {
    queryKey,
    queryArguments,
    queryFn,
    enabled,
    ...restOptions
  } = options;
  const generatedQueryKey = generateQueryKey({
    queryKey,
    queryArguments,
  });

  const queryFunctionWithHeaders = async (
    context: QueryFunctionContext<GeneratedQueryKey>,
  ) => {
    return await queryFn(
      context,
      // @ts-expect-error
      headers,
    );
  };
  return {
    ...restOptions,
    queryKey: generatedQueryKey,
    queryFn: queryFunctionWithHeaders,
    enabled: isTokenPresent && !!enabled,
  };
};

type UseAuthenticatedQueryOptions<TQueryFnData, TError> = UseQueryOptions<
  TQueryFnData,
  TError,
  TQueryFnData,
  QueryKey
> & {
  queryArguments?: QueryArguments;
};

const useAuthenticatedQuery = <TQueryFnData = unknown>(
  options: UseAuthenticatedQueryOptions<TQueryFnData, FetchError>,
) => {
  const headers = useHeaders();
  const { cookies, removeAuthenticationCookies } = useCookiesWithOptions([
    'token',
  ]);
  const router = useRouter();

  const preparedOptions = getPreparedOptions({
    options,
    isTokenPresent: isTokenValid(cookies.token),
    headers,
  });

  const result = useQuery(preparedOptions);

  if (
    isUnAuthorized(result?.error?.status) &&
    !router.asPath.startsWith('/login') &&
    router.asPath !== '/[...params]'
  ) {
    removeAuthenticationCookies();

    router.push('/login');

    return;
  }

  return result;
};

export { useAuthenticatedQuery };
export type { AuthenticatedQueryFunctionContext };
