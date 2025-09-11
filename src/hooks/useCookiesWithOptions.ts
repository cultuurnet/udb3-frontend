import { useCallback } from 'react';
import { useCookies as useReactCookies } from 'react-cookie';
import type { CookieSetOptions } from 'universal-cookie';

const defaultCookieOptions = {
  maxAge: 60 * 60 * 24 * 30,
  path: '/',
};

type Cookies = {
  'udb-language'?: string;
  token?: string;
  idToken?: string;
};

const useCookiesWithOptions = (
  dependencies: string[] = [],
  options: CookieSetOptions = defaultCookieOptions,
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

export { defaultCookieOptions, useCookiesWithOptions };
export type { Cookies };
