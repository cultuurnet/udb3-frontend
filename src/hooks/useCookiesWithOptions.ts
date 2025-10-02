import { useCallback } from 'react';
import { useCookies as useReactCookies } from 'react-cookie';
import type { CookieSetOptions } from 'universal-cookie';

import { DEFAULT_COOKIE_OPTIONS } from '@/constants/Cookies';

type Cookies = {
  'udb-language'?: string;
  token?: string;
  idToken?: string;
};

const useCookiesWithOptions = (
  dependencies: string[] = [],
  options: CookieSetOptions = DEFAULT_COOKIE_OPTIONS,
) => {
  const [cookies, setCookie, removeCookie] = useReactCookies(dependencies);

  const setCookieWithOptions = useCallback(
    (name: string, value: any) => {
      setCookie(name, value, options);
    },
    [setCookie, options],
  );
  const removeAuthenticationCookies = useCallback(() => {
    ['token', 'idToken'].forEach((cookie) => removeCookie(cookie));
  }, [removeCookie]);
  return {
    cookies,
    setCookie: setCookieWithOptions,
    removeCookie,
    removeAuthenticationCookies,
  };
};

export { useCookiesWithOptions };
export type { Cookies };
