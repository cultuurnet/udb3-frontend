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

type SetCookie = (name: string, value: any, options?: CookieSetOptions) => void;
type RemoveCookie = (name: string, options?: CookieSetOptions) => void;

const useCookiesWithOptions = (
  dependencies: string[] = [],
  options: CookieSetOptions = defaultCookieOptions,
) => {
  const [cookies, setCookie, removeCookie]: [Cookies, SetCookie, RemoveCookie] =
    useReactCookies(dependencies);

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
