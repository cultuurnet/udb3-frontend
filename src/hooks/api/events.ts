// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/utils/fetchFromApi' or its c... Remove this comment to see the full error message
import { fetchFromApi } from '@/utils/fetchFromApi';
import {
  useAuthenticatedQuery,
  useAuthenticatedQueries,
  useAuthenticatedMutation,
} from './authenticated-query';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/utils/formatDate' or its cor... Remove this comment to see the full error message
import { formatDate } from '@/utils/formatDate';

const getEventsToModerate = async ({ headers, ...queryData }) => {
  const res = await fetchFromApi({
    path: '/events/',
    searchParams: {
      ...queryData,
      availableFrom: formatDate(new Date()),
    },
    options: {
      headers,
    },
  });
  return await res.json();
};

const useGetEventsToModerate = (searchQuery, configuration = {}) =>
  useAuthenticatedQuery({
    queryKey: ['events'],
    queryFn: getEventsToModerate,
    queryArguments: {
      q: searchQuery,
      audienceType: 'everyone',
      availableTo: '*',
      limit: 1,
      start: 0,
      workflowStatus: 'READY_FOR_VALIDATION',
    },
    enabled: !!searchQuery,
    ...configuration,
  });

const getEventById = async ({ headers, id }) => {
  const res = await fetchFromApi({
    path: `/event/${id.toString()}`,
    options: {
      headers,
    },
  });
  return await res.json();
};

const useGetEventById = ({ req, queryClient, id }, configuration = {}) =>
  useAuthenticatedQuery({
    req,
    queryClient,
    queryKey: ['events'],
    queryFn: getEventById,
    queryArguments: { id },
    enabled: !!id,
    ...configuration,
  });

const useGetEventsByIds = ({ req, queryClient, ids = [] }) => {
  const options = ids.map((id) => ({
    queryKey: ['events'],
    // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'id' implicitly has an 'any' type.
    queryFn: getEventById,
    queryArguments: { id },
    enabled: !!id,
  }));

  return useAuthenticatedQueries({ req, queryClient, options });
};

const getCalendarSummary = async ({ headers, id, format, locale }) => {
  const res = await fetchFromApi({
    path: `/events/${id.toString()}/calsum`,
    searchParams: {
      format,
      langCode: `${locale}_BE`,
    },
    options: {
      headers,
    },
  });
  return res.text();
};

const useGetCalendarSummary = (
  { id, locale, format = 'lg' },
  configuration = {},
) =>
  useAuthenticatedQuery({
    queryKey: ['events'],
    queryFn: getCalendarSummary,
    queryArguments: {
      id,
      locale,
      format,
    },
    configuration: {
      enabled: !!id && !!locale,
      ...configuration,
    },
  });

const changeStatus = async ({ headers, id, type, reason }) =>
  fetchFromApi({
    path: `/events/${id.toString()}/status`,
    options: {
      method: 'PUT',
      headers,
      body: JSON.stringify({ type, reason }),
    },
  });

const useChangeStatus = (configuration = {}) =>
  useAuthenticatedMutation({ mutationFn: changeStatus, ...configuration });

const changeStatusSubEvents = async ({
  // @ts-expect-error ts-migrate(2322) FIXME: Type '({ headers, id, type, reason }: any) => Prom... Remove this comment to see the full error message
  headers,
  eventId,
  subEventIds = [],
  subEvents = [],
  type,
  reason,
}) =>
  fetchFromApi({
    path: `/events/${eventId.toString()}/subEvents`,
    options: {
      method: 'PATCH',
      headers,
      body: JSON.stringify(
        subEventIds.map((id) => ({
          id,
          status: {
            type,
            reason: {
              // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'id' implicitly has an 'any' type.
              ...(subEvents[id].status.type === type &&
                subEvents[id].status.reason),
              ...reason,
            },
          },
        })),
      ),
    },
  });

const useChangeStatusSubEvents = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: changeStatusSubEvents,
    ...configuration,
  });

export {
  // @ts-expect-error ts-migrate(2322) FIXME: Type '({ headers, eventId, subEventIds, subEvents,... Remove this comment to see the full error message
  useGetEventsToModerate,
  useGetEventById,
  useGetEventsByIds,
  useGetCalendarSummary,
  useChangeStatus,
  useChangeStatusSubEvents,
};
