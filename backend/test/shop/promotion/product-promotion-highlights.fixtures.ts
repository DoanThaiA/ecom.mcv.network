import { DiscountType } from '../../../src/combos/domain/discount-type.enum';
import { Product } from '../../../src/products/domain/product';
import { ProductStatus } from '../../../src/products/domain/product-status.enum';
import { ProductType } from '../../../src/products/domain/product-type.enum';
import { BundleDealSubType } from '../../../src/promotions/domain/bundle-deal-sub-type.enum';
import { OrderDiscountSubType } from '../../../src/promotions/domain/order-discount-sub-type.enum';
import { Promotion } from '../../../src/promotions/domain/promotion';
import { PromotionType } from '../../../src/promotions/domain/promotion-type.enum';
import { ShippingPromotion } from '../../../src/shipping-promotions/domain/shipping-promotion';
import { ShippingPromotionType } from '../../../src/shipping-promotions/domain/shipping-promotion-type.enum';

export const productId = '507f1f77bcf86cd799439011';
export const giftProductId = '507f1f77bcf86cd799439012';
export const hiddenGiftProductId = '507f1f77bcf86cd799439013';
export const inactiveGiftProductId = '507f1f77bcf86cd799439014';
export const deletedGiftProductId = '507f1f77bcf86cd799439015';
export const zeroPriceGiftProductId = '507f1f77bcf86cd799439016';

const endTime = new Date(Date.now() + 60_000);

export function createProduct(id: string, name: string): Product {
  return {
    id,
    businessId: '1',
    source: 'nhanh',
    code: id,
    name,
    hide: false,
    prices: { retail: 100_000 },
    images: { avatar: `${id}.jpg` },
    inventory: { remain: 5, available: 5 },
    status: ProductStatus.ACTIVE,
    type: ProductType.REGULAR,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function createOrderDiscount(
  id: string,
  overrides: Partial<NonNullable<Promotion['orderDiscountConfig']>> = {},
): Promotion {
  return {
    id,
    type: PromotionType.ORDER_DISCOUNT,
    name: id,
    startTime: new Date(),
    endTime,
    isEnabled: true,
    orderDiscountConfig: {
      subType: OrderDiscountSubType.PROMO_CODE,
      promoCode: 'CODE',
      discountType: DiscountType.FIXED,
      discountValue: 50_000,
      minimumOrderValue: 300_000,
      notApplicableWithOtherPromotions: false,
      singleUsePerCustomer: false,
      currentUsageCount: 0,
      ...overrides,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function createBuyToGetGift(
  giftProductIds: string[] = [giftProductId],
): Promotion {
  return {
    id: 'buy-to-get-gift',
    type: PromotionType.BUNDLE_DEAL,
    name: 'Buy to get gift',
    startTime: new Date(),
    endTime,
    isEnabled: true,
    bundleDealConfig: {
      subType: BundleDealSubType.BUY_TO_GET_GIFT,
      tiers: [
        {
          minOrderValue: 500_000,
          giftProducts: giftProductIds.map((configuredProductId) => ({
            productId: configuredProductId,
            name: '',
            image: '',
          })),
        },
      ],
      notApplicableWithOtherPromotions: false,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function createBuyXGetY(
  overrides: Partial<NonNullable<Promotion['bundleDealConfig']>> = {},
): Promotion {
  return {
    id: 'buy-x-get-y',
    type: PromotionType.BUNDLE_DEAL,
    name: 'Buy X get Y',
    startTime: new Date(),
    endTime,
    isEnabled: true,
    bundleDealConfig: {
      subType: BundleDealSubType.BUY_X_GET_Y,
      requiredQuantity: 2,
      requiredProducts: [{ productId, name: '', image: '' }],
      giftQuantity: 1,
      giftProducts: [{ productId: giftProductId, name: '', image: '' }],
      maxGiftQuantity: 10,
      currentGiftCount: 3,
      notApplicableWithOtherPromotions: false,
      ...overrides,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function createFreeship(): ShippingPromotion {
  return {
    id: 'free-ship',
    type: ShippingPromotionType.FREESHIP,
    name: 'Freeship',
    startTime: new Date(),
    endTime,
    isEnabled: true,
    freeshippingConfig: { minimumOrderValue: 200_000 },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function createShippingDiscount(): ShippingPromotion {
  return {
    id: 'shipping-discount',
    type: ShippingPromotionType.SHIPPING_DISCOUNT,
    name: 'Shipping discount',
    startTime: new Date(),
    endTime,
    isEnabled: true,
    shippingDiscountConfig: {
      tiers: [
        {
          minimumOrderValue: 300_000,
          discountType: DiscountType.FIXED,
          discountValue: 20_000,
        },
      ],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
