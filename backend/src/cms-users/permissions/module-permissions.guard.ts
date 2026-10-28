import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModulePermission } from './module-permission.enum';

@Injectable()
export class ModulePermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<
      ModulePermission[]
    >('modulePermissions', [context.getClass(), context.getHandler()]);

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const userPermissions: ModulePermission[] = user?.permissions ?? [];

    // super_admin bypasses all module-level permission checks
    if (userPermissions.includes(ModulePermission.super_admin)) {
      return true;
    }

    return requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );
  }
}
