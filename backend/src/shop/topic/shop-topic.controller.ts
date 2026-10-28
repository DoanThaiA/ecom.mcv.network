import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ShopTopicService } from './shop-topic.service';
import {
  ShopTopicListResponseDto,
  ShopTopicResponseDto,
  ShopTopicProductsQueryDto,
} from './dto/shop-topic.dto';
import { Product } from '../../products/domain/product';
import {
  InfinityPaginationResponseDto,
  InfinityPaginationResponse,
} from '../../utils/dto/infinity-pagination-response.dto';

/**
 * Public controller for shop topic endpoints
 * No authentication required
 */
@ApiTags('Shop - Topics')
@Controller({ path: 'shop/topics', version: '1' })
export class ShopTopicController {
  constructor(private readonly shopTopicService: ShopTopicService) {}

  /**
   * Get all active topics for navigation
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get active topics list',
    description:
      'Returns all active topics ordered by display order. ' +
      'Use this for navigation menus, mega-menus, or homepage topic sections.',
  })
  @ApiOkResponse({
    description: 'Topics returned successfully',
    type: ShopTopicListResponseDto,
  })
  async getTopics(): Promise<ShopTopicListResponseDto> {
    return this.shopTopicService.getTopics();
  }

  /**
   * Get topic by slug with products
   */
  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get topic by slug with products',
    description:
      'Returns topic details with paginated products. ' +
      'Use this for topic landing pages.',
  })
  @ApiParam({
    name: 'slug',
    type: String,
    description: 'Topic slug (URL-friendly identifier)',
    example: 'featured-products',
  })
  @ApiOkResponse({
    description: 'Topic found',
    type: ShopTopicResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Topic not found or inactive' })
  async getTopicBySlug(
    @Param('slug') slug: string,
    @Query() query: ShopTopicProductsQueryDto,
  ): Promise<ShopTopicResponseDto> {
    return this.shopTopicService.getTopicBySlug(slug, query);
  }

  /**
   * Get products by topic slug (paginated with variants)
   */
  @Get(':slug/products')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get products by topic (paginated)',
    description:
      'Returns paginated products with variant information for a topic. ' +
      'Use this for infinite scroll on topic pages.',
  })
  @ApiParam({
    name: 'slug',
    type: String,
    description: 'Topic slug (URL-friendly identifier)',
    example: 'featured-products',
  })
  @ApiOkResponse({
    description: 'Products returned successfully',
    type: InfinityPaginationResponse(Product),
  })
  @ApiNotFoundResponse({ description: 'Topic not found or inactive' })
  async getTopicProducts(
    @Param('slug') slug: string,
    @Query() query: ShopTopicProductsQueryDto,
  ): Promise<InfinityPaginationResponseDto<Product>> {
    return this.shopTopicService.getTopicProducts(slug, query);
  }
}
