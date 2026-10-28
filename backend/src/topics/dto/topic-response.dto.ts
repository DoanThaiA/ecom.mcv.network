import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TopicStatus } from '../domain/topic-status.enum';
import { TopicType } from '../domain/topic-type.enum';
import { BannerMediaType } from '../../banners/model/banner-media-type.enum';

/**
 * DTO for product in topic response (with details)
 */
export class TopicProductResponseDto {
  @ApiProperty({ type: String })
  productId: string;

  @ApiProperty({ type: Number })
  order: number;

  @ApiPropertyOptional({ type: String })
  productName?: string;

  @ApiPropertyOptional({ type: String })
  productImage?: string;

  @ApiPropertyOptional({ type: Number })
  productPrice?: number;

  @ApiPropertyOptional({ type: String })
  productStatus?: string;
}

/**
 * DTO for category in topic response (with details)
 */
export class TopicCategoryResponseDto {
  @ApiProperty({ type: String })
  categoryId: string;

  @ApiProperty({ type: Number })
  order: number;

  @ApiPropertyOptional({ type: String })
  categoryName?: string;

  @ApiPropertyOptional({ type: String })
  categoryImage?: string;

  @ApiPropertyOptional({ type: String })
  categorySlug?: string;
}

/**
 * DTO for banner media in topic response
 */
export class TopicBannerMediaResponseDto {
  @ApiPropertyOptional({ type: String })
  mobile?: string;

  @ApiPropertyOptional({ type: String })
  tablet?: string;

  @ApiPropertyOptional({ type: String })
  desktop?: string;
}

/**
 * DTO for banner in topic response (with details)
 */
export class TopicBannerResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ enum: BannerMediaType })
  mediaType: BannerMediaType;

  @ApiProperty({ type: TopicBannerMediaResponseDto })
  media: TopicBannerMediaResponseDto;

  @ApiPropertyOptional({ type: String })
  link?: string | null;

  @ApiProperty({ type: Number })
  order: number;
}

/**
 * DTO for topic response
 */
export class TopicResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  businessId: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiPropertyOptional({
    type: Object,
    description: 'Localized topic names',
    example: { vi: 'Sản phẩm nổi bật', en: 'Featured Products' },
  })
  localization?: { vi?: string; en?: string } | null;

  @ApiProperty({ type: String })
  slug: string;

  @ApiProperty({ enum: TopicType })
  type: TopicType;

  @ApiPropertyOptional({ type: String })
  description?: string | null;

  @ApiPropertyOptional({ type: String })
  image?: string | null;

  @ApiProperty({ type: Number })
  order: number;

  @ApiProperty({ enum: TopicStatus })
  status: TopicStatus;

  @ApiProperty({ type: [TopicProductResponseDto] })
  products: TopicProductResponseDto[];

  @ApiProperty({ type: [TopicCategoryResponseDto] })
  categories: TopicCategoryResponseDto[];

  @ApiProperty({
    type: Number,
    description: 'Total number of products in topic',
  })
  productCount: number;

  @ApiProperty({
    type: Number,
    description: 'Total number of categories in topic',
  })
  categoryCount: number;

  @ApiProperty({ type: [TopicBannerResponseDto] })
  banners: TopicBannerResponseDto[];

  @ApiProperty({
    type: Number,
    description: 'Total number of banners in topic',
  })
  bannerCount: number;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}
