import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { TopicRepository } from '../../topics/domain/topic.repository';
import { ProductRepository } from '../../products/domain/product.repository';
import { ProductCategoryRepository } from '../../product-categories/domain/product-category.repository';
import { NhanhAuthService } from '../../nhanh/services/nhanh-auth.service';
import { TopicStatus } from '../../topics/domain/topic-status.enum';
import { TopicType } from '../../topics/domain/topic-type.enum';
import { getProductImage } from '../../products/domain/product.utils';
import { ProductStatus } from '../../products/domain/product-status.enum';
import { throwException } from '../../utils/errors/throw-exception';
import {
  filterActiveVariants,
  hasZeroActiveVariants,
} from '../helpers/filter-active-variants';
import {
  ShopTopicListResponseDto,
  ShopTopicItemDto,
  ShopTopicResponseDto,
  ShopTopicProductDto,
  ShopTopicCategoryDto,
  ShopTopicProductsQueryDto,
} from './dto/shop-topic.dto';
import { Product } from '../../products/domain/product';
import { InfinityPaginationResponseDto } from '../../utils/dto/infinity-pagination-response.dto';

/**
 * Shop topic service - public endpoints for topic browsing
 */
@Injectable()
export class ShopTopicService {
  private readonly logger = new Logger(ShopTopicService.name);

  constructor(
    private readonly topicRepository: TopicRepository,
    private readonly productRepository: ProductRepository,
    private readonly productCategoryRepository: ProductCategoryRepository,
    private readonly nhanhAuthService: NhanhAuthService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Get businessId from NhanhAuthService
   */
  private async getBusinessId(): Promise<string> {
    const tokenData = await this.nhanhAuthService.getAccessToken();
    if (!tokenData?.businessId) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Business not configured',
      });
    }
    return tokenData.businessId.toString();
  }

  /**
   * Get all active topics for navigation
   * Returns minimal info for use in menus/navigation
   */
  async getTopics(): Promise<ShopTopicListResponseDto> {
    const businessId = await this.getBusinessId();

    const topics =
      await this.topicRepository.findActiveByBusinessId(businessId);

    const topicItems: ShopTopicItemDto[] = topics.map((topic) => ({
      id: topic.id,
      name: topic.name,
      localization: topic.localization
        ? { vi: topic.localization.vi, en: topic.localization.en }
        : null,
      slug: topic.slug,
      type: topic.type,
      image: topic.image,
      productCount: topic.products.length,
      categoryCount: topic.categories.length,
      bannerCount: topic.banners.length,
    }));

    return {
      topics: topicItems,
    };
  }

  /**
   * Get topic by slug with products
   * Returns full topic details for landing pages
   */
  async getTopicBySlug(
    slug: string,
    query: ShopTopicProductsQueryDto,
  ): Promise<ShopTopicResponseDto> {
    const businessId = await this.getBusinessId();

    const topic = await this.topicRepository.findBySlug(businessId, slug);

    if (!topic) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('topic.notFound'),
      });
    }

    // Only return active topics
    if (topic.status !== TopicStatus.ACTIVE) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('topic.notFound'),
      });
    }

    // Get products and categories with pagination
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const startIndex = (page - 1) * limit;

    let products: ShopTopicProductDto[] = [];
    let categories: ShopTopicCategoryDto[] = [];

    // Handle based on topic type
    if (topic.type === TopicType.PRODUCT) {
      // Sort product refs by topic order
      const orderedProductRefs = [...topic.products].sort(
        (a, b) => a.order - b.order,
      );
      const paginatedProductRefs = orderedProductRefs.slice(
        startIndex,
        startIndex + limit,
      );

      // Fetch product details with stock-based sorting
      products = await this.fetchProductDetails(paginatedProductRefs);
    } else if (topic.type === TopicType.CATEGORY) {
      // Sort category refs by topic order
      const orderedCategoryRefs = [...topic.categories].sort(
        (a, b) => a.order - b.order,
      );
      const paginatedCategoryRefs = orderedCategoryRefs.slice(
        startIndex,
        startIndex + limit,
      );

      // Fetch category details
      categories = await this.fetchCategoryDetails(paginatedCategoryRefs);
    }

    // Map banners sorted by order
    const banners = (topic.banners || [])
      .sort((a, b) => a.order - b.order)
      .map((b) => ({
        id: b.id,
        mediaType: b.mediaType,
        media: {
          mobile: b.media?.mobile,
          tablet: b.media?.tablet,
          desktop: b.media?.desktop,
        },
        link: b.link,
        order: b.order,
      }));

    return {
      id: topic.id,
      name: topic.name,
      localization: topic.localization
        ? { vi: topic.localization.vi, en: topic.localization.en }
        : null,
      slug: topic.slug,
      type: topic.type,
      description: topic.description,
      image: topic.image,
      products,
      categories,
      banners,
      totalProducts: topic.products.length,
      totalCategories: topic.categories.length,
    };
  }

  /**
   * Get products by topic slug (paginated)
   * Returns products with variants for infinite scroll
   */
  async getTopicProducts(
    slug: string,
    query: ShopTopicProductsQueryDto,
  ): Promise<InfinityPaginationResponseDto<Product>> {
    const businessId = await this.getBusinessId();

    const topic = await this.topicRepository.findBySlug(businessId, slug);

    if (!topic) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('topic.notFound'),
      });
    }

    // Only return active topics
    if (topic.status !== TopicStatus.ACTIVE) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('topic.notFound'),
      });
    }

    // If this is a category topic, return empty products
    if (topic.type === TopicType.CATEGORY) {
      return {
        data: [],
        hasNextPage: false,
        total: 0,
        page: 1,
        limit: query.limit ?? 20,
        totalPages: 0,
      };
    }

    // Pagination
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const startIndex = (page - 1) * limit;

    // Sort product refs by topic order
    const orderedProductRefs = [...topic.products].sort(
      (a, b) => a.order - b.order,
    );
    const paginatedProductRefs = orderedProductRefs.slice(
      startIndex,
      startIndex + limit,
    );

    // Fetch product details (variants and variantOptions are already embedded from sync)
    const productIds = paginatedProductRefs.map((p) => p.productId);
    const products = await this.productRepository.findByIds(productIds);

    // Map products to match the topic order, only include saleable products.
    // Ẩn parent đã hết ACTIVE variant (không còn SKU bán được) và strip
    // các variant non-ACTIVE khỏi picker để đồng nhất với `/shop/products`.
    const productMap = new Map(products.map((p) => [p.id, p]));
    const orderedProducts = paginatedProductRefs
      .map((ref) => productMap.get(ref.productId))
      .filter(
        (p): p is Product =>
          p !== undefined && p.status === ProductStatus.ACTIVE,
      )
      .filter((p) => !hasZeroActiveVariants(p))
      .map((p) => filterActiveVariants(p));

    // Sort: in-stock products first, maintaining topic order within each group
    const sortedProducts = this.sortByStockAvailability(orderedProducts);

    // Flash sale data is already synced to products by cron job
    // No runtime enrichment needed
    const totalProducts = topic.products.length;
    const totalPages = Math.ceil(totalProducts / limit);

    return {
      data: sortedProducts,
      hasNextPage: page < totalPages,
      total: totalProducts,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Sort products with in-stock items first, out-of-stock at bottom
   * Maintains original order within each group
   */
  private sortByStockAvailability(products: Product[]): Product[] {
    return [...products].sort((a, b) => {
      const aAvailable = a.inventory?.available ?? 0;
      const bAvailable = b.inventory?.available ?? 0;
      // In-stock (available > 0) first, then out-of-stock
      if (aAvailable > 0 && bAvailable <= 0) return -1;
      if (aAvailable <= 0 && bAvailable > 0) return 1;
      return 0; // Maintain original order within each group
    });
  }

  /**
   * Fetch product details for display
   */
  private async fetchProductDetails(
    productRefs: Array<{ productId: string; order: number }>,
  ): Promise<ShopTopicProductDto[]> {
    const productIds = productRefs.map((p) => p.productId);
    const products = await this.productRepository.findByIds(productIds);

    // Map products to their order
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Build ordered products list, only include saleable products
    const orderedProducts = productRefs
      .map((ref) => productMap.get(ref.productId))
      .filter(
        (p): p is Product =>
          p !== undefined && p.status === ProductStatus.ACTIVE,
      );

    // Sort: in-stock products first
    const sortedProducts = this.sortByStockAvailability(orderedProducts);

    // Map to DTOs
    return sortedProducts.map((product) => ({
      id: product.id,
      name: product.name,
      image: getProductImage(product),
      price: product.prices?.retail ?? 0,
      code: product.code,
    }));
  }

  /**
   * Fetch category details for display
   */
  private async fetchCategoryDetails(
    categoryRefs: Array<{ categoryId: string; order: number }>,
  ): Promise<ShopTopicCategoryDto[]> {
    const categoryIds = categoryRefs.map((c) => c.categoryId);
    const categories =
      await this.productCategoryRepository.findByIds(categoryIds);

    // Map categories to their order
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    // Build ordered categories list maintaining topic order
    const orderedCategories = categoryRefs
      .map((ref) => categoryMap.get(ref.categoryId))
      .filter(
        (
          c,
        ): c is import('../../product-categories/domain/product-category').ProductCategory =>
          c !== undefined,
      );

    return orderedCategories.map((category) => ({
      id: category.id,
      name: category.name,
      image: category.image ?? null,
      slug: category.slug ?? null,
      productCount: 0, // Category product count can be added later if needed
    }));
  }
}
