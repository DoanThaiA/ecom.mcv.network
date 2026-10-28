import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
  IsMongoId,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';

/**
 * DTO for adding item to cart
 */
export class AddToCartDto {
  @ApiProperty({
    type: String,
    description: 'Product ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Variant ID (if applicable)',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  @IsOptional()
  variantId?: string;

  @ApiProperty({
    type: Number,
    description: 'Quantity to add',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}

/**
 * DTO for combo item variant selection
 */
export class ComboItemVariantDto {
  @ApiProperty({
    type: String,
    description: 'Product ID (parent product from combo)',
  })
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Selected variant ID (if product has variants)',
  })
  @ValidateIf((o) => o.variantId !== '' && o.variantId != null)
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  variantId?: string;
}

/**
 * DTO for adding combo to cart
 */
export class AddComboToCartDto {
  @ApiProperty({
    type: String,
    description: 'Combo ID',
  })
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  @IsNotEmpty()
  comboId: string;

  @ApiProperty({
    type: [ComboItemVariantDto],
    description: 'Selected variants for each product in combo',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => ComboItemVariantDto)
  items: ComboItemVariantDto[];
}

/**
 * DTO for merging guest cart to authenticated user
 */
export class MergeGuestCartDto {
  @ApiProperty({
    type: String,
    description: 'Guest session ID to merge from',
    example: 'guest-session-uuid',
  })
  @IsString()
  @IsNotEmpty()
  guestSessionId: string;
}

/**
 * DTO for updating cart item quantity
 */
export class UpdateCartItemDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Variant ID (if applicable)',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  @IsOptional()
  variantId?: string;

  @ApiPropertyOptional({
    type: String,
    description:
      'Combo instance ID to target a specific combo item. If not provided, standalone items are prioritized.',
    example: 'uuid-v4',
  })
  @IsString()
  @IsOptional()
  comboInstanceId?: string;

  @ApiProperty({
    type: Number,
    description: 'New quantity',
    minimum: 1,
    example: 2,
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}

/**
 * DTO for removing item from cart
 */
export class RemoveFromCartDto {
  @ApiProperty({
    type: String,
    description: 'Product ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Variant ID (if applicable)',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  @IsOptional()
  variantId?: string;
}

/**
 * Flash sale info for cart item
 */
export class CartItemFlashSaleInfoDto {
  @ApiProperty({ type: String, description: 'Flash sale ID' })
  flashSaleId: string;

  @ApiProperty({ type: Number, description: 'Original retail price' })
  originalPrice: number;

  @ApiProperty({ type: Number, description: 'Flash sale price after discount' })
  flashSalePrice: number;

  @ApiProperty({
    type: Number,
    description: 'Remaining units at flash sale price',
  })
  remainingStock: number;
}

/**
 * Product discount info for cart item (CTKM auto-apply, no min order)
 */
export class CartItemProductDiscountInfoDto {
  @ApiProperty({ type: String, description: 'Promotion ID' })
  promotionId: string;

  @ApiProperty({ type: String, description: 'Promotion name' })
  promotionName: string;

  @ApiProperty({ type: Number, description: 'Original retail price' })
  originalPrice: number;

  @ApiProperty({
    type: Number,
    description: 'Discounted price after promotion',
  })
  discountedPrice: number;

  @ApiProperty({
    type: Number,
    description: 'Discount percentage for display',
  })
  discountPercent: number;
}

/**
 * Cart item response DTO
 */
export class CartItemResponseDto {
  @ApiProperty({ type: String })
  productId: string;

  @ApiPropertyOptional({ type: String })
  variantId?: string | null;

  @ApiProperty({ type: String })
  code: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiPropertyOptional({ type: String })
  image?: string | null;

  @ApiProperty({ type: Number, description: 'Original retail price' })
  price: number;

  @ApiProperty({
    type: Number,
    description:
      'Effective price (flash sale price if applicable, otherwise original)',
  })
  effectivePrice: number;

  @ApiProperty({ type: Number })
  quantity: number;

  @ApiProperty({
    type: Number,
    description: 'Line item subtotal (effectivePrice * quantity)',
  })
  subtotal: number;

  @ApiPropertyOptional({
    type: CartItemFlashSaleInfoDto,
    description: 'Flash sale info if item has active flash sale',
  })
  flashSale?: CartItemFlashSaleInfoDto | null;

  @ApiPropertyOptional({
    type: CartItemProductDiscountInfoDto,
    description: 'Product discount info if item has active CTKM promotion',
  })
  productDiscount?: CartItemProductDiscountInfoDto | null;

  @ApiPropertyOptional({
    description: 'Product attributes (for variants)',
    example: [
      { id: '1', name: 'Color', value: 'Red' },
      { id: '2', name: 'Size', value: 'M' },
    ],
  })
  attributes?: Array<{ id?: number | string; name: string; value: string }>;

  @ApiPropertyOptional({
    type: String,
    description: 'Combo instance ID (if item is part of a combo)',
  })
  comboInstanceId?: string | null;

  // Gift item fields for "Mua để nhận quà" promotion
  @ApiPropertyOptional({
    type: Boolean,
    description: 'Whether this item is a gift from promotion',
    default: false,
  })
  isGift?: boolean;

  @ApiPropertyOptional({
    type: String,
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
    description: 'Original price for display (strikethrough) for gift items',
  })
  originalPrice?: number | null;
}

/**
 * Cart combo instance response DTO
 */
export class CartComboInstanceResponseDto {
  @ApiProperty({ type: String })
  comboInstanceId: string;

  @ApiProperty({ type: String })
  comboId: string;

  @ApiProperty({ type: String })
  comboName: string;

  @ApiProperty({ type: Number })
  originalPrice: number;

  @ApiProperty({ type: Number })
  discountAmount: number;

  @ApiProperty({ type: Number })
  finalPrice: number;

  @ApiProperty({ type: Number, description: 'Number of items in this combo' })
  itemCount: number;
}

/**
 * Cart response DTO
 */
export class CartResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: [CartItemResponseDto] })
  items: CartItemResponseDto[];

  @ApiProperty({ type: [CartComboInstanceResponseDto] })
  comboInstances: CartComboInstanceResponseDto[];

  @ApiProperty({ type: Number, description: 'Total number of items in cart' })
  itemCount: number;

  @ApiProperty({
    type: Number,
    description: 'Cart subtotal (sum of effectivePrice * quantity)',
  })
  subtotal: number;

  @ApiProperty({ type: Number, description: 'Total combo discount amount' })
  comboDiscount: number;

  @ApiProperty({
    type: Number,
    description: 'Total flash sale discount amount',
  })
  flashSaleDiscount: number;

  @ApiProperty({
    type: Number,
    description: 'Total product discount (CTKM) amount',
  })
  productDiscountTotal: number;

  @ApiProperty({ type: Number, description: 'Cart total after all discounts' })
  total: number;
}
