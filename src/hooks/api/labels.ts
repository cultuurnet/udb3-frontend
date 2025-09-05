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

export const labelsToTableData = (labels: Label[]) =>
  labels.map((label) => ({
    name: label.name,
    invisible: label.visibility,
    private: label.privacy,
    excluded: label.excluded,
    options: label.uuid,
  }));

export const prefetchGetLabelsQuery = ({
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
  const res = await fetchFromApi({
    path: '/labels/',
    searchParams: {
      query: name,
      limit: limit,
      start: start,
      suggestion: suggestion.toString(),
    },
    options: {
      headers,
    },
  });
  return (await res.json()) as PaginatedData<Label[]>;
};

const createGetLabelsQueryOptions = ({
  name = '',
  paginationOptions = { start: 0, limit: 10 },
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
  paginationOptions = { start: 0, limit: 10 },
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

export { useGetLabelsByQuery };
