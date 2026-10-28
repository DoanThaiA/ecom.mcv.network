import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  IsMongoId,
  IsNotEmpty,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ProductBannerPosition } from '../domain/product-banner-position.enum';

/**
 * DTO for creating a new product banner
 */
export class CreateProductBannerDto {
  @ApiProperty({
    type: String,
    description: 'Banner name (for CMS identification)',
    example: 'Summer Sale Banner',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: String,
    description: 'Banner image URL',
    example: 'https://cdn.example.com/banner.jpg',
  })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiPropertyOptional({
    enum: ProductBannerPosition,
    enumName: 'ProductBannerPosition',
    description: 'Banner position (1 = TOP, 2 = BOTTOM). Default: BOTTOM',
    example: ProductBannerPosition.BOTTOM,
    default: ProductBannerPosition.BOTTOM,
  })
  @IsOptional()
  @IsEnum(ProductBannerPosition)
  position?: ProductBannerPosition;

  @ApiPropertyOptional({
    type: Number,
    description: 'Optional aspect ratio for the banner',
    example: 16 / 9,
  })
  @IsOptional()
  @IsNumber()
  ratio?: number;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Whether the banner is active (default: true)',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    type: [String],
    description: 'Array of product IDs to assign this banner to',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({
    each: true,
    message: i18nValidationMessage('validation.isMongoId'),
  })
  productIds?: string[];
}
