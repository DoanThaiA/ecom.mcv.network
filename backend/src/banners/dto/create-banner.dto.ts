import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsObject,
  ValidateNested,
  Min,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BannerPosition } from '../model/banner-position.enum';
import { BannerMediaType } from '../model/banner-media-type.enum';

/**
 * Custom validator to ensure at least one media URL is provided
 */
@ValidatorConstraint({ name: 'atLeastOneMedia', async: false })
export class AtLeastOneMediaConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const obj = args.object as ResponsiveMediaDto;
    return !!(obj.mobile || obj.tablet || obj.desktop);
  }

  defaultMessage(): string {
    return 'At least one media URL (mobile, tablet, or desktop) is required';
  }
}

/**
 * DTO for responsive media URLs (images or videos for different device types)
 * At least one of mobile, tablet, or desktop must be provided
 */
export class ResponsiveMediaDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Media URL for mobile devices (<768px)',
    example: 'https://cdn.example.com/banner_mobile.jpg',
  })
  @IsOptional()
  @IsString()
  @Validate(AtLeastOneMediaConstraint)
  mobile?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Media URL for tablet devices (768px - 1023px)',
    example: 'https://cdn.example.com/banner_tablet.jpg',
  })
  @IsOptional()
  @IsString()
  tablet?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Media URL for desktop devices (>=1024px)',
    example: 'https://cdn.example.com/banner_desktop.jpg',
  })
  @IsOptional()
  @IsString()
  desktop?: string;
}

/**
 * DTO for creating a new banner
 */
export class CreateBannerDto {
  @ApiProperty({
    enum: BannerPosition,
    enumName: 'BannerPosition',
    description: 'Banner position (1 = HERO_SLIDER, 2 = AD_SECTION)',
    example: 1,
  })
  @IsEnum(BannerPosition)
  position: BannerPosition;

  @ApiProperty({
    enum: BannerMediaType,
    enumName: 'BannerMediaType',
    description: 'Media type (1 = IMAGE, 2 = VIDEO)',
    example: 1,
  })
  @IsEnum(BannerMediaType)
  mediaType: BannerMediaType;

  @ApiProperty({
    type: ResponsiveMediaDto,
    description: 'Responsive media URLs for different device types',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ResponsiveMediaDto)
  media: ResponsiveMediaDto;

  @ApiPropertyOptional({
    type: String,
    description: 'Optional URL link when banner is clicked',
    example: 'https://example.com/promotion',
  })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiProperty({
    type: Number,
    description: 'Display order (lower value = displayed first)',
    example: 1,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  order: number;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Whether the banner is active (default: true)',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
