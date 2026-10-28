import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { DiscountType } from '../../combos/domain/discount-type.enum';
import { ValidateDiscountValue } from '../../utils/decorators/validate-discount-value.decorator';

/**
 * Single product update item for bulk update
 */
export class BulkUpdatePromotionProductItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNotEmpty()
  @IsString()
  productId: string;

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

  @ApiPropertyOptional({ description: 'Whether product is enabled' })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

/**
 * DTO for bulk updating products in a product discount promotion
 */
export class BulkUpdatePromotionProductsDto {
  @ApiProperty({
    type: [BulkUpdatePromotionProductItemDto],
    description: 'Products to update',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => BulkUpdatePromotionProductItemDto)
  products: BulkUpdatePromotionProductItemDto[];
}
