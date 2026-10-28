import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { NhanhDepotSnapshot } from '../../nhanh/types/nhanh-snapshots';

const idType = String;

/**
 * Depot domain entity
 * Represents a warehouse/depot in the system, synced from Nhanh.vn
 *
 * Data architecture:
 * - `snapshot`: Raw data from source (excluded from API responses)
 * - Other fields: Domain data derived from snapshot, controlled by our system
 */
export class Depot {
  @ApiProperty({
    type: idType,
    description: 'Internal depot ID',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Business ID from the source system',
    example: '110668',
  })
  businessId: string;

  @ApiProperty({
    type: String,
    enum: ['nhanh', 'shopify'],
    description: 'Data source origin',
    example: 'nhanh',
  })
  source: 'nhanh' | 'shopify';

  /**
   * Raw snapshot from the source system
   * Excluded from serialization - not sent to clients
   */
  @Exclude()
  snapshot?: NhanhDepotSnapshot | Record<string, any> | null;

  @ApiProperty({
    type: String,
    description: 'Depot name',
    example: 'Main Warehouse',
  })
  name: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Depot phone number',
    example: '0901234567',
  })
  phone?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Depot street address',
    example: '123 Nguyen Hue',
  })
  address?: string | null;

  @ApiPropertyOptional({
    type: Number,
    description: 'Nhanh city ID for shipping calculation',
  })
  cityId?: number | null;

  @ApiPropertyOptional({
    type: Number,
    description: 'Nhanh district ID for shipping calculation',
  })
  districtId?: number | null;

  @ApiPropertyOptional({
    type: Number,
    description: 'Nhanh ward ID for shipping calculation',
  })
  wardId?: number | null;

  @ApiProperty({
    type: Date,
    description: 'Depot creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Depot last update timestamp',
  })
  updatedAt: Date;
}
