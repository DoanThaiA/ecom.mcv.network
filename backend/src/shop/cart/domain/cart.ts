import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '../../../combos/domain/discount-type.enum';

const idType = String;

/**
 * Cart item - represents a product in the cart
 */
export class CartItem {
  @ApiProperty({
    type: idType,
    description: 'Product ID',
  })
  productId: string;

  @ApiPropertyOptional({
    type: idType,
    description: 'Variant ID (if applicable)',
  })
  variantId?: string | null;

  @ApiProperty({
    type: String,
    description: 'Product code/SKU',
  })
  code: string;

  @ApiProperty({
    type: String,
    description: 'Product name',
  })
  name: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Product image URL',
  })
  image?: string | null;

  @ApiProperty({
    type: Number,
    description: 'Unit price at time of adding to cart',
  })
  price: number;

  @ApiProperty({
    type: Number,
    description: 'Quantity',
    minimum: 1,
  })
  quantity: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Combo instance ID (UUID) if item is part of a combo',
  })
  comboInstanceId?: string | null;

  @ApiPropertyOptional({
    description: 'Product attributes (for variants)',
    example: [
      { id: '1', name: 'Color', value: 'Red' },
      { id: '2', name: 'Size', value: 'M' },
    ],
  })
  attributes?: Array<{ id?: number | string; name: string; value: string }>;

  // Gift item fields for "Mua để nhận quà" promotion
  @ApiPropertyOptional({
    type: Boolean,
    description: 'Whether this item is a gift from promotion',
    default: false,
  })
  isGift?: boolean;

  @ApiPropertyOptional({
    type: idType,
    description: 'Promotion ID this gift belongs to',
  })
  promotionId?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Promotion tier ID this gift belongs to',
  })
  promotionTierId?: string | null;

  @ApiPropertyOptional({
    type: Number,
    description: 'Original price for display (strikethrough)',
  })
  originalPrice?: number | null;
}

/**
 * Cart combo instance - tracks a combo added to cart
 */
export class CartComboInstance {
  @ApiProperty({
    type: String,
    description: 'Unique instance ID (UUID)',
  })
  comboInstanceId: string;

  @ApiProperty({
    type: String,
    description: 'Combo ID reference',
  })
  comboId: string;

  @ApiProperty({
    type: String,
    description: 'Combo name snapshot',
  })
  comboName: string;

  @ApiProperty({
    enum: DiscountType,
    description: 'Discount type',
  })
  discountType: DiscountType;

  @ApiProperty({
    type: Number,
    description: 'Discount value',
  })
  discountValue: number;

  @ApiProperty({
    type: Number,
    description: 'Original price of combo',
  })
  originalPrice: number;

  @ApiProperty({
    type: Number,
    description: 'Calculated discount amount',
  })
  discountAmount: number;
}

/**
 * Cart domain entity
 */
export class Cart {
  @ApiProperty({
    type: idType,
    description: 'Cart ID',
  })
  id: string;

  @ApiPropertyOptional({
    type: idType,
    description: 'User ID (null for guest carts)',
  })
  userId?: string | null;

  @ApiProperty({
    type: String,
    description: 'Session ID for guest identification',
  })
  sessionId: string;

  @ApiProperty({
    type: [CartItem],
    description: 'Cart items',
  })
  items: CartItem[];

  @ApiPropertyOptional({
    type: [CartComboInstance],
    description: 'Combo instances in cart',
  })
  comboInstances?: CartComboInstance[] | null;

  @ApiProperty({
    type: Date,
    description: 'Cart creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Cart last update timestamp',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    type: Date,
    description: 'Cart expiration timestamp',
  })
  expiresAt?: Date | null;
}
