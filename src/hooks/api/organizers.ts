import type { UseMutationOptions } from 'react-query';

import {
  AuthenticatedQueryOptions,
  ExtendQueryOptions,
  PaginationOptions,
  prefetchAuthenticatedQuery,
  queryOptions,
  ServerSideQueryOptions,
  SortOptions,
} from '@/hooks/api/authenticated-query';
import {
  useAuthenticatedMutation,
  useAuthenticatedQuery,
} from '@/hooks/api/authenticated-query';
import type { Organizer } from '@/types/Organizer';
import { createSortingArgument } from '@/utils/createSortingArgument';
import { fetchFromApi } from '@/utils/fetchFromApi';

import type { Headers } from './types/Headers';
import type { User } from './user';

type HeadersAndQueryData = {
  headers: Headers;
} & { [x: string]: string };

export type GetOrganizersByQueryResponse = { member: Organizer[] };

const useGetOrganizersByQueryQuery = (
  {
    name,
    q,
    paginationOptions = { start: 0, limit: 10 },
  }: { name?: string; q?: string } & PaginationOptions = {},
  configuration: ExtendQueryOptions<typeof getOrganizers> = {},
) =>
  useAuthenticatedQuery<GetOrganizersByQueryResponse>({
    queryKey: ['organizers'],
    queryFn: getOrganizers,
    queryArguments: {
      embed: true,
      q,
      name,
      start: paginationOptions.start,
      limit: paginationOptions.limit,
    },
    ...configuration,
    enabled: !!name && configuration.enabled !== false,
  });

type GetOrganizersArguments = {
  headers: Headers;
  embed?: string;
  website?: string;
  name?: string;
  q?: string;
  limit?: string;
  start?: string;
};

const getOrganizers = async ({
  headers,
  website,
  name,
  q,
  embed,
  limit,
  start,
}: GetOrganizersArguments) => {
  const res = await fetchFromApi({
    path: '/organizers',
    searchParams: {
      embed: `${embed}`,
      ...(q && { q }),
      ...(website && { website }),
      ...(name && { name }),
      ...(limit && { limit }),
      ...(start && { start }),
    },
    options: {
      headers,
    },
  });
  return (await res.json()) as GetOrganizersByQueryResponse;
};

const useGetOrganizersByWebsiteQuery = (
  { website }: { website?: string } = {},
  configuration: ExtendQueryOptions<typeof getOrganizers> = {},
) =>
  useAuthenticatedQuery({
    queryKey: ['organizers'],
    queryFn: getOrganizers,
    queryArguments: {
      embed: 'true',
      website,
    },
    ...configuration,
    enabled: configuration.enabled && !!website,
  });

type GetOrganizerByIdArguments = {
  headers: Headers;
  id: string;
};

export type GetOrganizerByIdResponse = Organizer | undefined;

const getOrganizerById = async ({ headers, id }: GetOrganizerByIdArguments) => {
  const res = await fetchFromApi({
    path: `/organizers/${id.toString()}`,
    options: {
      headers,
    },
  });
  return (await res.json()) as GetOrganizerByIdResponse;
};

const createGetOrganizerByIdQueryOptions = ({ id }: { id: string }) =>
  queryOptions({
    queryKey: ['organizers'],
    queryFn: getOrganizerById,
    queryArguments: { id },
    refetchOnWindowFocus: false,
    enabled: !!id,
  });

const useGetOrganizerByIdQuery = (
  { id }: { id: string },
  configuration: ExtendQueryOptions<typeof getOrganizerById> = {},
) => {
  const options = createGetOrganizerByIdQueryOptions({ id });

  return useAuthenticatedQuery({
    ...options,
    ...configuration,
    enabled: options.enabled !== false && configuration.enabled !== false,
  });
};

export const prefetchGetOrganizerByIdQuery = async ({
  req,
  queryClient,
  id,
}: ServerSideQueryOptions & { id: string }) => {
  return await prefetchAuthenticatedQuery({
    req,
    queryClient,
    ...createGetOrganizerByIdQueryOptions({ id }),
  });
};
type GetOrganizersByCreator = { headers: Headers } & {
  q: string;
  limit: string;
  start: string;
  embed: string;
};

const getOrganizersByCreator = async ({
  headers,
  q,
  limit,
  start,
  embed,
}: GetOrganizersByCreator) => {
  delete headers['Authorization'];

  const res = await fetchFromApi({
    path: '/organizers/',
    searchParams: {
      q,
      limit,
      start,
      embed,
    },
    options: {
      headers,
    },
  });
  return await res.json();
};

type UseGetOrganizerPermissionsArguments = {
  organizerId: string;
};

const getOrganizerPermissions = async ({ headers, organizerId }) => {
  const res = await fetchFromApi({
    path: `/organizers/${organizerId}/permissions`,
    options: { headers },
  });

  return (await res.json()) as GetOrganizerPermissionsResponse;
};

export type GetOrganizerPermissionsResponse = {
  permissions: string[];
};
const useGetOrganizerPermissions = (
  { organizerId }: UseGetOrganizerPermissionsArguments,
  configuration: ExtendQueryOptions<typeof getOrganizerPermissions> = {},
) =>
  useAuthenticatedQuery({
    queryKey: ['ownership-permissions'],
    queryFn: getOrganizerPermissions,
    queryArguments: { organizerId },
    refetchOnWindowFocus: false,
    ...configuration,
  });

const getSuggestedOrganizersQuery = async ({ headers }) => {
  const res = await fetchFromApi({
    path: '/ownerships/suggestions',
    options: { headers },
    searchParams: { itemType: 'organizer' },
  });

  return await res.json();
};

const useGetSuggestedOrganizersQuery = (
  {},
  configuration: ExtendQueryOptions<typeof getSuggestedOrganizersQuery> = {},
) =>
  useAuthenticatedQuery({
    queryKey: ['ownership-suggestions'],
    queryFn: getSuggestedOrganizersQuery,
    refetchOnWindowFocus: false,
    ...configuration,
  });

const deleteOrganizerById = async ({ headers, id }) =>
  fetchFromApi({
    path: `/organizers/${id}`,
    options: { headers, method: 'DELETE' },
  });

const useDeleteOrganizerByIdMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: deleteOrganizerById,
    mutationKey: 'organizers-delete-by-id',
    ...configuration,
  });

const useGetOrganizersByCreatorQuery = (
  {
    creator,
    paginationOptions = { start: 0, limit: 50 },
    sortOptions = { field: 'modified', order: 'desc' },
  }: PaginationOptions &
    SortOptions & {
      creator: User;
    },
  configuration: ExtendQueryOptions<typeof getOrganizersByCreator> = {},
) =>
  useAuthenticatedQuery({
    queryKey: ['organizers'],
    queryFn: getOrganizersByCreator,
    queryArguments: {
      q: `creator:(${creator?.sub} OR ${
        creator?.['https://publiq.be/uitidv1id']
          ? `${creator?.['https://publiq.be/uitidv1id']} OR`
          : ''
      } ${creator?.email}) OR contributors:${creator?.email}`,
      limit: `${paginationOptions.limit}`,
      start: `${paginationOptions.start}`,
      embed: 'true',
      ...createSortingArgument(sortOptions),
    },
    enabled: !!(creator?.sub && creator?.email),
    ...configuration,
  });

type CreateOrganizerArguments = {
  headers: Headers;
  url: string;
  name: string;
  address: any;
  mainLanguage: string;
  contact: any;
};

const createOrganizer = ({ headers, ...body }: CreateOrganizerArguments) =>
  fetchFromApi({
    path: '/organizers',
    options: {
      headers,
      method: 'POST',
      body: JSON.stringify(body),
    },
  });

const useCreateOrganizerMutation = (configuration: UseMutationOptions = {}) =>
  useAuthenticatedMutation({
    mutationFn: createOrganizer,
    mutationKey: 'organizers-create',
    ...configuration,
  });

type UpdateOrganizerArguments = CreateOrganizerArguments & {
  organizerId: string;
};

type UpdateOrganizerEducationalDescriptionArguments =
  CreateOrganizerArguments & {
    organizerId: string;
    educationalDescription: string;
  };

const updateOrganizer = async ({
  headers,
  organizerId,
  name,
  mainLanguage,
  url,
}: UpdateOrganizerArguments) => {
  await fetchFromApi({
    path: `/organizers/${organizerId}/name/${mainLanguage}`,
    options: {
      headers,
      method: 'PUT',
      body: JSON.stringify({
        name,
      }),
    },
  });
  return fetchFromApi({
    path: `/organizers/${organizerId}/url/`,
    options: {
      headers,
      method: 'PUT',
      body: JSON.stringify({
        url,
      }),
    },
  });
};

const useUpdateOrganizerMutation = (configuration: UseMutationOptions = {}) =>
  useAuthenticatedMutation({
    mutationFn: updateOrganizer,
    mutationKey: 'organizers-update',
    ...configuration,
  });

const updateOrganizerEducationalDescription = ({
  headers,
  organizerId,
  mainLanguage,
  educationalDescription,
}: UpdateOrganizerEducationalDescriptionArguments) =>
  fetchFromApi({
    path: `/organizers/${organizerId}/educational-description/${mainLanguage}`,
    options: {
      headers,
      method: 'PUT',
      body: JSON.stringify({
        educationalDescription,
      }),
    },
  });

const useUpdateOrganizerEducationalDescriptionMutation = (
  configuration: UseMutationOptions = {},
) =>
  useAuthenticatedMutation({
    mutationFn: updateOrganizerEducationalDescription,
    mutationKey: 'organizers-update-educational-description',
    ...configuration,
  });

const deleteOrganizerEducationalDescription = ({
  headers,
  organizerId,
  mainLanguage,
}: UpdateOrganizerEducationalDescriptionArguments) =>
  fetchFromApi({
    path: `/organizers/${organizerId}/educational-description/${mainLanguage}`,
    options: {
      headers,
      method: 'DELETE',
    },
  });

const useDeleteOrganizerEducationalDescriptionMutation = (
  configuration: UseMutationOptions = {},
) =>
  useAuthenticatedMutation({
    mutationFn: deleteOrganizerEducationalDescription,
    mutationKey: 'organizers-delete-educational-description',
    ...configuration,
  });

const changeLocation = async ({ headers, organizerId, language, location }) => {
  return fetchFromApi({
    path: `/organizers/${organizerId.toString()}/address/${language}`,
    options: {
      method: 'PUT',
      headers,
      body: JSON.stringify(location),
    },
  });
};

const useChangeLocationMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: changeLocation,
    mutationKey: 'organizer-change-location',
    ...configuration,
  });

export {
  useChangeLocationMutation,
  useCreateOrganizerMutation,
  useDeleteOrganizerByIdMutation,
  useDeleteOrganizerEducationalDescriptionMutation,
  useGetOrganizerByIdQuery,
  useGetOrganizerPermissions,
  useGetOrganizersByCreatorQuery,
  useGetOrganizersByQueryQuery,
  useGetOrganizersByWebsiteQuery,
  useGetSuggestedOrganizersQuery,
  useUpdateOrganizerEducationalDescriptionMutation,
  useUpdateOrganizerMutation,
};
