import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '../../../combos/domain/discount-type.enum';

/**
 * A single variant attribute, e.g. { name: 'Màu sắc', value: 'Đỏ' }
 */
export class ShopComboVariantAttributeDto {
  @ApiProperty({ type: String, description: 'Attribute name' })
  name: string;

  @ApiProperty({ type: String, description: 'Attribute value' })
  value: string;
}

/**
 * Variant option for combo item
 */
export class ShopComboVariantDto {
  @ApiProperty({ type: String, description: 'Variant ID' })
  id: string;

  @ApiProperty({ type: String, description: 'Variant name' })
  name: string;

  @ApiProperty({ type: Number, description: 'Variant price' })
  price: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Variant SKU code, e.g. "AH023-Đỏ-M"',
  })
  code?: string | null;

  @ApiPropertyOptional({
    type: [ShopComboVariantAttributeDto],
    description:
      'Variant attributes (color, size) used to build option pickers',
  })
  attributes?: ShopComboVariantAttributeDto[];

  @ApiPropertyOptional({
    type: Number,
    description:
      'Sellable stock, so the client can strike out sold-out options',
  })
  available?: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Variant photo, so the card can follow the selected color',
  })
  image?: string | null;
}

/**
 * Combo item response DTO with product details
 */
export class ShopComboItemResponseDto {
  @ApiProperty({ type: String, description: 'Product ID' })
  productId: string;

  @ApiProperty({ type: Number, description: 'Quantity in combo' })
  quantity: number;

  @ApiPropertyOptional({ type: String, description: 'Product name' })
  productName?: string | null;

  @ApiPropertyOptional({ type: String, description: 'Product image URL' })
  productImage?: string | null;

  @ApiPropertyOptional({ type: Number, description: 'Product retail price' })
  productPrice?: number | null;

  @ApiPropertyOptional({
    type: String,
    description:
      'Parent product code. Variant codes are prefixed with it, which lets the ' +
      'client derive each variant option pair from the SKU code.',
  })
  productCode?: string | null;

  @ApiProperty({
    type: Boolean,
    description:
      'Whether this is a parent product (requires variant selection)',
  })
  isParentProduct: boolean;

  @ApiPropertyOptional({
    type: Number,
    description:
      'Product stock. Used when the item has no variant to pick, so the product itself is the SKU',
  })
  available?: number;

  @ApiPropertyOptional({
    type: [ShopComboVariantDto],
    description: 'Available variants for selection (only for parent products)',
  })
  variants?: ShopComboVariantDto[];
}

/**
 * Shop combo response DTO
 */
export class ShopComboResponseDto {
  @ApiProperty({ type: String, description: 'Combo ID' })
  id: string;

  @ApiProperty({ type: String, description: 'Combo name' })
  name: string;

  @ApiPropertyOptional({
    type: Object,
    description: 'Localized combo name (vi, en)',
    example: { vi: 'Gói mùa hè', en: 'Summer Bundle' },
  })
  nameLocalization?: { vi?: string; en?: string } | null;

  @ApiPropertyOptional({ type: String, description: 'Combo description' })
  description?: string | null;

  @ApiPropertyOptional({ type: String, description: 'Combo image URL' })
  image?: string | null;

  @ApiProperty({
    type: [ShopComboItemResponseDto],
    description: 'Combo items with product details',
  })
  items: ShopComboItemResponseDto[];

  @ApiProperty({ enum: DiscountType, description: 'Discount type' })
  discountType: DiscountType;

  @ApiProperty({ type: Number, description: 'Discount value' })
  discountValue: number;

  @ApiProperty({ type: Number, description: 'Original total price' })
  originalPrice: number;

  @ApiProperty({ type: Number, description: 'Final price after discount' })
  finalPrice: number;

  @ApiProperty({ type: Number, description: 'Discount amount saved' })
  discountAmount: number;

  @ApiPropertyOptional({ type: Date, description: 'Valid from date' })
  validFrom?: Date | null;

  @ApiPropertyOptional({ type: Date, description: 'Valid to date' })
  validTo?: Date | null;
}

/**
 * Shop combo list response DTO
 */
export class ShopComboListResponseDto {
  @ApiProperty({
    type: [ShopComboResponseDto],
    description: 'List of available combos',
  })
  combos: ShopComboResponseDto[];

  @ApiProperty({ type: Number, description: 'Total number of combos' })
  total: number;
}
