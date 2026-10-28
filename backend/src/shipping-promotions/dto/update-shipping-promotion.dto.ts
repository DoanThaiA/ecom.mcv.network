import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  FreeshippingConfigDto,
  ShippingDiscountConfigDto,
} from './create-shipping-promotion.dto';

/**
 * DTO for updating a shipping promotion
 */
export class UpdateShippingPromotionDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Promotion name',
    example: 'Free shipping for orders over 500K',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Start time (ISO 8601)',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'End time (ISO 8601)',
    example: '2026-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Whether the promotion is enabled',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({
    type: FreeshippingConfigDto,
    description: 'Freeship configuration (when type=freeship)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FreeshippingConfigDto)
  freeshippingConfig?: FreeshippingConfigDto;

  @ApiPropertyOptional({
    type: ShippingDiscountConfigDto,
    description:
      'Shipping discount configuration (when type=shipping_discount)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingDiscountConfigDto)
  shippingDiscountConfig?: ShippingDiscountConfigDto;
}
