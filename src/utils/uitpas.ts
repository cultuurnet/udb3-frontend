import { Place } from '@/types/Place';

export const isUitpasLocation = (location: Place, uitpasLabels: string[]) => {
  if (!location.labels && !location.hiddenLabels) {
    return false;
  }

  const allLabels = [
    ...new Set([...(location.labels || []), ...(location.hiddenLabels || [])]),
  ];

  return allLabels.some((label) => uitpasLabels.includes(label));
};
