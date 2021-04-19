// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/utils/fetchFromApi' or its c... Remove this comment to see the full error message
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
  fetchFromApi({
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
  Promise.all(
    eventIds.map((eventId) =>
      // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'eventId' implicitly has an 'any' type.
      deleteEventById({ productionId, eventId, headers, silentError: true }),
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
  fetchFromApi({
    path: `/productions/${productionId}/events/${eventId}`,
    options: {
      method: 'PUT',
      headers,
    },
    silentError,
  });

const useAddEventById = (configuration = {}) =>
  useAuthenticatedMutation({ mutationFn: addEventById, ...configuration });

// @ts-expect-error ts-migrate(2322) FIXME: Type '({ productionId, eventId, headers, silentErr... Remove this comment to see the full error message
const addEventsByIds = async ({
  productionId = '',
  eventIds = [],
  headers,
} = {}) =>
  Promise.all(
    eventIds.map((eventId) =>
      // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'eventId' implicitly has an 'any' type.
      addEventById({ headers, productionId, eventId, silentError: true }),
    ),
  );

const useAddEventsByIds = (configuration = {}) =>
  useAuthenticatedMutations({ mutationFns: addEventsByIds, ...configuration });

// @ts-expect-error ts-migrate(2740) FIXME: Type '({ productionId, eventIds, headers }?: any) ... Remove this comment to see the full error message
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

const useSkipSuggestedEvents = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: skipSuggestedEvents,
    ...configuration,
  });

// @ts-expect-error ts-migrate(2322) FIXME: Type '({ headers, eventIds }: any) => Promise<any>... Remove this comment to see the full error message
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

const useCreateWithEvents = (configuration = {}) =>
  useAuthenticatedMutation({ mutationFn: createWithEvents, ...configuration });

// @ts-expect-error ts-migrate(2322) FIXME: Type '({ headers, productionName, eventIds }: any)... Remove this comment to see the full error message
const mergeProductions = async ({
  headers,
  fromProductionId,
  toProductionId,
}) =>
  fetchFromApi({
    path: `/productions/${toProductionId}/merge/${fromProductionId}`,
    options: { method: 'POST', headers },
  });

const useMergeProductions = (configuration = {}) =>
  useAuthenticatedMutation({ mutationFn: mergeProductions, ...configuration });

export {
  useGetProductions,
  // @ts-expect-error ts-migrate(2322) FIXME: Type '({ headers, fromProductionId, toProductionId... Remove this comment to see the full error message
  useDeleteEventById,
  useDeleteEventsByIds,
  useAddEventById,
  useAddEventsByIds,
  useGetSuggestedEvents,
  useSkipSuggestedEvents,
  useCreateWithEvents,
  useMergeProductions,
};
