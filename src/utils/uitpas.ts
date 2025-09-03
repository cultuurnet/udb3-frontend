import { Place } from '@/types/Place';

export const isUitpasLocation = (location: Place, uitpasLabels: string[]) => {
  if (!location.labels || location.labels.length === 0) {
    return false;
  }

  return location.labels.some((label) => uitpasLabels.includes(label));
};
