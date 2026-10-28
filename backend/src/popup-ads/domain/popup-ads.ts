import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const idType = String;

/**
 * PopupAds domain entity
 * Represents an advertising popup displayed on the shop homepage
 */
export class PopupAds {
  @ApiProperty({
    type: idType,
    description: 'Internal popup ads ID',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Image URL (773x464px)',
    example: 'https://cdn.example.com/popup.jpg',
  })
  image: string;

  @ApiProperty({
    type: Date,
    description: 'Display start time',
  })
  startAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Display end time',
  })
  endAt: Date;

  @ApiProperty({
    type: String,
    description: 'Popup name',
    example: 'Summer Sale Popup',
  })
  name: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Optional click-through URL',
    example: 'https://example.com/promotion',
  })
  link?: string | null;

  @ApiProperty({
    type: Number,
    description: 'Display order (lower value = displayed first)',
    example: 1,
  })
  order: number;

  @ApiProperty({
    type: Boolean,
    description: 'Whether the popup ads is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    type: Date,
    description: 'Popup ads creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Popup ads last update timestamp',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    type: Date,
    description: 'Popup ads deletion timestamp (soft delete)',
  })
  deletedAt?: Date | null;
}
