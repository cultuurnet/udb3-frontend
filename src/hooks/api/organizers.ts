import type { UseMutationOptions, UseQueryOptions } from 'react-query';

import type {
  AuthenticatedQueryOptions,
  PaginationOptions,
  ServerSideQueryOptions,
  SortOptions,
} from '@/hooks/api/authenticated-query';
import {
  useAuthenticatedMutation,
  useAuthenticatedQuery,
} from '@/hooks/api/authenticated-query';
import type { Organizer } from '@/types/Organizer';
import { createSortingArgument } from '@/utils/createSortingArgument';
import { fetchFromApi, isErrorObject } from '@/utils/fetchFromApi';
import { handleErrorObject } from '@/utils/handleErrorObject';

import type { Headers } from './types/Headers';
import type { User } from './user';

type HeadersAndQueryData = {
  headers: Headers;
} & { [x: string]: string };

export type GetOrganizersByQueryResponse = { member: Organizer[] };

const useGetOrganizersByQueryQuery = (
  {
    req,
    queryClient,
    name,
    paginationOptions = { start: 0, limit: 10 },
  }: AuthenticatedQueryOptions<{ name?: string } & PaginationOptions> = {},
  configuration: UseQueryOptions = {},
) =>
  useAuthenticatedQuery<GetOrganizersByQueryResponse>({
    req,
    queryClient,
    queryKey: ['organizers'],
    queryFn: getOrganizers,
    queryArguments: {
      embed: true,
      name,
      start: paginationOptions.start,
      limit: paginationOptions.limit,
    },
    ...configuration,
    enabled: !!name && configuration.enabled === true,
  });

type GetOrganizersArguments = {
  headers: Headers;
  embed?: string;
  website?: string;
  name?: string;
  limit?: string;
  start?: string;
};

const getOrganizers = async ({
  headers,
  website,
  name,
  embed,
  limit,
  start,
}: GetOrganizersArguments) => {
  const res = await fetchFromApi({
    path: '/organizers',
    searchParams: {
      embed: `${embed}`,
      ...(website && { website }),
      ...(name && { name }),
      ...(limit && { limit }),
      ...(start && { start }),
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

const useGetOrganizersByWebsiteQuery = (
  {
    req,
    queryClient,
    website,
  }: AuthenticatedQueryOptions<{ website?: string }> = {},
  configuration: UseQueryOptions = {},
) =>
  useAuthenticatedQuery<{ member: Organizer[] }>({
    req,
    queryClient,
    queryKey: ['organizers'],
    queryFn: getOrganizers,
    queryArguments: {
      embed: true,
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
  if (isErrorObject(res)) {
    // eslint-disable-next-line no-console
    return console.error(res);
  }
  return await res.json();
};

const useGetOrganizerByIdQuery = (
  { id, req, queryClient }: { id: string } & ServerSideQueryOptions,
  configuration: UseQueryOptions = {},
) =>
  useAuthenticatedQuery<GetOrganizerByIdResponse>({
    req,
    queryClient,
    queryKey: ['organizers'],
    queryFn: getOrganizerById,
    queryArguments: { id },
    refetchOnWindowFocus: false,
    enabled: !!id,
    ...configuration,
  });

type GetOrganizersByCreator = HeadersAndQueryData;

const getOrganizersByCreator = async ({
  headers,
  ...queryData
}: GetOrganizersByCreator) => {
  delete headers['Authorization'];

  const res = await fetchFromApi({
    path: '/organizers/',
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

type UseGetOrganizerPermissionsArguments = ServerSideQueryOptions & {
  organizerId: string;
};

const getOrganizerPermissions = async ({ headers, organizerId }) => {
  const res = await fetchFromApi({
    path: `/organizers/${organizerId}/permissions`,
    options: { headers },
  });

  return handleErrorObject(res);
};

export type GetOrganizerPermissionsResponse = {
  permissions: string[];
};
const useGetOrganizerPermissions = (
  { req, queryClient, organizerId }: UseGetOrganizerPermissionsArguments,
  configuration: UseQueryOptions = {},
) =>
  useAuthenticatedQuery<GetOrganizerPermissionsResponse>({
    req,
    queryClient,
    queryKey: ['ownership-permissions'],
    queryFn: getOrganizerPermissions,
    queryArguments: { organizerId },
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
    req,
    queryClient,
    creator,
    paginationOptions = { start: 0, limit: 50 },
    sortOptions = { field: 'modified', order: 'desc' },
  }: AuthenticatedQueryOptions<
    PaginationOptions &
      SortOptions & {
        creator: User;
      }
  >,
  configuration: UseQueryOptions = {},
) =>
  useAuthenticatedQuery<Organizer[]>({
    req,
    queryClient,
    queryKey: ['organizers'],
    queryFn: getOrganizersByCreator,
    queryArguments: {
      q: `creator:(${creator?.sub} OR ${
        creator?.['https://publiq.be/uitidv1id']
          ? `${creator?.['https://publiq.be/uitidv1id']} OR`
          : ''
      } ${creator?.email}) OR contributors:${creator?.email}`,
      limit: paginationOptions.limit,
      start: paginationOptions.start,
      embed: true,
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
  useUpdateOrganizerEducationalDescriptionMutation,
  useUpdateOrganizerMutation,
};
