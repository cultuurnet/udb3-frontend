import * as Sentry from '@sentry/nextjs';
import { useRouter } from 'next/router';
import Router from 'next/router';
import PropTypes from 'prop-types';
import { useEffect, useMemo } from 'react';
import { Cookies } from 'react-cookie';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

import { useGetTermsQuery } from '@/hooks/api/terms';
import { useGetUserQuery } from '@/hooks/api/user';
import { useCookiesWithOptions } from '@/hooks/useCookiesWithOptions';
import {
  useHandleWindowMessage,
  WindowMessageTypes,
} from '@/hooks/useHandleWindowMessage';
import { Inline } from '@/ui/Inline';
import { isTokenValid } from '@/utils/isTokenValid';

import { ErrorBoundary } from './ErrorBoundary';
import { Sidebar } from './Sidebar';

const useChangeLanguage = () => {
  const { i18n } = useTranslation();
  const { cookies } = useCookiesWithOptions(['udb-language']);
  const language = useMemo(() => cookies['udb-language'], [cookies]);
  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);
};

const useHandleAuthentication = () => {
  const { pathname, query, asPath, ...router } = useRouter();
  const getUserQuery = useGetUserQuery();

  useEffect(() => {
    if (!getUserQuery.data) return;
    // @ts-expect-error TODO: Fix type error
    Sentry.setUser({ id: getUserQuery.data.id });
  }, [getUserQuery.data]);

  // redirect when there is no token or user cookie
  // manipulation from outside the application
  useEffect(() => {
    let intervalId; // eslint-disable-line prefer-const
    const cleanUp = () => (intervalId ? clearInterval(intervalId) : undefined);
    if (asPath.startsWith('/login')) return cleanUp;
    intervalId = setInterval(() => {
      const cookies = new Cookies();
      if (!isTokenValid(cookies.get('token'))) {
        Sentry.setUser(null);
        cookies.remove('token');
        Router.push('/login');
      }
    }, 5000); // checking every 5 seconds
    return cleanUp;
  }, [asPath]);
};

const Layout = ({ children }) => {
  const { asPath, ...router } = useRouter();
  const queryClient = useQueryClient();
  const { cookies, removeAuthenticationCookies } = useCookiesWithOptions([
    'token',
  ]);

  useChangeLanguage();
  useHandleWindowMessage({
    [WindowMessageTypes.URL_CHANGED]: ({ path }) => {
      const currentUrl = new URL(window.location.href);
      const nextUrl = new URL(
        `${window.location.protocol}//${window.location.host}${path}`,
      );

      const areUrlsDeepEqual =
        currentUrl.pathname === nextUrl.pathname &&
        [...nextUrl.searchParams.entries()]
          .filter(([key]) => key !== 'jwt' && key !== 'lang')
          .every(([key, val]) => currentUrl.searchParams.get(key) === val);

      if (areUrlsDeepEqual) {
        return;
      }

      const hasPage = nextUrl.searchParams.has('page');

      if (hasPage) {
        window.history.pushState(undefined, '', nextUrl.toString());
      } else {
        router.push(`${nextUrl.pathname}${nextUrl.search}`);
      }
    },
    [WindowMessageTypes.HTTP_ERROR_CODE]: ({ code }) => {
      if ([401, 403].includes(code)) {
        removeAuthenticationCookies();
        queryClient.invalidateQueries('user');
        router.push('/login');
      }
    },
  });
  useHandleAuthentication();
  useGetTermsQuery();

  if (!cookies.token) return null;

  return (
    <Inline height="100vh">
      {/* @ts-expect-error TODO: Fix type error */}
      <Sidebar />
      {children}
    </Inline>
  );
};

Layout.propTypes = {
  children: PropTypes.node,
};

const LayoutWrapper = ({ children }) => {
  const { asPath } = useRouter();

  if (
    asPath.startsWith('/login') ||
    asPath.startsWith('/404') ||
    asPath.startsWith('/500')
  ) {
    return <>{children}</>;
  }

  return (
    <ErrorBoundary>
      <Layout>{children}</Layout>
    </ErrorBoundary>
  );
};

LayoutWrapper.propTypes = {
  children: PropTypes.node,
};

export default LayoutWrapper;
