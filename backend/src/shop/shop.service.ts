import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PaginateResult } from 'mongoose';
import { ProductRepository } from '../products/domain/product.repository';
import { ProductCategoryRepository } from '../product-categories/domain/product-category.repository';
import { TopicRepository } from '../topics/domain/topic.repository';
import { BannerRepository } from '../banners/domain/banner.repository';
import { PopupAdsRepository } from '../popup-ads/domain/popup-ads.repository';
import { Product } from '../products/domain/product';
import { PopupAds } from '../popup-ads/domain/popup-ads';
import { ShopQueryProductDto } from './dto/shop-query-product.dto';
import { ShopLandingResponseDto } from './dto/shop-landing.dto';
import { throwException } from '../utils/errors/throw-exception';
import { ProductCategory } from '../product-categories/domain/product-category';
import { NhanhAuthService } from '../nhanh/services/nhanh-auth.service';
import { BannerPosition } from '../banners/model/banner-position.enum';
import {
  ProductStatus,
  isSaleable,
} from '../products/domain/product-status.enum';
import { SortProductDto } from '../products/dto/query-product.dto';
import { SearchKeywordsService } from '../search-keywords/search-keywords.service';
import {
  filterActiveVariants,
  hasZeroActiveVariants,
} from './helpers/filter-active-variants';

/**
 * Map of shop sort field names to database field paths
 * Uses flashSale fields for price-related sorting (synced by cron job)
 */
const SORT_FIELD_MAP: Record<string, string> = {
  price: 'flashSale.effectivePrice',
  discount: 'flashSale.discountAmount',
  discountPercent: 'flashSale.discountPercent',
  name: 'name',
  createdAt: 'createdAt',
};

/**
 * Service for public shop endpoints
 * Provides read-only access to active products and categories
 */
@Injectable()
export class ShopService {
  private readonly logger = new Logger(ShopService.name);

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productCategoryRepository: ProductCategoryRepository,
    private readonly topicRepository: TopicRepository,
    private readonly bannerRepository: BannerRepository,
    private readonly popupAdsRepository: PopupAdsRepository,
    private readonly i18n: I18nService,
    private readonly nhanhAuthService: NhanhAuthService,
    private readonly searchKeywordsService: SearchKeywordsService,
  ) {}

  /**
   * Get landing page data including categories, topics, and banners
   */
  async getLanding(): Promise<ShopLandingResponseDto> {
    this.logger.debug('Fetching shop landing page data');

    // Get businessId from cached token
    const tokenData = await this.nhanhAuthService.getAccessToken();
    const businessId = tokenData?.businessId.toString();

    // Fetch all data in parallel
    const [categories, topics, heroSliderBanners, adSectionBanners] =
      await Promise.all([
        this.productCategoryRepository.findAll(),
        businessId
          ? this.topicRepository.findActiveByBusinessId(businessId)
          : Promise.resolve([]),
        this.bannerRepository.findActiveByPosition(BannerPosition.HERO_SLIDER),
        this.bannerRepository.findActiveByPosition(BannerPosition.AD_SECTION),
      ]);

    return {
      categories,
      topics: topics.map((topic) => ({
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
      })),
      banners: {
        heroSlider: heroSliderBanners,
        adSection: adSectionBanners,
      },
    };
  }

  /**
   * Get products with filtering, sorting, and pagination for infinite scroll
   */
  async getProducts(
    query: ShopQueryProductDto,
  ): Promise<PaginateResult<Product>> {
    this.logger.debug(
      `Fetching shop products with query: ${JSON.stringify(query)}`,
    );

    // Get businessId from cached token
    const tokenData = await this.nhanhAuthService.getAccessToken();
    const businessId = tokenData?.businessId.toString();

    // Enforce limit
    let limit = query.limit ?? 20;
    if (limit > 50) {
      limit = 50;
    }

    // If filtering by topic, get product IDs from the topic first
    let topicProductIds: string[] | undefined;
    if (query.filters?.topicId) {
      const topic = await this.topicRepository.findById(query.filters.topicId);
      if (topic && topic.products.length > 0) {
        topicProductIds = topic.products.map((p) => p.productId);
      } else {
        // Topic not found or has no products, return empty result
        return {
          docs: [],
          totalDocs: 0,
          limit,
          page: query.page ?? 1,
          totalPages: 0,
          offset: 0,
          hasNextPage: false,
          hasPrevPage: false,
          pagingCounter: 1,
          prevPage: null,
          nextPage: null,
        };
      }
    }

    // Build filter options - only show saleable products with a valid retail price
    const filterOptions = {
      status: ProductStatus.ACTIVE,
      hasRetailPrice: true,
      ...(businessId && { businessId }),
      ...(query.filters?.search && { search: query.filters.search }),
      ...(query.filters?.categoryIds?.length && {
        categoryIds: query.filters.categoryIds,
      }),
      ...(topicProductIds && { productIds: topicProductIds }),
      ...(query.filters?.minPrice !== undefined && {
        minPrice: query.filters.minPrice,
      }),
      ...(query.filters?.maxPrice !== undefined && {
        maxPrice: query.filters.maxPrice,
      }),
    };

    // Build sort options using the field map
    // Flash sale pricing is synced by cron job, so we can sort directly in DB
    const sortField = query.sort?.orderBy
      ? (SORT_FIELD_MAP[query.sort.orderBy] ?? 'createdAt')
      : 'createdAt';

    // For discount fields, default to descending (highest first)
    const discountFields = ['discount', 'discountPercent'];
    const defaultOrder = discountFields.includes(query.sort?.orderBy ?? '')
      ? 'desc'
      : 'asc';

    // Build sort options based on user's preference
    // stock = sum of variant inventory for parent products, or inventory.available for standalone
    const sortOptions: SortProductDto[] = [];

    if (query.sort?.orderBy) {
      // User specified a sort field - use only that field
      sortOptions.push({
        orderBy: sortField as keyof Product,
        order: query.sort?.order ?? defaultOrder,
      });
    } else {
      // Default sort: stock (in-stock first)
      sortOptions.push({
        orderBy: 'stock' as keyof Product,
        order: 'desc',
      });
    }

    // Track search keyword (fire-and-forget)
    if (query.filters?.search) {
      void this.searchKeywordsService.trackKeyword(query.filters.search);
    }

    const result = await this.productRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions: {
        page: query.page ?? 1,
        limit,
      },
    });

    // Flash sale data is already synced to products by cron job
    // No runtime enrichment needed
    const docs = result.docs
      .filter((product) => !hasZeroActiveVariants(product))
      .map((product) => filterActiveVariants(product));
    return { ...result, docs };
  }

  /**
   * Get product by slugId (slug-id or just id)
   * Supports both URL formats:
   * - SEO-friendly: /products/ao-thun-nam-cotton-69561664abd3fed1bcd75757
   * - Legacy: /products/69561664abd3fed1bcd75757
   * @param slugId - String containing slug-id or just id
   */
  async getProduct(slugId: string): Promise<Product> {
    // Get businessId from cached token
    const tokenData = await this.nhanhAuthService.getAccessToken();
    const businessId = tokenData?.businessId.toString();

    // Parse slugId: extract ID from the end (after last hyphen if it's a valid ObjectId)
    const { id, slug } = this.parseSlugId(slugId);

    let product: Product | null = null;

    // Try to find by ID first (most common case)
    if (id) {
      product = await this.productRepository.findById(id);
    }

    // If not found by ID and we have a slug, try finding by slug
    if (!product && slug && businessId) {
      product = await this.productRepository.findBySlug(businessId, slug);
    }

    if (!product) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('product.notFound'),
      });
    }

    // Only return saleable products
    if (!isSaleable(product.status)) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('product.notFound'),
      });
    }

    // Block products with no retail price set
    if (!product.prices?.retail) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('product.notFound'),
      });
    }

    // Parent mà tất cả variant đều không ACTIVE thì coi như không bán
    // được: nút thêm vào giỏ sẽ mua theo SKU của parent, mà SKU parent
    // không phải hàng thực tế ở Nhanh. Trả 404 thay vì trả product.
    if (hasZeroActiveVariants(product)) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('product.notFound'),
      });
    }

    // Flash sale data is already synced to products by cron job
    // No runtime enrichment needed
    return filterActiveVariants(product);
  }

  /**
   * Get category by slugId (slug-id or just id)
   * Supports both URL formats:
   * - SEO-friendly: /categories/thoi-trang-nam-6955f3dfabd3fed1bcd51843
   * - Legacy: /categories/6955f3dfabd3fed1bcd51843
   * @param slugId - String containing slug-id or just id
   */
  async getCategory(slugId: string): Promise<ProductCategory> {
    // Get businessId from cached token
    const tokenData = await this.nhanhAuthService.getAccessToken();
    const businessId = tokenData?.businessId.toString();

    // Parse slugId: extract ID from the end
    const { id, slug } = this.parseSlugId(slugId);

    let category: ProductCategory | null = null;

    // Try to find by ID first
    if (id) {
      category = await this.productCategoryRepository.findById(id);
    }

    // If not found by ID and we have a slug, try finding by slug
    if (!category && slug && businessId) {
      category = await this.productCategoryRepository.findBySlug(
        businessId,
        slug,
      );
    }

    if (!category) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('category.notFound'),
      });
    }

    return category;
  }

  /**
   * Get all categories (flat list - client builds tree using parentId)
   */
  async getCategories(): Promise<ProductCategory[]> {
    return this.productCategoryRepository.findAll();
  }

  /**
   * Get top searched keywords from recent searches
   * @returns List of keyword strings sorted by popularity
   */
  async getTopKeywords(): Promise<string[]> {
    return this.searchKeywordsService.getTopKeywords();
  }

  /**
   * Get active popup ads within the current time range
   * Used by shop frontend to display advertising popups
   */
  async getActivePopups(): Promise<PopupAds[]> {
    this.logger.debug('Fetching active popup ads for shop');
    return this.popupAdsRepository.findActiveInRange();
  }

  /**
   * Parse slugId to extract id and slug
   * Format: slug-id (e.g., ao-thun-nam-cotton-69561664abd3fed1bcd75757)
   * or just id (e.g., 69561664abd3fed1bcd75757)
   */
  private parseSlugId(slugId: string): {
    id: string | null;
    slug: string | null;
  } {
    // MongoDB ObjectId pattern: 24 hex characters
    const objectIdRegex = /^[a-f0-9]{24}$/i;

    // If the entire string is a valid ObjectId, it's just an ID
    if (objectIdRegex.test(slugId)) {
      return { id: slugId, slug: null };
    }

    // Try to extract ObjectId from the end (after last hyphen)
    const lastHyphenIndex = slugId.lastIndexOf('-');
    if (lastHyphenIndex > 0) {
      const potentialId = slugId.substring(lastHyphenIndex + 1);
      if (objectIdRegex.test(potentialId)) {
        const slug = slugId.substring(0, lastHyphenIndex);
        return { id: potentialId, slug };
      }
    }

    // No valid ObjectId found, treat the whole string as a slug
    return { id: null, slug: slugId };
  }
}
