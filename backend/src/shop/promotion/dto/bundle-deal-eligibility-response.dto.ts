import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BundleDealSubType } from '../../../promotions/domain/bundle-deal-sub-type.enum';

/**
 * Gift product variant info
 */
export class GiftProductVariantDto {
  @ApiProperty({ type: String })
  variantId: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({
    type: [Object],
    description: 'Variant attributes',
    example: [{ name: 'Color', value: 'Red' }],
  })
  attributes: Array<{ id?: number | string; name: string; value: string }>;

  @ApiProperty({ type: Number })
  availableStock: number;

  @ApiProperty({ type: Boolean })
  isAvailable: boolean;
}

/**
 * Gift product detail for display
 */
export class GiftProductDetailDto {
  @ApiProperty({ type: String })
  productId: string;

  @ApiProperty({ type: String })
  code: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  image: string;

  @ApiProperty({ type: Number, description: 'Original price (strikethrough)' })
  price: number;

  @ApiProperty({ type: Number })
  availableStock: number;

  @ApiProperty({ type: Boolean })
  hasVariants: boolean;

  @ApiPropertyOptional({ type: [GiftProductVariantDto] })
  variants?: GiftProductVariantDto[];
}

/**
 * Eligible gift tier response
 */
export class EligibleGiftTierDto {
  @ApiProperty({
    type: String,
    description: 'Tier ID (minOrderValue as string)',
  })
  tierId: string;

  @ApiProperty({ type: Number })
  minOrderValue: number;

  @ApiProperty({ type: [GiftProductDetailDto] })
  giftProducts: GiftProductDetailDto[];

  @ApiProperty({
    type: Boolean,
    description: 'Already has gift in cart for this tier',
  })
  isClaimed: boolean;
}

/**
 * Gift already in cart info
 */
export class CartGiftInfoDto {
  @ApiProperty({ type: String })
  productId: string;

  @ApiPropertyOptional({ type: String })
  variantId?: string | null;

  @ApiProperty({ type: String })
  promotionId: string;

  @ApiProperty({ type: String })
  tierId: string;

  @ApiProperty({ type: String })
  productName: string;

  @ApiPropertyOptional({ type: String })
  productImage?: string | null;

  @ApiProperty({ type: Number })
  originalPrice: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Gift quantity in cart (BUY_X_GET_Y)',
  })
  quantity?: number;
}

/**
 * Bundle deal eligibility response
 */
export class BundleDealEligibilityResponseDto {
  @ApiProperty({ type: String })
  promotionId: string;

  @ApiProperty({ type: String })
  promotionName: string;

  @ApiProperty({ enum: BundleDealSubType })
  subType: BundleDealSubType;

  @ApiProperty({ type: Number, description: 'Current cart total' })
  cartTotal: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Amount needed to reach next tier',
  })
  amountNeededForNextTier?: number | null;

  @ApiPropertyOptional({ type: EligibleGiftTierDto })
  nextTier?: EligibleGiftTierDto | null;

  @ApiProperty({
    type: [EligibleGiftTierDto],
    description: 'Tiers already reached',
  })
  eligibleTiers: EligibleGiftTierDto[];

  @ApiPropertyOptional({ type: CartGiftInfoDto })
  currentGift?: CartGiftInfoDto | null;

  @ApiPropertyOptional({
    type: [CartGiftInfoDto],
    description: 'All gifts in cart for this promotion (BUY_X_GET_Y)',
  })
  currentGifts?: CartGiftInfoDto[] | null;

  @ApiPropertyOptional({
    type: Number,
    description: 'Required quantity (BUY_X_GET_Y)',
  })
  requiredQuantity?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Current required quantity in cart (BUY_X_GET_Y)',
  })
  currentRequiredQuantity?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Gift quantity allowed (BUY_X_GET_Y)',
  })
  giftQuantity?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Remaining gift quantity can be claimed (BUY_X_GET_Y)',
  })
  remainingGiftQuantity?: number;

  @ApiPropertyOptional({
    type: [GiftProductDetailDto],
    description: 'Required products (BUY_X_GET_Y)',
  })
  requiredProducts?: GiftProductDetailDto[];

  @ApiPropertyOptional({
    type: [GiftProductDetailDto],
    description: 'Gift products (BUY_X_GET_Y)',
  })
  giftProducts?: GiftProductDetailDto[];

  @ApiPropertyOptional({
    type: Number,
    description: 'Minimum order value to qualify (BUY_X_GET_Y)',
  })
  minimumOrderValue?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Maximum total gifts in this promotion (BUY_X_GET_Y)',
  })
  maxGiftQuantity?: number;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Cannot be combined with other promotions (exclusive)',
    default: false,
  })
  notApplicableWithOtherPromotions?: boolean;
}
