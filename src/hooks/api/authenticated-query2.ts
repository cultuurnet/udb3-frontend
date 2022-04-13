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

type QueryArguments = Record<string, string>;

type GenerateUniqueQueryKeyArguments = {
  queryKey: QueryKey;
  queryArguments: QueryArguments;
};

type GeneratedQueryKey = readonly [QueryKey, QueryArguments];

type AuthenticatedQueryFunctionContext = QueryFunctionContext<GeneratedQueryKey> & {
  headers: Headers;
};

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
  const { cookies } = useCookiesWithOptions(['token']);

  const preparedOptions = getPreparedOptions({
    options,
    isTokenPresent: isTokenValid(cookies.token),
    headers,
  });

  return useQuery<TQueryFnData, FetchError, TQueryFnData, GeneratedQueryKey>(
    preparedOptions,
  );
};

export { useAuthenticatedQuery };
export type { AuthenticatedQueryFunctionContext };
