import { PaginatedData } from '@/types/PaginatedData';
import { Production } from '@/types/Production';
import { fetchFromApi, isErrorObject } from '@/utils/fetchFromApi';

import {
  ExtendQueryOptions,
  PaginationOptions,
  prefetchAuthenticatedQuery,
  queryOptions,
  ServerSideQueryOptions,
  useAuthenticatedMutation,
  useAuthenticatedMutations,
  useAuthenticatedQuery,
} from './authenticated-query';

const getProductions = async ({
  headers,
  name,
  start,
  limit,
}: {
  headers: Headers;
  name: string;
  start: string;
  limit: string;
}) => {
  const res = await fetchFromApi({
    path: '/productions/',
    searchParams: {
      name,
      start,
      limit,
    },
    options: {
      headers,
    },
  });
  return (await res.json()) as PaginatedData<Production[]>;
};

const createGetProductionsQueryOptions = ({
  name = '',
  paginationOptions = { start: 0, limit: 15 },
}: PaginationOptions & { name?: string }) =>
  queryOptions({
    queryKey: ['productions'],
    queryFn: getProductions,
    queryArguments: {
      name,
      start: `${paginationOptions.start}`,
      limit: `${paginationOptions.limit}`,
    },
  });

const useGetProductionsQuery = (
  { name, paginationOptions }: PaginationOptions & { name?: string },
  configuration: ExtendQueryOptions<typeof getProductions> = {},
) => {
  const options = createGetProductionsQueryOptions({ name, paginationOptions });

  return useAuthenticatedQuery({
    ...options,
    ...configuration,
    enabled: options.enabled !== false && configuration.enabled,
  });
};

export const prefetchGetProductionsQuery = ({
  req,
  queryClient,
  name,
  paginationOptions,
}: ServerSideQueryOptions & PaginationOptions & { name?: string }) =>
  prefetchAuthenticatedQuery({
    req,
    queryClient,
    ...createGetProductionsQueryOptions({ name, paginationOptions }),
  });

const deleteEventById = async ({
  productionId = '',
  eventId = '',
  headers,
  silentError = false,
}) =>
  fetchFromApi({
    path: `/productions/${productionId}/events/${eventId}`,
    options: {
      method: 'DELETE',
      headers,
    },
    silentError,
  });

const useDeleteEventByIdMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: deleteEventById,
    mutationKey: 'productions-delete-event-by-id',
    ...configuration,
  });

const deleteEventsByIds = async ({
  productionId = '',
  eventIds = [],
  headers,
}) =>
  Promise.all(
    eventIds.map(async (eventId) =>
      deleteEventById({ productionId, eventId, headers, silentError: true }),
    ),
  );

const useDeleteEventsByIdsMutation = (configuration = {}) =>
  useAuthenticatedMutations({
    mutationFns: deleteEventsByIds,
    ...configuration,
  });

const addEventById = async ({
  productionId,
  eventId,
  headers,
  silentError = false,
}) =>
  fetchFromApi({
    path: `/productions/${productionId}/events/${eventId}`,
    options: {
      method: 'PUT',
      headers,
    },
    silentError,
  });

const useAddEventByIdMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: addEventById,
    mutationKey: 'productions-add-event-by-id',
    ...configuration,
  });

const addEventsByIds = async ({ productionId = '', eventIds = [], headers }) =>
  Promise.all(
    eventIds.map(async (eventId) =>
      addEventById({ headers, productionId, eventId, silentError: true }),
    ),
  );

const useAddEventsByIdsMutation = (configuration = {}) =>
  useAuthenticatedMutations({ mutationFns: addEventsByIds, ...configuration });

const getSuggestedEvents = async ({
  headers,
}): Promise<{
  events: Event[];
  similarity: number;
}> => {
  const response = await fetchFromApi({
    path: '/productions/suggestion',
    options: {
      headers,
    },
  });
  if (response.status !== 200) {
    // eslint-disable-next-line no-console
    console.error(response);
    return { events: [], similarity: 0 };
  }
  return await response.json();
};

const useGetSuggestedEventsQuery = (
  configuration: ExtendQueryOptions<typeof getSuggestedEvents> = {},
) =>
  useAuthenticatedQuery({
    queryKey: ['productions', 'suggestion'],
    queryFn: getSuggestedEvents,
    ...configuration,
  });

const skipSuggestedEvents = async ({ headers, eventIds = [] }) =>
  fetchFromApi({
    path: '/productions/skip',
    options: {
      method: 'POST',
      headers,
      body: JSON.stringify({
        eventIds,
      }),
    },
  });

const useSkipSuggestedEventsMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: skipSuggestedEvents,
    mutationKey: 'productions-skip-suggested-events',
    ...configuration,
  });

const createWithEvents = async ({ headers, productionName, eventIds = [] }) =>
  fetchFromApi({
    path: '/productions/',
    options: {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: productionName,
        eventIds,
      }),
    },
  });

const useCreateWithEventsMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: createWithEvents,
    mutationKey: 'productions-create-with-events',
    ...configuration,
  });

const mergeProductions = async ({
  headers,
  fromProductionId,
  toProductionId,
}) =>
  fetchFromApi({
    path: `/productions/${toProductionId}/merge/${fromProductionId}`,
    options: { method: 'POST', headers },
  });

const useMergeProductionsMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: mergeProductions,
    mutationKey: 'productions-merge',
    ...configuration,
  });

const changeProductionName = async ({
  productionId = '',
  productionName = '',
  headers,
  silentError = false,
}) =>
  fetchFromApi({
    path: `/productions/${productionId}/name`,
    options: {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        name: productionName,
      }),
    },
    silentError,
  });

const useChangeProductionNameMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: changeProductionName,
    mutationKey: 'productions-change-name',
    ...configuration,
  });

export {
  useAddEventByIdMutation,
  useAddEventsByIdsMutation,
  useChangeProductionNameMutation,
  useCreateWithEventsMutation,
  useDeleteEventByIdMutation,
  useDeleteEventsByIdsMutation,
  useGetProductionsQuery,
  useGetSuggestedEventsQuery,
  useMergeProductionsMutation,
  useSkipSuggestedEventsMutation,
};
