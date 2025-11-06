import { PermissionType } from '@/constants/PermissionTypes';

interface Role {
  uuid: string;
  name: string;
  permissions?: PermissionType[];
  constraint?: string;
  constraints?: {
    v3?: string;
  };
}

interface RoleUser {
  uuid: string;
  email: string;
  username?: string;
}

interface RoleLabel {
  uuid: string;
  name: string;
  privacy?: 'public' | 'private';
}

interface TranslatedPermission {
  key: PermissionType;
  name: string;
}

interface RoleFormData {
  name: string;
  permissions: PermissionType[];
  users: RoleUser[];
  labels: RoleLabel[];
  constraints?: {
    v3?: string;
  };
}

const RoleValidationInformation = {
  MAX_LENGTH: 255,
  MIN_LENGTH: 3,
} as const;

export type { Role, RoleFormData, RoleLabel, RoleUser, TranslatedPermission };

export { RoleValidationInformation };
