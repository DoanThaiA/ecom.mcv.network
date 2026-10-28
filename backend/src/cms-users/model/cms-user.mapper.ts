import { CmsUser } from '../domain/cms-user';
import { CmsUserSchemaClass } from './cms-user.schema';
import { FileSchemaClass } from '../../files/infrastructure/persistence/document/entities/file.schema';
import { FileMapper } from '../../files/infrastructure/persistence/document/mappers/file.mapper';

export class CmsUserMapper {
  static toDomain(raw: CmsUserSchemaClass): CmsUser {
    const domainEntity = new CmsUser();
    domainEntity.id = raw._id.toString();
    domainEntity.email = raw.email;
    domainEntity.password = raw.password;
    domainEntity.firstName = raw.firstName;
    domainEntity.lastName = raw.lastName;
    domainEntity.phone = raw.phone ?? null;
    if (raw.photo) {
      domainEntity.photo = FileMapper.toDomain(raw.photo);
    } else if (raw.photo === null) {
      domainEntity.photo = null;
    }

    if (typeof raw.permissionGroup !== 'undefined') {
      domainEntity.permissionGroup = raw.permissionGroup;
    }

    domainEntity.accountType = raw.accountType ?? null;
    domainEntity.permissions = raw.permissions ?? [];
    domainEntity.affiliateId = raw.affiliateId ?? null;

    if (typeof raw.status !== 'undefined') {
      domainEntity.status = raw.status;
    }

    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;

    return domainEntity;
  }

  static toDocument(domainEntity: CmsUser): CmsUserSchemaClass {
    let photo: FileSchemaClass | undefined = undefined;

    if (domainEntity.photo) {
      photo = new FileSchemaClass();
      photo._id = domainEntity.photo.id;
      photo.path = domainEntity.photo.path;
    }

    const persistenceSchema = new CmsUserSchemaClass();
    if (domainEntity.id && typeof domainEntity.id === 'string') {
      persistenceSchema._id = domainEntity.id;
    }
    persistenceSchema.email = domainEntity.email ?? '';
    persistenceSchema.password = domainEntity.password ?? '';
    persistenceSchema.firstName = domainEntity.firstName;
    persistenceSchema.lastName = domainEntity.lastName;
    persistenceSchema.phone = domainEntity.phone;
    persistenceSchema.photo = photo;
    if (
      typeof domainEntity.permissionGroup !== 'undefined' &&
      domainEntity.permissionGroup !== null
    ) {
      persistenceSchema.permissionGroup = domainEntity.permissionGroup;
    }
    if (domainEntity.accountType) {
      persistenceSchema.accountType = domainEntity.accountType;
    }
    if (domainEntity.permissions) {
      persistenceSchema.permissions = domainEntity.permissions;
    }
    if (typeof domainEntity.affiliateId !== 'undefined') {
      persistenceSchema.affiliateId = domainEntity.affiliateId;
    }
    if (
      typeof domainEntity.status !== 'undefined' &&
      domainEntity.status !== null
    ) {
      persistenceSchema.status = domainEntity.status;
    }
    persistenceSchema.createdAt = domainEntity.createdAt;
    persistenceSchema.updatedAt = domainEntity.updatedAt;
    persistenceSchema.deletedAt = domainEntity.deletedAt;
    return persistenceSchema;
  }
}
