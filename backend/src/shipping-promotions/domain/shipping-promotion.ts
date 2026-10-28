import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShippingPromotionType } from './shipping-promotion-type.enum';
import { FreeshippingConfig } from './freeshipping-config';
import { ShippingDiscountConfig } from './shipping-discount-config';

const idType = String;

/**
 * Shipping promotion domain entity
 */
export class ShippingPromotion {
  @ApiProperty({ type: idType, description: 'Shipping promotion ID' })
  id: string;

  @ApiProperty({
    enum: ShippingPromotionType,
    description: 'Promotion type',
  })
  type: ShippingPromotionType;

  @ApiProperty({ type: String, description: 'Promotion name' })
  name: string;

  @ApiProperty({ type: Date, description: 'Start time' })
  startTime: Date;

  @ApiProperty({ type: Date, description: 'End time' })
  endTime: Date;

  @ApiProperty({ type: Boolean, description: 'Whether enabled' })
  isEnabled: boolean;

  @ApiPropertyOptional({
    type: () => FreeshippingConfig,
    description: 'Freeship configuration (when type=freeship)',
  })
  freeshippingConfig?: FreeshippingConfig | null;

  @ApiPropertyOptional({
    type: () => ShippingDiscountConfig,
    description:
      'Shipping discount configuration (when type=shipping_discount)',
  })
  shippingDiscountConfig?: ShippingDiscountConfig | null;

  @ApiProperty({ type: Date, description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ type: Date, description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({ type: Date, description: 'Deletion timestamp' })
  deletedAt?: Date | null;
}
