import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '../../combos/domain/discount-type.enum';

/**
 * Import session row entity - a single validated product row from an Excel import
 */
export class ImportSessionRow {
  @ApiProperty({ type: String, description: 'Document ID' })
  id: string;

  @ApiProperty({ type: String, description: 'Import session ID' })
  sessionId: string;

  @ApiProperty({ type: Number, description: 'Row number in Excel (1-based)' })
  rowNumber: number;

  @ApiProperty({ type: String, description: 'Product ID (resolved from DB)' })
  productId: string;

  @ApiProperty({ type: String, description: 'Product code from Excel' })
  code: string;

  @ApiProperty({ type: String, description: 'Product name from Excel' })
  name: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Actual product name from DB',
  })
  actualName?: string;

  @ApiPropertyOptional({ type: String, description: 'Product avatar image' })
  image?: string;

  @ApiProperty({ type: Number, description: 'Original retail price' })
  originalPrice: number;

  @ApiProperty({ enum: DiscountType, description: 'Discount type' })
  discountType: DiscountType;

  @ApiProperty({ type: Number, description: 'Discount value' })
  discountValue: number;

  @ApiProperty({ type: Number, description: 'Calculated flash sale price' })
  flashSalePrice: number;

  @ApiProperty({ type: Number, description: 'Promotional quantity' })
  promotionalQuantity: number;

  @ApiProperty({ type: Number, description: 'Available stock' })
  stock: number;

  @ApiPropertyOptional({
    type: Number,
    description:
      'Commission rate percent (only for affiliate_product_commission imports)',
  })
  commissionRate?: number;

  @ApiProperty({ type: Boolean, description: 'Whether the row is valid' })
  isValid: boolean;

  @ApiProperty({
    type: [String],
    description: 'Validation error codes',
  })
  errors: string[];

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}
