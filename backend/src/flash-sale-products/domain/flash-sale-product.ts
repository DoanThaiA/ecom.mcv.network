import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '../../combos/domain/discount-type.enum';
import { ProductStatus } from '../../products/domain/product-status.enum';

const idType = String;

/**
 * Flash sale product entity - minimal flash sale pricing + filter/sort fields
 * Stored in the flash_sale_products collection for efficient paginated queries
 * Note: This domain intentionally excludes populated product fields.
 */
export class FlashSaleProduct {
  @ApiProperty({ type: idType, description: 'Document ID' })
  id: string;

  @ApiProperty({ type: String, description: 'Flash sale ID' })
  flashSaleId: string;

  @ApiProperty({ type: String, description: 'Flash sale name' })
  flashSaleName: string;

  @ApiProperty({ type: String, description: 'Product ID (reference)' })
  productId: string;

  // --- Stored fields (used for filtering/sorting) ---

  @ApiProperty({ type: String, description: 'Product name' })
  name: string;

  @ApiProperty({ type: String, description: 'Product code/SKU' })
  code: string;

  @ApiPropertyOptional({ description: 'Product category' })
  category?: {
    id: string;
    name: string;
  } | null;

  @ApiProperty({
    enum: ProductStatus,
    description: 'Product status',
  })
  status: ProductStatus;

  @ApiPropertyOptional({ description: 'Total stock for sorting' })
  stock?: number;

  @ApiProperty({ type: Boolean, description: 'Hide product from shop' })
  hide: boolean;

  @ApiPropertyOptional({ description: 'Product images (stored for display)' })
  images?: {
    avatar?: string | null;
    others?: string[];
  };

  // --- Flash sale pricing fields ---

  @ApiProperty({ enum: DiscountType, description: 'Discount type' })
  discountType: DiscountType;

  @ApiProperty({ type: Number, description: 'Discount value' })
  discountValue: number;

  @ApiProperty({ type: Number, description: 'Original retail price' })
  originalPrice: number;

  @ApiProperty({
    type: Number,
    description:
      'Price after product discount (base for flash sale calculation)',
  })
  productDiscountPrice: number;

  @ApiProperty({ type: Number, description: 'Flash sale price' })
  flashSalePrice: number;

  @ApiProperty({ type: Number, description: 'Discount amount in currency' })
  discountAmount: number;

  @ApiProperty({ type: Number, description: 'Discount percentage' })
  discountPercent: number;

  @ApiProperty({ type: Number, description: 'Promotional quantity' })
  promotionalQuantity: number;

  @ApiProperty({ type: Number, description: 'Number sold' })
  soldCount: number;

  @ApiProperty({ type: Number, description: 'Remaining stock for flash sale' })
  remainingStock: number;

  @ApiProperty({ type: Number, description: 'Effective price for sorting' })
  effectivePrice: number;

  @ApiProperty({ type: Date, description: 'Flash sale end time' })
  endTime: Date;

  @ApiProperty({ type: Boolean, description: 'Whether enabled in flash sale' })
  isEnabled: boolean;

  @ApiProperty({ type: Number, description: 'Display order (0-based)' })
  order: number;

  @ApiPropertyOptional({ type: Date, nullable: true })
  deletedAt: Date | null;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}
