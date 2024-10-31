import { UseQueryOptions } from 'react-query';

import { Values } from '@/types/Values';
import { fetchFromApi, isErrorObject } from '@/utils/fetchFromApi';

import {
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
  state: RequestState;
};

export const RequestState = {
  APPROVED: 'approved',
  REQUESTED: 'requested',
} as const;

type RequestState = Values<typeof RequestState>;

const createOwnership = async ({ headers, itemId, itemType, ownerId }) =>
  fetchFromApi({
    path: `/ownerships`,
    options: {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ownerId,
        itemId,
        itemType,
      }),
    },
  });

const useCreateOwnershipMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: createOwnership,
    mutationKey: 'ownerships-create-ownership',
    ...configuration,
  });

const getOwnershipRequests = async ({ headers, organizerId }) => {
  const res = await fetchFromApi({
    path: '/ownerships/',
    searchParams: {
      itemId: organizerId,
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

type UseGetOwnershipRequestsArguments = ServerSideQueryOptions & {
  organizerId: string;
};

const useGetOwnershipRequestsQuery = (
  { req, queryClient, organizerId }: UseGetOwnershipRequestsArguments,
  configuration: UseQueryOptions = {},
) =>
  useAuthenticatedQuery<OwnershipRequest[]>({
    req,
    queryClient,
    queryKey: ['ownership-requests'],
    queryFn: getOwnershipRequests,
    queryArguments: { organizerId },
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
  useCreateOwnershipMutation,
  useDeleteOwnershipRequestMutation,
  useGetOwnershipRequestsQuery,
  useRejectOwnershipRequestMutation,
};
