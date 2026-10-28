import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BundleDealSubType } from './bundle-deal-sub-type.enum';

/**
 * Gift product reference
 */
export class GiftProduct {
  @ApiProperty({ description: 'Product ID' })
  productId: string;

  @ApiProperty({ description: 'Product name' })
  name: string;

  @ApiProperty({ description: 'Product image URL' })
  image: string;
}

/**
 * Required product reference (for BUY_X_GET_Y)
 */
export class RequiredProduct {
  @ApiProperty({ description: 'Product ID' })
  productId: string;

  @ApiProperty({ description: 'Product name' })
  name: string;

  @ApiProperty({ description: 'Product image URL' })
  image: string;
}

/**
 * Bundle deal tier - min order value and gift products
 */
export class BundleDealTier {
  @ApiProperty({ description: 'Minimum order value in VND' })
  minOrderValue: number;

  @ApiProperty({
    type: [GiftProduct],
    description: 'Gift products for this tier',
  })
  giftProducts: GiftProduct[];
}

/**
 * Bundle deal configuration
 */
export class BundleDealConfig {
  @ApiProperty({ enum: BundleDealSubType, description: 'Bundle deal sub-type' })
  subType: BundleDealSubType;

  @ApiPropertyOptional({
    type: [BundleDealTier],
    description: 'Tiers with thresholds and gifts',
  })
  tiers?: BundleDealTier[];

  @ApiPropertyOptional({
    description: 'Required quantity (BUY_X_GET_Y)',
  })
  requiredQuantity?: number;

  @ApiPropertyOptional({
    type: [RequiredProduct],
    description: 'Required products (BUY_X_GET_Y)',
  })
  requiredProducts?: RequiredProduct[];

  @ApiPropertyOptional({
    description: 'Gift quantity (BUY_X_GET_Y)',
  })
  giftQuantity?: number;

  @ApiPropertyOptional({
    type: [GiftProduct],
    description: 'Gift products (BUY_X_GET_Y)',
  })
  giftProducts?: GiftProduct[];

  @ApiPropertyOptional({
    description: 'Minimum order value to qualify (BUY_X_GET_Y)',
  })
  minimumOrderValue?: number;

  @ApiPropertyOptional({
    description: 'Maximum total gifts in this promotion (BUY_X_GET_Y)',
  })
  maxGiftQuantity?: number;

  @ApiPropertyOptional({
    description: 'Current gift count already granted (BUY_X_GET_Y)',
    default: 0,
  })
  currentGiftCount?: number;

  @ApiProperty({
    description:
      'Whether this promotion cannot be combined with other promotions',
    default: false,
  })
  notApplicableWithOtherPromotions: boolean;
}
