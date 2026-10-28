import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PromotionType } from './promotion-type.enum';
import { PromotionStatus } from './promotion-status.enum';
import { BundleDealConfig } from './bundle-deal-config';
import { OrderDiscountConfig } from './order-discount-config';
import { ProductDiscountConfig } from './product-discount-config';

/**
 * Promotion domain entity
 * Base entity for all promotion types
 */
export class Promotion {
  @ApiProperty({ description: 'Promotion ID' })
  id: string;

  @ApiProperty({ enum: PromotionType, description: 'Promotion type' })
  type: PromotionType;

  @ApiProperty({ description: 'Promotion name' })
  name: string;

  @ApiProperty({ description: 'Start time' })
  startTime: Date;

  @ApiProperty({ description: 'End time' })
  endTime: Date;

  @ApiProperty({ description: 'Whether promotion is enabled' })
  isEnabled: boolean;

  // Type-specific configuration
  @ApiPropertyOptional({
    type: BundleDealConfig,
    description: 'Bundle deal config',
  })
  bundleDealConfig?: BundleDealConfig;

  @ApiPropertyOptional({
    type: OrderDiscountConfig,
    description: 'Order discount config',
  })
  orderDiscountConfig?: OrderDiscountConfig;

  @ApiPropertyOptional({
    type: ProductDiscountConfig,
    description: 'Product discount config',
  })
  productDiscountConfig?: ProductDiscountConfig;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Deleted timestamp (soft delete)' })
  deletedAt?: Date | null;
}

/**
 * Promotion with computed status (for responses)
 */
export class PromotionWithStatus extends Promotion {
  @ApiProperty({ enum: PromotionStatus, description: 'Computed status' })
  status: PromotionStatus;
}
