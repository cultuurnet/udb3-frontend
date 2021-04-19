import getConfig from 'next/config';
import { useCookiesWithOptions } from '../useCookiesWithOptions';

const createHeaders = (token, extraHeaders) => {
  const { publicRuntimeConfig } = getConfig();

  return {
    Authorization: `Bearer ${token}`,
    'X-Api-Key': publicRuntimeConfig.apiKey,
    ...extraHeaders,
  };
};

const useHeaders = (extraHeaders = {}) => {
  // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'never'.
  const { cookies } = useCookiesWithOptions(['token']);
  return createHeaders(cookies.token, extraHeaders);
};

export { useHeaders, createHeaders };
