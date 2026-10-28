import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsNumber, IsEnum, Min } from 'class-validator';
import { DiscountType } from '../../combos/domain/discount-type.enum';
import { ValidateDiscountValue } from '../../utils/decorators/validate-discount-value.decorator';

/**
 * DTO for updating a product in a product discount promotion
 */
export class UpdatePromotionProductDto {
  @ApiPropertyOptional({ enum: DiscountType, description: 'Discount type' })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @ApiPropertyOptional({ description: 'Discount value' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @ValidateDiscountValue()
  discountValue?: number;

  @ApiPropertyOptional({
    description: 'Whether this product is enabled in the promotion',
  })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
