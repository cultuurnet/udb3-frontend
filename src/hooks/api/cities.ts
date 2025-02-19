import { QueryFunctionContext, useQuery } from 'react-query';

import { ExtendQueryOptions } from '@/hooks/api/authenticated-query';
import { Country } from '@/types/Country';

type City = {
  label: string;
  name: string;
  zip: string;
};

type GetCitiesArguments = {
  q: string;
  country: Country;
};

const getCitiesByQuery = async (
  ctx: QueryFunctionContext<[string, GetCitiesArguments]>,
) => {
  const [_, { q, country }] = ctx.queryKey;

  const params = new URLSearchParams({ q, country });

  const res = await fetch(`/api/cities?${params.toString()}`);

  if (!res.ok) {
    return undefined;
  }

  return (await res.json()) as City[];
};

const useGetCitiesByQuery = (
  { q, country }: GetCitiesArguments,
  options: ExtendQueryOptions<typeof getCitiesByQuery> = {},
) =>
  useQuery({
    queryKey: ['cities', { q, country }],
    queryFn: getCitiesByQuery,
    enabled: !!q,
    ...options,
  });

export { useGetCitiesByQuery };
export type { City };
