import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
// @ts-expect-error ts-migrate(2306) FIXME: File '/Users/simondebruijn/workspace/udb3-vagrant/... Remove this comment to see the full error message
import { publicRuntimeConfig } from '../../next.config';

const initializeSentry = () => {
  Sentry.init({
    environment: publicRuntimeConfig.environment,
    dsn: publicRuntimeConfig.sentryDsn,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
  });
};

const setSentryUser = ({ id, email, username }) => {
  Sentry.setUser({ id, email, username });
};

export { initializeSentry, setSentryUser };
