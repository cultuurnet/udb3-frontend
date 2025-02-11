import { isEqual } from 'lodash';
import flatten from 'lodash/flatten';
import type { NextApiRequest } from 'next';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { Cookies } from 'react-cookie';
import {
  MutationFunction,
  QueryClient,
  QueryFunctionContext,
  QueryKey,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';

import { useCookiesWithOptions } from '@/hooks/useCookiesWithOptions';
import type { CalendarSummaryFormat } from '@/utils/createEmbededCalendarSummaries';
import type { ErrorObject, FetchError } from '@/utils/fetchFromApi';
import { isErrorObject } from '@/utils/fetchFromApi';
import { isTokenValid } from '@/utils/isTokenValid';

import { createHeaders, useHeaders } from './useHeaders';

type ServerSideQueryOptions = {
  req?: NextApiRequest;
  queryClient?: QueryClient;
};

type PaginationOptions = {
  paginationOptions?: {
    start: number;
    limit: number;
  };
};

type SortOptions = {
  sortOptions?: {
    field: string;
    order: string;
  };
};

type CalendarSummaryFormats = {
  calendarSummaryFormats?: CalendarSummaryFormat[];
};

const QueryStatus = {
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
};

type QueryArguments = Record<string, unknown>;

const prepareKey = <
  TQueryKey extends QueryKey,
  TQueryArguments extends QueryArguments,
>({
  queryKey,
  queryArguments,
}: {
  queryKey: TQueryKey;
  queryArguments: TQueryArguments;
}) => {
  const key = Array.isArray(queryKey) ? queryKey : [queryKey];
  const args = Object.entries(queryArguments ?? {}).filter(
    ([_, value]) => typeof value !== 'undefined',
  );
  const preparedKey = flatten(key);

  if (args.length > 0) {
    preparedKey.push(Object.fromEntries(args));
  }

  return preparedKey;
};

const prepareArguments = <TData, TQueryArguments extends QueryArguments>({
  options: {
    queryKey,
    queryFn,
    queryArguments,
    enabled = true,
    ...configuration
  },
  isTokenPresent = false,
  headers,
}: {
  options: UseAuthenticatedQueryOptions<TData, TQueryArguments>;
  isTokenPresent: boolean;
  headers: Record<string, string>;
}) => {
  const parsedQueryKey = prepareKey({ queryArguments, queryKey });

  return {
    queryKey: parsedQueryKey,
    queryFn: async (ctx: QueryFunctionContext<typeof queryKey>) =>
      await queryFn({
        ...ctx,
        ...queryArguments,
        headers,
        queryKey: parsedQueryKey,
      }),
    enabled: isTokenPresent && !!enabled,
    ...configuration,
  };
};

const isUnAuthorized = (status: number) => [401, 403].includes(status);

const getStatusFromResults = (results) => {
  if (results.some(({ status }) => status === QueryStatus.ERROR)) {
    return {
      status: QueryStatus.ERROR,
      error: results
        .map(({ error }) => error)
        .filter((error) => error !== undefined),
    };
  }

  if (results.every(({ status }) => status === QueryStatus.SUCCESS)) {
    return { status: QueryStatus.SUCCESS };
  }
  if (results.some(({ status }) => status === QueryStatus.LOADING)) {
    return { status: QueryStatus.LOADING };
  }
  if (results.some(({ status }) => status === QueryStatus.IDLE)) {
    return { status: QueryStatus.IDLE };
  }
};

const prefetchAuthenticatedQueries = async ({
  req,
  queryClient,
  options: rawOptions = [],
}) => {
  const cookies = new Cookies(req?.headers?.cookie);
  const headers = createHeaders(cookies.get('token'));

  const preparedArguments = rawOptions.map((options) =>
    prepareArguments({
      options,
      isTokenPresent: isTokenValid(cookies.get('token')),
      headers,
    }),
  );

  await Promise.all(
    preparedArguments.map(({ queryKey, queryFn }) =>
      queryClient.prefetchQuery(queryKey, queryFn),
    ),
  );

  return await Promise.all(
    preparedArguments.map(({ queryKey }) => queryClient.getQueryData(queryKey)),
  );
};

const prefetchAuthenticatedQuery = async <
  TData,
  TQueryArguments extends Record<string, unknown>,
>({
  req,
  queryClient,
  ...options
}: ServerSideQueryOptions &
  UseAuthenticatedQueryOptions<TData, TQueryArguments>): Promise<TData> => {
  const cookies = new Cookies(req?.headers?.cookie);
  const headers = createHeaders(cookies.get('token'));

  const { queryKey, queryFn } = prepareArguments({
    options,
    isTokenPresent: isTokenValid(cookies.get('token')),
    headers,
  });

  return await queryClient.fetchQuery(queryKey, queryFn);
};

/// /////////////////////////////////////////////////////////////////////////////////////////////

const isDuplicateMutation = (
  queryClient: QueryClient,
  mutationFn: MutationFunction,
  variables: any,
  mutationKey?: string,
): boolean => {
  if (!mutationKey) {
    // eslint-disable-next-line no-console
    console.warn(`${mutationFn.name} has no mutationKey configured`);

    return false;
  }

  // Temporary disable caching on price-info
  // https://jira.uitdatabank.be/browse/III-5620

  const disabledMutations = [
    'offers-add-price-info',
    'offers-change-calendar',
    'places-add',
    'request-ownership',
  ];

  if (disabledMutations.includes(mutationKey)) {
    return false;
  }

  const mutations = queryClient.getMutationCache().findAll({
    mutationKey,
  });

  const latestMutation = mutations.slice(-2)[0];

  // If the latest mutation was unsuccessful, we don't want to trigger a false positive.
  if (latestMutation.state.error) {
    return false;
  }

  return (
    mutations.length > 1 && isEqual(latestMutation.options.variables, variables)
  );
};

const useAuthenticatedMutation = ({ mutationFn, ...configuration }) => {
  const router = useRouter();
  const headers = useHeaders();
  const queryClient = useQueryClient();

  const { removeAuthenticationCookies } = useCookiesWithOptions();

  const innerMutationFn = useCallback(async (variables) => {
    const isDuplicate = isDuplicateMutation(
      queryClient,
      mutationFn,
      variables,
      configuration.mutationKey,
    );

    if (isDuplicate) return;

    const response = await mutationFn({ ...variables, headers });

    if (!response) return '';

    if (isUnAuthorized(response?.status)) {
      removeAuthenticationCookies();
      queryClient.invalidateQueries('user');
      router.push('/login');
    }

    const result = await response.text();

    if (!result) {
      return '';
    }
    return JSON.parse(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useMutation(innerMutationFn, configuration);
};

const useAuthenticatedMutations = ({
  mutationFns,
  ...configuration
}: {
  mutationFns: (variables: unknown) => Promise<Array<Response | ErrorObject>>;
}) => {
  const router = useRouter();
  const headers = useHeaders();
  const queryClient = useQueryClient();

  const { removeAuthenticationCookies } = useCookiesWithOptions();

  const innerMutationFn = useCallback(async (variables) => {
    const responses = await mutationFns({ ...variables, headers });

    if (responses.some((response) => isUnAuthorized(response.status))) {
      removeAuthenticationCookies();
      queryClient.invalidateQueries('user');
      router.push('/login');
      return;
    }

    if (responses.some(isErrorObject)) {
      const errorMessages = responses
        .filter(isErrorObject)
        .map((response) => response.message)
        .join(', ');
      throw new Error(errorMessages);
    }

    return Promise.all(
      (responses as Response[]).map(async (response) => {
        const result = await response.text();

        if (!result) {
          return '';
        }

        return JSON.parse(result);
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useMutation(innerMutationFn, configuration);
};

type Handlers = 'onSuccess' | 'onError' | 'onSettled';
type UseQueryOptionsWithoutQueryFn<TData, TError> = Omit<
  UseQueryOptions<TData, TError>,
  'queryFn' | Handlers
>;

type QueryFunction<TData> = UseQueryOptions<TData, FetchError>['queryFn'];

type CustomQueryFunction<
  TData,
  TQueryArguments extends Record<string, unknown>,
> = (
  context: QueryFunctionContext & {
    headers: Record<string, string>;
  } & TQueryArguments,
) => ReturnType<QueryFunction<TData>>;

type UseAuthenticatedQueryOptions<
  TData,
  TQueryArguments extends Record<string, unknown>,
> = UseQueryOptionsWithoutQueryFn<TData, FetchError> & {
  queryArguments?: TQueryArguments;
  queryFn: CustomQueryFunction<TData, TQueryArguments>;
};

export const queryOptions = <
  TData,
  TQueryArguments extends Record<string, unknown>,
>(
  options: UseAuthenticatedQueryOptions<TData, TQueryArguments>,
) => {
  return options;
};

export type ExtendQueryOptions<TQueryFn extends (...args: any) => any> = Pick<
  UseQueryOptions<Awaited<ReturnType<TQueryFn>>, FetchError>,
  Handlers | 'enabled' | 'queryKey'
>;

const useAuthenticatedQuery = <
  TData,
  TQueryArguments extends Record<string, unknown>,
>(
  options: UseAuthenticatedQueryOptions<TData, TQueryArguments>,
) => {
  const { asPath, ...router } = useRouter();
  const headers = useHeaders();
  const { cookies, removeAuthenticationCookies } = useCookiesWithOptions([
    'token',
  ]);

  const preparedArguments = prepareArguments({
    options,
    isTokenPresent: isTokenValid(cookies.token),
    headers,
  });

  const result = useQuery(preparedArguments);

  if (isUnAuthorized(result?.error?.status)) {
    if (!asPath.startsWith('/login') && asPath !== '/[...params]') {
      removeAuthenticationCookies();
      router.push('/login');
    }
  }

  return result;
};

const useAuthenticatedQueries = ({
  req,
  queryClient,
  options: rawOptions = [],
}) => {
  if (!!req && !!queryClient && typeof window === 'undefined') {
    return prefetchAuthenticatedQueries({
      req,
      queryClient,
      options: rawOptions,
    });
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { asPath, ...router } = useRouter();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const headers = useHeaders();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { cookies, removeAuthenticationCookies } = useCookiesWithOptions([
    'token',
  ]);

  const options = rawOptions.map((options) =>
    prepareArguments({
      options,
      isTokenPresent: isTokenValid(cookies.token),
      headers,
    }),
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const results = useQueries(options);

  if (results.some((result) => isUnAuthorized(result?.error?.status))) {
    if (!asPath.startsWith('/login') && asPath !== '/[...params]') {
      removeAuthenticationCookies();
      queryClient.invalidateQueries('user');
      router.push('/login');
    }
  }

  return {
    data: results.map(({ data }) => data).filter((data) => data !== undefined),
    ...getStatusFromResults(results),
  };
};

export {
  getStatusFromResults,
  prefetchAuthenticatedQuery,
  QueryStatus,
  useAuthenticatedMutation,
  useAuthenticatedMutations,
  useAuthenticatedQueries,
  useAuthenticatedQuery,
};

export type {
  CalendarSummaryFormats,
  PaginationOptions,
  ServerSideQueryOptions,
  SortOptions,
};
