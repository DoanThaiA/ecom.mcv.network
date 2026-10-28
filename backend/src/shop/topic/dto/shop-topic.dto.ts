import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { TopicType } from '../../../topics/domain/topic-type.enum';
import { BannerMediaType } from '../../../banners/model/banner-media-type.enum';

/**
 * Topic item for navigation list (minimal info)
 */
export class ShopTopicItemDto {
  @ApiProperty({ type: String, description: 'Topic ID' })
  id: string;

  @ApiProperty({ type: String, description: 'Topic name' })
  name: string;

  @ApiPropertyOptional({
    type: Object,
    description: 'Localized topic names',
    example: { vi: 'Sản phẩm nổi bật', en: 'Featured Products' },
  })
  localization?: { vi?: string; en?: string } | null;

  @ApiProperty({ type: String, description: 'URL-friendly slug' })
  slug: string;

  @ApiProperty({ enum: TopicType, description: 'Topic type' })
  type: TopicType;

  @ApiPropertyOptional({ type: String, description: 'Topic image URL' })
  image?: string | null;

  @ApiProperty({ type: Number, description: 'Number of products in topic' })
  productCount: number;

  @ApiProperty({ type: Number, description: 'Number of categories in topic' })
  categoryCount: number;

  @ApiProperty({ type: Number, description: 'Number of banners in topic' })
  bannerCount: number;
}

/**
 * Banner item in topic (public view)
 */
export class ShopTopicBannerDto {
  @ApiProperty({ type: String, description: 'Banner item ID' })
  id: string;

  @ApiProperty({ enum: BannerMediaType, description: 'Media type' })
  mediaType: BannerMediaType;

  @ApiProperty({
    type: Object,
    description: 'Responsive media URLs',
  })
  media: { mobile?: string; tablet?: string; desktop?: string };

  @ApiPropertyOptional({ type: String, description: 'Optional click URL' })
  link?: string | null;

  @ApiProperty({ type: Number, description: 'Display order' })
  order: number;
}

/**
 * Topic list response for navigation
 */
export class ShopTopicListResponseDto {
  @ApiProperty({
    type: [ShopTopicItemDto],
    description: 'List of active topics',
  })
  topics: ShopTopicItemDto[];
}

/**
 * Product item in topic (public view)
 */
export class ShopTopicProductDto {
  @ApiProperty({ type: String, description: 'Product ID' })
  id: string;

  @ApiProperty({ type: String, description: 'Product name' })
  name: string;

  @ApiPropertyOptional({ type: String, description: 'Product image URL' })
  image?: string | null;

  @ApiProperty({ type: Number, description: 'Product price (retail)' })
  price: number;

  @ApiPropertyOptional({ type: String, description: 'Product code/SKU' })
  code?: string;
}

/**
 * Category item in topic (public view)
 */
export class ShopTopicCategoryDto {
  @ApiProperty({ type: String, description: 'Category ID' })
  id: string;

  @ApiProperty({ type: String, description: 'Category name' })
  name: string;

  @ApiPropertyOptional({ type: String, description: 'Category image URL' })
  image?: string | null;

  @ApiPropertyOptional({ type: String, description: 'Category slug' })
  slug?: string | null;

  @ApiProperty({ type: Number, description: 'Number of products in category' })
  productCount: number;
}

/**
 * Full topic response with products (for topic landing page)
 */
export class ShopTopicResponseDto {
  @ApiProperty({ type: String, description: 'Topic ID' })
  id: string;

  @ApiProperty({ type: String, description: 'Topic name' })
  name: string;

  @ApiPropertyOptional({
    type: Object,
    description: 'Localized topic names',
    example: { vi: 'Sản phẩm nổi bật', en: 'Featured Products' },
  })
  localization?: { vi?: string; en?: string } | null;

  @ApiProperty({ type: String, description: 'URL-friendly slug' })
  slug: string;

  @ApiProperty({ enum: TopicType, description: 'Topic type' })
  type: TopicType;

  @ApiPropertyOptional({ type: String, description: 'Topic description' })
  description?: string | null;

  @ApiPropertyOptional({ type: String, description: 'Topic banner image URL' })
  image?: string | null;

  @ApiProperty({
    type: [ShopTopicProductDto],
    description: 'Products in the topic',
  })
  products: ShopTopicProductDto[];

  @ApiProperty({
    type: [ShopTopicCategoryDto],
    description: 'Categories in the topic',
  })
  categories: ShopTopicCategoryDto[];

  @ApiProperty({
    type: [ShopTopicBannerDto],
    description: 'Banners in the topic',
  })
  banners: ShopTopicBannerDto[];

  @ApiProperty({ type: Number, description: 'Total number of products' })
  totalProducts: number;

  @ApiProperty({ type: Number, description: 'Total number of categories' })
  totalCategories: number;
}

/**
 * Query DTO for topic products pagination
 */
export class ShopTopicProductsQueryDto {
  @ApiPropertyOptional({
    type: Number,
    description: 'Page number (starts from 1)',
    default: 1,
  })
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Items per page (max 50)',
    default: 20,
  })
  @Transform(({ value }) => (value ? Math.min(Number(value) || 20, 50) : 20))
  @IsNumber()
  @IsOptional()
  limit?: number;
}
