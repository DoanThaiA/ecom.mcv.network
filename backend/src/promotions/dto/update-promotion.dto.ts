import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsBoolean,
  MaxLength,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CreateBundleDealConfigDto,
  CreateOrderDiscountConfigDto,
  CreateProductDiscountConfigDto,
} from './create-promotion.dto';

export class UpdatePromotionDto {
  @ApiPropertyOptional({ description: 'Promotion name (max 100 chars)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Start time (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({ description: 'End time (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ description: 'Enable/disable flag' })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  // Type-specific config (full replacement)
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
