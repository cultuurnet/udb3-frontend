import { defaultCookieOptions } from '@/hooks/useCookiesWithOptions';
import { createCookieName, FeatureFlags } from '@/hooks/useFeatureFlag';
import i18n from '@/i18n/index';
import Layout from '@/layouts/index';
import { GlobalStyle } from '@/styles/GlobalStyle';
import { ThemeProvider } from '@/ui/ThemeProvider';
import { initializeSentry } from '@/utils/sentry';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import NextHead from 'next/head';
import PropTypes from 'prop-types';
import { cloneElement } from 'react';
import { Cookies, CookiesProvider } from 'react-cookie';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Hydrate } from 'react-query/hydration';

const cookies = new Cookies();

if (typeof window !== 'undefined') {
  window.FeatureFlags = FeatureFlags;

  // @ts-expect-error ts-migrate(2339) FIXME: Property 'setFeatureFlag' does not exist on type '... Remove this comment to see the full error message
  window.setFeatureFlag = (featureFlagName, value) => {
    cookies.set(createCookieName(featureFlagName), value, defaultCookieOptions);
    window.getCurrentFeatureFlagConfiguration();
  };

  // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCurrentFeatureFlagConfiguration' does... Remove this comment to see the full error message
  window.getCurrentFeatureFlagConfiguration = () => {
    // eslint-disable-next-line no-console
    console.table(
      Object.entries(FeatureFlags).reduce(
        (acc, [constant, featureFlagName]) => ({
          ...acc,
          [`FeatureFlags.${constant}`]: {
            enabled:
              cookies.get(createCookieName(featureFlagName)) === 'true'
                ? '✅'
                : '🚫',
          },
        }),
        {},
      ),
    );
  };
}

// @ts-expect-error ts-migrate(7031) FIXME: Binding element 'providers' implicitly has an 'any... Remove this comment to see the full error message
const ContextProvider = ({ providers, children }) => {
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'AccumulatedProviders' implicitly has an... Remove this comment to see the full error message
  return providers.reverse().reduce((AccumulatedProviders, current) => {
    const [CurrentProvider, currentProps] = Array.isArray(current)
      ? current
      : [current, {}];
    // eslint-disable-next-line react/prop-types
    return (
      // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
      <CurrentProvider {...currentProps}>
        {AccumulatedProviders}
      </CurrentProvider>
    );
  }, children);
};

ContextProvider.propTypes = {
  providers: PropTypes.array,
  children: PropTypes.node,
};

config.autoAddCss = false;

const Head = () => {
  const { t } = useTranslation();

  return (
    <NextHead>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <meta
        // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        key="viewport"
        name="viewport"
        content="initial-scale=1.0, width=device-width"
        // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
      />
      <link
        key="icon"
        rel="icon"
        type="image/png"
        // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        sizes="32x32"
        href="/favicon.png"
        // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
      />
      <title key="title">UiTdatabank</title>
      <meta name="description" content={t('description')} />
    </NextHead>
  );
};

const queryClient = new QueryClient();
initializeSentry();

// @ts-expect-error ts-migrate(7031) FIXME: Binding element 'Component' implicitly has an 'any... Remove this comment to see the full error message
const isServer = () => typeof window === 'undefined';

// @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
const App = ({ Component, pageProps, children }) => {
  return (
    <>
      <GlobalStyle />
      <Head />
      <ContextProvider
        providers={[
          [I18nextProvider, { i18n }],
          ThemeProvider,
          [
            CookiesProvider,
            {
              cookies: isServer()
                ? new Cookies(pageProps.cookies ?? '')
                : undefined,
            },
          ],
          [QueryClientProvider, { client: queryClient }],
          // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          [Hydrate, { state: pageProps?.dehydratedState ?? {} }],
        ]}
      >
        <ReactQueryDevtools initialIsOpen={false} />
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Layout>
          {children ? (
            cloneElement(children, { ...children.props, ...pageProps })
          ) : (
            <Component {...pageProps} />
          )}
        </Layout>
      </ContextProvider>
    </>
  );
};

App.propTypes = {
  Component: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  pageProps: PropTypes.object,
  children: PropTypes.node,
};

export default App;
