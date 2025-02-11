import { useAuthenticatedQuery } from '@/hooks/api/authenticated-query';
import { Label } from '@/types/Offer';
import { fetchFromApi, isErrorObject } from '@/utils/fetchFromApi';

const getLabelsByQuery = async ({ headers, query }) => {
  const res = await fetchFromApi({
    path: '/labels/',
    searchParams: {
      query,
      limit: '6',
      start: '0',
      suggestion: 'true',
    },
    options: {
      headers: headers as unknown as Record<string, string>,
    },
  });

  return (await res.json()) as Label[];
};

const useGetLabelsByQuery = ({ query }: { query: string }) =>
  useAuthenticatedQuery({
    queryKey: ['labels'],
    queryFn: getLabelsByQuery,
    queryArguments: { query },
    enabled: !!query,
  });

export { getLabelsByQuery, useGetLabelsByQuery };
