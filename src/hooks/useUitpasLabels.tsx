import { useMemo } from 'react';

import { useGetUitpasLabelsQuery } from '@/hooks/api/labels';

export const useUitpasLabels = () => {
  const { data = [], isLoading, error } = useGetUitpasLabelsQuery();
  const uitpasLabels = useMemo(() => Object.values(data), [data]);

  return { uitpasLabels, isLoading, error };
};
