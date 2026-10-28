import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { ProductCategoryStatus } from './product-category-status.enum';
import { NhanhProductCategorySnapshot } from '../../nhanh/types/nhanh-snapshots';

const idType = String;

/**
 * ProductCategory domain entity
 * Platform-agnostic business model for product categories
 *
 * Data architecture:
 * - `snapshot`: Raw data from source (excluded from API responses)
 * - Other fields: Domain data derived from snapshot, controlled by our system
 */
export class ProductCategory {
  @ApiProperty({
    type: idType,
    description: 'Internal category ID',
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
  snapshot?: NhanhProductCategorySnapshot | Record<string, any> | null;

  @ApiProperty({
    type: String,
    description: 'ProductCategory code',
    example: 'CAT-001',
  })
  code: string;

  @ApiProperty({
    type: String,
    description: 'ProductCategory name',
    example: 'Electronics',
  })
  name: string;

  @ApiPropertyOptional({
    type: Object,
    description: 'Localized category name (vi, en)',
    example: { vi: 'Điện tử', en: 'Electronics' },
  })
  nameLocalization?: { vi?: string; en?: string } | null;

  @ApiPropertyOptional({
    type: String,
    description: 'SEO-friendly URL slug',
    example: 'electronics',
  })
  slug?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Parent category ID (internal)',
  })
  parentId?: string | null;

  @ApiPropertyOptional({
    type: Number,
    description: 'Display order',
    example: 1,
  })
  order?: number | null;

  @ApiPropertyOptional({
    type: String,
    description: 'ProductCategory image URL',
  })
  image?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'ProductCategory description/content',
  })
  content?: string | null;

  @ApiProperty({
    enum: ProductCategoryStatus,
    enumName: 'ProductCategoryStatus',
    description: 'ProductCategory status (1=Active, 2=Inactive)',
    example: ProductCategoryStatus.ACTIVE,
  })
  status: ProductCategoryStatus;

  @ApiProperty({
    type: Date,
    description: 'ProductCategory creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'ProductCategory last update timestamp',
  })
  updatedAt: Date;
}
