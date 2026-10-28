import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '../../combos/domain/discount-type.enum';
import { OrderDiscountSubType } from './order-discount-sub-type.enum';

/**
 * Order discount configuration
 * Applies a discount to the entire order based on conditions
 */
export class OrderDiscountConfig {
  @ApiProperty({
    enum: OrderDiscountSubType,
    description: 'Sub-type: auto-apply or promo code',
  })
  subType: OrderDiscountSubType;

  @ApiPropertyOptional({
    description: 'Promo code (only for PROMO_CODE sub-type)',
  })
  promoCode?: string;

  @ApiProperty({
    enum: DiscountType,
    description: 'Type of discount (fixed amount or percentage)',
  })
  discountType: DiscountType;

  @ApiProperty({
    description:
      'Discount value (amount in VND for fixed, percentage for percentage type)',
  })
  discountValue: number;

  @ApiPropertyOptional({
    description: 'Maximum discount amount for percentage discounts (in VND)',
  })
  maxDiscountValue?: number;

  @ApiProperty({
    description: 'Minimum order subtotal required to qualify (in VND)',
  })
  minimumOrderValue: number;

  @ApiProperty({
    description: 'Cannot be combined with other promotions/vouchers',
    default: false,
  })
  notApplicableWithOtherPromotions: boolean;

  @ApiProperty({
    description: 'Each customer can only use this promotion once',
    default: false,
  })
  singleUsePerCustomer: boolean;

  @ApiPropertyOptional({
    description: 'Total number of times this promotion can be used',
  })
  totalUsageLimit?: number;

  @ApiProperty({
    description: 'Current number of times this promotion has been used',
    default: 0,
  })
  currentUsageCount: number;
}
