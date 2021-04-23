import { fetchFromApi } from '@/utils/fetchFromApi';
import {
  useAuthenticatedMutation,
  useAuthenticatedQuery,
} from './authenticated-query';
import type { UseAuthenticatedQueryOptions } from './authenticated-query';

const getPlaceById = async ({ headers, id }) => {
  const res = await fetchFromApi({
    path: `/place/${id.toString()}`,
    options: {
      headers,
    },
  });
  return await res.json();
};

const useGetPlaceById = async (
  { req, queryClient, id },
  configuration?: UseAuthenticatedQueryOptions,
) =>
  await useAuthenticatedQuery({
    req,
    queryClient,
    queryKey: ['places'],
    queryFn: getPlaceById,
    queryArguments: { id },
    enabled: !!id,
    ...(configuration ?? {}),
  });

const changeStatus = async ({ headers, id, type, reason }) =>
  await fetchFromApi({
    path: `/places/${id.toString()}/status`,
    options: {
      method: 'PUT',
      headers,
      body: JSON.stringify({ type, reason }),
    },
  });

const useChangeStatus = (configuration?: UseAuthenticatedQueryOptions) =>
  useAuthenticatedMutation({ mutationFn: changeStatus, ...configuration });

export { useGetPlaceById, useChangeStatus };
