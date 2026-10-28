import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Individual product hide update item
 */
export class ProductHideUpdateItem {
  @ApiProperty({
    type: String,
    description: 'Product ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    type: Boolean,
    description: 'Hide status to set',
    example: true,
  })
  @IsBoolean()
  hide: boolean;
}

/**
 * DTO for bulk updating hide status on multiple products
 */
export class BulkUpdateHideDto {
  @ApiProperty({
    type: [ProductHideUpdateItem],
    description: 'Array of product hide updates',
    example: [
      { productId: '507f1f77bcf86cd799439011', hide: true },
      { productId: '507f1f77bcf86cd799439012', hide: false },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => ProductHideUpdateItem)
  items: ProductHideUpdateItem[];
}
