import { fetchFromApi } from '@/utils/fetchFromApi';

import {
  ExtendQueryOptions,
  queryOptions,
  useAuthenticatedQuery,
} from './authenticated-query';

const getCultuurkuurRegions = async ({ headers }) => {
  const res = await fetchFromApi({
    path: `/cultuurkuur/regions`,
    options: {
      headers,
    },
  });
  return (await res.json()) as GetCultuurkuurLocationsResponse;
};

const useGetCultuurkuurRegions = (
  configuration: ExtendQueryOptions<typeof getCultuurkuurRegions> = {},
) => {
  const options = createGetCultuurkuurRegionsQueryOptions();

  return useAuthenticatedQuery({
    ...options,
    ...configuration,
    enabled: options.enabled !== false && configuration.enabled !== false,
  });
};

const createGetCultuurkuurRegionsQueryOptions = () =>
  queryOptions({
    queryKey: ['cultuurkuur-regions'],
    queryFn: getCultuurkuurRegions,
    refetchOnWindowFocus: false,
  });

export type HierarchicalData = {
  name: {
    nl: string;
  };
  label: string;
  children?: HierarchicalData[];
};

export type GetCultuurkuurLocationsResponse = HierarchicalData[];

export { useGetCultuurkuurRegions };
