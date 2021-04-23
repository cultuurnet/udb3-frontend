import flatten from 'lodash/flatten';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { Cookies } from 'react-cookie';
import {
  useQuery,
  useQueries,
  useMutation,
  UseMutationOptions,
} from 'react-query';
import { isTokenValid } from '@/utils/isTokenValid';
import { useCookiesWithOptions } from '@/hooks/useCookiesWithOptions';
import { createHeaders, useHeaders } from './useHeaders';
import type { Values } from '@/types/Values';
import type {
  UseQueryResult,
  QueryClient,
  UseQueryOptions as ReactQueryUseQueryOptions,
} from 'react-query';
import type { NextApiRequest } from 'next';

const QueryStatus = {
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
} as const;

type ApiError = {
  type?: 'ERROR';
  status?: number;
  message?: string;
};

type QueryKey = readonly unknown[];

// TODO: this is the correct type for args, but couldn't get it to work
// {
//   headers: Record<string, unknown>;
//   [key: string]: any;
// }

type QueryFunction = (args: any) => Promise<Response | ApiError>;

type MutationFunction = (args: any) => Promise<Response | ApiError>;

type MutationsFunction = (args: any) => Promise<Array<Response | ApiError>>;

type UseQueryOptions = Omit<
  ReactQueryUseQueryOptions<unknown, unknown, unknown, QueryKey>,
  'queryKey' | 'queryFn'
> & {
  queryKey: QueryKey;
  queryFn: QueryFunction;
};

type PrepareKeyArguments = {
  queryKey: QueryKey;
  queryArguments?: Record<string, unknown>;
};

const prepareKey = ({
  queryKey,
  queryArguments,
}: PrepareKeyArguments): QueryKey => {
  return [...flatten(queryKey), queryArguments].filter(
    (key) => key !== undefined,
  );
};

type PrepareArgumentsArguments = {
  options: UseQueryOptions & { queryArguments?: Record<string, unknown> };
  isTokenPresent: boolean;
  headers: Record<string, unknown>;
};

const prepareArguments = ({
  options: {
    queryKey,
    queryFn,
    queryArguments,
    enabled = true,
    ...configuration
  },
  isTokenPresent = false,
  headers,
}: PrepareArgumentsArguments): UseQueryOptions => ({
  queryKey: prepareKey({ queryKey, queryArguments }),
  queryFn: async () => await queryFn({ ...(queryArguments ?? {}), headers }),
  enabled: isTokenPresent && !!enabled,
  ...configuration,
});

const isUnAuthorized = (statusCode: number) => [401, 403].includes(statusCode);

type Status = {
  status: Values<typeof QueryStatus>;
  error?: Error[];
};

const getStatusFromResults = (
  results: UseQueryResult[],
): Status | undefined => {
  if (results.some(({ status }) => status === QueryStatus.ERROR)) {
    return {
      status: QueryStatus.ERROR,
      error: results
        .map(({ error }) => error)
        .filter((error) => error !== undefined) as Error[],
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
}: {
  req: NextApiRequest;
  queryClient: QueryClient;
  options: any[];
}) => {
  const cookies = new Cookies(req?.headers?.cookie);
  const headers = createHeaders(cookies.get('token'));

  const preparedArguments = rawOptions.map((rawOption) =>
    prepareArguments({
      options: rawOption,
      isTokenPresent: isTokenValid(cookies.get('token')),
      headers,
    }),
  );

  await Promise.all(
    preparedArguments.map(
      async ({ queryKey, queryFn }) =>
        await queryClient.prefetchQuery({
          queryKey,
          queryFn: queryFn,
        }),
    ),
  );

  return await Promise.all(
    preparedArguments.map(({ queryKey }) => queryClient.getQueryData(queryKey)),
  );
};

type PrefetchAuthenticatedQueryOptions = UseQueryOptions & {
  req: NextApiRequest;
  queryClient: QueryClient;
};

const prefetchAuthenticatedQuery = async ({
  req,
  queryClient,
  ...options
}: PrefetchAuthenticatedQueryOptions) => {
  const cookies = new Cookies(req.headers?.cookie);
  const headers = createHeaders(cookies.get('token'));

  const { queryKey, queryFn } = prepareArguments({
    options,
    isTokenPresent: isTokenValid(cookies.get('token')),
    headers,
  });

  try {
    await queryClient.prefetchQuery(
      queryKey,
      queryFn as (...args: unknown[]) => Promise<Response>,
    );
  } catch {}
  // eslint-disable-next-line @typescript-eslint/return-await
  return await queryClient.getQueryData<any>(queryKey);
};

/// /////////////////////////////////////////////////////////////////////////////////////////////

type AuthenticatedMutationArguments = UseMutationOptions & {
  mutationFn: MutationFunction;
};

const useAuthenticatedMutation = ({
  mutationFn,
  ...configuration
}: AuthenticatedMutationArguments) => {
  const router = useRouter();
  const headers = useHeaders();

  const { removeAuthenticationCookies } = useCookiesWithOptions();

  const innerMutationFn = useCallback(async (variables) => {
    const response = await mutationFn({ ...variables, headers });

    if (response?.status && isUnAuthorized(response.status)) {
      removeAuthenticationCookies();
      await router.push('/login');
      return;
    }

    const result = await (response as Response).text();

    if (!result) {
      return '';
    }
    return JSON.parse(result);
  }, []);

  return useMutation(innerMutationFn, configuration);
};

type UseAuthenticatedMutationOptions = UseMutationOptions & {
  mutationFns: MutationsFunction;
};

const useAuthenticatedMutations = ({
  mutationFns,
  ...configuration
}: UseAuthenticatedMutationOptions) => {
  const router = useRouter();
  const headers = useHeaders();

  const { removeAuthenticationCookies } = useCookiesWithOptions();

  const innerMutationFn = useCallback(async (variables) => {
    const responses = await mutationFns({ ...variables, headers });

    if (
      responses.some(
        (response) => response.status && isUnAuthorized(response.status),
      )
    ) {
      removeAuthenticationCookies();
      await router.push('/login');
    } else if (
      responses.some((response) => (response as ApiError)?.type === 'ERROR')
    ) {
      const errorMessages = responses
        .filter((response) => response.type === 'ERROR')
        .map((response) => (response as ApiError).message)
        .join(', ');
      throw new Error(errorMessages);
    }

    return Promise.all(
      responses.map(async (response) => {
        const result = await (response as Response).text();

        if (!result) {
          return '';
        }

        return JSON.parse(result);
      }),
    );
  }, []);

  return useMutation(innerMutationFn, configuration);
};

type UseAuthenticatedQueryOptions = UseQueryOptions & {
  req?: NextApiRequest;
  queryClient?: QueryClient;
  queryArguments?: Record<string, unknown>;
};

const useAuthenticatedQuery = async (options: UseAuthenticatedQueryOptions) => {
  if (
    options.req !== undefined &&
    options.queryClient !== undefined &&
    typeof window === 'undefined'
  ) {
    return await prefetchAuthenticatedQuery(
      options as PrefetchAuthenticatedQueryOptions,
    );
  }

  const { asPath, ...router } = useRouter();

  const headers = useHeaders();
  const { cookies, removeAuthenticationCookies } = useCookiesWithOptions([
    'token',
  ]);

  const useQueryOptions = prepareArguments({
    options,
    isTokenPresent: isTokenValid(cookies.token),
    headers,
  });

  const result = useQuery<any, { status: number }>(useQueryOptions as any);

  if (result.error && isUnAuthorized(result.error.status)) {
    if (!asPath.startsWith('/login') && asPath !== '/[...params]') {
      removeAuthenticationCookies();
      await router.push('/login');
    }
  }

  return result;
};

const useAuthenticatedQueries = async ({
  req,
  queryClient,
  options: rawOptions = [],
}) => {
  if (!!req && !!queryClient && typeof window === 'undefined') {
    return await prefetchAuthenticatedQueries({
      req,
      queryClient,
      options: rawOptions,
    });
  }

  const { asPath, ...router } = useRouter();

  const headers = useHeaders();
  const { cookies, removeAuthenticationCookies } = useCookiesWithOptions([
    'token',
  ]);

  const useQueriesOptions = rawOptions.map((options) =>
    prepareArguments({
      options,
      isTokenPresent: isTokenValid(cookies.token),
      headers,
    }),
  );

  const results = useQueries(useQueriesOptions as any) as Array<
    UseQueryResult<any, { status: number }>
  >;

  if (
    results.some(
      (result) => result?.error && isUnAuthorized(result?.error.status),
    )
  ) {
    if (!asPath.startsWith('/login') && asPath !== '/[...params]') {
      removeAuthenticationCookies();
      await router.push('/login');
    }
  }

  return {
    data: results.map(({ data }) => data).filter((data) => data !== undefined),
    ...getStatusFromResults(results),
  };
};

export {
  useAuthenticatedQuery,
  useAuthenticatedQueries,
  useAuthenticatedMutation,
  useAuthenticatedMutations,
  getStatusFromResults,
  QueryStatus,
};

export type { UseAuthenticatedQueryOptions };
