import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BannerPosition } from '../model/banner-position.enum';
import { BannerMediaType } from '../model/banner-media-type.enum';

const idType = String;

/**
 * Responsive media URLs for different device types
 * At least one of mobile, tablet, or desktop must be provided
 */
export class ResponsiveMedia {
  @ApiPropertyOptional({
    type: String,
    description: 'Media URL for mobile devices (<768px)',
    example: 'https://cdn.example.com/banner_mobile.jpg',
  })
  mobile?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Media URL for tablet devices (768px - 1023px)',
    example: 'https://cdn.example.com/banner_tablet.jpg',
  })
  tablet?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Media URL for desktop devices (>=1024px)',
    example: 'https://cdn.example.com/banner_desktop.jpg',
  })
  desktop?: string;
}

/**
 * Banner domain entity
 * Represents a homepage banner with responsive media (images or videos)
 */
export class Banner {
  @ApiProperty({
    type: idType,
    description: 'Internal banner ID',
  })
  id: string;

  @ApiProperty({
    enum: BannerPosition,
    enumName: 'BannerPosition',
    description: 'Banner position (HERO_SLIDER or AD_SECTION)',
    example: BannerPosition.HERO_SLIDER,
  })
  position: BannerPosition;

  @ApiProperty({
    enum: BannerMediaType,
    enumName: 'BannerMediaType',
    description: 'Media type (1 = IMAGE, 2 = VIDEO)',
    example: BannerMediaType.IMAGE,
  })
  mediaType: BannerMediaType;

  @ApiProperty({
    type: ResponsiveMedia,
    description: 'Responsive media URLs for different device types',
  })
  media: ResponsiveMedia;

  @ApiPropertyOptional({
    type: String,
    description: 'Optional URL link when banner is clicked',
    example: 'https://example.com/promotion',
  })
  link?: string | null;

  @ApiProperty({
    type: Number,
    description: 'Display order (lower value = displayed first)',
    example: 1,
  })
  order: number;

  @ApiProperty({
    type: Boolean,
    description: 'Whether the banner is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    type: Date,
    description: 'Banner creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Banner last update timestamp',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    type: Date,
    description: 'Banner deletion timestamp (soft delete)',
  })
  deletedAt?: Date | null;
}
