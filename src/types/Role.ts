import { PermissionType } from '@/constants/PermissionTypes';

export interface Role {
  uuid: string;
  name: string;
  permissions?: PermissionType[];
  constraint?: string;
  constraints?: {
    v3?: string;
  };
}

export interface RoleUser {
  uuid: string;
  email: string;
  username?: string;
}

export interface RoleLabel {
  uuid: string;
  name: string;
  privacy?: 'public' | 'private';
}

export interface TranslatedPermission {
  key: PermissionType;
  name: string;
}

export interface RoleFormData {
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

export { RoleValidationInformation };
