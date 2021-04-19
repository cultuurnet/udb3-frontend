// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/utils/fetchFromApi' or its c... Remove this comment to see the full error message
import { fetchFromApi } from '@/utils/fetchFromApi';
import {
  useAuthenticatedMutation,
  useAuthenticatedQuery,
} from './authenticated-query';

const getPlaceById = async ({ headers, id }) => {
  const res = await fetchFromApi({
    path: `/place/${id.toString()}`,
    options: {
      headers,
    },
  });
  return await res.json();
};

const useGetPlaceById = ({ req, queryClient, id }, configuration = {}) =>
  useAuthenticatedQuery({
    req,
    queryClient,
    queryKey: ['places'],
    queryFn: getPlaceById,
    queryArguments: { id },
    enabled: !!id,
    ...configuration,
  });

const changeStatus = async ({ headers, id, type, reason }) =>
  fetchFromApi({
    path: `/places/${id.toString()}/status`,
    options: {
      method: 'PUT',
      headers,
      body: JSON.stringify({ type, reason }),
    },
  });

const useChangeStatus = (configuration = {}) =>
  // @ts-expect-error ts-migrate(2322) FIXME: Type '({ headers, id, type, reason }: any) => Prom... Remove this comment to see the full error message
  useAuthenticatedMutation({ mutationFn: changeStatus, ...configuration });

export { useGetPlaceById, useChangeStatus };
