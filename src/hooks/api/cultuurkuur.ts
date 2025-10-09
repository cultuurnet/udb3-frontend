import { useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useMemo } from 'react';

import { CULTUURKUUR_ON_SITE_LABEL } from '@/constants/Cultuurkuur';
import { useBulkUpdateOfferLabelsMutation } from '@/hooks/api/offers';
import { useGetEntityByIdAndScope } from '@/hooks/api/scope';
import { StepProps } from '@/pages/steps/Steps';
import { Offer } from '@/types/Offer';
import { Organizer } from '@/types/Organizer';
import {
  getEducationLabels,
  getLocationLabels,
} from '@/utils/cultuurkuurLabels';
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

  const entity = getEntityByIdQuery.data;
  const formLabels = watch?.('labels');
  const labels = useMemo(
    () => (entity ? getUniqueLabels(entity) : formLabels) ?? [],
    [entity, formLabels],
  );

  const locationLabels = useMemo(() => {
    return getLocationLabels(labels);
  }, [labels]);

  const hasLocationLabels = locationLabels && locationLabels?.length > 0;

  const educationLabels = useMemo(() => {
    return getEducationLabels(labels);
  }, [labels]);

  const hasEducationLabels = educationLabels && educationLabels.length > 0;

  const otherLabels = useMemo(() => {
    return labels.filter((label) => !label.startsWith('cultuurkuur_'));
  }, [labels]);

  const queryClient = useQueryClient();
  const updateLabels = useBulkUpdateOfferLabelsMutation({
    onSuccess: async () =>
      await queryClient.invalidateQueries({ queryKey: [scope] }),
  });

  const handleCultuurkuurLabelsChange = (
    newLabels: string[],
    labelsKey: string,
  ) => {
    const hasNewLabels = newLabels.length > 0;
    const newLocationLabelsWithRest = [
      ...newLabels,
      ...educationLabels,
      ...otherLabels,
    ];
    const newEducationLabelsWithRest = [
      ...newLabels,
      ...locationLabels,
      ...otherLabels,
    ];

    const locationLabelsToMutate = hasNewLabels
      ? [...newLocationLabelsWithRest, CULTUURKUUR_ON_SITE_LABEL]
      : newLocationLabelsWithRest;

    const labelsToMutate =
      labelsKey === 'location'
        ? locationLabelsToMutate
        : newEducationLabelsWithRest;

    return offerId
      ? updateLabels.mutate({ scope, offerId, labels: labelsToMutate })
      : setValue?.('labels', labelsToMutate);
  };

  const handleClearCultuurkuurLabels = () => {
    return offerId
      ? updateLabels.mutate({ scope, offerId, labels: otherLabels })
      : setValue?.('labels', otherLabels);
  };

  return {
    selectedData: labels,
    data: available.data,
    hasLocationLabels: hasLocationLabels,
    hasEducationLabels: hasEducationLabels,
    onConfirm: handleCultuurkuurLabelsChange,
    onClean: handleClearCultuurkuurLabels,
  };
};

export {
  useCultuurkuurLabelsPickerProps,
  useGetCultuurkuurRegions,
  useGetEducationLevelsQuery,
};
