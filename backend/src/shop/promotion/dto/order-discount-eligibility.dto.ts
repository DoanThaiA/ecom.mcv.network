import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderDiscountSubType } from '../../../promotions/domain/order-discount-sub-type.enum';
import { DiscountType } from '../../../combos/domain/discount-type.enum';

/**
 * Order discount eligibility response - for AUTO_APPLY type (CTKM Giảm giá hóa đơn)
 * Similar to ProductDiscountEligibilityResponseDto but for order-level discounts
 */
export class OrderDiscountEligibilityResponseDto {
  @ApiProperty({ type: String, description: 'Promotion ID' })
  promotionId: string;

  @ApiProperty({ type: String, description: 'Promotion name' })
  promotionName: string;

  @ApiProperty({
    enum: OrderDiscountSubType,
    description: 'Sub-type (AUTO_APPLY or PROMO_CODE)',
  })
  subType: OrderDiscountSubType;

  @ApiProperty({ enum: DiscountType, description: 'Discount type' })
  discountType: DiscountType;

  @ApiProperty({
    type: Number,
    description: 'Discount value (percentage or fixed amount)',
  })
  discountValue: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Maximum discount amount for percentage discounts',
  })
  maxDiscountValue?: number;

  @ApiProperty({
    type: Number,
    description: 'Minimum order value required',
  })
  minimumOrderValue: number;

  @ApiProperty({
    type: Boolean,
    description: 'Whether the cart meets the minimum order requirement',
  })
  isEligible: boolean;

  @ApiProperty({
    type: Number,
    description: 'Total potential discount if applied',
  })
  potentialDiscount: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Amount needed to reach minimum order value',
  })
  amountNeededForEligibility?: number;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Cannot be combined with other promotions',
  })
  notApplicableWithOtherPromotions?: boolean;

  @ApiPropertyOptional({
    type: Date,
    description: 'Promotion end date',
  })
  endDate?: Date;
}
