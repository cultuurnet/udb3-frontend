import { useQuery } from 'react-query';

import { useAuthenticatedQuery } from '@/hooks/api/authenticated-query';
import type { Headers } from '@/hooks/api/types/Headers';
import { Label } from '@/types/Offer';
import { PaginatedData } from '@/types/PaginatedData';
import { fetchFromApi } from '@/utils/fetchFromApi';

type UitpasLabels = Record<string, string>;

const getLabelsByQuery = async ({
  headers,
  query,
}: {
  headers: Headers;
  query: string;
}) => {
  const res = await fetchFromApi({
    path: '/labels/',
    searchParams: {
      query,
      limit: '6',
      start: '0',
      suggestion: 'true',
    },
    options: {
      headers,
    },
  });
  return (await res.json()) as PaginatedData<Label[]>;
};

const useGetLabelsByQuery = ({ query }: { query: string }) =>
  useAuthenticatedQuery({
    queryKey: ['labels'],
    queryFn: getLabelsByQuery,
    queryArguments: { query },
    enabled: !!query,
  });

const getUitpasLabelsQuery = async (): Promise<UitpasLabels> => {
  const res = await fetchFromApi({
    path: '/uitpas/labels',
  });
  return await res.json();
};

const useGetUitpasLabelsQuery = () =>
  useQuery({
    queryKey: ['uitpas-labels'],
    queryFn: getUitpasLabelsQuery,
    staleTime: 1000 * 60 * 60, // 1 hour
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

export {
  getLabelsByQuery,
  getUitpasLabelsQuery,
  useGetLabelsByQuery,
  useGetUitpasLabelsQuery,
};
