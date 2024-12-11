import { useRouter } from 'next/router';
import { useMemo } from 'react';

export const useShallowRouter = () => {
  const router = useRouter();

  return useMemo(() => {
    const pushSearchParams = async (params: Record<string, string>) => {
      const newQuery = {
        ...router.query,
      };

      Object.entries(params).forEach(([key, value]) => {
        if (value !== '' && value !== undefined) {
          newQuery[key] = value;
          return;
        }

        if (key in newQuery) {
          delete newQuery[key];
        }
      });

      await router.push(
        {
          pathname: router.pathname,
          query: newQuery,
        },
        undefined,
        {
          shallow: true,
        },
      );
    };

    return {
      pushSearchParams,
    };
  }, [router]);
};
