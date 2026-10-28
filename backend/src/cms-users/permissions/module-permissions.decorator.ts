import { SetMetadata } from '@nestjs/common';
import { ModulePermission } from './module-permission.enum';

export const RequireModulePermission = (...permissions: ModulePermission[]) =>
  SetMetadata('modulePermissions', permissions);
