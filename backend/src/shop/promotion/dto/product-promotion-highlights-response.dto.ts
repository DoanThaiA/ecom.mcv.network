import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BundleDealSubType } from '../../../promotions/domain/bundle-deal-sub-type.enum';
import { OrderDiscountSubType } from '../../../promotions/domain/order-discount-sub-type.enum';

/** Proto-compatible values from shared.common.DiscountType. */
export enum ProductPromotionDiscountType {
  UNSPECIFIED = 0,
  FIXED = 1,
  PERCENTAGE = 2,
}

/** Proto-compatible values from shared.common.ShippingPromotionType. */
export enum ProductPromotionShippingType {
  UNSPECIFIED = 0,
  FREESHIP = 1,
  SHIPPING_DISCOUNT = 2,
}

/** Compact, customer-safe product reference for PDP promotion highlights. */
export class ProductPromotionGiftProductDto {
  @ApiProperty({ description: 'Product ID' })
  productId: string;

  @ApiProperty({ description: 'Product name' })
  name: string;

  @ApiProperty({ description: 'Primary product image URL' })
  image: string;

  @ApiProperty({ description: 'Regular retail price before it becomes a gift' })
  originalPrice: number;

  @ApiProperty({
    description:
      'Whether the active, customer-visible product currently has gift stock',
  })
  isAvailable: boolean;
}

export class ProductPromotionShippingTierDto {
  @ApiProperty({ description: 'Minimum order subtotal for this tier' })
  minimumOrderValue: number;

  @ApiProperty({ enum: ProductPromotionDiscountType })
  discountType: ProductPromotionDiscountType;

  @ApiProperty({ description: 'Fixed VND amount or percentage value' })
  discountValue: number;
}

export class ProductPromotionShippingPromotionDto {
  @ApiProperty({ description: 'Shipping promotion ID' })
  promotionId: string;

  @ApiProperty({ description: 'Customer-visible promotion name' })
  promotionName: string;

  @ApiProperty({ enum: ProductPromotionShippingType })
  type: ProductPromotionShippingType;

  @ApiPropertyOptional({ description: 'Minimum subtotal for free shipping' })
  minimumOrderValue?: number;

  @ApiProperty({ type: [ProductPromotionShippingTierDto] })
  tiers: ProductPromotionShippingTierDto[];

  @ApiProperty({ type: Date })
  endTime: Date;
}

export class ProductPromotionOrderDiscountDto {
  @ApiProperty({ description: 'Order discount promotion ID' })
  promotionId: string;

  @ApiProperty({ description: 'Customer-visible promotion name' })
  promotionName: string;

  @ApiProperty({ enum: OrderDiscountSubType })
  subType: OrderDiscountSubType;

  @ApiPropertyOptional({ description: 'Code for PROMO_CODE promotions only' })
  promoCode?: string;

  @ApiProperty({ enum: ProductPromotionDiscountType })
  discountType: ProductPromotionDiscountType;

  @ApiProperty({ description: 'Fixed VND amount or percentage value' })
  discountValue: number;

  @ApiPropertyOptional({
    description: 'Maximum VND discount for percentage promotions',
  })
  maxDiscountValue?: number;

  @ApiProperty({ description: 'Minimum order subtotal' })
  minimumOrderValue: number;

  @ApiProperty()
  notApplicableWithOtherPromotions: boolean;

  @ApiProperty()
  singleUsePerCustomer: boolean;

  @ApiProperty({ type: Date })
  endTime: Date;
}

export class ProductPromotionGiftTierDto {
  @ApiProperty({ description: 'Minimum order subtotal for this gift tier' })
  minimumOrderValue: number;

  @ApiProperty({ type: [ProductPromotionGiftProductDto] })
  giftProducts: ProductPromotionGiftProductDto[];
}

export class ProductPromotionGiftPromotionDto {
  @ApiProperty({ description: 'Bundle deal promotion ID' })
  promotionId: string;

  @ApiProperty({ description: 'Customer-visible promotion name' })
  promotionName: string;

  @ApiProperty({ enum: BundleDealSubType })
  subType: BundleDealSubType;

  @ApiProperty({ type: [ProductPromotionGiftTierDto] })
  tiers: ProductPromotionGiftTierDto[];

  @ApiPropertyOptional({ description: 'Required trigger-product quantity' })
  requiredQuantity?: number;

  @ApiProperty({ type: [ProductPromotionGiftProductDto] })
  requiredProducts: ProductPromotionGiftProductDto[];

  @ApiPropertyOptional({ description: 'Gift quantity granted when qualified' })
  giftQuantity?: number;

  @ApiProperty({ type: [ProductPromotionGiftProductDto] })
  giftProducts: ProductPromotionGiftProductDto[];

  @ApiPropertyOptional({ description: 'Optional minimum order subtotal' })
  minimumOrderValue?: number;

  @ApiProperty()
  notApplicableWithOtherPromotions: boolean;

  @ApiProperty({ type: Date })
  endTime: Date;
}

export class ProductPromotionHighlightsResponseDto {
  @ApiProperty({ description: 'Canonical product ID' })
  productId: string;

  @ApiProperty({ type: [ProductPromotionShippingPromotionDto] })
  shippingPromotions: ProductPromotionShippingPromotionDto[];

  @ApiProperty({ type: [ProductPromotionOrderDiscountDto] })
  orderDiscounts: ProductPromotionOrderDiscountDto[];

  @ApiProperty({ type: [ProductPromotionGiftPromotionDto] })
  giftPromotions: ProductPromotionGiftPromotionDto[];
}
