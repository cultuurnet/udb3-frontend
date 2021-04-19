import flatten from 'lodash/flatten';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { Cookies } from 'react-cookie';
import { useQuery, useQueries, useMutation } from 'react-query';
import { isTokenValid } from '@/utils/isTokenValid';
import { useCookiesWithOptions } from '@/hooks/useCookiesWithOptions';
import { createHeaders, useHeaders } from './useHeaders';

const QueryStatus = {
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
};

const prepareKey = ({ queryKey = [], queryArguments = {} } = {}) => {
  return [
    ...flatten(queryKey),
    Object.keys(queryArguments).length > 0 ? queryArguments : undefined,
  ].filter((key) => key !== undefined);
};

const prepareArguments = ({
  options: {
    queryKey,
    // @ts-expect-error ts-migrate(2525) FIXME: Initializer provides no value for this binding ele... Remove this comment to see the full error message
    queryFn = () => {},
    queryArguments = {},
    enabled = true,
    ...configuration
  } = {},
  // @ts-expect-error ts-migrate(2525) FIXME: Initializer provides no value for this binding ele... Remove this comment to see the full error message
  isTokenPresent = false,
  headers,
} = {}) => ({
  queryKey: prepareKey({ queryArguments, queryKey }),
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
  queryFn: () => queryFn({ ...queryArguments, headers }),
  enabled: isTokenPresent && !!enabled,
  ...configuration,
});

// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'status' implicitly has an 'any' type.
const isUnAuthorized = (status) => [401, 403].includes(status);

// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'results' implicitly has an 'any' type.
const getStatusFromResults = (results) => {
  // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'status' implicitly has an 'any' t... Remove this comment to see the full error message
  if (results.some(({ status }) => status === QueryStatus.ERROR)) {
    return {
      status: QueryStatus.ERROR,
      error: results
        .map(({ error }) => error)
        // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'error' implicitly has an 'any' ty... Remove this comment to see the full error message
        .filter((error) => error !== undefined),
    };
  }

  // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'status' implicitly has an 'any' t... Remove this comment to see the full error message
  if (results.every(({ status }) => status === QueryStatus.SUCCESS)) {
    return { status: QueryStatus.SUCCESS };
  }
  // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'status' implicitly has an 'any' t... Remove this comment to see the full error message
  if (results.some(({ status }) => status === QueryStatus.LOADING)) {
    return { status: QueryStatus.LOADING };
  }
  if (results.some(({ status }) => status === QueryStatus.IDLE)) {
    // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'status' implicitly has an 'any' t... Remove this comment to see the full error message
    return { status: QueryStatus.IDLE };
  }
};

const prefetchAuthenticatedQueries = async ({
  req,
  queryClient,
  options: rawOptions = [],
}) => {
  // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'req' implicitly has an 'any' type... Remove this comment to see the full error message
  const cookies = new Cookies(req?.headers?.cookie);
  const headers = createHeaders(cookies.get('token'));

  // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
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

// @ts-expect-error ts-migrate(7031) FIXME: Binding element 'req' implicitly has an 'any' type... Remove this comment to see the full error message
const prefetchAuthenticatedQuery = async ({ req, queryClient, ...options }) => {
  const cookies = new Cookies(req?.headers?.cookie);
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
  const headers = createHeaders(cookies.get('token'));

  const { queryKey, queryFn } = prepareArguments({
    options,
    // @ts-expect-error ts-migrate(2741) FIXME: Property 'queryKey' is missing in type '{ [x: stri... Remove this comment to see the full error message
    isTokenPresent: isTokenValid(cookies.get('token')),
    headers,
  });

  try {
    await queryClient.prefetchQuery(queryKey, queryFn);
  } catch {}
  return await queryClient.getQueryData(queryKey);
};

/// /////////////////////////////////////////////////////////////////////////////////////////////

const useAuthenticatedMutation = ({
  mutationFn = () => {},
  ...configuration
} = {}) => {
  const router = useRouter();
  const headers = useHeaders();

  const { removeAuthenticationCookies } = useCookiesWithOptions();

  const innerMutationFn = useCallback(async (variables) => {
    const response = await mutationFn({ ...variables, headers });

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
    if (isUnAuthorized(response?.status)) {
      removeAuthenticationCookies();
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type 'void'.
      router.push('/login');
    }

    const result = await response.text();

    if (!result) {
      return '';
    }
    return JSON.parse(result);
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'text' does not exist on type 'void'.
  }, []);

  return useMutation(innerMutationFn, configuration);
};

const useAuthenticatedMutations = ({
  mutationFns = [],
  ...configuration
} = {}) => {
  const router = useRouter();
  const headers = useHeaders();

  const { removeAuthenticationCookies } = useCookiesWithOptions();

  const innerMutationFn = useCallback(async (variables) => {
    const responses = await mutationFns({ ...variables, headers });

    // @ts-expect-error ts-migrate(2349) FIXME: This expression is not callable.
    if (responses.some((response) => isUnAuthorized(response.status))) {
      removeAuthenticationCookies();
      // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'response' implicitly has an 'any' type.
      router.push('/login');
    } else if (responses.some((response) => response.type === 'ERROR')) {
      const errorMessages = responses
        .filter((response) => response.type === 'ERROR')
        // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'response' implicitly has an 'any' type.
        .map((response) => response.title)
        .join(', ');
      throw new Error(errorMessages);
    }

    // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'response' implicitly has an 'any' type.
    return Promise.all(
      // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'response' implicitly has an 'any' type.
      responses.map(async (response) => {
        const result = await response.text();

        if (!result) {
          return '';
        }

        return JSON.parse(result);
      }),
    );
    // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'response' implicitly has an 'any' type.
  }, []);

  return useMutation(innerMutationFn, configuration);
};

const useAuthenticatedQuery = (options = {}) => {
  if (!!options.req && !!options.queryClient && typeof window === 'undefined') {
    return prefetchAuthenticatedQuery(options);
  }

  const { asPath, ...router } = useRouter();

  // @ts-expect-error ts-migrate(2339) FIXME: Property 'req' does not exist on type '{}'.
  const headers = useHeaders();
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'queryClient' does not exist on type '{}'... Remove this comment to see the full error message
  const { cookies, removeAuthenticationCookies } = useCookiesWithOptions([
    'token',
  ]);

  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{}' is not assignable to paramet... Remove this comment to see the full error message
  const preparedArguments = prepareArguments({
    options,
    isTokenPresent: isTokenValid(cookies.token),
    headers,
  });

  const result = useQuery(preparedArguments);

  if (isUnAuthorized(result?.error?.status)) {
    // @ts-expect-error ts-migrate(2741) FIXME: Property 'queryKey' is missing in type '{}' but re... Remove this comment to see the full error message
    if (!asPath.startsWith('/login') && asPath !== '/[...params]') {
      removeAuthenticationCookies();
      router.push('/login');
    }
  }

  return result;
};

// @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
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

  // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'req' implicitly has an 'any' type... Remove this comment to see the full error message
  const { asPath, ...router } = useRouter();

  const headers = useHeaders();
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

  const results = useQueries(options);

  if (results.some((result) => isUnAuthorized(result?.error?.status))) {
    if (!asPath.startsWith('/login') && asPath !== '/[...params]') {
      removeAuthenticationCookies();
      router.push('/login');
    }
  }

  return {
    data: results.map(({ data }) => data).filter((data) => data !== undefined),
    // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
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
