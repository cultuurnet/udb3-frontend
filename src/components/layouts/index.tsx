import PropTypes from 'prop-types';

// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/hooks/api/user' or its corre... Remove this comment to see the full error message
import { useGetUser } from '@/hooks/api/user';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/hooks/useCookiesWithOptions'... Remove this comment to see the full error message
import { useCookiesWithOptions } from '@/hooks/useCookiesWithOptions';
import {
  useHandleWindowMessage,
  WindowMessageTypes,
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/hooks/useHandleWindowMessage... Remove this comment to see the full error message
} from '@/hooks/useHandleWindowMessage';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Inline' or its correspond... Remove this comment to see the full error message
import { Inline } from '@/ui/Inline';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/utils/isTokenValid' or its c... Remove this comment to see the full error message
import { isTokenValid } from '@/utils/isTokenValid';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/utils/sentry' or its corresp... Remove this comment to see the full error message
import { setSentryUser } from '@/utils/sentry';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Sidebar' was resolved to '/Users/simonde... Remove this comment to see the full error message
import { Sidebar } from './Sidebar';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Cookies } from 'react-cookie';
import { useTranslation } from 'react-i18next';
import { ErrorFallback } from './ErrorFallback';
import * as Sentry from '@sentry/react';

const useChangeLanguage = () => {
  const { i18n } = useTranslation();
  const { cookies } = useCookiesWithOptions(['udb-language']);
  useEffect(() => {
    i18n.changeLanguage(cookies['udb-language']);
  }, [cookies['udb-language']]);
};

const useHandleAuthentication = () => {
  const { query, asPath, ...router } = useRouter();
  const { setCookie, cookies } = useCookiesWithOptions(['user', 'token']);
  const getUserQuery = useGetUser();

  useEffect(() => {
    if (query?.jwt && cookies.token !== query?.jwt) {
      setCookie('token', query.jwt);
    }
  }, [query]);

  useEffect(() => {
    if (!getUserQuery.data) return;
    setCookie('user', getUserQuery.data);
    setSentryUser({ id: getUserQuery.data.id });
  }, [getUserQuery.data]);

  // redirect when there is no token or user cookie
  // manipulation from outside the application
  useEffect(() => {
    let intervalId; // eslint-disable-line prefer-const
    // @ts-expect-error ts-migrate(7034) FIXME: Variable 'intervalId' implicitly has type 'any' in... Remove this comment to see the full error message
    const cleanUp = () => (intervalId ? clearInterval(intervalId) : undefined);
    // @ts-expect-error ts-migrate(7005) FIXME: Variable 'intervalId' implicitly has an 'any' type... Remove this comment to see the full error message
    if (asPath.startsWith('/login')) return cleanUp;
    intervalId = setInterval(() => {
      const cookies = new Cookies();
      if (!isTokenValid(cookies.get('token')) || !cookies.get('user')) {
        cookies.remove('user');
        cookies.remove('token');
        router.push('/login');
      }
    }, 5000); // checking every 5 seconds
    return cleanUp;
  }, [asPath]);
};

const Layout = ({ children }) => {
  const { asPath, ...router } = useRouter();
  const { cookies, removeAuthenticationCookies } = useCookiesWithOptions([
    // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'children' implicitly has an 'any'... Remove this comment to see the full error message
    'token',
  ]);

  useChangeLanguage();
  useHandleWindowMessage({
    [WindowMessageTypes.URL_CHANGED]: ({ path }) => {
      const url = new URL(
        `${window.location.protocol}//${window.location.host}${path}`,
      );
      // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'path' implicitly has an 'any' typ... Remove this comment to see the full error message
      const query = Object.fromEntries(url.searchParams.entries());
      const hasPage = url.searchParams.has('page');
      if (hasPage) {
        window.history.pushState(
          // @ts-expect-error ts-migrate(2550) FIXME: Property 'fromEntries' does not exist on type 'Obj... Remove this comment to see the full error message
          undefined,
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'entries' does not exist on type 'URLSear... Remove this comment to see the full error message
          '',
          `${window.location.protocol}//${window.location.host}${path}`,
        );
      } else {
        router.push({ pathname: url.pathname, query });
      }
    },
    [WindowMessageTypes.URL_UNKNOWN]: () => router.push('/404'),
    [WindowMessageTypes.HTTP_ERROR_CODE]: ({ code }) => {
      if ([401, 403].includes(code)) {
        removeAuthenticationCookies();
        router.push('/login');
      }
    },
  });
  useHandleAuthentication();

  // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'code' implicitly has an 'any' typ... Remove this comment to see the full error message
  if (!cookies.token) return null;

  return (
    <Inline height="100vh">
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
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    asPath.startsWith('/login') ||
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    asPath.startsWith('/404') ||
    asPath.startsWith('/500')
  ) {
    return <>{children}</>;
  }

  return (
    // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'children' implicitly has an 'any'... Remove this comment to see the full error message
    // eslint-disable-next-line node/handle-callback-err
    <Sentry.ErrorBoundary
      fallback={({ error }) => <ErrorFallback error={error} />}
    >
      <Layout>{children}</Layout>
    {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
    </Sentry.ErrorBoundary>
  );
};

LayoutWrapper.propTypes = {
  children: PropTypes.node,
};

// @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
export default LayoutWrapper;
// @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
