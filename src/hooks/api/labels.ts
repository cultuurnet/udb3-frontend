import { useQuery } from 'react-query';

import {
  PaginationOptions,
  prefetchAuthenticatedQuery,
  queryOptions,
  ServerSideQueryOptions,
  useAuthenticatedQuery,
} from '@/hooks/api/authenticated-query';
import type { Headers } from '@/hooks/api/types/Headers';
import { Label } from '@/types/Offer';
import { PaginatedData } from '@/types/PaginatedData';
import { fetchFromApi } from '@/utils/fetchFromApi';

type UitpasLabels = Record<string, string>;

const prefetchGetLabelsQuery = ({
  req,
  queryClient,
  name,
  paginationOptions,
  onlySuggestions = false,
}: ServerSideQueryOptions &
  PaginationOptions & { name?: string } & { onlySuggestions?: boolean }) =>
  prefetchAuthenticatedQuery({
    req,
    queryClient,
    ...createGetLabelsQueryOptions({
      name,
      paginationOptions,
      onlySuggestions,
    }),
  });

const getLabels = async ({
  headers,
  name,
  start,
  limit,
  suggestion,
}: {
  headers: Headers;
  name: string;
  start: string;
  limit: string;
  suggestion: boolean;
}) => {
  const searchParams = new URLSearchParams({
    query: name,
    limit: limit,
    start: start,
    ...(suggestion && { suggestion: 'true' }),
  });
  const res = await fetchFromApi({
    path: '/labels/',
    searchParams,
    options: {
      headers,
    },
  });
  return (await res.json()) as PaginatedData<Label[]>;
};

const createGetLabelsQueryOptions = ({
  name = '',
  paginationOptions = { start: 0, limit: 6 },
  onlySuggestions = false,
}: PaginationOptions & { name?: string } & { onlySuggestions?: boolean }) =>
  queryOptions({
    queryKey: ['labels'],
    queryFn: getLabels,
    queryArguments: {
      name,
      start: `${paginationOptions.start}`,
      limit: `${paginationOptions.limit}`,
      suggestion: onlySuggestions,
    },
  });

const useGetLabelsByQuery = ({
  name,
  paginationOptions = { start: 0, limit: 6 },
  onlySuggestions = false,
}: PaginationOptions & { name: string } & { onlySuggestions?: boolean }) => {
  const options = createGetLabelsQueryOptions({
    name,
    paginationOptions,
    onlySuggestions,
  });

  return useAuthenticatedQuery({
    ...options,
  });
};

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
  getUitpasLabelsQuery,
  prefetchGetLabelsQuery,
  useGetLabelsByQuery,
  useGetUitpasLabelsQuery,
};
