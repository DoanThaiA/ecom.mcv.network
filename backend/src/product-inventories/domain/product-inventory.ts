import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { NhanhProductInventorySnapshot } from '../../nhanh/types/nhanh-snapshots';

const idType = String;

/**
 * Depot inventory information
 */
export class DepotProductInventory {
  @ApiProperty({
    type: String,
    description: 'Internal depot ID',
  })
  depotId: string;

  @ApiProperty({
    type: Number,
    description: 'Total remaining stock in depot',
    example: 100,
  })
  remain: number;

  @ApiProperty({
    type: Number,
    description: 'Available stock for sale',
    example: 95,
  })
  available: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Stock in shipping/transit',
    example: 5,
  })
  shipping?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Damaged stock',
    example: 0,
  })
  damaged?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Stock on hold/reserved',
    example: 0,
  })
  holding?: number;

  @ApiPropertyOptional({
    description: 'Warranty stock information',
  })
  warranty?: {
    remain?: number;
    holding?: number;
  };
}

/**
 * Product inventory domain entity
 * Tracks product inventories across multiple depots/warehouses
 *
 * Data architecture:
 * - `snapshot`: Raw data from source (excluded from API responses)
 * - Other fields: Domain data derived from snapshot, controlled by our system
 */
export class ProductInventory {
  @ApiProperty({
    type: idType,
    description: 'Internal inventory record ID',
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
    description: 'Internal product ID',
  })
  productId: string;

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
  snapshot?: NhanhProductInventorySnapshot | Record<string, any> | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Product barcode',
  })
  barcode?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Product name (for reference)',
  })
  productName?: string | null;

  @ApiPropertyOptional({
    description: 'Product image (from variant product)',
    example: {
      avatar: 'https://example.com/product.jpg',
      others: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
    },
  })
  image?: {
    avatar?: string | null;
    others?: string[];
  } | null;

  @ApiProperty({
    type: Number,
    description: 'Total remaining stock across all depots',
    example: 250,
  })
  totalRemain: number;

  @ApiProperty({
    type: Number,
    description: 'Total available stock for sale',
    example: 240,
  })
  totalAvailable: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Total stock in shipping',
  })
  totalShipping?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Total damaged stock',
  })
  totalDamaged?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Total stock on hold',
  })
  totalHolding?: number;

  @ApiPropertyOptional({
    description: 'Pricing information',
  })
  prices?: {
    retail?: number;
    wholesale?: number;
    import?: number;
    avgCost?: number;
  };

  @ApiProperty({
    type: [DepotProductInventory],
    description: 'Per-depot inventory breakdown',
  })
  depots: DepotProductInventory[];

  @ApiProperty({
    type: Date,
    description: 'Inventory creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Inventory last update timestamp',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    type: () => [ProductInventory],
    description:
      'Variant inventories (for parent products only, populated in singular GET endpoints)',
  })
  variantInventories?: ProductInventory[];
}
