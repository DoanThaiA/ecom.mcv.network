import mongoose from 'mongoose';
import {
  Topic,
  TopicProduct,
  TopicCategory,
  TopicBanner,
} from '../domain/topic';
import {
  TopicSchemaClass,
  TopicProductSchemaClass,
  TopicCategorySchemaClass,
  TopicBannerSchemaClass,
  TopicBannerMediaSchemaClass,
} from './topic.schema';

/**
 * Mapper for converting between Topic domain entity and Mongoose document
 */
export class TopicMapper {
  /**
   * Convert Mongoose document to domain entity
   * @param raw - Mongoose document
   * @returns Topic domain entity
   */
  static toDomain(raw: TopicSchemaClass): Topic {
    const domainEntity = new Topic();

    domainEntity.id = raw._id.toString();
    domainEntity.businessId = raw.businessId;
    domainEntity.name = raw.name;
    domainEntity.localization = raw.localization
      ? { vi: raw.localization.vi, en: raw.localization.en }
      : null;
    domainEntity.slug = raw.slug;
    domainEntity.type = raw.type;
    domainEntity.description = raw.description ?? null;
    domainEntity.image = raw.image ?? null;
    domainEntity.order = raw.order;
    domainEntity.status = raw.status;
    domainEntity.products = (raw.products || []).map((item) => ({
      productId: item.productId.toString(),
      order: item.order,
    }));
    domainEntity.categories = (raw.categories || []).map((item) => ({
      categoryId: item.categoryId.toString(),
      order: item.order,
    }));
    domainEntity.banners = (raw.banners || []).map((item) => ({
      id: item._id.toString(),
      mediaType: item.mediaType,
      media: {
        mobile: item.media?.mobile,
        tablet: item.media?.tablet,
        desktop: item.media?.desktop,
      },
      link: item.link ?? null,
      order: item.order,
    }));
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt ?? null;

    return domainEntity;
  }

  /**
   * Convert domain entity to Mongoose document
   * @param domainEntity - Topic domain entity
   * @returns Mongoose document
   */
  static toDocument(domainEntity: Topic): TopicSchemaClass {
    const persistenceSchema = new TopicSchemaClass();

    if (domainEntity.id && typeof domainEntity.id === 'string') {
      persistenceSchema._id = domainEntity.id;
    }

    persistenceSchema.businessId = domainEntity.businessId;
    persistenceSchema.name = domainEntity.name;
    persistenceSchema.localization = domainEntity.localization
      ? { vi: domainEntity.localization.vi, en: domainEntity.localization.en }
      : undefined;
    persistenceSchema.slug = domainEntity.slug;
    persistenceSchema.type = domainEntity.type;
    persistenceSchema.description = domainEntity.description ?? undefined;
    persistenceSchema.image = domainEntity.image ?? undefined;
    persistenceSchema.order = domainEntity.order;
    persistenceSchema.status = domainEntity.status;
    persistenceSchema.products = (domainEntity.products || []).map((item) => {
      const schemaItem = new TopicProductSchemaClass();
      schemaItem.productId = new mongoose.Types.ObjectId(item.productId);
      schemaItem.order = item.order;
      return schemaItem;
    });
    persistenceSchema.categories = (domainEntity.categories || []).map(
      (item) => {
        const schemaItem = new TopicCategorySchemaClass();
        schemaItem.categoryId = new mongoose.Types.ObjectId(item.categoryId);
        schemaItem.order = item.order;
        return schemaItem;
      },
    );
    persistenceSchema.banners = (domainEntity.banners || []).map((item) =>
      TopicMapper.toDocumentBanner(item),
    );
    persistenceSchema.createdAt = domainEntity.createdAt;
    persistenceSchema.updatedAt = domainEntity.updatedAt;
    persistenceSchema.deletedAt = domainEntity.deletedAt ?? undefined;

    return persistenceSchema;
  }

  /**
   * Convert TopicProduct domain to schema class
   * @param item - TopicProduct domain
   * @returns TopicProductSchemaClass
   */
  static toDocumentProduct(item: TopicProduct): TopicProductSchemaClass {
    const schemaItem = new TopicProductSchemaClass();
    schemaItem.productId = new mongoose.Types.ObjectId(item.productId);
    schemaItem.order = item.order;
    return schemaItem;
  }

  /**
   * Convert TopicCategory domain to schema class
   * @param item - TopicCategory domain
   * @returns TopicCategorySchemaClass
   */
  static toDocumentCategory(item: TopicCategory): TopicCategorySchemaClass {
    const schemaItem = new TopicCategorySchemaClass();
    schemaItem.categoryId = new mongoose.Types.ObjectId(item.categoryId);
    schemaItem.order = item.order;
    return schemaItem;
  }

  /**
   * Convert TopicBanner domain to schema class
   * @param item - TopicBanner domain
   * @returns TopicBannerSchemaClass
   */
  static toDocumentBanner(item: TopicBanner): TopicBannerSchemaClass {
    const schemaItem = new TopicBannerSchemaClass();
    schemaItem._id = item.id
      ? new mongoose.Types.ObjectId(item.id)
      : new mongoose.Types.ObjectId();
    schemaItem.mediaType = item.mediaType;
    const media = new TopicBannerMediaSchemaClass();
    media.mobile = item.media?.mobile;
    media.tablet = item.media?.tablet;
    media.desktop = item.media?.desktop;
    schemaItem.media = media;
    schemaItem.link = item.link ?? undefined;
    schemaItem.order = item.order;
    return schemaItem;
  }
}
