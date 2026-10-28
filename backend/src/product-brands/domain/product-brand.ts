import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { ProductBrandStatus } from './product-brand-status.enum';
import { NhanhProductBrandSnapshot } from '../../nhanh/types/nhanh-snapshots';

const idType = String;

/**
 * Product ProductBrand domain entity
 * Represents a product brand in the system
 *
 * Data architecture:
 * - `snapshot`: Raw data from source (excluded from API responses)
 * - Other fields: Domain data derived from snapshot, controlled by our system
 */
export class ProductBrand {
  @ApiProperty({
    type: idType,
    description: 'Internal brand ID',
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
  snapshot?: NhanhProductBrandSnapshot | Record<string, any> | null;

  @ApiPropertyOptional({
    type: String,
    description: 'ProductBrand code',
    example: 'BRAND-001',
  })
  code: string | null;

  @ApiProperty({
    type: String,
    description: 'ProductBrand name',
    example: 'Apple',
  })
  name: string;

  @ApiProperty({
    enum: ProductBrandStatus,
    enumName: 'ProductBrandStatus',
    description: 'ProductBrand status',
    example: ProductBrandStatus.ACTIVE,
  })
  status: ProductBrandStatus;

  @ApiPropertyOptional({
    type: String,
    description: 'Parent brand ID',
  })
  parentId: string | null;

  @ApiProperty({
    type: Date,
    description: 'ProductBrand creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'ProductBrand last update timestamp',
  })
  updatedAt: Date;
}
