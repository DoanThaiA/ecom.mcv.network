import mongoose from 'mongoose';
import { Menu } from '../domain/menu';
import { MenuSchemaClass } from './menu.schema';

/**
 * Mapper for converting between Menu domain entity and Mongoose document
 */
export class MenuMapper {
  /**
   * Convert Mongoose document to domain entity
   * @param raw - Mongoose document
   * @returns Menu domain entity
   */
  static toDomain(raw: MenuSchemaClass): Menu {
    const domainEntity = new Menu();

    domainEntity.id = raw._id.toString();
    domainEntity.name = raw.name;
    domainEntity.localization = raw.localization
      ? { vi: raw.localization.vi, en: raw.localization.en }
      : null;
    domainEntity.parentId = raw.parentId?.toString() ?? null;
    domainEntity.type = raw.type;
    domainEntity.categoryId = raw.categoryId?.toString() ?? null;
    domainEntity.topicId = raw.topicId?.toString() ?? null;
    domainEntity.url = raw.url ?? null;
    domainEntity.order = raw.order;
    domainEntity.status = raw.status;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt ?? null;

    return domainEntity;
  }

  /**
   * Convert domain entity to Mongoose document
   * @param domainEntity - Menu domain entity
   * @returns Mongoose document
   */
  static toDocument(domainEntity: Menu): MenuSchemaClass {
    const persistenceSchema = new MenuSchemaClass();

    if (domainEntity.id && typeof domainEntity.id === 'string') {
      persistenceSchema._id = domainEntity.id;
    }

    persistenceSchema.name = domainEntity.name;
    persistenceSchema.localization = domainEntity.localization
      ? { vi: domainEntity.localization.vi, en: domainEntity.localization.en }
      : undefined;
    persistenceSchema.parentId = domainEntity.parentId
      ? new mongoose.Types.ObjectId(domainEntity.parentId)
      : undefined;
    persistenceSchema.type = domainEntity.type;
    persistenceSchema.categoryId = domainEntity.categoryId
      ? new mongoose.Types.ObjectId(domainEntity.categoryId)
      : undefined;
    persistenceSchema.topicId = domainEntity.topicId
      ? new mongoose.Types.ObjectId(domainEntity.topicId)
      : undefined;
    persistenceSchema.url = domainEntity.url ?? undefined;
    persistenceSchema.order = domainEntity.order;
    persistenceSchema.status = domainEntity.status;
    persistenceSchema.createdAt = domainEntity.createdAt;
    persistenceSchema.updatedAt = domainEntity.updatedAt;
    persistenceSchema.deletedAt = domainEntity.deletedAt ?? undefined;

    return persistenceSchema;
  }
}
