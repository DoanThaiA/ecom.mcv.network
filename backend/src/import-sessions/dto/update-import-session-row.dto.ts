import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min } from 'class-validator';
import { DiscountType } from '../../combos/domain/discount-type.enum';
import { TransformProtoEnum } from '../../utils/decorators/transform-proto-enum.decorator';
import { ValidateDiscountValue } from '../../utils/decorators/validate-discount-value.decorator';
import { DISCOUNT_TYPE_PROTO_MAP } from '../../utils/transformers/proto-enum.transformer';

/**
 * DTO for updating an import session row (inline edit)
 */
export class UpdateImportSessionRowDto {
  @ApiPropertyOptional({
    enum: DiscountType,
    description: 'Discount type',
  })
  @IsOptional()
  @TransformProtoEnum(DiscountType, DISCOUNT_TYPE_PROTO_MAP)
  discountType?: DiscountType;

  @ApiPropertyOptional({
    type: Number,
    description: 'Discount value',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @ValidateDiscountValue()
  discountValue?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Promotional quantity',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  promotionalQuantity?: number;
}
