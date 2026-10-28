import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { LocalizationDto } from '../../common/dto/localization.dto';
import { ProductBadge } from '../domain/product-badge.enum';

/**
 * DTO for product details sub-fields
 */
export class ProductDetailsDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Material composition',
    example: 'Cotton 100%',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  material?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Product style',
    example: 'Casual',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  style?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Key highlights/features',
    example: 'Soft and breathable fabric',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  highlights?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Suitable for occasions/usage',
    example: 'Everyday wear',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  suitableFor?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Care and maintenance instructions',
    example: 'Machine wash cold, tumble dry low',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  careInstructions?: string;
}

/**
 * DTO for product details localization
 */
export class DetailsLocalizationDto {
  @ApiPropertyOptional({
    type: LocalizationDto,
    description: 'Localized material',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizationDto)
  material?: LocalizationDto;

  @ApiPropertyOptional({
    type: LocalizationDto,
    description: 'Localized style',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizationDto)
  style?: LocalizationDto;

  @ApiPropertyOptional({
    type: LocalizationDto,
    description: 'Localized highlights',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizationDto)
  highlights?: LocalizationDto;

  @ApiPropertyOptional({
    type: LocalizationDto,
    description: 'Localized suitable for',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizationDto)
  suitableFor?: LocalizationDto;

  @ApiPropertyOptional({
    type: LocalizationDto,
    description: 'Localized care instructions',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizationDto)
  careInstructions?: LocalizationDto;
}

/** DTO for ordered product-description media URLs. */
export class ProductDescriptionMediaDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(2048, { each: true })
  topImages?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(2048, { each: true })
  sliderImages?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(2048, { each: true })
  bottomImages?: string[];
}

/**
 * DTO for updating product details
 */
export class UpdateProductDetailsDto {
  @ApiPropertyOptional({ type: ProductDescriptionMediaDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductDescriptionMediaDto)
  descriptionMedia?: ProductDescriptionMediaDto;
  @ApiPropertyOptional({
    type: LocalizationDto,
    description: 'Multilingual product name',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizationDto)
  nameLocalization?: LocalizationDto;

  @ApiPropertyOptional({
    type: String,
    description: 'Product description (short)',
    example: 'A high-quality cotton t-shirt',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({
    type: LocalizationDto,
    description: 'Multilingual product description',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizationDto)
  descriptionLocalization?: LocalizationDto;

  @ApiPropertyOptional({
    type: String,
    description: 'Product content (detailed HTML content)',
    example: '<p>Detailed product information...</p>',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50000)
  content?: string;

  @ApiPropertyOptional({
    type: ProductDetailsDto,
    description: 'Product details to update',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductDetailsDto)
  details?: ProductDetailsDto;

  @ApiPropertyOptional({
    type: DetailsLocalizationDto,
    description: 'Multilingual product details',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DetailsLocalizationDto)
  detailsLocalization?: DetailsLocalizationDto;

  @ApiPropertyOptional({
    enum: ProductBadge,
    enumName: 'ProductBadge',
    description: 'Product badge for promotional display (null to remove)',
    example: ProductBadge.NEW,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(ProductBadge)
  badge?: ProductBadge | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Size guide image URL (null to remove)',
    example: 'https://cdn.example.com/size-guide.jpg',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  sizeGuide?: string | null;
}
