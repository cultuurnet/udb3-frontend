import { useRouter } from 'next/router';
import { useMemo } from 'react';

export const useSearchParams = () => {
  const { query, pathname } = useRouter();

  return useMemo(() => {
    const params = new URLSearchParams();

    const filtered = Object.entries(query).filter(([key]) => {
      return !pathname.includes(`[${key}]`);
    });

    filtered.forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
        return;
      }

      params.set(key, value);
    });

    return params;
  }, [query, pathname]);
};
