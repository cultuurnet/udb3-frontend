import { ConfigParameters } from '@auth0/nextjs-auth0';

export const getAuthConfig = (): ConfigParameters => {
  if (typeof window !== 'undefined') {
    throw new Error('Auth config should only be used on server side');
  }

  const config: ConfigParameters =
    process.env.NEXT_PUBLIC_KEYCLOAK_ENABLED === 'true'
      ? {
          secret: process.env.AUTH_SECRET,
          baseURL: process.env.AUTH_BASE_URL,
          clientID: process.env.AUTH_CLIENT_ID,
          clientSecret: process.env.AUTH_CLIENT_SECRET,
          issuerBaseURL: process.env.AUTH_ISSUER_BASE_URL,
        }
      : {
          secret: process.env.LEGACY_AUTH_SECRET,
          baseURL: process.env.LEGACY_AUTH_BASE_URL,
          clientID: process.env.LEGACY_AUTH_CLIENT_ID,
          clientSecret: process.env.LEGACY_AUTH_CLIENT_SECRET,
          issuerBaseURL: process.env.LEGACY_AUTH_ISSUER_BASE_URL,
        };

  console.log({ config });

  return config;
};
