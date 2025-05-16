import { ConfigParameters } from '@auth0/nextjs-auth0';

export const getAuthConfig = (): ConfigParameters => {
  if (typeof window !== 'undefined') {
    throw new Error('Auth config should only be used on server side');
  }

  return {
    secret: process.env.AUTH_SECRET,
    baseURL: process.env.AUTH_BASE_URL,
    clientID: process.env.AUTH_CLIENT_ID,
    clientSecret: process.env.AUTH_CLIENT_SECRET,
    issuerBaseURL: process.env.AUTH_ISSUER_BASE_URL,
  };
};
