import { ApiProperty } from '@nestjs/swagger';
import { FailedProductDto } from './bulk-add-flash-sale-products-response.dto';

/**
 * Response DTO for bulk upserting products in a flash sale.
 * Supports partial success — returns counts of added, updated, and failed products
 * with per-product failure details.
 */
export class BulkUpsertFlashSaleProductsResponseDto {
  @ApiProperty({
    type: Number,
    description: 'Total number of products successfully added or updated',
    example: 95,
  })
  upsertedCount: number;

  @ApiProperty({
    type: Number,
    description: 'Number of new products added',
    example: 80,
  })
  addedCount: number;

  @ApiProperty({
    type: Number,
    description: 'Number of existing products updated',
    example: 15,
  })
  updatedCount: number;

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
