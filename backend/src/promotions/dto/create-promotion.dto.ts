import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsDateString,
  IsNotEmpty,
  MaxLength,
  ValidateNested,
  IsArray,
  IsNumber,
  Min,
  IsOptional,
  IsBoolean,
  ValidateIf,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PromotionType } from '../domain/promotion-type.enum';
import { BundleDealSubType } from '../domain/bundle-deal-sub-type.enum';
import { OrderDiscountSubType } from '../domain/order-discount-sub-type.enum';
import { DiscountType } from '../../combos/domain/discount-type.enum';
import { ValidateDiscountValue } from '../../utils/decorators/validate-discount-value.decorator';

/**
 * Transform proto numeric DiscountType to string enum
 * Proto: 1 = FIXED, 2 = PERCENTAGE
 * Backend: 'fixed', 'percentage'
 */
function transformDiscountType(value: unknown): DiscountType | unknown {
  if (value === 1 || value === 'DISCOUNT_TYPE_FIXED') {
    return DiscountType.FIXED;
  }
  if (value === 2 || value === 'DISCOUNT_TYPE_PERCENTAGE') {
    return DiscountType.PERCENTAGE;
  }
  return value;
}

// ==================== Bundle Deal DTOs ====================

export class CreateGiftProductDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  @IsNotEmpty()
  productId: string;
}

export class CreateRequiredProductDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  @IsNotEmpty()
  productId: string;
}

export class CreateBundleDealTierDto {
  @ApiProperty({ description: 'Minimum order value in VND' })
  @IsNumber()
  @Min(0)
  minOrderValue: number;

  @ApiProperty({ type: [CreateGiftProductDto], description: 'Gift products' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGiftProductDto)
  giftProducts: CreateGiftProductDto[];
}

export class CreateBundleDealConfigDto {
  @ApiProperty({ enum: BundleDealSubType, description: 'Sub-type' })
  @Type(() => Number)
  @IsEnum(BundleDealSubType)
  subType: BundleDealSubType;

  @ApiPropertyOptional({
    type: [CreateBundleDealTierDto],
    description: 'Tiers',
  })
  @ValidateIf((o) => o.subType === BundleDealSubType.BUY_TO_GET_GIFT)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBundleDealTierDto)
  tiers?: CreateBundleDealTierDto[];

  @ApiPropertyOptional({
    description: 'Required quantity (BUY_X_GET_Y)',
  })
  @ValidateIf((o) => o.subType === BundleDealSubType.BUY_X_GET_Y)
  @IsNumber()
  @Min(1)
  requiredQuantity?: number;

  @ApiPropertyOptional({
    type: [CreateRequiredProductDto],
    description: 'Required products (BUY_X_GET_Y)',
  })
  @ValidateIf((o) => o.subType === BundleDealSubType.BUY_X_GET_Y)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRequiredProductDto)
  requiredProducts?: CreateRequiredProductDto[];

  @ApiPropertyOptional({
    description: 'Gift quantity (BUY_X_GET_Y)',
  })
  @ValidateIf((o) => o.subType === BundleDealSubType.BUY_X_GET_Y)
  @IsNumber()
  @Min(1)
  giftQuantity?: number;

  @ApiPropertyOptional({
    type: [CreateGiftProductDto],
    description: 'Gift products (BUY_X_GET_Y)',
  })
  @ValidateIf((o) => o.subType === BundleDealSubType.BUY_X_GET_Y)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGiftProductDto)
  giftProducts?: CreateGiftProductDto[];

  @ApiPropertyOptional({
    description: 'Minimum order value to qualify (BUY_X_GET_Y)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderValue?: number;

  @ApiPropertyOptional({
    description: 'Maximum total gifts in this promotion (BUY_X_GET_Y)',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxGiftQuantity?: number;

  @ApiPropertyOptional({
    description: 'Cannot combine with other promotions',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  notApplicableWithOtherPromotions?: boolean;
}

// ==================== Order Discount DTOs ====================

export class CreateOrderDiscountConfigDto {
  @ApiProperty({
    enum: OrderDiscountSubType,
    description: 'Sub-type: auto-apply or promo code',
  })
  @Type(() => Number)
  @IsEnum(OrderDiscountSubType)
  subType: OrderDiscountSubType;

  @ApiPropertyOptional({
    description: 'Promo code (required if subType is PROMO_CODE)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  promoCode?: string;

  @ApiProperty({ enum: DiscountType, description: 'Discount type' })
  @Transform(({ value }) => transformDiscountType(value))
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ description: 'Discount value (VND or percentage)' })
  @IsNumber()
  @Min(0)
  @ValidateDiscountValue()
  discountValue: number;

  @ApiPropertyOptional({
    description: 'Max discount for percentage type (VND)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountValue?: number;

  @ApiProperty({ description: 'Minimum order value to qualify (VND)' })
  @IsNumber()
  @Min(0)
  minimumOrderValue: number;

  @ApiPropertyOptional({
    description: 'Cannot combine with other promotions',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  notApplicableWithOtherPromotions?: boolean;

  @ApiPropertyOptional({
    description: 'Single use per customer',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  singleUsePerCustomer?: boolean;

  @ApiPropertyOptional({ description: 'Total usage limit' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  totalUsageLimit?: number;
}

// ==================== Product Discount DTOs ====================

export class CreateProductDiscountProductDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    enum: DiscountType,
    description: 'Discount type for this product (fixed amount or percentage)',
  })
  @Transform(({ value }) => transformDiscountType(value))
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ description: 'Discount value for this product' })
  @IsNumber()
  @Min(0)
  @ValidateDiscountValue()
  discountValue: number;

  @ApiPropertyOptional({
    description: 'Whether this product is enabled in promotion',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

export class CreateProductDiscountConfigDto {
  @ApiProperty({
    type: [CreateProductDiscountProductDto],
    description: 'Products in promotion (each with its own discount)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductDiscountProductDto)
  products: CreateProductDiscountProductDto[];
}

// ==================== Main Create DTO ====================

export class CreatePromotionDto {
  @ApiProperty({ enum: PromotionType, description: 'Promotion type' })
  @Type(() => Number)
  @IsEnum(PromotionType)
  type: PromotionType;

  @ApiProperty({ description: 'Promotion name (max 100 chars)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Start time (ISO 8601)' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'End time (ISO 8601)' })
  @IsDateString()
  endTime: string;

  // Type-specific config
  @ApiPropertyOptional({ type: CreateBundleDealConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateBundleDealConfigDto)
  bundleDealConfig?: CreateBundleDealConfigDto;

  @ApiPropertyOptional({ type: CreateOrderDiscountConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateOrderDiscountConfigDto)
  orderDiscountConfig?: CreateOrderDiscountConfigDto;

  @ApiPropertyOptional({ type: CreateProductDiscountConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProductDiscountConfigDto)
  productDiscountConfig?: CreateProductDiscountConfigDto;
}
