import type { UseMutationOptions } from '@tanstack/react-query';

import { CalendarType } from '@/constants/CalendarType';
import type { EventTypes } from '@/constants/EventTypes';
import { OfferStatus } from '@/constants/OfferStatus';
import { OfferTypes, Scope } from '@/constants/OfferType';
import type { SupportedLanguages } from '@/i18n/index';
import type { Address } from '@/types/Address';
import { Country } from '@/types/Country';
import { OpeningHours, Term } from '@/types/Offer';
import { PaginatedData } from '@/types/PaginatedData';
import type { Place } from '@/types/Place';
import type { Values } from '@/types/Values';
import { WorkflowStatus } from '@/types/WorkflowStatus';
import { createEmbededCalendarSummaries } from '@/utils/createEmbededCalendarSummaries';
import { createSortingArgument } from '@/utils/createSortingArgument';
import { fetchFromApi } from '@/utils/fetchFromApi';

import {
  CalendarSummaryFormats,
  ExtendQueryOptions,
  PaginationOptions,
  prefetchAuthenticatedQuery,
  queryOptions,
  ServerSideQueryOptions,
  SortOptions,
} from './authenticated-query';
import {
  useAuthenticatedMutation,
  useAuthenticatedQuery,
} from './authenticated-query';
import type { Headers } from './types/Headers';
import type { User } from './user';

const getPlaceById = async ({ headers, id }) => {
  const res = await fetchFromApi({
    path: `/places/${id.toString()}`,
    options: {
      headers,
    },
  });
  return (await res.json()) as Place | undefined;
};

type UseGetPlaceByIdArguments = {
  id: string;
  scope?: Values<typeof OfferTypes>;
};

const createGetPlaceByIdQueryOptions = ({
  id,
  scope,
}: {
  id: string;
  scope: Scope;
}) =>
  queryOptions({
    queryKey: ['places'],
    queryFn: getPlaceById,
    queryArguments: { id },
    enabled: !!id && scope === OfferTypes.PLACES,
  });

const useGetPlaceByIdQuery = (
  { id, scope }: UseGetPlaceByIdArguments,
  configuration: ExtendQueryOptions<typeof getPlaceById> = {},
) => {
  const options = createGetPlaceByIdQueryOptions({ id, scope });

  return useAuthenticatedQuery({
    ...options,
    ...configuration,
    enabled: options.enabled !== false && configuration.enabled !== false,
  });
};

export const prefetchGetPlaceByIdQuery = ({
  req,
  queryClient,
  scope,
  id,
}: ServerSideQueryOptions & {
  id: string;
  scope: Scope;
}) =>
  prefetchAuthenticatedQuery({
    req,
    queryClient,
    ...createGetPlaceByIdQueryOptions({ scope, id }),
  });

const getPlacesByCreator = async ({
  headers,
  q,
  limit,
  start,
  embed,
  workflowStatus,
  disableDefaultFilters,
  ...rest
}: {
  headers: Headers;
  q: string;
  disableDefaultFilters: string;
  embed: string;
  limit: string;
  start: string;
  workflowStatus: string;
} & Record<string, string>) => {
  delete headers['Authorization'];

  const sortOptions = Object.entries(rest).filter(([key]) =>
    key.startsWith('sort'),
  );
  const embedCalendarSummaries = Object.entries(rest).filter(([key]) =>
    key.startsWith('embedCalendarSummaries'),
  );

  const res = await fetchFromApi({
    path: '/places/',
    searchParams: {
      q,
      limit,
      start,
      embed,
      workflowStatus,
      disableDefaultFilters,
      ...Object.fromEntries(sortOptions),
      ...Object.fromEntries(embedCalendarSummaries),
    },
    options: {
      headers,
    },
  });
  return (await res.json()) as PaginatedData<Place[]>;
};

const createGetPlacesByCreatorQueryOptions = ({
  creator,
  paginationOptions = { start: 0, limit: 50 },
  sortOptions = { field: 'modified', order: 'desc' },
  calendarSummaryFormats = ['lg-text', 'sm-text', 'xs-text'],
}: PaginationOptions &
  SortOptions &
  CalendarSummaryFormats & {
    creator: User;
  }) => {
  const queryArguments = {
    q: `creator:(${creator?.sub} OR ${
      creator?.['https://publiq.be/uitidv1id']
        ? `${creator?.['https://publiq.be/uitidv1id']} OR`
        : ''
    } ${creator?.email}) OR contributors:${creator?.email}`,
    disableDefaultFilters: 'true',
    embed: 'true',
    limit: `${paginationOptions.limit}`,
    start: `${paginationOptions.start}`,
    workflowStatus: 'DRAFT,READY_FOR_VALIDATION,APPROVED,REJECTED',
  };
  const sortingArguments = createSortingArgument(sortOptions);
  const embededCalendarSummaries = createEmbededCalendarSummaries(
    calendarSummaryFormats,
  );

  return queryOptions({
    queryKey: ['places'],
    queryFn: getPlacesByCreator,
    queryArguments: {
      ...queryArguments,
      ...sortingArguments,
      ...embededCalendarSummaries,
    } as typeof queryArguments &
      typeof sortingArguments &
      typeof embededCalendarSummaries,
    enabled: !!(creator?.sub && creator?.email),
  });
};

const useGetPlacesByCreatorQuery = (
  {
    creator,
    paginationOptions,
    sortOptions,
    calendarSummaryFormats,
  }: PaginationOptions &
    SortOptions &
    CalendarSummaryFormats & {
      creator: User;
    },
  configuration: ExtendQueryOptions<typeof getPlacesByCreator> = {},
) => {
  const options = createGetPlacesByCreatorQueryOptions({
    creator,
    paginationOptions,
    sortOptions,
    calendarSummaryFormats,
  });

  return useAuthenticatedQuery({
    ...options,
    ...configuration,
    enabled: options.enabled !== false && configuration.enabled !== false,
  });
};

export const prefetchGetPlacesByCreatorQuery = ({
  req,
  queryClient,
  creator,
  paginationOptions,
  sortOptions,
  calendarSummaryFormats,
}: ServerSideQueryOptions &
  PaginationOptions &
  SortOptions &
  CalendarSummaryFormats & {
    creator: User;
  }) =>
  prefetchAuthenticatedQuery({
    req,
    queryClient,
    ...createGetPlacesByCreatorQueryOptions({
      creator,
      paginationOptions,
      sortOptions,
      calendarSummaryFormats,
    }),
  });

type GetPlacesByQueryArguments = {
  name?: string;
  terms: Array<Values<typeof EventTypes>>;
  zip?: string;
  searchTerm?: string;
  addressLocality?: string;
  addressCountry?: Country;
  streetAddress?: string;
  excludeId?: string;
};

const getPlacesByQuery = async ({
  headers,
  name,
  terms,
  zip,
  addressLocality,
  addressCountry,
  streetAddress,
  searchTerm,
  excludeId,
}: { headers: Headers } & GetPlacesByQueryArguments) => {
  const termsString = terms.reduce(
    (acc, currentTerm) => `${acc}terms.id:${currentTerm}`,
    '',
  );
  const queryArguments = [
    termsString,
    name ? `name.\\*:"${name}"` : '',
    zip && addressCountry === 'BE' ? `address.\\*.postalCode:"${zip}"` : '',
    addressLocality ? `address.\\*.addressLocality:${addressLocality}` : '',
    streetAddress ? `address.\\*.streetAddress:"${streetAddress}"` : '',
    excludeId ? `NOT _id:"${excludeId}"` : '',
  ].filter((argument) => !!argument);

  const res = await fetchFromApi({
    path: '/places/',
    searchParams: {
      // eslint-disable-next-line no-useless-escape
      q: queryArguments.join(' AND '),
      addressCountry,
      embed: 'true',
      disableDefaultFilters: 'true',
      isDuplicate: 'false',
      workflowStatus: 'DRAFT,READY_FOR_VALIDATION,APPROVED',
      ['sort[created]']: 'desc',
      limit: '1000',
      status: OfferStatus.AVAILABLE,
      ...(searchTerm && { text: `*${searchTerm}*` }),
    },
    options: {
      headers,
    },
  });
  return (await res.json()) as PaginatedData<Place[]>;
};

const useGetPlacesByQuery = (
  {
    name,
    terms,
    zip,
    addressLocality,
    addressCountry,
    streetAddress,
    searchTerm,
    excludeId,
  }: GetPlacesByQueryArguments,
  configuration: ExtendQueryOptions<typeof getPlacesByQuery> = {},
) =>
  useAuthenticatedQuery({
    queryKey: ['places'],
    queryFn: getPlacesByQuery,
    queryArguments: {
      name,
      terms,
      zip,
      addressCountry,
      addressLocality,
      streetAddress,
      searchTerm,
      excludeId,
    },
    enabled: (!!name && !!streetAddress && !!zip) || !!searchTerm,
    ...configuration,
  });

type GetStreetAddressArguments = {
  zip?: string;
  addressLocality?: string;
  addressCountry?: Country;
  streetAddress?: string;
};

const getStreetAddressesQuery = async ({
  headers,
  zip,
  addressLocality,
  addressCountry,
  streetAddress,
}: { headers: Headers } & GetStreetAddressArguments) => {
  const res = await fetchFromApi({
    path: '/addresses/streets',
    searchParams: {
      country: addressCountry,
      postalCode: zip,
      query: streetAddress,
      locality: addressLocality,
    },
    options: {
      headers,
    },
  });
  return (await res.json()) as string[];
};

const useGetStreetAddressesQuery = (
  {
    zip,
    addressLocality,
    addressCountry,
    streetAddress,
  }: GetStreetAddressArguments,
  configuration: ExtendQueryOptions<typeof getStreetAddressesQuery> = {},
) =>
  useAuthenticatedQuery({
    queryKey: ['street-addresses'],
    queryFn: getStreetAddressesQuery,
    queryArguments: {
      zip,
      addressCountry,
      addressLocality,
      streetAddress,
    },
    enabled: !!streetAddress,
    ...configuration,
  });

const changeAddress = async ({ headers, id, address, language }) =>
  fetchFromApi({
    path: `/places/${id.toString()}/address/${language}`,
    options: {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        ...address,
      }),
    },
  });

const useChangeAddressMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: changeAddress,
    mutationKey: 'places-change-address',
    ...configuration,
  });

const deletePlaceById = async ({ headers, id }) =>
  fetchFromApi({
    path: `/places/${id}`,
    options: { headers, method: 'DELETE' },
  });

const useDeletePlaceByIdMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: deletePlaceById,
    mutationKey: 'places-delete-by-id',
    ...configuration,
  });

type ChangeStatusArguments = {
  headers: Headers;
  id: string;
  type: Values<typeof OfferStatus>;
  reason: Record<Values<typeof SupportedLanguages>, string>;
};

const changeStatus = async ({
  headers,
  id,
  type,
  reason,
}: ChangeStatusArguments) =>
  fetchFromApi({
    path: `/places/${id.toString()}/status`,
    options: {
      method: 'PUT',
      headers,
      body: JSON.stringify({ type, reason }),
    },
  });

const useChangeStatusMutation = (configuration: UseMutationOptions = {}) =>
  useAuthenticatedMutation({
    mutationFn: changeStatus,
    mutationKey: 'places-change-status',
    ...configuration,
  });

type PlaceArguments = {
  address: Address;
  mainLanguage: string;
  name: string;
  terms: Term[];
  workflowStatus: WorkflowStatus;
  calendarType: Values<typeof CalendarType>;
  openingHours: OpeningHours[];
  startDate: string;
  endDate: string;
  typicalAgeRange: string;
};

type AddPlaceArguments = PlaceArguments & { headers: Headers };

const addPlace = async ({
  headers,
  calendarType,
  openingHours,
  startDate,
  endDate,
  address,
  mainLanguage,
  name,
  terms,
  workflowStatus,
  typicalAgeRange,
}: AddPlaceArguments) =>
  fetchFromApi({
    path: `/places`,
    options: {
      method: 'POST',
      headers,
      body: JSON.stringify({
        calendarType,
        openingHours,
        address,
        mainLanguage,
        name,
        terms,
        workflowStatus,
        startDate,
        endDate,
        typicalAgeRange,
      }),
    },
  });

const useAddPlaceMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: addPlace,
    mutationKey: 'places-add',
    ...configuration,
  });

const publish = async ({ headers, id, publicationDate }) =>
  fetchFromApi({
    path: `/places/${id}`,
    options: {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/ld+json;domain-model=Publish',
      },
      body: JSON.stringify({ publicationDate }),
    },
  });

const usePublishPlaceMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: publish,
    mutationKey: 'places-publish',
    ...configuration,
  });

export {
  getPlaceById,
  getPlacesByQuery,
  useAddPlaceMutation,
  useChangeAddressMutation,
  useChangeStatusMutation,
  useDeletePlaceByIdMutation,
  useGetPlaceByIdQuery,
  useGetPlacesByCreatorQuery,
  useGetPlacesByQuery,
  useGetStreetAddressesQuery,
  usePublishPlaceMutation,
};
