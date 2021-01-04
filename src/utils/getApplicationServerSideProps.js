import { Cookies } from 'react-cookie';
import { QueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import { useGetPermissions, useGetRoles, useGetUser } from '../hooks/api/user';

const getApplicationServerSideProps = (callbackFn) => async ({
  req,
  query,
}) => {
  if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
  }

  const { cookies } = new Cookies(req?.headers?.cookie);
  const isUnAuthorized = !cookies.token && !query?.jwt;

  if (isUnAuthorized) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const queryClient = new QueryClient();

  await Promise.all([
    useGetUser({ req, queryClient }),
    useGetPermissions({ req, queryClient }),
    useGetRoles({ req, queryClient }),
  ]);

  if (!callbackFn)
    return { props: { cookies, dehydratedState: dehydrate(queryClient) } };
  return await callbackFn({ req, query, queryClient, cookies });
};

export { getApplicationServerSideProps };
