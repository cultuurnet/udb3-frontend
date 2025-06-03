import { PermissionTypes } from '@/constants/PermissionTypes';

const displayCultuurkuurLabels = (roles: string[], labels: string[]) => {
  const isGodUser = roles?.includes(PermissionTypes.GEBRUIKERS_BEHEREN);

  const cultuurkuurLabels = labels.filter((label) =>
    label.startsWith('cultuurkuur_'),
  );
  const otherLabels = labels.filter(
    (label) => !label.startsWith('cultuurkuur_'),
  );

  return isGodUser ? [...cultuurkuurLabels, ...otherLabels] : otherLabels;
};

export { displayCultuurkuurLabels };
