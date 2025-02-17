import { UseMutationOptions, UseMutationResult } from 'react-query';

import { Values } from '@/types/Values';
import { fetchFromApi } from '@/utils/fetchFromApi';

import {
  ExtendQueryOptions,
  PaginationOptions,
  useAuthenticatedMutation,
  useAuthenticatedQuery,
} from './authenticated-query';
import type { Headers } from './types/Headers';

export type OwnershipRequest = {
  id: string;
  itemId: string;
  ownerId: string;
  ownerEmail: string;
  requesterId: string;
  state: OwnershipState;
};

export type OwnershipCreator = {
  userId: string;
  email: string;
};

export const OwnershipState = {
  REQUESTED: 'requested',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DELETED: 'deleted',
} as const;

export type OwnershipState = Values<typeof OwnershipState>;

type RequestOwnershipArguments = {
  itemId: string;
  ownerEmail?: string;
  ownerId?: string;
};

const requestOwnership = async ({
  headers,
  itemId,
  ownerEmail,
  ownerId,
}: { headers: Headers } & RequestOwnershipArguments) =>
  fetchFromApi({
    path: `/ownerships`,
    options: {
      method: 'POST',
      headers,
      body: JSON.stringify({
        itemId,
        itemType: 'organizer',
        ...(ownerEmail && { ownerEmail }),
        ...(ownerId && { ownerId }),
      }),
    },
  });

const useRequestOwnershipMutation = (configuration: UseMutationOptions = {}) =>
  useAuthenticatedMutation({
    mutationFn: requestOwnership,
    mutationKey: 'ownerships-request-ownership',
    ...configuration,
  }) as UseMutationResult<void, Error, RequestOwnershipArguments>;

const getOwnershipRequests = async ({
  headers,
  itemId,
  ownerId,
  state,
  paginationOptions,
}: {
  headers: Headers;
  itemId?: string;
  ownerId?: string;
  state?: OwnershipState;
} & PaginationOptions) => {
  const searchParams = new URLSearchParams();
  if (paginationOptions) {
    searchParams.set('limit', `${paginationOptions.limit}`);
    searchParams.set('offset', `${paginationOptions.start}`);
  }
  if (itemId) {
    searchParams.set('itemId', itemId);
  }
  if (ownerId) {
    searchParams.set('ownerId', ownerId);
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
  return (await res.json()) as GetOwnershipRequestsResponse;
};

type UseGetOwnershipRequestsArguments = {
  itemId?: string;
  ownerId?: string;
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
    itemId,
    ownerId,
    state,
    paginationOptions,
  }: UseGetOwnershipRequestsArguments,
  configuration: ExtendQueryOptions<typeof getOwnershipRequests> = {},
) =>
  useAuthenticatedQuery({
    queryKey: ['ownership-requests'],
    queryFn: getOwnershipRequests,
    queryArguments: { itemId, ownerId, state, paginationOptions },
    refetchOnWindowFocus: false,
    ...configuration,
  });

type ApproveOwnershipArguments = { ownershipId: string };

const approveOwnershipRequest = async ({
  headers,
  ownershipId,
}: {
  headers: Headers;
} & ApproveOwnershipArguments) =>
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
  }) as UseMutationResult<void, Error, ApproveOwnershipArguments>;

type RejectOwnershipArguments = { ownershipId: string };

const rejectOwnershipRequest = async ({
  headers,
  ownershipId,
}: {
  headers: Headers;
} & RejectOwnershipArguments) =>
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
  }) as UseMutationResult<void, Error, RejectOwnershipArguments>;

type DeleteOwnershipArguments = { ownershipId: string };

const deleteOwnershipRequest = async ({
  headers,
  ownershipId,
}: { headers: Headers } & DeleteOwnershipArguments) =>
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
  }) as UseMutationResult<void, Error, DeleteOwnershipArguments>;

const getOwnershipCreator = async ({ headers, organizerId }) => {
  const res = await fetchFromApi({
    path: `/organizers/${organizerId}/creator`,
    options: {
      headers,
    },
  });
  return (await res.json()) as OwnershipCreator;
};

type UseGetOwnershipCreatorArguments = {
  organizerId: string;
};

const useGetOwnershipCreatorQuery = (
  { organizerId }: UseGetOwnershipCreatorArguments,
  configuration: ExtendQueryOptions<typeof getOwnershipCreator> = {},
) =>
  useAuthenticatedQuery({
    queryKey: ['ownership-creator'],
    queryFn: getOwnershipCreator,
    queryArguments: { organizerId },
    refetchOnWindowFocus: false,
    ...configuration,
  });

export {
  useApproveOwnershipRequestMutation,
  useDeleteOwnershipRequestMutation,
  useGetOwnershipCreatorQuery,
  useGetOwnershipRequestsQuery,
  useRejectOwnershipRequestMutation,
  useRequestOwnershipMutation,
};
