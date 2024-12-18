import type { UseQueryOptions } from 'react-query';

import type { CalendarType } from '@/constants/CalendarType';
import { OfferTypes } from '@/constants/OfferType';
import { Video } from '@/pages/VideoUploadBox';
import { ContactPoint } from '@/types/ContactPoint';
import type { AttendanceMode, Event } from '@/types/Event';
import type {
  BookingAvailability,
  BookingInfo,
  MediaObject,
  OpeningHours,
  PriceInfo,
  Status,
  SubEvent,
  Term,
} from '@/types/Offer';
import { Organizer } from '@/types/Organizer';
import type { Values } from '@/types/Values';
import type { WorkflowStatus } from '@/types/WorkflowStatus';
import { createEmbededCalendarSummaries } from '@/utils/createEmbededCalendarSummaries';
import { createSortingArgument } from '@/utils/createSortingArgument';
import { fetchFromApi, isErrorObject } from '@/utils/fetchFromApi';
import { formatDateToISO } from '@/utils/formatDateToISO';

import type {
  AuthenticatedQueryOptions,
  CalendarSummaryFormats,
  PaginationOptions,
  ServerSideQueryOptions,
  SortOptions,
} from './authenticated-query';
import {
  useAuthenticatedMutation,
  useAuthenticatedQueries,
  useAuthenticatedQuery,
} from './authenticated-query';
import type { Headers } from './types/Headers';
import type { User } from './user';

type EventArguments = {
  description: string;
  name: string;
  calendarType: Values<typeof CalendarType>;
  startDate: string;
  endDate: string;
  subEvent: SubEvent[];
  openingHours: OpeningHours[];
  terms: Term[];
  workflowStatus: WorkflowStatus;
  audienceType: string;
  location: {
    id: string;
  };
  attendanceMode: Values<typeof AttendanceMode>;
  mainLanguage: string;
  typicalAgeRange: string;
  onlineUrl: string;
  mediaObject: MediaObject[];
  priceInfo: PriceInfo;
  contactPoint: ContactPoint;
  bookingInfo: BookingInfo;
  videos: Video[];
  organizer: Organizer;
  labels: string[];
  hiddenLabels: string[];
  audience: {
    audienceType: string;
  };
};
type AddEventArguments = EventArguments & { headers: Headers };

const addEvent = async ({
  headers,
  mainLanguage,
  description,
  name,
  calendarType,
  startDate,
  endDate,
  subEvent,
  openingHours,
  terms,
  location,
  audienceType,
  attendanceMode,
  typicalAgeRange,
  onlineUrl,
  mediaObject,
  videos,
  priceInfo,
  contactPoint,
  bookingInfo,
  organizer,
  labels,
  hiddenLabels,
  audience,
}: AddEventArguments) =>
  fetchFromApi({
    path: '/events/',
    options: {
      headers,
      method: 'POST',
      body: JSON.stringify({
        description,
        mainLanguage,
        name,
        calendarType,
        startDate,
        endDate,
        subEvent,
        openingHours,
        terms,
        location,
        audienceType,
        attendanceMode,
        typicalAgeRange,
        onlineUrl,
        mediaObject,
        priceInfo,
        videos,
        contactPoint,
        bookingInfo,
        organizer,
        labels,
        hiddenLabels,
        audience,
      }),
    },
  });

const useAddEventMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: addEvent,
    mutationKey: 'events-add',
    ...configuration,
  });

const getEventsToModerate = async ({ headers, queryKey, ...queryData }) => {
  const res = await fetchFromApi({
    path: '/events/',
    searchParams: {
      ...queryData,
      availableFrom: formatDateToISO(new Date()),
    },
    options: {
      headers,
    },
  });
  if (isErrorObject(res)) {
    // eslint-disable-next-line no-console
    return console.error(res);
  }
  return await res.json();
};

const useGetEventsToModerateQuery = (searchQuery, configuration = {}) =>
  useAuthenticatedQuery<Event[]>({
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
    path: `/events/${id.toString()}`,
    searchParams: {
      embedUitpasPrices: 'true',
    },
    options: {
      headers,
    },
  });
  if (isErrorObject(res)) {
    // eslint-disable-next-line no-console
    return console.error(res);
  }
  return await res.json();
};

type UseGetEventByIdArguments = ServerSideQueryOptions & {
  id: string;
  scope?: Values<typeof OfferTypes>;
};

const useGetEventByIdQuery = (
  { req, queryClient, id, scope = OfferTypes.EVENTS }: UseGetEventByIdArguments,
  configuration: UseQueryOptions = {},
) =>
  useAuthenticatedQuery({
    req,
    queryClient,
    queryKey: ['events'],
    queryFn: getEventById,
    queryArguments: { id },
    refetchOnWindowFocus: false,
    enabled: !!id && scope === OfferTypes.EVENTS,
    ...configuration,
  });

const getEventsByIds = async ({
  headers,
  ids,
}: {
  headers: Headers;
  ids: string[];
}) => {
  const searchParams = new URLSearchParams({
    embedUitpasPrices: 'true',
    disableDefaultFilters: 'true',
    embed: 'true',
    q: `id:(${ids.join(' OR ')})`,
  });

  searchParams.append('embedCalendarSummaries[]', 'xs-text');
  searchParams.append('embedCalendarSummaries[]', 'sm-text');
  searchParams.append('embedCalendarSummaries[]', 'lg-text');

  const res = await fetchFromApi({
    path: '/events',
    searchParams,
    options: {
      headers,
    },
  });
  if (isErrorObject(res)) {
    // eslint-disable-next-line no-console
    return console.error(res);
  }
  return (await res.json()) as { member: Event[] };
};

const useGetEventsByIdsQuery = (
  { req, queryClient, ids = [], scope = OfferTypes.EVENTS },
  configuration: UseQueryOptions = {},
) => {
  return useAuthenticatedQuery<{ member: Event[] }>({
    req,
    queryClient,
    queryKey: ['events'],
    queryFn: getEventsByIds,
    queryArguments: { ids },
    refetchOnWindowFocus: false,
    enabled: ids.length > 0 && scope === OfferTypes.EVENTS,
    ...configuration,
  });
};

const deleteEventById = async ({ headers, id }) =>
  fetchFromApi({
    path: `/events/${id}`,
    options: { headers, method: 'DELETE' },
  });

const useDeleteEventByIdMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: deleteEventById,
    mutationKey: 'events-delete-by-id',
    ...configuration,
  });

const getEventsByCreator = async ({ headers, ...queryData }) => {
  delete headers['Authorization'];

  const res = await fetchFromApi({
    path: '/events/',
    searchParams: {
      ...queryData,
    },
    options: {
      headers,
    },
  });
  if (isErrorObject(res)) {
    // eslint-disable-next-line no-console
    return console.error(res);
  }
  return await res.json();
};

const useGetEventsByCreatorQuery = (
  {
    req,
    queryClient,
    creator,
    paginationOptions = { start: 0, limit: 50 },
    sortOptions = { field: 'modified', order: 'desc' },
    calendarSummaryFormats = ['lg-text', 'sm-text', 'xs-text'],
  }: AuthenticatedQueryOptions<
    PaginationOptions &
      SortOptions &
      CalendarSummaryFormats & {
        creator: User;
      }
  >,
  configuration: UseQueryOptions = {},
) =>
  useAuthenticatedQuery<Event[]>({
    req,
    queryClient,
    queryKey: ['events'],
    queryFn: getEventsByCreator,
    queryArguments: {
      q: `creator:(${creator?.sub} OR ${
        creator?.['https://publiq.be/uitidv1id']
          ? `${creator?.['https://publiq.be/uitidv1id']} OR`
          : ''
      } ${creator?.email}) OR contributors:${creator?.email}`,
      disableDefaultFilters: true,
      embed: true,
      limit: paginationOptions.limit,
      start: paginationOptions.start,
      workflowStatus: 'DRAFT,READY_FOR_VALIDATION,APPROVED,REJECTED',
      ...createSortingArgument(sortOptions),
      ...createEmbededCalendarSummaries(calendarSummaryFormats),
    },
    enabled: !!(creator?.sub && creator?.email),
    ...configuration,
  });

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
  if (isErrorObject(res)) {
    // eslint-disable-next-line no-console
    return console.error(res);
  }

  return res.text();
};

const useGetCalendarSummaryQuery = (
  { id, locale, format = 'lg' },
  configuration: UseQueryOptions = {},
) =>
  useAuthenticatedQuery({
    queryKey: ['events'],
    queryFn: getCalendarSummary,
    queryArguments: {
      id,
      locale,
      format,
    },
    enabled: !!id && !!locale,
    ...configuration,
  });

const changeLocation = async ({ headers, eventId, locationId }) => {
  return fetchFromApi({
    path: `/events/${eventId.toString()}/location/${locationId}`,
    options: {
      method: 'PUT',
      headers,
    },
  });
};

const useChangeLocationMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: changeLocation,
    mutationKey: 'events-change-location',
    ...configuration,
  });

const changeAvailableFrom = async ({ headers, id, availableFrom }) => {
  return fetchFromApi({
    path: `/events/${id.toString()}/available-from`,
    options: {
      method: 'PUT',
      body: JSON.stringify({ availableFrom }),
      headers,
    },
  });
};

const useChangeAvailableFromMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: changeAvailableFrom,
    mutationKey: 'events-change-available-from',
    ...configuration,
  });

const changeName = async ({ headers, id, lang, name }) => {
  return fetchFromApi({
    path: `/events/${id.toString()}/name/${lang}`,
    options: {
      method: 'PUT',
      body: JSON.stringify({ name }),
      headers,
    },
  });
};

const useChangeNameMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: changeName,
    mutationKey: 'events-change-name',
    ...configuration,
  });

const changeCalendar = async ({
  headers,
  id,
  calendarType,
  timeSpans,
  subEvent,
  start,
  end,
  startDate,
  endDate,
  openingHours,
  dayOfWeek,
  opens,
  closes,
}) => {
  return fetchFromApi({
    path: `/events/${id.toString()}/calendar`,
    options: {
      method: 'PUT',
      body: JSON.stringify({
        calendarType,
        timeSpans,
        subEvent,
        start,
        end,
        startDate,
        endDate,
        openingHours,
        dayOfWeek,
        opens,
        closes,
      }),
      headers,
    },
  });
};

const useChangeCalendarMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: changeCalendar,
    mutationKey: 'events-change-calendar',
    ...configuration,
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

const useChangeStatusMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: changeStatus,
    mutationKey: 'events-change-status',
    ...configuration,
  });

const changeStatusSubEvents = async ({
  headers,
  eventId,
  subEventIds = [],
  subEvents = [],
  type,
  reason,
  bookingAvailability,
}) =>
  fetchFromApi({
    path: `/events/${eventId.toString()}/subEvents`,
    options: {
      method: 'PATCH',
      headers,
      body: JSON.stringify(
        subEventIds.map((id) =>
          createSubEventPatch(id, subEvents, type, reason, bookingAvailability),
        ),
      ),
    },
  });

type SubEventPatch = {
  id: number;
  status?: Status;
  bookingAvailability?: BookingAvailability;
};

const createSubEventPatch = (
  id,
  subEvents,
  type,
  reason,
  bookingAvailability,
) => {
  const subEventPatch: SubEventPatch = { id };

  if (type) {
    subEventPatch.status = {
      type,
      reason: {
        ...(subEvents[id].status.type === type && subEvents[id].status.reason),
        ...reason,
      },
    };
  }

  if (bookingAvailability) {
    subEventPatch.bookingAvailability = {
      type: bookingAvailability,
    };
  }

  return subEventPatch;
};

const useChangeStatusSubEventsMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: changeStatusSubEvents,
    mutationKey: 'events-change-status-sub-events',
    ...configuration,
  });

const publish = async ({ headers, id, publicationDate }) =>
  fetchFromApi({
    path: `/events/${id}`,
    options: {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/ld+json;domain-model=Publish',
      },
      body: JSON.stringify({ publicationDate }),
    },
  });

const usePublishEventMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: publish,
    mutationKey: 'events-publish',
    ...configuration,
  });

const changeAudience = async ({ headers, eventId, audienceType }) =>
  fetchFromApi({
    path: `/events/${eventId}/audience`,
    options: {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        audienceType,
      }),
    },
  });

const useChangeAudienceMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: changeAudience,
    mutationKey: 'events-change-audience',
    ...configuration,
  });

const changeAttendanceMode = async ({
  headers,
  eventId,
  attendanceMode,
  location,
}) =>
  fetchFromApi({
    path: `/events/${eventId}/attendance-mode`,
    options: {
      method: 'PUT',
      headers,
      body: JSON.stringify({ attendanceMode, location }),
    },
  });

const useChangeAttendanceModeMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: changeAttendanceMode,
    mutationKey: 'events-change-attendance-mode',
    ...configuration,
  });

const changeOnlineUrl = async ({ headers, eventId, onlineUrl }) =>
  fetchFromApi({
    path: `/events/${eventId}/online-url`,
    options: {
      method: 'PUT',
      headers,
      body: JSON.stringify({ onlineUrl }),
    },
  });

const useChangeOnlineUrlMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: changeOnlineUrl,
    mutationKey: 'events-change-online-url',
    ...configuration,
  });

const deleteOnlineUrl = async ({ headers, eventId }) =>
  fetchFromApi({
    path: `/events/${eventId}/online-url`,
    options: {
      method: 'DELETE',
      headers,
    },
  });

const useDeleteOnlineUrlMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: deleteOnlineUrl,
    mutationKey: 'events-delete-online-url',
    ...configuration,
  });
export {
  useAddEventMutation,
  useChangeAttendanceModeMutation,
  useChangeAudienceMutation,
  useChangeAvailableFromMutation,
  useChangeCalendarMutation,
  useChangeLocationMutation,
  useChangeNameMutation,
  useChangeOnlineUrlMutation,
  useChangeStatusMutation,
  useChangeStatusSubEventsMutation,
  useDeleteEventByIdMutation,
  useDeleteOnlineUrlMutation,
  useGetCalendarSummaryQuery,
  useGetEventByIdQuery,
  useGetEventsByCreatorQuery,
  useGetEventsByIdsQuery,
  useGetEventsToModerateQuery,
  usePublishEventMutation,
};
