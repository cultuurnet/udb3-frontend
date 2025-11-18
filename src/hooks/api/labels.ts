import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  ExtendQueryOptions,
  PaginationOptions,
  prefetchAuthenticatedQuery,
  queryOptions,
  ServerSideQueryOptions,
  useAuthenticatedMutation,
  useAuthenticatedQuery,
} from '@/hooks/api/authenticated-query';
import type { Headers } from '@/hooks/api/types/Headers';
import {
  Label,
  LabelPrivacyOptions,
  LabelVisibilityOptions,
} from '@/types/Offer';
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
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

const getLabelById = async ({
  headers,
  id,
}: {
  headers: Headers;
  id: string;
}) => {
  const res = await fetchFromApi({
    path: `/labels/${id}`,
    options: { headers },
  });
  return (await res.json()) as Label;
};

const createGetLabelByIdQueryOptions = ({ id }: { id: string }) =>
  queryOptions({
    queryKey: ['labels', { id: id }],
    queryFn: getLabelById,
    queryArguments: { id },
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

const useGetLabelByIdQuery = (
  { id }: { id: string },
  configuration?: ExtendQueryOptions<typeof getLabelById>,
) => {
  const options = createGetLabelByIdQueryOptions({ id });
  return useAuthenticatedQuery({
    ...options,
    ...(configuration || {}),
    enabled: options.enabled !== false && configuration?.enabled !== false,
  });
};

const prefetchGetLabelByIdQuery = ({
  req,
  queryClient,
  id,
}: ServerSideQueryOptions & { id: string }) =>
  prefetchAuthenticatedQuery({
    req,
    queryClient,
    ...createGetLabelByIdQueryOptions({ id }),
  });

type CreateLabelArgs = {
  headers: Headers;
  name: string;
  isVisible: boolean;
  isPrivate: boolean;
  parentId?: string;
};

const createLabel = async ({
  headers,
  name,
  isVisible,
  isPrivate,
  parentId,
}: CreateLabelArgs) => {
  const body = {
    name: (name || '').trim(),
    visibility: isVisible
      ? LabelVisibilityOptions.VISIBLE
      : LabelVisibilityOptions.INVISIBLE,
    privacy: isPrivate
      ? LabelPrivacyOptions.PRIVATE
      : LabelPrivacyOptions.PUBLIC,
    parentId: parentId || undefined,
  };
  return fetchFromApi({
    path: '/labels',
    options: {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    },
  });
};

const useCreateLabelMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: createLabel,
    mutationKey: 'labels-create',
    ...configuration,
  });

type UpdateLabelFlagsArgs = {
  headers: Headers;
  id: string;
  command: 'MakeVisible' | 'MakeInvisible' | 'MakePrivate' | 'MakePublic';
};

const updateLabel = async ({ headers, id, command }: UpdateLabelFlagsArgs) =>
  fetchFromApi({
    path: `/labels/${id}`,
    options: {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ command }),
    },
  });

const useUpdateLabelVisibilityMutation = (configuration = {}) => {
  const queryClient = useQueryClient();

  return useAuthenticatedMutation({
    mutationFn: ({
      headers,
      id,
      isVisible,
    }: {
      headers: Headers;
      id: string;
      isVisible: boolean;
    }) =>
      updateLabel({
        headers,
        id,
        command: isVisible ? 'MakeVisible' : 'MakeInvisible',
      }),
    mutationKey: 'labels-update-visibility',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['labels', { id: variables.id }],
      });
      queryClient.invalidateQueries({
        queryKey: ['labels'],
        exact: false,
      });
    },
    ...configuration,
  });
};

const useUpdateLabelPrivacyMutation = (configuration = {}) => {
  const queryClient = useQueryClient();

  return useAuthenticatedMutation({
    mutationFn: ({
      headers,
      id,
      isPrivate,
    }: {
      headers: Headers;
      id: string;
      isPrivate: boolean;
    }) =>
      updateLabel({
        headers,
        id,
        command: isPrivate ? 'MakePrivate' : 'MakePublic',
      }),
    mutationKey: 'labels-update-privacy',
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['labels', { id: variables.id }],
      });
      queryClient.invalidateQueries({
        queryKey: ['labels'],
        exact: false,
      });
    },
    ...configuration,
  });
};

const deleteLabel = async ({ headers, id }: { headers: Headers; id: string }) =>
  fetchFromApi({
    path: `/labels/${id}`,
    options: { method: 'DELETE', headers },
  });

const useDeleteLabelMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: deleteLabel,
    mutationKey: 'labels-delete',
    ...configuration,
  });

const useIsLabelNameUnique = ({ name }: { name: string }) => {
  const trimmedName = (name || '').trim();

  const { data } = useGetLabelsByQuery({
    name: trimmedName,
    paginationOptions: { start: 0, limit: 1 },
  });

  const isLabelAlreadyUsed = (data?.member ?? []).find(
    (l: Label) => (l?.name ?? '').toLowerCase() === trimmedName.toLowerCase(),
  );

  return {
    isUnique: !isLabelAlreadyUsed,
  };
};

export {
  getUitpasLabelsQuery,
  prefetchGetLabelByIdQuery,
  prefetchGetLabelsQuery,
  useCreateLabelMutation,
  useDeleteLabelMutation,
  useGetLabelByIdQuery,
  useGetLabelsByQuery,
  useGetUitpasLabelsQuery,
  useIsLabelNameUnique,
  useUpdateLabelPrivacyMutation,
  useUpdateLabelVisibilityMutation,
};
