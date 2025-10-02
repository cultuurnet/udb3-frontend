import { PermissionsType } from '@/constants/PermissionTypes';

const formatPermission = (permission: string) =>
  permission
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());

export { formatPermission };
