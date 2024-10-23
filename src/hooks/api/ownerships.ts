import { UseQueryOptions } from 'react-query';

import { useAuthenticatedMutation } from '@/hooks/api/authenticated-query';
import { Values } from '@/types/Values';
import { fetchFromApi, isErrorObject } from '@/utils/fetchFromApi';

import {
  ServerSideQueryOptions,
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

const approveOwnership = ({ headers, ownershipId }) =>
  fetchFromApi({
    path: `/ownerships/${ownershipId}/approve`,
    options: { headers, method: 'POST' },
  });

const useCreateOwnershipMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: createOwnership,
    mutationKey: 'ownerships-create-ownership',
    ...configuration,
  });

const useApproveOwnershipMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: approveOwnership,
    mutationKey: 'ownerships-approve-ownership',
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

export {
  useApproveOwnershipMutation,
  useCreateOwnershipMutation,
  useGetOwnershipRequestsQuery,
};
