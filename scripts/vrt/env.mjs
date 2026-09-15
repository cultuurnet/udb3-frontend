import dotenv from 'dotenv';

import { APP_HOST, MOCK_ORIGIN } from './hosts.mjs';

dotenv.config({ path: ['.env.local', '.env'] });

const FEATURE_FLAGS = {
  // BOA cleanup: drop this entry once no FeatureFlags.BOA gates are left in src/.
  boa: true,
  shadcn_migration: false,
};

export const buildFeatureFlagEnv = () =>
  Object.fromEntries(
    Object.entries(FEATURE_FLAGS).map(([flag, enabled]) => [
      `NEXT_PUBLIC_FF_${flag.toUpperCase()}`,
      String(enabled),
    ]),
  );

export const PINNED_ENV = {
  NEXT_PUBLIC_OWNERSHIP_ENABLED: 'true',
  NEXT_PUBLIC_GLOBAL_ALERT_MESSAGE: 'null',
};

// Allowed because the app reaches them today, not because they belong here.
const UNMOCKED_HOSTS = [
  'cdn.jsdelivr.net', // Bootstrap CSS, moves pixels
  'fonts.googleapis.com', // unused, GlobalStyle forces a system font stack
  'fonts.gstatic.com', // the font files that stylesheet pulls
  'static.hotjar.com', // analytics, site id hardcoded in the app
];

const UNMOCKED_HOST_ENV_VARS = ['NEXT_PUBLIC_SOCKET_URL'];

export const buildAllowedHosts = () => [
  APP_HOST,
  new URL(MOCK_ORIGIN).hostname,
  ...UNMOCKED_HOSTS,
  ...UNMOCKED_HOST_ENV_VARS.filter((envVar) => process.env[envVar]).map(
    (envVar) => new URL(process.env[envVar]).hostname,
  ),
];

const REQUIRED_ENV = [
  'NEXT_PUBLIC_API_KEY',
  'NEXT_PUBLIC_BASE_URL',
  'NEXT_PUBLIC_LEGACY_APP_URL',
  'NEXT_PUBLIC_UDB_PUBLICATION_RULES_URL',
  'AUTH_SECRET',
  'AUTH_BASE_URL',
  'AUTH_ISSUER_BASE_URL',
  'AUTH_CLIENT_ID',
  'AUTH_CLIENT_SECRET',
  'E2E_TEST_EMAIL',
  'E2E_TEST_PASSWORD',
];

export const assertRequiredEnv = () => {
  const missing = REQUIRED_ENV.filter((envVar) => !process.env[envVar]);
  if (missing.length === 0) return;

  console.error(
    `\nNot set in the environment, .env.local or .env:\n${missing.map((envVar) => `  - ${envVar}`).join('\n')}\n\nA VRT run cannot log in and render the way CI does without these.\n`,
  );
  process.exit(1);
};
