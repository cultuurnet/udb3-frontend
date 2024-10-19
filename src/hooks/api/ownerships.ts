import { useAuthenticatedMutation } from '@/hooks/api/authenticated-query';
import { fetchFromApi } from '@/utils/fetchFromApi';

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

export { useApproveOwnershipMutation, useCreateOwnershipMutation };
