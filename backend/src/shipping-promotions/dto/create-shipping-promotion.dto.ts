import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsEnum,
  IsNumber,
  IsArray,
  ValidateNested,
  ValidateIf,
  IsNotEmpty,
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ShippingPromotionType } from '../domain/shipping-promotion-type.enum';
import { DiscountType } from '../../combos/domain/discount-type.enum';
import { ValidateDiscountValue } from '../../utils/decorators/validate-discount-value.decorator';

/**
 * DTO for freeshipping config
 */
export class FreeshippingConfigDto {
  @ApiProperty({
    type: Number,
    description: 'Minimum order subtotal for free shipping',
    example: 500000,
  })
  @IsNumber()
  @Min(0)
  minimumOrderValue: number;
}

/**
 * DTO for a single shipping discount tier
 */
export class ShippingDiscountTierDto {
  @ApiProperty({
    type: Number,
    description: 'Minimum order subtotal for this tier',
    example: 300000,
  })
  @IsNumber()
  @Min(0)
  minimumOrderValue: number;

  @ApiProperty({
    enum: DiscountType,
    description: 'Discount type (fixed amount or percentage)',
    default: DiscountType.FIXED,
  })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({
    type: Number,
    description:
      'Discount value (amount in VND for fixed, percentage for percentage)',
    example: 20000,
  })
  @IsNumber()
  @Min(0)
  @ValidateDiscountValue()
  discountValue: number;
}

/**
 * DTO for shipping discount config
 */
export class ShippingDiscountConfigDto {
  @ApiProperty({
    type: [ShippingDiscountTierDto],
    description: 'Discount tiers sorted by minimumOrderValue ascending',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ShippingDiscountTierDto)
  tiers: ShippingDiscountTierDto[];
}

/**
 * DTO for creating a new shipping promotion
 */
export class CreateShippingPromotionDto {
  @ApiProperty({
    enum: ShippingPromotionType,
    description: 'Promotion type',
    example: ShippingPromotionType.FREESHIP,
  })
  @IsEnum(ShippingPromotionType)
  type: ShippingPromotionType;

  @ApiProperty({
    type: String,
    description: 'Promotion name',
    example: 'Free shipping for orders over 500K',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Start time (ISO 8601)',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsDateString()
  startTime: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'End time (ISO 8601)',
    example: '2026-12-31T23:59:59.000Z',
  })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({
    type: FreeshippingConfigDto,
    description: 'Freeship configuration (required when type=freeship)',
  })
  @ValidateIf((o) => o.type === ShippingPromotionType.FREESHIP)
  @ValidateNested()
  @Type(() => FreeshippingConfigDto)
  freeshippingConfig?: FreeshippingConfigDto;

  @ApiPropertyOptional({
    type: ShippingDiscountConfigDto,
    description:
      'Shipping discount configuration (required when type=shipping_discount)',
  })
  @ValidateIf((o) => o.type === ShippingPromotionType.SHIPPING_DISCOUNT)
  @ValidateNested()
  @Type(() => ShippingDiscountConfigDto)
  shippingDiscountConfig?: ShippingDiscountConfigDto;
}
