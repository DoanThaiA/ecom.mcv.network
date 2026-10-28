import { ApiProperty } from '@nestjs/swagger';

/**
 * Configuration for freeship promotion type
 */
export class FreeshippingConfig {
  @ApiProperty({
    type: Number,
    description: 'Minimum order subtotal for free shipping',
    example: 500000,
  })
  minimumOrderValue: number;
}
