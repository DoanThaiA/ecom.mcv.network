import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, Min, IsOptional, IsBoolean } from 'class-validator';
import { DiscountType } from '../../combos/domain/discount-type.enum';
import { TransformProtoEnum } from '../../utils/decorators/transform-proto-enum.decorator';
import { ValidateDiscountValue } from '../../utils/decorators/validate-discount-value.decorator';
import { DISCOUNT_TYPE_PROTO_MAP } from '../../utils/transformers/proto-enum.transformer';

/**
 * DTO for updating a product in a flash sale
 */
export class UpdateFlashSaleProductDto {
  @ApiPropertyOptional({
    enum: DiscountType,
    description: 'Type of discount (fixed amount or percentage)',
    example: DiscountType.PERCENTAGE,
  })
  @IsOptional()
  @TransformProtoEnum(DiscountType, DISCOUNT_TYPE_PROTO_MAP)
  discountType?: DiscountType;

  @ApiPropertyOptional({
    type: Number,
    description:
      'Discount value (VND for fixed, percentage 0-100 for percentage type)',
    example: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @ValidateDiscountValue()
  discountValue?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Maximum units available at flash sale price',
    example: 100,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  promotionalQuantity?: number;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Whether this product is enabled in the flash sale',
  })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
