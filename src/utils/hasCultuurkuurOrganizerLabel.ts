export const CULTUURKUUR_ORGANIZER_LABEL = 'cultuurkuur_organizer';

export const hasCultuurkuurOrganizerLabel = (labels: string[]) => {
  return (labels ?? []).includes(CULTUURKUUR_ORGANIZER_LABEL);
};
