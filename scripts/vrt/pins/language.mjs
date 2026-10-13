const VRT_LANGUAGE = 'nl';

const LANGUAGE_COOKIE_NAME = 'udb-language';

export const pinLanguage = (cookies, domain) => [
  ...cookies.filter(
    (cookie) =>
      cookie.name !== LANGUAGE_COOKIE_NAME || cookie.domain !== domain,
  ),
  { name: LANGUAGE_COOKIE_NAME, value: VRT_LANGUAGE, domain, path: '/' },
];
