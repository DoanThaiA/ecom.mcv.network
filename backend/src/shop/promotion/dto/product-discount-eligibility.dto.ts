import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsArray, IsString, Min } from 'class-validator';
import { DiscountType } from '../../../combos/domain/discount-type.enum';

/**
 * Request DTO for checking product discount eligibility
 */
export class CheckProductDiscountEligibilityDto {
  @ApiProperty({
    type: Number,
    description: 'Current cart total (excluding gift items)',
  })
  @IsNumber()
  @Min(0)
  cartTotal: number;

  @ApiProperty({
    type: [String],
    description: 'Product IDs in the cart',
  })
  @IsArray()
  @IsString({ each: true })
  productIds: string[];
}

/**
 * Eligible product info in a product discount promotion
 */
export class EligibleProductDto {
  @ApiProperty({ type: String })
  productId: string;

  @ApiProperty({ type: String })
  productName: string;

  @ApiProperty({ type: String })
  productImage: string;

  @ApiProperty({ type: String })
  productCode: string;

  @ApiProperty({ type: Number, description: 'Original price' })
  originalPrice: number;

  @ApiProperty({ type: Number, description: 'Price after discount' })
  discountedPrice: number;

  @ApiProperty({
    type: Number,
    description: 'Discount amount for this product',
  })
  discountAmount: number;
}

/**
 * Product discount eligibility response
 */
export class ProductDiscountEligibilityResponseDto {
  @ApiProperty({ type: String })
  promotionId: string;

  @ApiProperty({ type: String })
  promotionName: string;

  /** @deprecated Per-product discounts are now used. See eligibleProducts for details. */
  @ApiPropertyOptional({ enum: DiscountType })
  discountType?: DiscountType;

  /** @deprecated Per-product discounts are now used. See eligibleProducts for details. */
  @ApiPropertyOptional({
    type: Number,
    description:
      'Deprecated: discount value. Per-product discounts are used instead.',
  })
  discountValue?: number;

  /** @deprecated No longer used. */
  @ApiPropertyOptional({
    type: Number,
    description: 'Deprecated: max discount cap. No longer used.',
  })
  maxDiscountValue?: number;

  @ApiProperty({
    type: Boolean,
    description: 'Always true — no minimum order condition',
  })
  isEligible: boolean;

  @ApiProperty({
    type: [EligibleProductDto],
    description: 'Products in cart that are eligible for this promotion',
  })
  eligibleProducts: EligibleProductDto[];

  @ApiProperty({
    type: Number,
    description: 'Total potential discount if applied',
  })
  potentialDiscount: number;

  @ApiPropertyOptional({
    type: Date,
    description: 'Promotion end date',
  })
  endDate?: Date;
}

/**
 * Request DTO for applying product discount
 */
export class ApplyProductDiscountDto {
  @ApiProperty({ type: String, description: 'Promotion ID to apply' })
  @IsString()
  promotionId: string;

  @ApiProperty({ type: String, description: 'Checkout session ID' })
  @IsString()
  checkoutSessionId: string;
}
