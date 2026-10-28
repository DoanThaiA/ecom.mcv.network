import { SetMetadata } from '@nestjs/common';

export const CmsPermissions = (...permissionGroups: number[]) =>
  SetMetadata('cmsPermissions', permissionGroups);
