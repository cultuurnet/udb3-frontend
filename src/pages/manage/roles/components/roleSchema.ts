import * as yup from 'yup';

import { PermissionType, PermissionTypes } from '@/constants/PermissionTypes';
import { RoleValidationInformation } from '@/types/Role';

const createRoleSchema = (t: (key: string) => string) =>
  yup.object({
    name: yup
      .string()
      .trim()
      .required(t('roles.form.errors.name_required'))
      .min(
        RoleValidationInformation.MIN_LENGTH,
        t('roles.form.errors.name_min_length'),
      )
      .max(
        RoleValidationInformation.MAX_LENGTH,
        t('roles.form.errors.name_max_length'),
      ),

    permissions: yup
      .array()
      .of(yup.mixed<PermissionType>().oneOf(Object.values(PermissionTypes)))
      .default([]),
    users: yup
      .array()
      .of(
        yup.object({
          uuid: yup.string().required(),
          email: yup.string().email().required(),
          username: yup.string().optional(),
        }),
      )
      .default([]),

    labels: yup
      .array()
      .of(
        yup.object({
          uuid: yup.string().required(),
          name: yup.string().required(),
          privacy: yup
            .mixed<'public' | 'private'>()
            .oneOf(['public', 'private'])
            .optional(),
        }),
      )
      .default([]),

    constraints: yup
      .object({
        v3: yup.string().optional(),
      })
      .optional(),
  });

type RoleFormDataInferred = yup.InferType<ReturnType<typeof createRoleSchema>>;

export { createRoleSchema };
export type { RoleFormDataInferred };
