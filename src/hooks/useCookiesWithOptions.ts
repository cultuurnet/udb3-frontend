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

  const setCookieWithOptions = (name: string, value: any) =>
    setCookie(name, value, options);
  const removeAuthenticationCookies = () =>
    ['token', 'idToken'].forEach((cookie) => removeCookie(cookie));

  return {
    cookies,
    setCookie: setCookieWithOptions,
    removeCookie,
    removeAuthenticationCookies,
  };
};

export { defaultCookieOptions, useCookiesWithOptions };
export type { Cookies };
