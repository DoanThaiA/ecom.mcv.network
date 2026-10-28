import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const idType = String;

/**
 * Flash sale domain entity
 * Represents a time-limited sale campaign with discounted products
 * Products are stored in the separate flash_sale_products collection
 */
export class FlashSale {
  @ApiProperty({
    type: idType,
    description: 'Internal flash sale ID',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Flash sale campaign name',
    example: 'Flash Sale Tháng 12',
  })
  name: string;

  @ApiProperty({
    type: Date,
    description: 'Flash sale start time',
  })
  startTime: Date;

  @ApiProperty({
    type: Date,
    description: 'Flash sale end time',
  })
  endTime: Date;

  @ApiProperty({
    type: Boolean,
    description: 'Whether the flash sale is enabled',
    example: true,
  })
  isEnabled: boolean;

  @ApiProperty({
    type: Date,
    description: 'Flash sale creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Flash sale last update timestamp',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    type: Date,
    description: 'Flash sale deletion timestamp (soft delete)',
  })
  deletedAt?: Date | null;
}
