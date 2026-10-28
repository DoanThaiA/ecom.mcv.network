import { ApiProperty } from '@nestjs/swagger';
import { DiscountType } from '../../combos/domain/discount-type.enum';

/**
 * A single tier in a shipping discount promotion
 */
export class ShippingDiscountTier {
  @ApiProperty({
    type: Number,
    description: 'Minimum order subtotal for this tier',
    example: 300000,
  })
  minimumOrderValue: number;

  @ApiProperty({
    enum: DiscountType,
    description: 'Discount type (fixed amount or percentage)',
    default: DiscountType.FIXED,
  })
  discountType: DiscountType;

  @ApiProperty({
    type: Number,
    description:
      'Discount value (amount in VND for fixed, percentage for percentage)',
    example: 20000,
  })
  discountValue: number;
}

/**
 * Configuration for shipping discount promotion type
 */
export class ShippingDiscountConfig {
  @ApiProperty({
    type: [ShippingDiscountTier],
    description: 'Discount tiers sorted by minimumOrderValue ascending',
  })
  tiers: ShippingDiscountTier[];
}
