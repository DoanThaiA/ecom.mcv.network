import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  IsMongoId,
  ValidateIf,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ProductBannerPosition } from '../domain/product-banner-position.enum';

/**
 * DTO for updating a product banner
 */
export class UpdateProductBannerDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Banner name (for CMS identification)',
    example: 'Summer Sale Banner',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Banner image URL',
    example: 'https://cdn.example.com/banner.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    enum: ProductBannerPosition,
    enumName: 'ProductBannerPosition',
    description: 'Banner position (1 = TOP, 2 = BOTTOM)',
    example: ProductBannerPosition.TOP,
  })
  @IsOptional()
  @IsEnum(ProductBannerPosition)
  position?: ProductBannerPosition;

  @ApiPropertyOptional({
    type: Number,
    description: 'Aspect ratio for the banner. Pass null to remove.',
    example: 16 / 9,
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsNumber()
  ratio?: number | null;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Whether the banner is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    type: [String],
    description: 'Array of product IDs to replace current assignments',
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
