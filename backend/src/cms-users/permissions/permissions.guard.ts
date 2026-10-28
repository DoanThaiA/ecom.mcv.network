import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CmsPermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permissionGroups = this.reflector.getAllAndOverride<
      (number | string)[]
    >('cmsPermissions', [context.getClass(), context.getHandler()]);
    if (!permissionGroups?.length) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    // 'cmsUser' object is added to request by AuthGuard with JWT-CMS strategy's validate method
    return permissionGroups
      .map(String)
      .includes(String(request.user?.permissionGroup));
  }
}
