import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { DiscountType } from '../../combos/domain/discount-type.enum';
import { ValidateDiscountValue } from '../../utils/decorators/validate-discount-value.decorator';

/**
 * DTO for adding a single product to a product discount promotion
 */
export class CreatePromotionProductDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({
    enum: DiscountType,
    description: 'Discount type for this product (fixed amount or percentage)',
  })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({
    description: 'Discount value for this product',
  })
  @IsNumber()
  @Min(0)
  @ValidateDiscountValue()
  discountValue: number;

  @ApiPropertyOptional({
    description: 'Whether this product is enabled in the promotion',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
