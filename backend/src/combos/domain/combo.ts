import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ComboStatus } from './combo-status.enum';
import { DiscountType } from './discount-type.enum';

const idType = String;

/**
 * Combo item - product reference with quantity
 */
export class ComboItem {
  @ApiProperty({
    type: String,
    description: 'Product ID (parent product)',
  })
  productId: string;

  @ApiProperty({
    type: Number,
    description: 'Required quantity in combo',
    minimum: 1,
  })
  quantity: number;
}

/**
 * Combo domain entity
 * Represents a product bundle with discount
 */
export class Combo {
  @ApiProperty({
    type: idType,
    description: 'Internal combo ID',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Combo name',
    example: 'Summer Bundle',
  })
  name: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Combo description',
  })
  description?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Combo image URL',
  })
  image?: string | null;

  @ApiProperty({
    type: [ComboItem],
    description: 'Products in the combo (max 5)',
  })
  items: ComboItem[];

  @ApiProperty({
    enum: DiscountType,
    enumName: 'DiscountType',
    description: 'Type of discount',
    example: DiscountType.FIXED,
  })
  discountType: DiscountType;

  @ApiProperty({
    type: Number,
    description:
      'Discount value (VND for fixed, percentage for percentage type)',
    example: 100000,
  })
  discountValue: number;

  @ApiProperty({
    type: Number,
    description: 'Original price (sum of products retail prices * quantities)',
    example: 500000,
  })
  originalPrice: number;

  @ApiProperty({
    enum: ComboStatus,
    enumName: 'ComboStatus',
    description: 'Combo status',
    example: ComboStatus.ACTIVE,
  })
  status: ComboStatus;

  @ApiPropertyOptional({
    type: Date,
    description: 'Combo validity start date',
  })
  validFrom?: Date | null;

  @ApiPropertyOptional({
    type: Date,
    description: 'Combo validity end date',
  })
  validTo?: Date | null;

  @ApiProperty({
    type: Date,
    description: 'Combo creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Combo last update timestamp',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    type: Date,
    description: 'Combo deletion timestamp (soft delete)',
  })
  deletedAt?: Date | null;

  @ApiPropertyOptional({
    type: Object,
    description: 'Localized combo name (vi, en)',
    example: { vi: 'Gói mùa hè', en: 'Summer Bundle' },
  })
  nameLocalization?: { vi?: string; en?: string } | null;
}
