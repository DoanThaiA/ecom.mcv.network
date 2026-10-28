import { Exclude, Expose } from 'class-transformer';
import { File } from '../../files/domain/file';
import { StatusEnum } from '../../statuses/statuses.enum';
import { AccountTypeEnum } from '../permissions/account-type.enum';
import { ModulePermission } from '../permissions/module-permission.enum';

export class CmsUser {
  id: number | string;

  @Expose({ groups: ['me', 'cms-admin'] })
  email?: string | null;

  @Exclude({ toPlainOnly: true })
  password?: string;

  firstName: string | null;
  lastName?: string | null;
  phone?: string | null;
  photo?: File | null;

  /** @deprecated No longer used – kept for backward compatibility. */
  permissionGroup?: number | null;
  accountType?: AccountTypeEnum | null;
  permissions?: ModulePermission[];
  affiliateId?: string | null;
  status?: StatusEnum | null;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
