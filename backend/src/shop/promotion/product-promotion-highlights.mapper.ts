import { Product } from '../../products/domain/product';
import { PromotionVariantAvailability } from '../../products/domain/product.repository';
import { getProductImage } from '../../products/domain/product.utils';
import { isSaleable } from '../../products/domain/product-status.enum';
import { Promotion } from '../../promotions/domain/promotion';
import { PromotionType } from '../../promotions/domain/promotion-type.enum';
import { BundleDealSubType } from '../../promotions/domain/bundle-deal-sub-type.enum';
import { OrderDiscountSubType } from '../../promotions/domain/order-discount-sub-type.enum';
import { ShippingPromotion } from '../../shipping-promotions/domain/shipping-promotion';
import { ShippingPromotionType } from '../../shipping-promotions/domain/shipping-promotion-type.enum';
import {
  ProductPromotionDiscountType,
  ProductPromotionGiftProductDto,
  ProductPromotionGiftPromotionDto,
  ProductPromotionHighlightsResponseDto,
  ProductPromotionOrderDiscountDto,
  ProductPromotionShippingPromotionDto,
  ProductPromotionShippingType,
} from './dto/product-promotion-highlights-response.dto';
import { DiscountType } from '../../combos/domain/discount-type.enum';

export function collectPromotionProductIds(promotions: Promotion[]): string[] {
  const ids = new Set<string>();

  for (const promotion of promotions) {
    const config = promotion.bundleDealConfig;
    for (const tier of config?.tiers ?? []) {
      for (const product of tier.giftProducts) ids.add(product.productId);
    }
    for (const product of config?.requiredProducts ?? []) {
      ids.add(product.productId);
    }
    for (const product of config?.giftProducts ?? []) {
      ids.add(product.productId);
    }
  }

  return [...ids];
}

export function buildProductPromotionHighlights(params: {
  productId: string;
  shippingPromotions: ShippingPromotion[];
  promotions: Promotion[];
  products: Product[];
  liveVariantsByParentId: ReadonlyMap<
    string,
    readonly PromotionVariantAvailability[]
  >;
}): ProductPromotionHighlightsResponseDto {
  const productMap = new Map(
    params.products.map((product) => [product.id, product]),
  );

  return {
    productId: params.productId,
    shippingPromotions: mapShippingPromotions(params.shippingPromotions),
    orderDiscounts: mapOrderDiscounts(params.promotions),
    giftPromotions: mapGiftPromotions(
      params.promotions,
      productMap,
      params.liveVariantsByParentId,
    ),
  };
}

function mapShippingPromotions(
  promotions: ShippingPromotion[],
): ProductPromotionShippingPromotionDto[] {
  return promotions
    .map((promotion): ProductPromotionShippingPromotionDto | null => {
      if (
        promotion.type === ShippingPromotionType.FREESHIP &&
        promotion.freeshippingConfig
      ) {
        return {
          promotionId: promotion.id,
          promotionName: promotion.name,
          type: ProductPromotionShippingType.FREESHIP,
          minimumOrderValue: promotion.freeshippingConfig.minimumOrderValue,
          tiers: [],
          endTime: promotion.endTime,
        };
      }

      if (
        promotion.type === ShippingPromotionType.SHIPPING_DISCOUNT &&
        promotion.shippingDiscountConfig?.tiers.length
      ) {
        return {
          promotionId: promotion.id,
          promotionName: promotion.name,
          type: ProductPromotionShippingType.SHIPPING_DISCOUNT,
          tiers: [...promotion.shippingDiscountConfig.tiers]
            .sort(
              (left, right) => left.minimumOrderValue - right.minimumOrderValue,
            )
            .map((tier) => ({
              minimumOrderValue: tier.minimumOrderValue,
              discountType: toProtoDiscountType(tier.discountType),
              discountValue: tier.discountValue,
            })),
          endTime: promotion.endTime,
        };
      }

      return null;
    })
    .filter(isPresent)
    .sort(comparePromotions);
}

function mapOrderDiscounts(
  promotions: Promotion[],
): ProductPromotionOrderDiscountDto[] {
  return promotions
    .filter((promotion) => promotion.type === PromotionType.ORDER_DISCOUNT)
    .map((promotion): ProductPromotionOrderDiscountDto | null => {
      const config = promotion.orderDiscountConfig;
      if (!config || isOrderDiscountExhausted(config)) return null;
      if (
        config.subType !== OrderDiscountSubType.AUTO_APPLY &&
        config.subType !== OrderDiscountSubType.PROMO_CODE
      ) {
        return null;
      }

      return {
        promotionId: promotion.id,
        promotionName: promotion.name,
        subType: config.subType,
        promoCode:
          config.subType === OrderDiscountSubType.PROMO_CODE
            ? config.promoCode
            : undefined,
        discountType: toProtoDiscountType(config.discountType),
        discountValue: config.discountValue,
        maxDiscountValue: config.maxDiscountValue,
        minimumOrderValue: config.minimumOrderValue,
        notApplicableWithOtherPromotions:
          config.notApplicableWithOtherPromotions,
        singleUsePerCustomer: config.singleUsePerCustomer,
        endTime: promotion.endTime,
      };
    })
    .filter(isPresent)
    .sort(comparePromotions);
}

function mapGiftPromotions(
  promotions: Promotion[],
  productMap: Map<string, Product>,
  liveVariantsByParentId: ReadonlyMap<
    string,
    readonly PromotionVariantAvailability[]
  >,
): ProductPromotionGiftPromotionDto[] {
  return promotions
    .filter((promotion) => promotion.type === PromotionType.BUNDLE_DEAL)
    .map((promotion) =>
      mapGiftPromotion(promotion, productMap, liveVariantsByParentId),
    )
    .filter(isPresent)
    .sort(comparePromotions);
}

function mapGiftPromotion(
  promotion: Promotion,
  productMap: Map<string, Product>,
  liveVariantsByParentId: ReadonlyMap<
    string,
    readonly PromotionVariantAvailability[]
  >,
): ProductPromotionGiftPromotionDto | null {
  const config = promotion.bundleDealConfig;
  if (!config) return null;

  if (config.subType === BundleDealSubType.BUY_TO_GET_GIFT) {
    const tiers = (config.tiers ?? [])
      .map((tier) => ({
        minimumOrderValue: tier.minOrderValue,
        giftProducts: mapProductReferences(
          tier.giftProducts.map((product) => product.productId),
          productMap,
          liveVariantsByParentId,
        ),
      }))
      .filter((tier) => tier.giftProducts.length > 0)
      .sort((left, right) => left.minimumOrderValue - right.minimumOrderValue);
    if (tiers.length === 0) return null;

    return {
      promotionId: promotion.id,
      promotionName: promotion.name,
      subType: config.subType,
      tiers,
      requiredProducts: [],
      giftProducts: [],
      notApplicableWithOtherPromotions: config.notApplicableWithOtherPromotions,
      endTime: promotion.endTime,
    };
  }

  if (config.subType !== BundleDealSubType.BUY_X_GET_Y) return null;
  const remainingGiftQuantity = getRemainingGiftQuantity(config);
  if (remainingGiftQuantity === 0) return null;

  const giftProducts = mapProductReferences(
    (config.giftProducts ?? []).map((product) => product.productId),
    productMap,
    liveVariantsByParentId,
  );
  if (giftProducts.length === 0) return null;

  return {
    promotionId: promotion.id,
    promotionName: promotion.name,
    subType: config.subType,
    tiers: [],
    requiredQuantity: config.requiredQuantity,
    requiredProducts: mapProductReferences(
      (config.requiredProducts ?? []).map((product) => product.productId),
      productMap,
      liveVariantsByParentId,
    ),
    giftQuantity: config.giftQuantity,
    giftProducts,
    minimumOrderValue: config.minimumOrderValue,
    notApplicableWithOtherPromotions: config.notApplicableWithOtherPromotions,
    endTime: promotion.endTime,
  };
}

function mapProductReferences(
  productIds: string[],
  productMap: Map<string, Product>,
  liveVariantsByParentId: ReadonlyMap<
    string,
    readonly PromotionVariantAvailability[]
  >,
): ProductPromotionGiftProductDto[] {
  const seen = new Set<string>();
  const result: ProductPromotionGiftProductDto[] = [];

  for (const productId of productIds) {
    if (seen.has(productId)) continue;
    seen.add(productId);
    const product = productMap.get(productId);
    if (!product) continue;

    const isAvailable = getPublicProductAvailability(
      product,
      liveVariantsByParentId,
    );
    if (isAvailable === null) continue;

    result.push({
      productId: product.id,
      name: product.name,
      image: getProductImage(product) ?? '',
      originalPrice: product.prices?.retail ?? 0,
      isAvailable,
    });
  }

  return result;
}

/**
 * Returns null when a referenced product must not be exposed on the shop.
 * A visible ACTIVE product remains displayable when out of stock, in which
 * case false lets the PDP render the "temporarily unavailable" state.
 */
function getPublicProductAvailability(
  product: Product,
  liveVariantsByParentId: ReadonlyMap<
    string,
    readonly PromotionVariantAvailability[]
  >,
): boolean | null {
  if (product.deletedAt || product.hide || !isSaleable(product.status)) {
    return null;
  }

  const liveVariants = liveVariantsByParentId.get(product.id);
  if (liveVariants !== undefined) {
    const publicVariants = liveVariants.filter(
      (variant) => !variant.hide && isSaleable(variant.status),
    );
    if (publicVariants.length === 0) return null;

    return publicVariants.some((variant) => variant.available > 0);
  }

  return (product.inventory?.available ?? 0) > 0;
}

function isOrderDiscountExhausted(
  config: NonNullable<Promotion['orderDiscountConfig']>,
): boolean {
  return (
    config.totalUsageLimit != null &&
    config.currentUsageCount >= config.totalUsageLimit
  );
}

function getRemainingGiftQuantity(
  config: NonNullable<Promotion['bundleDealConfig']>,
): number | undefined {
  if (config.maxGiftQuantity == null) return undefined;
  return Math.max(0, config.maxGiftQuantity - (config.currentGiftCount ?? 0));
}

function toProtoDiscountType(
  discountType: DiscountType,
): ProductPromotionDiscountType {
  return discountType === DiscountType.PERCENTAGE
    ? ProductPromotionDiscountType.PERCENTAGE
    : ProductPromotionDiscountType.FIXED;
}

function comparePromotions(
  left: { promotionId: string; promotionName: string; endTime: Date },
  right: { promotionId: string; promotionName: string; endTime: Date },
): number {
  return (
    left.endTime.getTime() - right.endTime.getTime() ||
    left.promotionName.localeCompare(right.promotionName, 'vi') ||
    left.promotionId.localeCompare(right.promotionId)
  );
}

function isPresent<T>(value: T | null): value is T {
  return value !== null;
}
