import { useCookiesWithOptions } from '../useCookiesWithOptions';

const createHeaders = (token, extraHeaders) => {
  return {
    Authorization: `Bearer ${token}`,
    'X-Api-Key': process.env.NEXT_PUBLIC_API_KEY,
    ...extraHeaders,
  };
};

const useHeaders = (extraHeaders = {}) => {
  const { cookies } = useCookiesWithOptions(['token']);
  return createHeaders(cookies.token, extraHeaders);
};

export { createHeaders, useHeaders };
