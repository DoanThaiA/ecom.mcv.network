import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '../../combos/domain/discount-type.enum';

/**
 * Flash sale info attached to product responses
 * Used in product listing, product detail, and cart
 */
export class ProductFlashSaleInfoDto {
  @ApiProperty({ type: String, description: 'Flash sale ID' })
  flashSaleId: string;

  @ApiProperty({ type: String, description: 'Flash sale campaign name' })
  flashSaleName: string;

  @ApiProperty({ type: Number, description: 'Original retail price' })
  originalPrice: number;

  @ApiProperty({ type: Number, description: 'Flash sale price after discount' })
  flashSalePrice: number;

  @ApiProperty({ enum: DiscountType, description: 'Type of discount' })
  discountType: DiscountType;

  @ApiProperty({ type: Number, description: 'Discount value' })
  discountValue: number;

  @ApiProperty({ type: Number, description: 'Discount amount saved' })
  discountAmount: number;

  @ApiProperty({
    type: Number,
    description: 'Maximum units available at flash sale price',
  })
  promotionalQuantity: number;

  @ApiProperty({
    type: Number,
    description: 'Number of units already sold at flash sale price',
  })
  soldCount: number;

  @ApiProperty({
    type: Number,
    description: 'Remaining units at flash sale price',
  })
  remainingStock: number;

  @ApiProperty({ type: Date, description: 'Flash sale end time' })
  endTime: Date;

  @ApiProperty({
    type: Number,
    description:
      'Effective price (flashSalePrice when stock > 0, originalPrice otherwise)',
  })
  effectivePrice: number;
}

/**
 * Simplified flash sale info for cart items
 */
export class CartItemFlashSaleInfoDto {
  @ApiProperty({ type: String, description: 'Flash sale ID' })
  flashSaleId: string;

  @ApiProperty({ type: Number, description: 'Original retail price' })
  originalPrice: number;

  @ApiProperty({ type: Number, description: 'Flash sale price after discount' })
  flashSalePrice: number;

  @ApiProperty({
    type: Number,
    description: 'Remaining units at flash sale price',
  })
  remainingStock: number;
}
