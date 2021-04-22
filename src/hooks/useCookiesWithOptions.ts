import { useCookies as useReactCookies } from 'react-cookie';
import { CookieSetOptions } from 'universal-cookie';

const defaultCookieOptions = {
  maxAge: 60 * 60 * 24 * 30,
  path: '/',
};

const useCookiesWithOptions = (
  dependencies: string[] = [],
  options: CookieSetOptions = defaultCookieOptions,
) => {
  const [cookies, setCookie, removeCookie] = useReactCookies(dependencies);

  const setCookieWithOptions = (name, value) => setCookie(name, value, options);
  const removeAuthenticationCookies = () =>
    ['token', 'user'].forEach((name) => removeCookie(name));

  return {
    cookies,
    setCookie: setCookieWithOptions,
    removeCookie,
    removeAuthenticationCookies,
  };
};

export { useCookiesWithOptions, defaultCookieOptions };
