import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ApplyVoucherDto {
  @ApiProperty({
    description: 'Voucher code',
    example: 'BANMOI',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ description: 'Checkout Session ID (UUID)' })
  @IsString()
  @IsOptional()
  checkoutSessionId?: string;
}

export class VoucherResponseDto {
  @ApiProperty({ description: 'Voucher code' })
  code: string;

  @ApiProperty({ description: 'Voucher name/description' })
  name: string;

  @ApiProperty({ description: 'Discount amount' })
  discountAmount: number;

  @ApiProperty({ description: 'Source of voucher (CMS or CDP)' })
  source: 'CMS' | 'CDP';

  @ApiPropertyOptional({ description: 'Voucher ID (CDP or CMS ID)' })
  id?: string;

  @ApiPropertyOptional({ description: 'Discount type (0: Fixed, 1: Percent)' })
  discountType?: number;

  @ApiPropertyOptional({ description: 'Discount value (e.g. 10 for 10%)' })
  discountValue?: number;

  @ApiPropertyOptional({ description: 'Minimum order value to apply voucher' })
  minimumOrderValue?: number;

  @ApiPropertyOptional({
    description: 'Maximum discount value (for percentage discounts)',
  })
  maxDiscountValue?: number;

  @ApiPropertyOptional({
    description: 'Whether voucher cannot be used with other promotions',
  })
  notApplicableWithOtherPromotions?: boolean;

  @ApiPropertyOptional({
    description:
      'Eligible product IDs (for CMS Product Discount VOUCHER - only these products get discount)',
  })
  eligibleProductIds?: string[];
}
