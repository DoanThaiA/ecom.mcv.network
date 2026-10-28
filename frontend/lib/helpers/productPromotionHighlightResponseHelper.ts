import {
  BundleDealSubType,
  DiscountType,
  OrderDiscountSubType,
  ShippingPromotionType,
} from '@/types/gen/shared/shared/common/enums';
import type {
  ProductPromotionGiftProduct,
  ProductPromotionGiftPromotion,
  ProductPromotionGiftTier,
  ProductPromotionHighlightsResponse,
  ProductPromotionOrderDiscount,
  ProductPromotionShippingPromotion,
  ProductPromotionShippingTier,
} from '@/types/gen/shop/shop/shop/shop';

type JsonRecord = Record<string, unknown>;

const DISCOUNT_TYPE_VALUES: Record<string, DiscountType> = {
  fixed: DiscountType.DISCOUNT_TYPE_FIXED,
  discount_type_fixed: DiscountType.DISCOUNT_TYPE_FIXED,
  percentage: DiscountType.DISCOUNT_TYPE_PERCENTAGE,
  discount_type_percentage: DiscountType.DISCOUNT_TYPE_PERCENTAGE,
  unspecified: DiscountType.DISCOUNT_TYPE_UNSPECIFIED,
  discount_type_unspecified: DiscountType.DISCOUNT_TYPE_UNSPECIFIED,
};

const SHIPPING_TYPE_VALUES: Record<string, ShippingPromotionType> = {
  freeship: ShippingPromotionType.SHIPPING_PROMOTION_TYPE_FREESHIP,
  shipping_promotion_type_freeship:
    ShippingPromotionType.SHIPPING_PROMOTION_TYPE_FREESHIP,
  shipping_discount:
    ShippingPromotionType.SHIPPING_PROMOTION_TYPE_SHIPPING_DISCOUNT,
  shipping_promotion_type_shipping_discount:
    ShippingPromotionType.SHIPPING_PROMOTION_TYPE_SHIPPING_DISCOUNT,
  unspecified: ShippingPromotionType.SHIPPING_PROMOTION_TYPE_UNSPECIFIED,
  shipping_promotion_type_unspecified:
    ShippingPromotionType.SHIPPING_PROMOTION_TYPE_UNSPECIFIED,
};

const SUB_TYPE_VALUES: Record<
  string,
  OrderDiscountSubType | BundleDealSubType
> = {
  auto_apply: OrderDiscountSubType.ORDER_DISCOUNT_SUB_TYPE_AUTO_APPLY,
  order_discount_sub_type_auto_apply:
    OrderDiscountSubType.ORDER_DISCOUNT_SUB_TYPE_AUTO_APPLY,
  promo_code: OrderDiscountSubType.ORDER_DISCOUNT_SUB_TYPE_PROMO_CODE,
  order_discount_sub_type_promo_code:
    OrderDiscountSubType.ORDER_DISCOUNT_SUB_TYPE_PROMO_CODE,
  buy_to_get_gift: BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT,
  bundle_deal_sub_type_buy_to_get_gift:
    BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT,
  buy_x_get_y: BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_X_GET_Y,
  bundle_deal_sub_type_buy_x_get_y:
    BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_X_GET_Y,
  unspecified: OrderDiscountSubType.ORDER_DISCOUNT_SUB_TYPE_UNSPECIFIED,
  order_discount_sub_type_unspecified:
    OrderDiscountSubType.ORDER_DISCOUNT_SUB_TYPE_UNSPECIFIED,
  bundle_deal_sub_type_unspecified:
    BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_UNSPECIFIED,
};

const isJsonRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === 'string';
const isBoolean = (value: unknown): value is boolean =>
  typeof value === 'boolean';
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const isOptionalString = (value: unknown): value is string | undefined =>
  value === undefined || isString(value);
const isOptionalNumber = (value: unknown): value is number | undefined =>
  value === undefined || isFiniteNumber(value);
const isOptionalValidDate = (value: unknown): value is Date | undefined =>
  value === undefined ||
  (value instanceof Date && !Number.isNaN(value.getTime()));

const normalizeEnumValue = (
  fieldName: string,
  value: unknown,
): unknown => {
  const normalizedFieldName = fieldName.replaceAll('_', '').toLowerCase();
  if (normalizedFieldName === 'endtime' && typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  if (typeof value !== 'string') return value;

  const normalizedValue = value.toLowerCase();

  if (normalizedFieldName === 'discounttype') {
    return DISCOUNT_TYPE_VALUES[normalizedValue] ?? value;
  }

  if (normalizedFieldName === 'type') {
    return SHIPPING_TYPE_VALUES[normalizedValue] ?? value;
  }

  if (normalizedFieldName === 'subtype') {
    return SUB_TYPE_VALUES[normalizedValue] ?? value;
  }

  return value;
};

const normalizePromotionEnums = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(normalizePromotionEnums);
  if (value instanceof Date) return value;
  if (!isJsonRecord(value)) return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, childValue]) => [
      key,
      normalizeEnumValue(key, normalizePromotionEnums(childValue)),
    ]),
  );
};

const isShippingTier = (
  value: unknown,
): value is ProductPromotionShippingTier =>
  isJsonRecord(value) &&
  isFiniteNumber(value.minimumOrderValue) &&
  isFiniteNumber(value.discountType) &&
  isFiniteNumber(value.discountValue);

const isShippingPromotion = (
  value: unknown,
): value is ProductPromotionShippingPromotion =>
  isJsonRecord(value) &&
  isString(value.promotionId) &&
  isString(value.promotionName) &&
  isFiniteNumber(value.type) &&
  isOptionalNumber(value.minimumOrderValue) &&
  Array.isArray(value.tiers) &&
  value.tiers.every(isShippingTier) &&
  isOptionalValidDate(value.endTime);

const isOrderDiscount = (
  value: unknown,
): value is ProductPromotionOrderDiscount =>
  isJsonRecord(value) &&
  isString(value.promotionId) &&
  isString(value.promotionName) &&
  isFiniteNumber(value.subType) &&
  isOptionalString(value.promoCode) &&
  isFiniteNumber(value.discountType) &&
  isFiniteNumber(value.discountValue) &&
  isOptionalNumber(value.maxDiscountValue) &&
  isFiniteNumber(value.minimumOrderValue) &&
  isBoolean(value.notApplicableWithOtherPromotions) &&
  isBoolean(value.singleUsePerCustomer) &&
  isOptionalValidDate(value.endTime);

const isGiftProduct = (value: unknown): value is ProductPromotionGiftProduct =>
  isJsonRecord(value) &&
  isString(value.productId) &&
  isString(value.name) &&
  isString(value.image) &&
  isFiniteNumber(value.originalPrice) &&
  isBoolean(value.isAvailable);

const isGiftTier = (value: unknown): value is ProductPromotionGiftTier =>
  isJsonRecord(value) &&
  isFiniteNumber(value.minimumOrderValue) &&
  Array.isArray(value.giftProducts) &&
  value.giftProducts.every(isGiftProduct);

const isGiftPromotion = (
  value: unknown,
): value is ProductPromotionGiftPromotion =>
  isJsonRecord(value) &&
  isString(value.promotionId) &&
  isString(value.promotionName) &&
  isFiniteNumber(value.subType) &&
  Array.isArray(value.tiers) &&
  value.tiers.every(isGiftTier) &&
  isOptionalNumber(value.requiredQuantity) &&
  Array.isArray(value.requiredProducts) &&
  value.requiredProducts.every(isGiftProduct) &&
  isOptionalNumber(value.giftQuantity) &&
  Array.isArray(value.giftProducts) &&
  value.giftProducts.every(isGiftProduct) &&
  isOptionalNumber(value.minimumOrderValue) &&
  isBoolean(value.notApplicableWithOtherPromotions) &&
  isOptionalValidDate(value.endTime);

export const parseProductPromotionHighlightsResponse = (
  payload: unknown,
): ProductPromotionHighlightsResponse | null => {
  const normalizedPayload = normalizePromotionEnums(payload);
  if (!isJsonRecord(normalizedPayload)) return null;

  const shippingPromotions = normalizedPayload.shippingPromotions;
  const orderDiscounts = normalizedPayload.orderDiscounts;
  const giftPromotions = normalizedPayload.giftPromotions;

  if (
    !isString(normalizedPayload.productId) ||
    !Array.isArray(shippingPromotions) ||
    !Array.isArray(orderDiscounts) ||
    !Array.isArray(giftPromotions)
  ) {
    return null;
  }

  return {
    productId: normalizedPayload.productId,
    shippingPromotions: shippingPromotions.filter(isShippingPromotion),
    orderDiscounts: orderDiscounts.filter(isOrderDiscount),
    giftPromotions: giftPromotions.filter(isGiftPromotion),
  };
};
