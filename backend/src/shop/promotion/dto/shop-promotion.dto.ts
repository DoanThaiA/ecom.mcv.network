import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsMongoId,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';

/**
 * Represents a single selected cart item with its quantity
 */
export class SelectedCartItemDto {
  @ApiProperty({ type: String, example: '6985ac9a6f5c91e64468642e' })
  @IsString()
  productId: string;

  @ApiPropertyOptional({ type: String, example: '6985ac9a6f5c91e64468642f' })
  @IsString()
  @IsOptional()
  variantId?: string;

  @ApiProperty({ type: Number, example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

/**
 * DTO for checking bundle deal eligibility
 */
export class CheckBundleDealEligibilityDto {
  @ApiProperty({
    type: Number,
    description: 'Total value of selected items in cart (excluding gift items)',
    example: 500000,
  })
  @IsNumber()
  cartTotal: number;

  @ApiPropertyOptional({
    type: [SelectedCartItemDto],
    description:
      'Selected (ticked) cart items with quantity. When provided, BUY_X_GET_Y required quantity is counted only from these items.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectedCartItemDto)
  @IsOptional()
  selectedItems?: SelectedCartItemDto[];
}

/**
 * DTO for adding gift to cart
 */
export class AddGiftToCartDto {
  @ApiProperty({
    type: String,
    description: 'Promotion ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  @IsNotEmpty()
  promotionId: string;

  @ApiProperty({
    type: String,
    description: 'Tier ID (minOrderValue as string)',
    example: '500000',
  })
  @IsOptional()
  @IsString()
  tierId?: string;

  @ApiProperty({
    type: String,
    description: 'Gift product ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Variant ID (required if product has variants)',
    example: '507f1f77bcf86cd799439013',
  })
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  @IsOptional()
  variantId?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Gift quantity to add (default: 1)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;
}

/**
 * Represents a single gift selection in a batch set operation
 */
export class GiftSelectionItemDto {
  @ApiProperty({
    type: String,
    description: 'Gift product ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Variant ID (required if product has variants)',
    example: '507f1f77bcf86cd799439013',
  })
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  @IsOptional()
  variantId?: string;

  @ApiProperty({
    type: Number,
    description: 'Quantity of this gift to claim',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}

/**
 * DTO for setting BUY_X_GET_Y gifts in batch (replace-all approach)
 */
export class SetBuyXGetYGiftsDto {
  @ApiProperty({
    type: String,
    description: 'Promotion ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  @IsNotEmpty()
  promotionId: string;

  @ApiProperty({
    type: [GiftSelectionItemDto],
    description:
      'Array of gift selections. Empty array clears all gifts for this promotion.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GiftSelectionItemDto)
  gifts: GiftSelectionItemDto[];
}

/**
 * DTO for removing gift from cart
 */
export class RemoveGiftFromCartDto {
  @ApiProperty({
    type: String,
    description: 'Gift product ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Variant ID',
    example: '507f1f77bcf86cd799439013',
  })
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  @IsOptional()
  variantId?: string;
}
