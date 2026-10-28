import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { CreatePromotionProductDto } from './create-promotion-product.dto';

/**
 * DTO for bulk adding products to a product discount promotion
 */
export class BulkAddPromotionProductsDto {
  @ApiProperty({
    type: [CreatePromotionProductDto],
    description: 'Products to add',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreatePromotionProductDto)
  products: CreatePromotionProductDto[];
}

/**
 * Response DTO for bulk add operation
 */
export class BulkAddPromotionProductsResponseDto {
  @ApiProperty({ description: 'Number of products successfully added' })
  addedCount: number;

  @ApiProperty({ description: 'Number of products that failed to add' })
  failedCount: number;

  @ApiProperty({
    description: 'Details of failed products',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        productId: { type: 'string' },
        reason: { type: 'string' },
      },
    },
  })
  failedProducts: Array<{ productId: string; reason: string }>;
}
