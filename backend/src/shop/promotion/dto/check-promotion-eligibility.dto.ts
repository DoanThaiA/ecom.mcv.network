import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsArray, IsString, Min, IsOptional } from 'class-validator';
import { BundleDealEligibilityResponseDto } from './bundle-deal-eligibility-response.dto';
import { ProductDiscountEligibilityResponseDto } from './product-discount-eligibility.dto';
import { OrderDiscountEligibilityResponseDto } from './order-discount-eligibility.dto';

/**
 * Request DTO for checking all promotion eligibility (unified)
 * Combines bundle deal and product discount eligibility checks
 */
export class CheckPromotionEligibilityDto {
  @ApiProperty({
    type: Number,
    description: 'Current cart total (excluding gift items)',
    example: 500000,
  })
  @IsNumber()
  @Min(0)
  cartTotal: number;

  @ApiPropertyOptional({
    type: [String],
    description:
      'Product IDs in the cart (optional, used for product discount eligibility)',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  productIds?: string[];
}

/**
 * Unified promotion eligibility response
 * Contains eligibility info for all promotion types (except vouchers)
 * Easily extensible for new promotion types in the future
 */
export class PromotionEligibilityResponseDto {
  @ApiProperty({
    type: [BundleDealEligibilityResponseDto],
    description: 'Bundle deal (gift) promotions eligibility',
  })
  bundleDeals: BundleDealEligibilityResponseDto[];

  @ApiProperty({
    type: [ProductDiscountEligibilityResponseDto],
    description: 'Product discount (CTKM AUTO_APPLY) promotions eligibility',
  })
  productDiscounts: ProductDiscountEligibilityResponseDto[];

  @ApiProperty({
    type: [OrderDiscountEligibilityResponseDto],
    description:
      'Order discount (CTKM Giảm giá hóa đơn AUTO_APPLY) promotions eligibility',
  })
  orderDiscounts: OrderDiscountEligibilityResponseDto[];
}
