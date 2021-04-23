import { fetchFromApi } from '@/utils/fetchFromApi';
import {
  useAuthenticatedQuery,
  useAuthenticatedQueries,
  useAuthenticatedMutation,
  UseAuthenticatedQueryOptions,
} from './authenticated-query';
import { formatDate } from '@/utils/formatDate';
import { NextApiRequest } from 'next';
import { QueryClient } from 'react-query';

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

const useGetEventsToModerate = async (
  searchQuery: string,
  configuration?: UseAuthenticatedQueryOptions,
) =>
  await useAuthenticatedQuery({
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
    ...(configuration ?? {}),
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

const useGetEventById = async (
  { req, queryClient, id },
  configuration?: UseAuthenticatedQueryOptions,
) =>
  await useAuthenticatedQuery({
    req,
    queryClient,
    queryKey: ['events'],
    queryFn: getEventById,
    queryArguments: { id },
    enabled: !!id,
    ...(configuration ?? {}),
  });

const useGetEventsByIds = async ({
  req,
  queryClient,
  ids = [],
}: {
  req: NextApiRequest;
  queryClient: QueryClient;
  ids: string[];
}) => {
  const options = ids.map((id) => ({
    queryKey: ['events'],
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

const useGetCalendarSummary = async (
  { id, locale, format = 'lg' },
  configuration?: UseAuthenticatedQueryOptions,
) =>
  await useAuthenticatedQuery({
    queryKey: ['events'],
    queryFn: getCalendarSummary,
    queryArguments: {
      id,
      locale,
      format,
    },
    enabled: !!id && !!locale,
    ...(configuration ?? {}),
  });

const changeStatus = async ({ headers, id, type, reason }) =>
  await fetchFromApi({
    path: `/events/${id.toString()}/status`,
    options: {
      method: 'PUT',
      headers,
      body: JSON.stringify({ type, reason }),
    },
  });

const useChangeStatus = (configuration?: UseAuthenticatedQueryOptions) =>
  useAuthenticatedMutation({ mutationFn: changeStatus, ...configuration });

const changeStatusSubEvents = async ({
  headers,
  eventId,
  subEventIds = [],
  subEvents = [],
  type,
  reason,
}: {
  subEventIds: string[];
  [key: string]: any;
}) =>
  await fetchFromApi({
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
              ...(subEvents[id].status.type === type &&
                subEvents[id].status.reason),
              ...reason,
            },
          },
        })),
      ),
    },
  });

const useChangeStatusSubEvents = (
  configuration?: UseAuthenticatedQueryOptions,
) =>
  useAuthenticatedMutation({
    mutationFn: changeStatusSubEvents,
    ...(configuration ?? {}),
  });

export {
  useGetEventsToModerate,
  useGetEventById,
  useGetEventsByIds,
  useGetCalendarSummary,
  useChangeStatus,
  useChangeStatusSubEvents,
};
