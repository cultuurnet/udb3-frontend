import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';

import { useCookiesWithOptions } from './useCookiesWithOptions';
import { useSearchParams } from './useSearchParams';

const useLegacyPath = () => {
  const { cookies } = useCookiesWithOptions(['token', 'udb-language']);
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefixWhenNotEmpty = (value, prefix) =>
    value ? `${prefix}${value}` : value;

  const jwt = cookies.token;
  const lang = cookies['udb-language'];

  const legacyPath = useMemo(() => {
    const path = new URL(router.asPath, process.env.NEXT_PUBLIC_LEGACY_APP_URL)
      .pathname;
    searchParams.set('jwt', jwt);
    searchParams.set('lang', lang);

    return `${process.env.NEXT_PUBLIC_LEGACY_APP_URL}${path}${prefixWhenNotEmpty(
      searchParams.toString(),
      '?',
    )}`;
  }, [
    router.asPath,
    jwt,
    lang,
    process.env.NEXT_PUBLIC_LEGACY_APP_URL,
    searchParams,
  ]);

  return legacyPath;
};

export { useLegacyPath };
