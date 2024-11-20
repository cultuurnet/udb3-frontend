import { UseQueryOptions } from 'react-query';

import { Values } from '@/types/Values';
import { fetchFromApi, isErrorObject } from '@/utils/fetchFromApi';

import {
  PaginationOptions,
  ServerSideQueryOptions,
  useAuthenticatedMutation,
  useAuthenticatedQuery,
} from './authenticated-query';

export type OwnershipRequest = {
  id: string;
  itemId: string;
  ownerId: string;
  ownerEmail: string;
  requesterId: string;
  state: OwnershipState;
};

export const OwnershipState = {
  REQUESTED: 'requested',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DELETED: 'deleted',
} as const;

export type OwnershipState = Values<typeof OwnershipState>;

const getOwnershipRequests = async ({
  headers,
  organizerId,
  state,
  paginationOptions,
}: {
  headers: Headers;
  organizerId?: string;
  state?: OwnershipState;
} & PaginationOptions) => {
  const searchParams = new URLSearchParams();
  if (paginationOptions) {
    searchParams.set('limit', `${paginationOptions.limit}`);
    searchParams.set('offset', `${paginationOptions.start}`);
  }
  if (organizerId) {
    searchParams.set('itemId', organizerId);
  }
  if (state) {
    searchParams.set('state', state);
  }
  const res = await fetchFromApi({
    path: '/ownerships/',
    searchParams,
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

type UseGetOwnershipRequestsArguments = ServerSideQueryOptions & {
  organizerId?: string;
  state?: OwnershipState;
} & PaginationOptions;

export type GetOwnershipRequestsResponse = {
  '@context': string;
  '@type': string;
  itemsPerPage: number;
  totalItems: number;
  member: OwnershipRequest[];
};
const useGetOwnershipRequestsQuery = (
  {
    req,
    queryClient,
    organizerId,
    state,
    paginationOptions,
  }: UseGetOwnershipRequestsArguments,
  configuration: UseQueryOptions = {},
) =>
  useAuthenticatedQuery<GetOwnershipRequestsResponse>({
    req,
    queryClient,
    queryKey: ['ownership-requests'],
    queryFn: getOwnershipRequests,
    queryArguments: { organizerId, state, paginationOptions },
    refetchOnWindowFocus: false,
    ...configuration,
  });

const approveOwnershipRequest = async ({ headers, ownershipId }) =>
  fetchFromApi({
    path: `/ownerships/${ownershipId}/approve`,
    options: {
      method: 'POST',
      headers,
    },
  });

const useApproveOwnershipRequestMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: approveOwnershipRequest,
    mutationKey: 'approve-ownership-request',
    ...configuration,
  });

const rejectOwnershipRequest = async ({ headers, ownershipId }) =>
  fetchFromApi({
    path: `/ownerships/${ownershipId}/reject`,
    options: {
      method: 'POST',
      headers,
    },
  });

const useRejectOwnershipRequestMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: rejectOwnershipRequest,
    mutationKey: 'reject-ownership-request',
    ...configuration,
  });

const deleteOwnershipRequest = async ({ headers, ownershipId }) =>
  fetchFromApi({
    path: `/ownerships/${ownershipId}`,
    options: {
      method: 'DELETE',
      headers,
    },
  });

const useDeleteOwnershipRequestMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: deleteOwnershipRequest,
    mutationKey: 'delete-ownership-request',
    ...configuration,
  });

export {
  useApproveOwnershipRequestMutation,
  useDeleteOwnershipRequestMutation,
  useGetOwnershipRequestsQuery,
  useRejectOwnershipRequestMutation,
};
