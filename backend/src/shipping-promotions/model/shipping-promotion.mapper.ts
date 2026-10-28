import { ShippingPromotion } from '../domain/shipping-promotion';
import { FreeshippingConfig } from '../domain/freeshipping-config';
import {
  ShippingDiscountConfig,
  ShippingDiscountTier,
} from '../domain/shipping-discount-config';
import {
  ShippingPromotionSchemaClass,
  FreeshippingConfigSchemaClass,
  ShippingDiscountConfigSchemaClass,
  ShippingDiscountTierSchemaClass,
} from './shipping-promotion.schema';

/**
 * Mapper for converting between ShippingPromotion domain entity and Mongoose document
 */
export class ShippingPromotionMapper {
  /**
   * Convert Mongoose document to domain entity
   */
  static toDomain(raw: ShippingPromotionSchemaClass): ShippingPromotion {
    const entity = new ShippingPromotion();

    entity.id = raw._id.toString();
    entity.type = raw.type;
    entity.name = raw.name;
    entity.startTime = raw.startTime;
    entity.endTime = raw.endTime;
    entity.isEnabled = raw.isEnabled;
    entity.freeshippingConfig = raw.freeshippingConfig
      ? this.freeshippingConfigToDomain(raw.freeshippingConfig)
      : null;
    entity.shippingDiscountConfig = raw.shippingDiscountConfig
      ? this.shippingDiscountConfigToDomain(raw.shippingDiscountConfig)
      : null;
    entity.createdAt = raw.createdAt;
    entity.updatedAt = raw.updatedAt;
    entity.deletedAt = raw.deletedAt ?? null;

    return entity;
  }

  static freeshippingConfigToDomain(
    raw: FreeshippingConfigSchemaClass,
  ): FreeshippingConfig {
    const config = new FreeshippingConfig();
    config.minimumOrderValue = raw.minimumOrderValue;
    return config;
  }

  static shippingDiscountConfigToDomain(
    raw: ShippingDiscountConfigSchemaClass,
  ): ShippingDiscountConfig {
    const config = new ShippingDiscountConfig();
    config.tiers =
      raw.tiers?.map((t) => this.shippingDiscountTierToDomain(t)) ?? [];
    return config;
  }

  static shippingDiscountTierToDomain(
    raw: ShippingDiscountTierSchemaClass,
  ): ShippingDiscountTier {
    const tier = new ShippingDiscountTier();
    tier.minimumOrderValue = raw.minimumOrderValue;
    tier.discountType = raw.discountType;
    tier.discountValue = raw.discountValue;
    return tier;
  }

  /**
   * Convert domain entity to Mongoose document
   */
  static toDocument(domain: ShippingPromotion): ShippingPromotionSchemaClass {
    const doc = new ShippingPromotionSchemaClass();

    if (domain.id && typeof domain.id === 'string') {
      doc._id = domain.id;
    }

    doc.type = domain.type;
    doc.name = domain.name;
    doc.startTime = domain.startTime;
    doc.endTime = domain.endTime;
    doc.isEnabled = domain.isEnabled;

    if (domain.freeshippingConfig) {
      doc.freeshippingConfig = this.freeshippingConfigToDocument(
        domain.freeshippingConfig,
      );
    }

    if (domain.shippingDiscountConfig) {
      doc.shippingDiscountConfig = this.shippingDiscountConfigToDocument(
        domain.shippingDiscountConfig,
      );
    }

    doc.createdAt = domain.createdAt;
    doc.updatedAt = domain.updatedAt;
    doc.deletedAt = domain.deletedAt ?? undefined;

    return doc;
  }

  static freeshippingConfigToDocument(
    config: FreeshippingConfig,
  ): FreeshippingConfigSchemaClass {
    const doc = new FreeshippingConfigSchemaClass();
    doc.minimumOrderValue = config.minimumOrderValue;
    return doc;
  }

  static shippingDiscountConfigToDocument(
    config: ShippingDiscountConfig,
  ): ShippingDiscountConfigSchemaClass {
    const doc = new ShippingDiscountConfigSchemaClass();
    doc.tiers = config.tiers.map((t) => this.shippingDiscountTierToDocument(t));
    return doc;
  }

  static shippingDiscountTierToDocument(
    tier: ShippingDiscountTier,
  ): ShippingDiscountTierSchemaClass {
    const doc = new ShippingDiscountTierSchemaClass();
    doc.minimumOrderValue = tier.minimumOrderValue;
    doc.discountType = tier.discountType;
    doc.discountValue = tier.discountValue;
    return doc;
  }
}
