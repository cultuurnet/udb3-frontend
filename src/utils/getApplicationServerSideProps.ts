import Cookies from 'universal-cookie';
import { QueryClient } from 'react-query';
import { isTokenValid } from './isTokenValid';
import getConfig from 'next/config';
import type { GetServerSidePropsContext } from 'next';
import { DehydratedState } from 'react-query/types/hydration';

type CallbackFnOptions = Pick<GetServerSidePropsContext, 'req' | 'query'> & {
  queryClient: QueryClient;
  cookies: string;
};

const getApplicationServerSideProps = (
  callbackFn?: (
    options: CallbackFnOptions,
  ) => Promise<{
    props: { dehydratedState: DehydratedState; cookies: string };
  }>,
) => async ({ req, query }: GetServerSidePropsContext) => {
  const { publicRuntimeConfig } = getConfig();
  if (publicRuntimeConfig.environment === 'development') {
    // @ts-expect-error ts-migrate(2322) FIXME: Type '0' is not assignable to type 'string | undef... Remove this comment to see the full error message
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
  }

  const rawCookies = req?.headers?.cookie ?? '';

  const cookies = new Cookies(rawCookies);

  if (!isTokenValid(query?.jwt ?? cookies.get('token'))) {
    cookies.remove('user');
    cookies.remove('token');

    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const queryClient = new QueryClient();

  if (!callbackFn) return { props: { cookies: rawCookies } };
  return await callbackFn({
    req,
    query,
    queryClient,
    cookies: rawCookies,
  });
};

export { getApplicationServerSideProps };
