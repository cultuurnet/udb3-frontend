import { UseQueryOptions } from 'react-query';

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

export { useGetOwnershipRequestsQuery };
