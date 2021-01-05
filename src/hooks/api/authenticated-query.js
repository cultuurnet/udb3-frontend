import { castArray } from 'lodash';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { Cookies } from 'react-cookie';
import { useQuery, useQueries, useMutation } from 'react-query';
import { Errors } from '../../utils/fetchFromApi';
import { useCookiesWithOptions } from '../useCookiesWithOptions';
import { createHeaders, useHeaders } from './useHeaders';

const QueryStatus = {
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
};

const prepareKey = ({ queryKey, queryArguments }) =>
  [
    ...queryKey,
    Object.keys(queryArguments).length > 0 ? queryArguments : undefined,
  ].filter((key) => key !== undefined);

const prepareArguments = ({
  options: {
    queryKey,
    queryFn = () => {},
    queryArguments = {},
    enabled = true,
    ...configuration
  } = {},
  isTokenPresent = false,
  headers,
} = {}) => {
  return {
    queryKey: prepareKey({ queryArguments, queryKey }),
    queryFn: () => queryFn({ ...queryArguments, headers }),
    enabled: isTokenPresent && !!enabled,
    ...configuration,
  };
};

const isUnAuthorized = (result) =>
  result.status === QueryStatus.ERROR &&
  [Errors['401'], Errors['403']].includes(result.error.message);

const getStatusFromResults = (results) => {
  if (results.some(({ status }) => status === QueryStatus.ERROR)) {
    return {
      status: QueryStatus.ERROR,
      error: results
        .map(({ error }) => error)
        .filter((error) => error !== undefined),
    };
  }
  if (results.every(({ status }) => status === QueryStatus.IDLE)) {
    return { status: QueryStatus.IDLE };
  }
  if (results.every(({ status }) => status === QueryStatus.SUCCESS)) {
    return { status: QueryStatus.SUCCESS };
  }
  if (results.some(({ status }) => status === QueryStatus.LOADING)) {
    return { status: QueryStatus.LOADING };
  }
};

const prefetchAuthenticatedQueries = async ({
  req,
  queryClient,
  options: rawOptions = [],
}) => {
  const cookies = new Cookies(req?.headers?.cookie);
  const headers = createHeaders(cookies.get('token'));

  const perparedArguments = rawOptions.map((options) =>
    prepareArguments({
      options,
      isTokenPresent: !!cookies.get('token'),
      headers,
    }),
  );

  await Promise.all(
    perparedArguments.map(({ queryKey, queryFn }) =>
      queryClient.prefetchQuery(queryKey, queryFn),
    ),
  );

  return await Promise.all(
    perparedArguments.map(({ queryKey }) => queryClient.getQueryData(queryKey)),
  );
};

const prefetchAuthenticatedQuery = async ({ req, queryClient, ...options }) => {
  const cookies = new Cookies(req?.headers?.cookie);
  const headers = createHeaders(cookies.get('token'));

  const { queryKey, queryFn } = prepareArguments({
    options,
    isTokenPresent: cookies.get('token'),
    headers,
  });

  await queryClient.prefetchQuery(queryKey, queryFn);
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
    const result = await mutationFn({ ...variables, headers });

    if (isUnAuthorized(result)) {
      removeAuthenticationCookies();
      router.push('/login');
    } else if (result.status) {
      throw new Error(result.title);
    }

    return result;
  });

  return useMutation(innerMutationFn, configuration);
};

const useAuthenticatedQuery = ({ mockData, ...options } = {}) => {
  if (!!options.req && !!options.queryClient && typeof window === 'undefined') {
    return prefetchAuthenticatedQuery(options);
  }

  const [randomMockData, setRandomMockData] = useState();
  const mockDataArray = castArray(mockData);

  const getNewMockData = () => {
    if (mockDataArray.length === 1) return mockDataArray[0];
    return mockDataArray[Math.floor(Math.random() * mockDataArray.length)];
  };

  const refetch = () => setRandomMockData(getNewMockData());

  useEffect(() => {
    if (
      !!mockData &&
      process.env.NODE_ENV !== 'production' &&
      typeof window !== 'undefined'
    ) {
      setRandomMockData(getNewMockData());
    }
  }, [mockData, process.env.NODE_ENV]);

  if (
    mockData &&
    process.env.NODE_ENV !== 'production' &&
    typeof window !== 'undefined'
  ) {
    return {
      refetch,
      status: QueryStatus.SUCCESS,
      data: randomMockData,
    };
  }

  const { asPath, ...router } = useRouter();

  const headers = useHeaders();
  const { cookies, removeAuthenticationCookies } = useCookiesWithOptions([
    'token',
  ]);

  const preparedArguments = prepareArguments({
    options,
    isTokenPresent: !!cookies.token,
    headers,
  });

  const result = useQuery(preparedArguments);

  if (isUnAuthorized(result)) {
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

  const { asPath, ...router } = useRouter();

  const headers = useHeaders();
  const { cookies, removeAuthenticationCookies } = useCookiesWithOptions([
    'token',
  ]);

  const options = rawOptions.map((options) =>
    prepareArguments({
      options,
      isTokenPresent: !!cookies.token,
      headers,
    }),
  );

  const results = useQueries(options);

  if (results.some(isUnAuthorized)) {
    if (!asPath.startsWith('/login') && asPath !== '/[...params]') {
      removeAuthenticationCookies();
      router.push('/login');
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
  QueryStatus,
};
