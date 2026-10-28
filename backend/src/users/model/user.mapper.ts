import { User } from '../domain/user';
import { UserSchemaClass } from './user.schema';
import { FileSchemaClass } from '../../files/infrastructure/persistence/document/entities/file.schema';
import { FileMapper } from '../../files/infrastructure/persistence/document/mappers/file.mapper';
import { SocialAccount } from '../domain/social-account';
import { SocialAccountSchemaClass } from './social-account.schema';

export class UserMapper {
  static toDomain(raw: UserSchemaClass): User {
    const domainEntity = new User();
    domainEntity.id = raw._id.toString();
    domainEntity.email = raw.email ?? null;
    domainEntity.phone = raw.phone ?? null;
    domainEntity.password = raw.password;
    domainEntity.cdpCustomerId = raw.cdpCustomerId ?? null;
    domainEntity.cdpCustomerCode = raw.cdpCustomerCode ?? null;
    domainEntity.provider = raw.provider;
    domainEntity.socialId = raw.socialId;
    domainEntity.firstName = raw.firstName;
    domainEntity.lastName = raw.lastName;
    if (raw.photo) {
      domainEntity.photo = FileMapper.toDomain(raw.photo);
    } else if (raw.photo === null) {
      domainEntity.photo = null;
    }
    domainEntity.socialAvatarUrl = raw.socialAvatarUrl ?? null;

    if (typeof raw.status !== 'undefined') {
      domainEntity.status = raw.status;
    }

    if (raw.socialAccounts && raw.socialAccounts.length > 0) {
      domainEntity.socialAccounts = raw.socialAccounts.map((sa) =>
        UserMapper.socialAccountToDomain(sa),
      );
    } else {
      domainEntity.socialAccounts = [];
    }

    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;

    return domainEntity;
  }

  static toDocument(domainEntity: User): UserSchemaClass {
    let photo: FileSchemaClass | undefined = undefined;

    if (domainEntity.photo) {
      photo = new FileSchemaClass();
      photo._id = domainEntity.photo.id;
      photo.path = domainEntity.photo.path;
    }

    const persistenceSchema = new UserSchemaClass();
    if (domainEntity.id && typeof domainEntity.id === 'string') {
      persistenceSchema._id = domainEntity.id;
    }
    persistenceSchema.email = domainEntity.email ?? undefined;
    persistenceSchema.phone = domainEntity.phone ?? undefined;
    persistenceSchema.password = domainEntity.password;
    persistenceSchema.cdpCustomerId = domainEntity.cdpCustomerId ?? undefined;
    persistenceSchema.cdpCustomerCode =
      domainEntity.cdpCustomerCode ?? undefined;
    persistenceSchema.provider = domainEntity.provider;
    persistenceSchema.socialId = domainEntity.socialId;
    persistenceSchema.firstName = domainEntity.firstName;
    persistenceSchema.lastName = domainEntity.lastName;
    persistenceSchema.photo = photo;
    persistenceSchema.socialAvatarUrl =
      domainEntity.socialAvatarUrl ?? undefined;
    if (typeof domainEntity.status !== 'undefined') {
      persistenceSchema.status = domainEntity.status;
    }
    if (domainEntity.socialAccounts && domainEntity.socialAccounts.length > 0) {
      persistenceSchema.socialAccounts = domainEntity.socialAccounts.map((sa) =>
        UserMapper.socialAccountToDocument(sa),
      );
    }
    persistenceSchema.createdAt = domainEntity.createdAt;
    persistenceSchema.updatedAt = domainEntity.updatedAt;
    persistenceSchema.deletedAt = domainEntity.deletedAt;
    return persistenceSchema;
  }

  static socialAccountToDomain(raw: SocialAccountSchemaClass): SocialAccount {
    const socialAccount = new SocialAccount();
    socialAccount.provider = raw.provider;
    socialAccount.socialId = raw.socialId;
    socialAccount.email = raw.email ?? null;
    socialAccount.firstName = raw.firstName ?? null;
    socialAccount.lastName = raw.lastName ?? null;
    socialAccount.avatarUrl = raw.avatarUrl ?? null;
    socialAccount.connectedAt = raw.connectedAt;
    return socialAccount;
  }

  static socialAccountToDocument(
    domainEntity: SocialAccount,
  ): SocialAccountSchemaClass {
    const schema = new SocialAccountSchemaClass();
    schema.provider = domainEntity.provider;
    schema.socialId = domainEntity.socialId;
    schema.email = domainEntity.email ?? undefined;
    schema.firstName = domainEntity.firstName ?? undefined;
    schema.lastName = domainEntity.lastName ?? undefined;
    schema.avatarUrl = domainEntity.avatarUrl ?? undefined;
    schema.connectedAt = domainEntity.connectedAt;
    return schema;
  }
}
