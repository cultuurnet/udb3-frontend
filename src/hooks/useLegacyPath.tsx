import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

import { useCookiesWithOptions } from './useCookiesWithOptions';

const useLegacyPath = () => {
  const { cookies } = useCookiesWithOptions(['token', 'udb-language']);
  const router = useRouter();
  const { publicRuntimeConfig } = getConfig();
  const prefixWhenNotEmpty = (value, prefix) =>
    value ? `${prefix}${value}` : value;

  const jwt = cookies.token;
  const lang = cookies['udb-language'];

  const legacyPath = useMemo(() => {
    const path = new URL(`http://localhost${router.asPath}`).pathname;
    const { params = [], ...queryWithoutParams } = router.query;
    const queryString = prefixWhenNotEmpty(
      new URLSearchParams({
        ...queryWithoutParams,
        jwt,
        lang,
      }),
      '?',
    );

    return `${publicRuntimeConfig.legacyAppUrl}${path}${queryString}`;
  }, [
    router.asPath,
    router.query,
    jwt,
    lang,
    publicRuntimeConfig.legacyAppUrl,
  ]);

  return legacyPath;
};

export { useLegacyPath };
