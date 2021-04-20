import { fetchFromApi } from '@/utils/fetchFromApi';
import {
  useAuthenticatedQuery,
  useAuthenticatedMutation,
  useAuthenticatedMutations,
} from './authenticated-query';

export const getProductions = async ({ headers, ...queryData }) => {
  const res = await fetchFromApi({
    path: '/productions/',
    searchParams: {
      ...queryData,
    },
    options: {
      headers,
    },
  });
  return await res.json();
};

const useGetProductions = (
  { req, queryClient, name = '', start = 0, limit = 15 },
  configuration = {},
) =>
  useAuthenticatedQuery({
    req,
    queryClient,
    queryKey: ['productions'],
    queryFn: getProductions,
    queryArguments: {
      name,
      start,
      limit,
    },
    ...configuration,
  });

const deleteEventById = async ({
  productionId = '',
  eventId = '',
  headers,
  silentError = false,
} = {}) =>
  await fetchFromApi({
    path: `/productions/${productionId}/events/${eventId}`,
    options: {
      method: 'DELETE',
      headers,
    },
    silentError,
  });

const useDeleteEventById = (configuration = {}) =>
  useAuthenticatedMutation({ mutationFn: deleteEventById, ...configuration });

const deleteEventsByIds = async ({
  productionId = '',
  eventIds = [],
  headers,
}) =>
  await Promise.all(
    eventIds.map(
      async (eventId) =>
        await deleteEventById({
          productionId,
          eventId,
          headers,
          silentError: true,
        }),
    ),
  );

const useDeleteEventsByIds = (configuration = {}) =>
  useAuthenticatedMutations({
    mutationFns: deleteEventsByIds,
    // @ts-expect-error ts-migrate(2740) FIXME: Type '({ productionId, eventIds, headers }: any) =... Remove this comment to see the full error message
    ...configuration,
  });

const addEventById = async ({
  productionId,
  eventId,
  headers,
  silentError = false,
}) =>
  await fetchFromApi({
    path: `/productions/${productionId}/events/${eventId}`,
    options: {
      method: 'PUT',
      headers,
    },
    silentError,
  });

const useAddEventById = (configuration = {}) =>
  useAuthenticatedMutation({ mutationFn: addEventById, ...configuration });

const addEventsByIds = async ({
  productionId = '',
  eventIds = [],
  headers,
} = {}) =>
  await Promise.all(
    eventIds.map(
      async (eventId) =>
        await addEventById({
          headers,
          productionId,
          eventId,
          silentError: true,
        }),
    ),
  );

const useAddEventsByIds = (configuration = {}) =>
  useAuthenticatedMutations({ mutationFns: addEventsByIds, ...configuration });

const getSuggestedEvents = async ({ headers }) => {
  const response = await fetchFromApi({
    path: '/productions/suggestion',
    options: {
      headers,
    },
  });
  if (response.status !== 200) {
    return { events: [], similarity: 0 };
  }
  return await response.json();
};

const useGetSuggestedEvents = (configuration = {}) =>
  useAuthenticatedQuery({
    queryKey: ['productions', 'suggestion'],
    queryFn: getSuggestedEvents,
    ...configuration,
  });

const skipSuggestedEvents = async ({ headers, eventIds = [] }) =>
  await fetchFromApi({
    path: '/productions/skip',
    options: {
      method: 'POST',
      headers,
      body: JSON.stringify({
        eventIds,
      }),
    },
  });

const useSkipSuggestedEvents = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: skipSuggestedEvents,
    ...configuration,
  });

const createWithEvents = async ({ headers, productionName, eventIds = [] }) =>
  await fetchFromApi({
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

const useCreateWithEvents = (configuration = {}) =>
  useAuthenticatedMutation({ mutationFn: createWithEvents, ...configuration });

const mergeProductions = async ({
  headers,
  fromProductionId,
  toProductionId,
}) =>
  await fetchFromApi({
    path: `/productions/${toProductionId}/merge/${fromProductionId}`,
    options: { method: 'POST', headers },
  });

const useMergeProductions = (configuration = {}) =>
  useAuthenticatedMutation({ mutationFn: mergeProductions, ...configuration });

export {
  useGetProductions,
  useDeleteEventById,
  useDeleteEventsByIds,
  useAddEventById,
  useAddEventsByIds,
  useGetSuggestedEvents,
  useSkipSuggestedEvents,
  useCreateWithEvents,
  useMergeProductions,
};
