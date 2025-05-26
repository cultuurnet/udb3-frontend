import { useMemo } from 'react';
import { useQueryClient, UseQueryResult } from 'react-query';

import { useBulkUpdateOfferLabelsMutation } from '@/hooks/api/offers';
import { useGetEntityByIdAndScope } from '@/hooks/api/scope';
import { StepProps } from '@/pages/steps/Steps';
import { Offer } from '@/types/Offer';
import { Organizer } from '@/types/Organizer';
import { fetchFromApi } from '@/utils/fetchFromApi';
import { getUniqueLabels } from '@/utils/getUniqueLabels';

import {
  ExtendQueryOptions,
  queryOptions,
  useAuthenticatedQuery,
} from './authenticated-query';

export type HierarchicalData = {
  name: {
    nl: string;
  };
  label?: string;
  extraLabel?: string;
  children?: HierarchicalData[];
  parent?: HierarchicalData;
};

const getCultuurkuurRegions = async ({ headers }) => {
  const res = await fetchFromApi({
    path: `/cultuurkuur/regions`,
    options: { headers },
  });

  return (await res.json()) as HierarchicalData[];
};

const useGetCultuurkuurRegions = (
  configuration: ExtendQueryOptions<typeof getCultuurkuurRegions> = {},
) => {
  const options = queryOptions({
    queryKey: ['cultuurkuur-regions'],
    queryFn: getCultuurkuurRegions,
    refetchOnWindowFocus: false,
  });

  return useAuthenticatedQuery({
    ...options,
    ...configuration,
    enabled: options.enabled !== false && configuration.enabled !== false,
  });
};

const getCultuurkuurEducationLevels = async ({ headers }) => {
  const res = await fetchFromApi({
    path: `/cultuurkuur/education-levels`,
    options: { headers },
  });

  return (await res.json()) as HierarchicalData[];
};

const useGetEducationLevelsQuery = (
  configuration: ExtendQueryOptions<typeof getCultuurkuurRegions> = {},
) => {
  const options = queryOptions({
    queryKey: ['cultuurkuur-education-levels'],
    queryFn: getCultuurkuurEducationLevels,
    refetchOnWindowFocus: false,
  });

  return useAuthenticatedQuery({
    ...options,
    ...configuration,
    enabled: options.enabled !== false && configuration.enabled !== false,
  });
};

const useCultuurkuurLabelsPickerProps = (
  props: Pick<StepProps, 'offerId' | 'scope'> &
    Partial<Pick<StepProps, 'setValue' | 'watch'>>,
  available: UseQueryResult<HierarchicalData[]>,
) => {
  const { offerId, scope, setValue, watch } = props;
  const getEntityByIdQuery = useGetEntityByIdAndScope({
    id: offerId,
    scope: scope,
  });

  const entity: Offer | Organizer | undefined = getEntityByIdQuery.data;
  const formLabels = watch?.('labels');
  const labels = useMemo(
    () => (entity ? getUniqueLabels(entity) : formLabels) ?? [],
    [entity, formLabels],
  );

  const locationLabels = useMemo(() => {
    return labels.filter((label) =>
      label.startsWith('cultuurkuur_werkingsregio'),
    );
  }, [labels]);

  const educationLabels = useMemo(() => {
    return labels.filter(
      (label) =>
        label.startsWith('cultuurkuur_') &&
        !label.startsWith('cultuurkuur_werkingsregio'),
    );
  }, [labels]);

  const otherLabels = useMemo(() => {
    return labels.filter((label) => !label.startsWith('cultuurkuur_'));
  }, [labels]);

  const queryClient = useQueryClient();
  const updateLabels = useBulkUpdateOfferLabelsMutation({
    onSuccess: async () => await queryClient.invalidateQueries(scope),
  });

  const handleCultuurkuurLabelsChange = (
    newLabels: string[],
    labelsKey: string,
  ) => {
    const labelsToMutate =
      labelsKey === 'location'
        ? [...newLabels, ...educationLabels, ...otherLabels]
        : [...newLabels, ...locationLabels, ...otherLabels];

    return offerId
      ? updateLabels.mutate({ scope, offerId, labels: labelsToMutate })
      : setValue?.('labels', labelsToMutate);
  };

  return {
    selectedData: labels,
    data: available.data,
    onConfirm: handleCultuurkuurLabelsChange,
  };
};

export {
  useCultuurkuurLabelsPickerProps,
  useGetCultuurkuurRegions,
  useGetEducationLevelsQuery,
};
