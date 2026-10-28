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
import { ShopService } from './shop.service';
import { ShopQueryProductDto } from './dto/shop-query-product.dto';
import { ShopLandingResponseDto } from './dto/shop-landing.dto';
import { Product } from '../products/domain/product';
import { ProductCategory } from '../product-categories/domain/product-category';
import { PopupAds } from '../popup-ads/domain/popup-ads';
import { infinityPaginationFromPaginate } from '../utils/infinity-pagination';
import {
  InfinityPaginationResponseDto,
  InfinityPaginationResponse,
} from '../utils/dto/infinity-pagination-response.dto';

/**
 * Public controller for shop/storefront endpoints
 * No authentication required
 */
@ApiTags('Shop - Products')
@Controller({ path: 'shop', version: '1' })
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  /**
   * Get landing page data including featured products, latest products, and categories
   */
  @Get('landing')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get shop landing page data',
    description:
      'Returns featured products, latest products, and category tree for the storefront landing page',
  })
  @ApiOkResponse({
    description: 'Landing page data returned successfully',
    type: ShopLandingResponseDto,
  })
  async getLanding(): Promise<ShopLandingResponseDto> {
    return this.shopService.getLanding();
  }

  /**
   * Get products with filtering, sorting, and pagination for infinite scroll
   */
  @Get('products')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get shop products with filtering and pagination',
    description:
      'Returns paginated list of active products. Supports filtering by category, brand, search term, and price range. Suitable for infinite scroll.',
  })
  @ApiOkResponse({
    description: 'Products returned successfully',
    type: InfinityPaginationResponse(Product),
  })
  async getProducts(
    @Query() query: ShopQueryProductDto,
  ): Promise<InfinityPaginationResponseDto<Product>> {
    const result = await this.shopService.getProducts(query);
    return infinityPaginationFromPaginate(result);
  }

  /**
   * Get top searched keywords
   */
  @Get('top-keywords')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get top searched keywords',
    description:
      'Returns the most popular search keywords from recent searches, sorted by frequency',
  })
  @ApiOkResponse({
    description: 'Top keywords returned successfully',
    type: [String],
  })
  async getTopKeywords(): Promise<string[]> {
    return this.shopService.getTopKeywords();
  }

  /**
   * Get product by slugId
   * Supports both URL formats:
   * - SEO-friendly: /products/ao-thun-nam-cotton-69561664abd3fed1bcd75757
   * - Legacy: /products/69561664abd3fed1bcd75757
   */
  @Get('products/:slugId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get product details by slug-id or id',
    description:
      'Returns a single active product with its variants. ' +
      'Supports SEO-friendly URLs (slug-id) and legacy URLs (id only).',
  })
  @ApiParam({
    name: 'slugId',
    type: String,
    description:
      'Product slug-id (e.g., ao-thun-nam-cotton-69561664abd3fed1bcd75757) or just id',
  })
  @ApiOkResponse({
    description: 'Product found',
    type: Product,
  })
  @ApiNotFoundResponse({
    description: 'Product not found or not active',
  })
  async getProduct(@Param('slugId') slugId: string): Promise<Product> {
    return this.shopService.getProduct(slugId);
  }

  /**
   * Get all categories (flat list)
   */
  @Get('categories')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all categories',
    description:
      'Returns flat list of categories. Client builds tree using parentId field.',
  })
  @ApiOkResponse({
    description: 'Categories returned successfully',
    type: [ProductCategory],
  })
  async getCategories(): Promise<ProductCategory[]> {
    return this.shopService.getCategories();
  }

  /**
   * Get active popup ads within the current time range
   */
  @Get('popup-ads')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get active popup ads',
    description:
      'Returns active popup ads within the current time range, ordered by display order then creation date',
  })
  @ApiOkResponse({
    description: 'Active popup ads returned successfully',
    type: [PopupAds],
  })
  async getActivePopups(): Promise<PopupAds[]> {
    return this.shopService.getActivePopups();
  }

  /**
   * Get category by slugId
   * Supports both URL formats:
   * - SEO-friendly: /categories/thoi-trang-nam-6955f3dfabd3fed1bcd51843
   * - Legacy: /categories/6955f3dfabd3fed1bcd51843
   */
  @Get('categories/:slugId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get category details by slug-id or id',
    description:
      'Returns a single category. ' +
      'Supports SEO-friendly URLs (slug-id) and legacy URLs (id only).',
  })
  @ApiParam({
    name: 'slugId',
    type: String,
    description:
      'Category slug-id (e.g., thoi-trang-nam-6955f3dfabd3fed1bcd51843) or just id',
  })
  @ApiOkResponse({
    description: 'Category found',
    type: ProductCategory,
  })
  @ApiNotFoundResponse({ description: 'Category not found' })
  async getCategory(@Param('slugId') slugId: string): Promise<ProductCategory> {
    return this.shopService.getCategory(slugId);
  }
}
