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
  const {
    // eslint-disable-next-line no-unused-vars
    query: { params = [], ...queryWithoutParams },
    asPath,
  } = router;

  const legacyPath = useMemo(() => {
    const path = new URL(`http://localhost${asPath}`).pathname;
    const ownershipPaths =
      router.asPath.startsWith('/organizer') &&
      !router.asPath.endsWith('/ownerships');
    const queryString = prefixWhenNotEmpty(
      new URLSearchParams({
        ...queryWithoutParams,
        jwt: cookies.token,
        lang: cookies['udb-language'],
        ...(ownershipPaths &&
          publicRuntimeConfig.ownershipEnabled === 'true' && {
            ownership: 'true',
          }),
      }),
      '?',
    );

    return `${publicRuntimeConfig.legacyAppUrl}${path}${queryString}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asPath, cookies.token, cookies['udb-language']]);

  return legacyPath;
};

export { useLegacyPath };
