import { ApiProperty } from '@nestjs/swagger';

/**
 * Individual product failure detail
 */
export class FailedProductDto {
  @ApiProperty({
    type: String,
    description: 'Product ID that failed',
    example: '507f1f77bcf86cd799439011',
  })
  productId: string;

  @ApiProperty({
    type: String,
    description: 'Product code (SKU) for display purposes',
    example: 'SP001',
  })
  productCode: string;

  @ApiProperty({
    type: String,
    description:
      'Failure reason key: duplicate | notFound | conflict | noStock | noImage',
    example: 'notFound',
  })
  reason: string;
}

/**
 * Response DTO for bulk adding products to a flash sale.
 * Supports partial success — returns counts of added vs failed products
 * with per-product failure details.
 */
export class BulkAddFlashSaleProductsResponseDto {
  @ApiProperty({
    type: Number,
    description: 'Number of products successfully added',
    example: 95,
  })
  addedCount: number;

  @ApiProperty({
    type: Number,
    description: 'Number of products that failed validation',
    example: 5,
  })
  failedCount: number;

  @ApiProperty({
    type: [FailedProductDto],
    description: 'Per-product failure details',
  })
  failedProducts: FailedProductDto[];
}
