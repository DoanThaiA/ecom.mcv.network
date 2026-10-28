import { Address } from '../domain/address';
import { AddressSchemaClass } from './address.schema';

export class AddressMapper {
  static toDomain(raw: AddressSchemaClass): Address {
    const domainEntity = new Address();

    domainEntity.id = raw._id.toString();
    domainEntity.userId = raw.userId;
    domainEntity.fullName = raw.fullName;
    domainEntity.phone = raw.phone;
    domainEntity.email = raw.email;
    domainEntity.notes = raw.notes;
    domainEntity.street = raw.street;
    domainEntity.cityId = raw.cityId;
    domainEntity.cityName = raw.cityName;
    domainEntity.districtId = raw.districtId;
    domainEntity.districtName = raw.districtName;
    domainEntity.wardId = raw.wardId;
    domainEntity.wardName = raw.wardName;
    domainEntity.isDefault = raw.isDefault;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Address): AddressSchemaClass {
    const persistenceSchema = new AddressSchemaClass();

    if (domainEntity.id && typeof domainEntity.id === 'string') {
      persistenceSchema._id = domainEntity.id;
    }
    persistenceSchema.userId = domainEntity.userId;
    persistenceSchema.fullName = domainEntity.fullName;
    persistenceSchema.phone = domainEntity.phone;
    persistenceSchema.email = domainEntity.email;
    persistenceSchema.notes = domainEntity.notes;
    persistenceSchema.street = domainEntity.street;
    persistenceSchema.cityId = domainEntity.cityId;
    persistenceSchema.cityName = domainEntity.cityName;
    persistenceSchema.districtId = domainEntity.districtId;
    persistenceSchema.districtName = domainEntity.districtName;
    persistenceSchema.wardId = domainEntity.wardId;
    persistenceSchema.wardName = domainEntity.wardName;
    persistenceSchema.isDefault = domainEntity.isDefault;
    persistenceSchema.createdAt = domainEntity.createdAt;
    persistenceSchema.updatedAt = domainEntity.updatedAt;
    persistenceSchema.deletedAt = domainEntity.deletedAt;

    return persistenceSchema;
  }
}
