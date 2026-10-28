import { Promotion } from '../domain/promotion';
import { PromotionSchemaClass } from './promotion.schema';
import {
  BundleDealConfig,
  BundleDealTier,
  GiftProduct,
  RequiredProduct,
} from '../domain/bundle-deal-config';
import { OrderDiscountConfig } from '../domain/order-discount-config';
import { ProductDiscountConfig } from '../domain/product-discount-config';
import { DiscountType } from '../../combos/domain/discount-type.enum';

/**
 * Mapper between MongoDB documents and domain entities
 */
export class PromotionMapper {
  /**
   * Map MongoDB document to domain entity
   */
  static toDomain(raw: PromotionSchemaClass): Promotion {
    const promotion = new Promotion();

    promotion.id = raw._id.toString();
    promotion.type = raw.type;
    promotion.name = raw.name;
    promotion.startTime = raw.startTime;
    promotion.endTime = raw.endTime;
    promotion.isEnabled = raw.isEnabled;

    // Map Bundle Deal config if present
    if (raw.bundleDealConfig) {
      const config = new BundleDealConfig();
      config.subType = raw.bundleDealConfig.subType;
      config.tiers = (raw.bundleDealConfig.tiers || []).map((tier) => {
        const t = new BundleDealTier();
        t.minOrderValue = tier.minOrderValue;
        t.giftProducts = (tier.giftProducts || []).map((gp) => {
          const g = new GiftProduct();
          g.productId = gp.productId.toString();
          g.name = gp.name;
          g.image = gp.image;
          return g;
        });
        return t;
      });
      config.requiredQuantity = raw.bundleDealConfig.requiredQuantity;
      config.requiredProducts = (
        raw.bundleDealConfig.requiredProducts || []
      ).map((rp) => {
        const r = new RequiredProduct();
        r.productId = rp.productId.toString();
        r.name = rp.name;
        r.image = rp.image;
        return r;
      });
      config.giftQuantity = raw.bundleDealConfig.giftQuantity;
      config.giftProducts = (raw.bundleDealConfig.giftProducts || []).map(
        (gp) => {
          const g = new GiftProduct();
          g.productId = gp.productId.toString();
          g.name = gp.name;
          g.image = gp.image;
          return g;
        },
      );
      config.minimumOrderValue = raw.bundleDealConfig.minimumOrderValue;
      config.maxGiftQuantity = raw.bundleDealConfig.maxGiftQuantity;
      config.currentGiftCount = raw.bundleDealConfig.currentGiftCount ?? 0;
      config.notApplicableWithOtherPromotions =
        raw.bundleDealConfig.notApplicableWithOtherPromotions ?? false;
      promotion.bundleDealConfig = config;
    }

    // Map Order Discount config if present
    if (raw.orderDiscountConfig) {
      const config = new OrderDiscountConfig();
      config.subType = raw.orderDiscountConfig.subType;
      config.promoCode = raw.orderDiscountConfig.promoCode;
      config.discountType = raw.orderDiscountConfig
        .discountType as DiscountType;
      config.discountValue = raw.orderDiscountConfig.discountValue;
      config.maxDiscountValue = raw.orderDiscountConfig.maxDiscountValue;
      config.minimumOrderValue = raw.orderDiscountConfig.minimumOrderValue;
      config.notApplicableWithOtherPromotions =
        raw.orderDiscountConfig.notApplicableWithOtherPromotions;
      config.singleUsePerCustomer =
        raw.orderDiscountConfig.singleUsePerCustomer;
      config.totalUsageLimit = raw.orderDiscountConfig.totalUsageLimit;
      config.currentUsageCount = raw.orderDiscountConfig.currentUsageCount ?? 0;
      promotion.orderDiscountConfig = config;
    }

    // Map Product Discount config if present
    if (raw.productDiscountConfig) {
      const config = new ProductDiscountConfig();
      // Deprecated promotion-level fields (kept for backward compat with old data)
      config.discountType = raw.productDiscountConfig.discountType
        ? (raw.productDiscountConfig.discountType as DiscountType)
        : undefined;
      config.discountValue = raw.productDiscountConfig.discountValue;
      config.maxDiscountValue = raw.productDiscountConfig.maxDiscountValue;
      promotion.productDiscountConfig = config;
    }

    promotion.createdAt = raw.createdAt;
    promotion.updatedAt = raw.updatedAt;
    promotion.deletedAt = raw.deletedAt ?? null;

    return promotion;
  }

  /**
   * Map domain entity to persistence format
   */
  static toPersistence(
    promotion: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt'>,
  ): Partial<PromotionSchemaClass> {
    const data: Partial<PromotionSchemaClass> = {
      type: promotion.type,
      name: promotion.name,
      startTime: promotion.startTime,
      endTime: promotion.endTime,
      isEnabled: promotion.isEnabled,
      deletedAt: promotion.deletedAt ?? undefined,
    };

    // Map Bundle Deal config if present
    if (promotion.bundleDealConfig) {
      data.bundleDealConfig = {
        subType: promotion.bundleDealConfig.subType,
        tiers: (promotion.bundleDealConfig.tiers || []).map((tier) => ({
          minOrderValue: tier.minOrderValue,
          giftProducts: tier.giftProducts.map((gp) => ({
            productId: gp.productId as any,
            name: gp.name,
            image: gp.image,
          })),
        })),
        requiredQuantity: promotion.bundleDealConfig.requiredQuantity,
        requiredProducts: (
          promotion.bundleDealConfig.requiredProducts || []
        ).map((rp) => ({
          productId: rp.productId as any,
          name: rp.name,
          image: rp.image,
        })),
        giftQuantity: promotion.bundleDealConfig.giftQuantity,
        giftProducts: (promotion.bundleDealConfig.giftProducts || []).map(
          (gp) => ({
            productId: gp.productId as any,
            name: gp.name,
            image: gp.image,
          }),
        ),
        minimumOrderValue: promotion.bundleDealConfig.minimumOrderValue,
        maxGiftQuantity: promotion.bundleDealConfig.maxGiftQuantity,
        currentGiftCount: promotion.bundleDealConfig.currentGiftCount ?? 0,
        notApplicableWithOtherPromotions:
          promotion.bundleDealConfig.notApplicableWithOtherPromotions ?? false,
      } as any;
    }

    // Map Order Discount config if present
    if (promotion.orderDiscountConfig) {
      data.orderDiscountConfig = {
        subType: promotion.orderDiscountConfig.subType,
        promoCode: promotion.orderDiscountConfig.promoCode,
        discountType: promotion.orderDiscountConfig.discountType,
        discountValue: promotion.orderDiscountConfig.discountValue,
        maxDiscountValue: promotion.orderDiscountConfig.maxDiscountValue,
        minimumOrderValue: promotion.orderDiscountConfig.minimumOrderValue,
        notApplicableWithOtherPromotions:
          promotion.orderDiscountConfig.notApplicableWithOtherPromotions,
        singleUsePerCustomer:
          promotion.orderDiscountConfig.singleUsePerCustomer,
        totalUsageLimit: promotion.orderDiscountConfig.totalUsageLimit,
        currentUsageCount: promotion.orderDiscountConfig.currentUsageCount ?? 0,
      } as any;
    }

    // Map Product Discount config if present
    if (promotion.productDiscountConfig) {
      data.productDiscountConfig = {
        // Deprecated promotion-level fields (only persisted for backward compat)
        ...(promotion.productDiscountConfig.discountType && {
          discountType: promotion.productDiscountConfig.discountType,
        }),
        ...(promotion.productDiscountConfig.discountValue != null && {
          discountValue: promotion.productDiscountConfig.discountValue,
        }),
        ...(promotion.productDiscountConfig.maxDiscountValue != null && {
          maxDiscountValue: promotion.productDiscountConfig.maxDiscountValue,
        }),
      } as any;
    }

    return data;
  }
}
