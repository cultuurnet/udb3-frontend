import type { UseMutationOptions, UseQueryOptions } from 'react-query';

import { CalendarType } from '@/constants/CalendarType';
import type { EventTypes } from '@/constants/EventTypes';
import { OfferStatus } from '@/constants/OfferStatus';
import { OfferTypes } from '@/constants/OfferType';
import type { SupportedLanguages } from '@/i18n/index';
import type { Address } from '@/types/Address';
import { Country } from '@/types/Country';
import { OpeningHours, Term } from '@/types/Offer';
import type { Place } from '@/types/Place';
import type { Values } from '@/types/Values';
import { WorkflowStatus } from '@/types/WorkflowStatus';
import { createEmbededCalendarSummaries } from '@/utils/createEmbededCalendarSummaries';
import { createSortingArgument } from '@/utils/createSortingArgument';
import { fetchFromApi, isErrorObject } from '@/utils/fetchFromApi';

import type {
  AuthenticatedQueryOptions,
  CalendarSummaryFormats,
  PaginationOptions,
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
  if (isErrorObject(res)) {
    // eslint-disable-next-line no-console
    return console.error(res);
  }
  return await res.json();
};

type UseGetPlaceByIdArguments = ServerSideQueryOptions & {
  id: string;
  scope?: Values<typeof OfferTypes>;
};

const useGetPlaceByIdQuery = (
  { req, queryClient, id, scope }: UseGetPlaceByIdArguments,
  configuration: UseQueryOptions = {},
) =>
  useAuthenticatedQuery({
    req,
    queryClient,
    queryKey: ['places'],
    queryFn: getPlaceById,
    queryArguments: { id },
    enabled: !!id && scope === OfferTypes.PLACES,
    ...configuration,
  });

const getPlacesByCreator = async ({ headers, ...queryData }) => {
  delete headers['Authorization'];

  const res = await fetchFromApi({
    path: '/places/',
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

const useGetPlacesByCreatorQuery = (
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
  useAuthenticatedQuery<Place[]>({
    req,
    queryClient,
    queryKey: ['places'],
    queryFn: getPlacesByCreator,
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

type GetPlacesByQueryArguments = {
  name: string;
  terms: Array<Values<typeof EventTypes>>;
  zip?: string;
  addressLocality?: string;
  addressCountry?: Country;
};

const getPlacesByQuery = async ({
  headers,
  name,
  terms,
  zip,
  addressLocality,
  addressCountry,
}: Headers & GetPlacesByQueryArguments) => {
  const termsString = terms.reduce(
    (acc, currentTerm) => `${acc}terms.id:${currentTerm}`,
    '',
  );
  const queryArguments = [
    termsString,
    zip && addressCountry === 'BE' ? `address.\\*.postalCode:"${zip}"` : '',
    addressLocality ? `address.\\*.addressLocality:${addressLocality}` : '',
  ].filter((argument) => !!argument);

  const res = await fetchFromApi({
    path: '/places/',
    searchParams: {
      // eslint-disable-next-line no-useless-escape
      q: queryArguments.join(' AND '),
      text: `*${name}*`,
      addressCountry,
      embed: 'true',
      disableDefaultFilters: 'true',
      isDuplicate: 'false',
      workflowStatus: 'DRAFT,READY_FOR_VALIDATION,APPROVED',
      ['sort[created]']: 'desc',
      limit: '1000',
      status: OfferStatus.AVAILABLE,
    },
    options: {
      headers: headers as unknown as Record<string, string>,
    },
  });

  if (isErrorObject(res)) {
    // eslint-disable-next-line no-console
    return console.error(res);
  }
  return await res.json();
};

const useGetPlacesByQuery = (
  {
    name,
    terms,
    zip,
    addressLocality,
    addressCountry,
  }: GetPlacesByQueryArguments,
  configuration = {},
) =>
  useAuthenticatedQuery<Place[]>({
    queryKey: ['places'],
    queryFn: getPlacesByQuery,
    queryArguments: {
      name,
      terms,
      zip,
      addressCountry,
      addressLocality,
    },
    enabled: !!name || terms.length,
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
  useAddPlaceMutation,
  useChangeAddressMutation,
  useChangeStatusMutation,
  useDeletePlaceByIdMutation,
  useGetPlaceByIdQuery,
  useGetPlacesByCreatorQuery,
  useGetPlacesByQuery,
  usePublishPlaceMutation,
};
