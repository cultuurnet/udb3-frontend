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
import { fetchFromApi, isErrorObject } from '@/utils/fetchFromApi';

export const prefetchGetLabelsQuery = ({
  req,
  queryClient,
  name,
  paginationOptions,
}: ServerSideQueryOptions & PaginationOptions & { name?: string }) =>
  prefetchAuthenticatedQuery({
    req,
    queryClient,
    ...createGetLabelsQueryOptions({ name, paginationOptions }),
});

const getLabels = async ({
  headers,
  name,
  start,
  limit
}: {
  headers: Headers;
  name: string;
  start: string;
  limit: string;
}) => {
  const res = await fetchFromApi({
    path: '/labels/',
    searchParams: {
      query: name,
      limit: limit,
      start: start,
      suggestion: 'true',
    },
    options: {
      headers,
    },
  });
  return (await res.json()) as PaginatedData<Label[]>;
};

const createGetLabelsQueryOptions = ({
  name = '',
  paginationOptions = { start: 0, limit: 10 }
}: PaginationOptions & { name?: string}) => queryOptions({
  queryKey: ['labels'],
  queryFn: getLabels,
  queryArguments: {
    name,
    start: `${paginationOptions.start}`,
    limit: `${paginationOptions.limit}`,
  }
});

const useGetLabelsByQuery = ({
  name,
  paginationOptions = { start: 0, limit: 10 }
}: PaginationOptions & { name: string}) => {
  const options = createGetLabelsQueryOptions({ name, paginationOptions });

  return useAuthenticatedQuery({
    ...options,
  });
}


export { useGetLabelsByQuery };
