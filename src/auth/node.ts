import { initAuth0 } from '@auth0/nextjs-auth0';

import { getAuthConfig } from './config';

export const getAuthServer = () => {
  if (typeof window !== 'undefined') {
    throw new Error('getAuthServer should only be used on server side');
  }

  return initAuth0(getAuthConfig());
};
