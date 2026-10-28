import { ApiProperty } from '@nestjs/swagger';
import { ProductCategory } from '../../product-categories/domain/product-category';
import { ShopTopicItemDto } from '../topic/dto/shop-topic.dto';
import { Banner } from '../../banners/domain/banner';

/**
 * Banners by position for landing page
 */
export class LandingBannersDto {
  @ApiProperty({
    description: 'Active hero slider banners',
    type: [Banner],
  })
  heroSlider: Banner[];

  @ApiProperty({
    description: 'Active ad section banners',
    type: [Banner],
  })
  adSection: Banner[];
}

/**
 * DTO for shop landing page response
 */
export class ShopLandingResponseDto {
  @ApiProperty({
    description: 'Flat list of categories (client builds tree using parentId)',
    type: [ProductCategory],
  })
  categories: ProductCategory[];

  @ApiProperty({
    description: 'Active topics for navigation and homepage sections',
    type: [ShopTopicItemDto],
  })
  topics: ShopTopicItemDto[];

  @ApiProperty({
    description: 'Active banners grouped by position',
    type: LandingBannersDto,
  })
  banners: LandingBannersDto;
}
