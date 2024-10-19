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

const useCreateOwnershipMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: createOwnership,
    mutationKey: 'ownerships-add-ownership',
    ...configuration,
  });

export { useCreateOwnershipMutation };
