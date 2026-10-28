import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TopicStatus } from './topic-status.enum';
import { TopicType } from './topic-type.enum';
import { BannerMediaType } from '../../banners/model/banner-media-type.enum';

const idType = String;

/**
 * Topic product - product reference with display order
 */
export class TopicProduct {
  @ApiProperty({
    type: String,
    description: 'Product ID',
  })
  productId: string;

  @ApiProperty({
    type: Number,
    description: 'Display order within topic',
    example: 0,
  })
  order: number;
}

/**
 * Topic category - category reference with display order
 */
export class TopicCategory {
  @ApiProperty({
    type: String,
    description: 'Category ID',
  })
  categoryId: string;

  @ApiProperty({
    type: Number,
    description: 'Display order within topic',
    example: 0,
  })
  order: number;
}

/**
 * Topic banner media - responsive URLs for different device types
 */
export class TopicBannerMedia {
  @ApiPropertyOptional({ type: String, description: 'Media URL for mobile' })
  mobile?: string;

  @ApiPropertyOptional({ type: String, description: 'Media URL for tablet' })
  tablet?: string;

  @ApiPropertyOptional({ type: String, description: 'Media URL for desktop' })
  desktop?: string;
}

/**
 * Topic banner - a banner item within a topic with display order
 */
export class TopicBanner {
  @ApiProperty({ type: String, description: 'Banner item ID' })
  id: string;

  @ApiProperty({
    enum: BannerMediaType,
    enumName: 'BannerMediaType',
    description: 'Media type (IMAGE or VIDEO)',
    example: BannerMediaType.IMAGE,
  })
  mediaType: BannerMediaType;

  @ApiProperty({
    type: TopicBannerMedia,
    description: 'Responsive media URLs',
  })
  media: TopicBannerMedia;

  @ApiPropertyOptional({ type: String, description: 'Optional click URL' })
  link?: string | null;

  @ApiProperty({
    type: Number,
    description: 'Display order within topic',
    example: 0,
  })
  order: number;
}

/**
 * Topic domain entity
 * Represents a marketing collection/curated list of products
 */
export class Topic {
  @ApiProperty({
    type: idType,
    description: 'Internal topic ID',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Business ID (multi-tenant support)',
    example: '110668',
  })
  businessId: string;

  @ApiProperty({
    type: String,
    description: 'Topic name',
    example: 'Featured Products',
  })
  name: string;

  @ApiPropertyOptional({
    type: Object,
    description: 'Localized topic names',
    example: { vi: 'Sản phẩm nổi bật', en: 'Featured Products' },
  })
  localization?: { vi?: string; en?: string } | null;

  @ApiProperty({
    type: String,
    description: 'URL-friendly slug (unique per business)',
    example: 'featured-products',
  })
  slug: string;

  @ApiProperty({
    enum: TopicType,
    enumName: 'TopicType',
    description: 'Type of topic (product or category)',
    example: TopicType.PRODUCT,
    default: TopicType.PRODUCT,
  })
  type: TopicType;

  @ApiPropertyOptional({
    type: String,
    description: 'Topic description',
  })
  description?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Topic banner/header image URL',
  })
  image?: string | null;

  @ApiProperty({
    type: Number,
    description: 'Display order for topic positioning',
    example: 0,
  })
  order: number;

  @ApiProperty({
    enum: TopicStatus,
    enumName: 'TopicStatus',
    description: 'Topic status',
    example: TopicStatus.ACTIVE,
  })
  status: TopicStatus;

  @ApiProperty({
    type: [TopicProduct],
    description:
      'Products in the topic with their display order (only when type=product)',
  })
  products: TopicProduct[];

  @ApiProperty({
    type: [TopicCategory],
    description:
      'Categories in the topic with their display order (only when type=category)',
  })
  categories: TopicCategory[];

  @ApiProperty({
    type: [TopicBanner],
    description:
      'Banners in the topic with their display order (only when type=banner)',
  })
  banners: TopicBanner[];

  @ApiProperty({
    type: Date,
    description: 'Topic creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Topic last update timestamp',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    type: Date,
    description: 'Topic deletion timestamp (soft delete)',
  })
  deletedAt?: Date | null;
}
