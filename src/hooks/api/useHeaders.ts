import getConfig from 'next/config';
import { useCookiesWithOptions } from '../useCookiesWithOptions';

const createHeaders = (
  token: string,
  extraHeaders: Record<string, unknown>,
): Record<string, unknown> => {
  const { publicRuntimeConfig } = getConfig();

  return {
    Authorization: `Bearer ${token}`,
    'X-Api-Key': publicRuntimeConfig.apiKey,
    ...extraHeaders,
  };
};

const useHeaders = (extraHeaders: Record<string, unknown> = {}) => {
  const { cookies } = useCookiesWithOptions(['token']);
  return createHeaders(cookies.token, extraHeaders);
};

export { useHeaders, createHeaders };
