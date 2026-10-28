import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '../../combos/domain/discount-type.enum';

const idType = String;

/**
 * Promotion product entity - discount pricing + filter/sort fields
 * Stored in the promotion_products collection for efficient paginated queries
 */
export class PromotionProduct {
  @ApiProperty({ type: idType, description: 'Document ID' })
  id: string;

  @ApiProperty({ type: String, description: 'Promotion ID' })
  promotionId: string;

  @ApiProperty({ type: String, description: 'Promotion name' })
  promotionName: string;

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

  @ApiPropertyOptional({ description: 'Total stock for sorting' })
  stock?: number;

  @ApiPropertyOptional({ description: 'Product images (stored for display)' })
  images?: {
    avatar?: string | null;
    others?: string[];
  };

  // --- Discount pricing fields ---

  @ApiProperty({ enum: DiscountType, description: 'Discount type' })
  discountType: DiscountType;

  @ApiProperty({ type: Number, description: 'Discount value' })
  discountValue: number;

  @ApiProperty({ type: Number, description: 'Original retail price' })
  originalPrice: number;

  @ApiProperty({ type: Number, description: 'Price after discount' })
  discountedPrice: number;

  @ApiProperty({ type: Number, description: 'Discount amount in currency' })
  discountAmount: number;

  @ApiProperty({ type: Number, description: 'Discount percentage' })
  discountPercent: number;

  @ApiProperty({ type: Number, description: 'Effective price for sorting' })
  effectivePrice: number;

  @ApiProperty({ type: Number, description: 'Number sold' })
  soldCount: number;

  @ApiProperty({ type: Boolean, description: 'Whether enabled in promotion' })
  isEnabled: boolean;

  @ApiProperty({ type: Date, description: 'Promotion end time' })
  endTime: Date;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}
