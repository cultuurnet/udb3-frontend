import { initAuth0 } from '@auth0/nextjs-auth0/edge';

import { getAuthConfig } from './config';

export const getAuthEdgeServer = () => {
  if (typeof window !== 'undefined') {
    throw new Error('getAuthEdgeServer should only be used on server side');
  }

  return initAuth0(getAuthConfig());
};
