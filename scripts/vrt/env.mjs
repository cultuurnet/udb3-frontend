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

export const buildPinnedEnv = () => ({
  NEXT_PUBLIC_OWNERSHIP_ENABLED: 'true',
  NEXT_PUBLIC_UDB_PUBLICATION_RULES_URL:
    'https://www.publiq.be/uitdatabank/publicatieregels',
  NEXT_PUBLIC_GLOBAL_ALERT_MESSAGE: 'null',
});

const REQUIRED_ENV = [
  'NEXT_PUBLIC_API_KEY',
  'NEXT_PUBLIC_BASE_URL',
  'NEXT_PUBLIC_LEGACY_APP_URL',
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
    `\nNot set:\n${missing.map((envVar) => `  - ${envVar}`).join('\n')}\n\nA VRT run cannot log in and render the way CI does without these.\n`,
  );
  process.exit(1);
};
