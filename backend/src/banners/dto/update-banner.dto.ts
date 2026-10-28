import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsObject,
  ValidateNested,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BannerPosition } from '../model/banner-position.enum';
import { BannerMediaType } from '../model/banner-media-type.enum';
import { ResponsiveMediaDto } from './create-banner.dto';

/**
 * DTO for updating a banner
 */
export class UpdateBannerDto {
  @ApiPropertyOptional({
    enum: BannerPosition,
    enumName: 'BannerPosition',
    description: 'Banner position (1 = HERO_SLIDER, 2 = AD_SECTION)',
    example: 1,
  })
  @IsOptional()
  @IsEnum(BannerPosition)
  position?: BannerPosition;

  @ApiPropertyOptional({
    enum: BannerMediaType,
    enumName: 'BannerMediaType',
    description: 'Media type (1 = IMAGE, 2 = VIDEO)',
    example: 1,
  })
  @IsOptional()
  @IsEnum(BannerMediaType)
  mediaType?: BannerMediaType;

  @ApiPropertyOptional({
    type: ResponsiveMediaDto,
    description: 'Responsive media URLs for different device types',
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ResponsiveMediaDto)
  media?: ResponsiveMediaDto;

  @ApiPropertyOptional({
    type: String,
    description:
      'Optional URL link when banner is clicked. Pass null to remove the link.',
    example: 'https://example.com/promotion',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  link?: string | null;

  @ApiPropertyOptional({
    type: Number,
    description: 'Display order (lower value = displayed first)',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Whether the banner is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
