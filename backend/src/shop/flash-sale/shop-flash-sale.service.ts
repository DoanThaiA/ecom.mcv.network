import { HttpStatus, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { FlashSaleRepository } from '../../flash-sales/domain/flash-sale.repository';
import {
  FlashSaleProductRepository,
  SortFlashSaleProductDto,
} from '../../flash-sale-products/domain/flash-sale-product.repository';
import { FlashSaleProduct } from '../../flash-sale-products/domain/flash-sale-product';
import { ProductRepository } from '../../products/domain/product.repository';
import { Product } from '../../products/domain/product';
import { ProductStatus } from '../../products/domain/product-status.enum';
import {
  filterActiveVariants,
  hasZeroActiveVariants,
} from '../helpers/filter-active-variants';
import { TopicRepository } from '../../topics/domain/topic.repository';
import { FlashSale } from '../../flash-sales/domain/flash-sale';
import {
  ShopFlashSaleQueryDto,
  ShopFlashSaleByIdQueryDto,
} from '../dto/shop-query-product.dto';
import {
  ShopFlashSaleDetailResponseDto,
  ShopActiveFlashSaleResponseDto,
  ShopFlashSaleProductsResponseDto,
} from './dto/shop-flash-sale.dto';
import { throwException } from '../../utils/errors/throw-exception';

/**
 * Sort field mapping for flash sale products
 */
const SORT_FIELD_MAP: Record<string, string> = {
  price: 'effectivePrice',
  discount: 'discountAmount',
  discountPercent: 'discountPercent',
  name: 'name',
  createdAt: 'createdAt',
  order: 'order',
};

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;
const PREVIEW_LIMIT = 50;

/**
 * Shop flash sale service - public endpoints for flash sale browsing
 * Uses the flash_sale_products collection for paginated queries
 */
@Injectable()
export class ShopFlashSaleService {
  constructor(
    private readonly flashSaleRepository: FlashSaleRepository,
    private readonly flashSaleProductRepository: FlashSaleProductRepository,
    private readonly productRepository: ProductRepository,
    private readonly topicRepository: TopicRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Get the currently active flash sale with first page of products
   */
  async getActiveFlashSale(): Promise<ShopActiveFlashSaleResponseDto | null> {
    const flashSale = await this.flashSaleRepository.findCurrentlyActive();

    if (!flashSale) {
      return null;
    }

    const result = await this.flashSaleProductRepository.findManyWithPagination(
      {
        flashSaleId: flashSale.id,
        paginationOptions: { page: 1, limit: PREVIEW_LIMIT },
      },
    );

    const data = await this.mapFlashSaleProductsToProducts(result.docs);

    return {
      id: flashSale.id,
      name: flashSale.name,
      startTime: flashSale.startTime,
      endTime: flashSale.endTime,
      data,
      total: result.totalDocs,
      hasNextPage: result.hasNextPage ?? false,
      page: result.page ?? 1,
      limit: PREVIEW_LIMIT,
      totalPages: result.totalPages,
    };
  }

  /**
   * Get paginated products from active flash sale with filtering and sorting
   */
  async getFlashSaleProducts(
    query: ShopFlashSaleQueryDto,
  ): Promise<ShopFlashSaleProductsResponseDto> {
    const flashSale = await this.flashSaleRepository.findCurrentlyActive();

    const limit = Math.min(query.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const page = query.page ?? 1;

    if (!flashSale) {
      return {
        data: [],
        total: 0,
        hasNextPage: false,
        page,
        limit,
        totalPages: 0,
      };
    }

    // Resolve topicId to product IDs if needed
    let topicProductIds: string[] | undefined;
    if (query.filters?.topicId) {
      const topic = await this.topicRepository.findById(query.filters.topicId);
      if (topic && topic.products.length > 0) {
        topicProductIds = topic.products.map((p) => p.productId);
      } else {
        return {
          data: [],
          total: 0,
          hasNextPage: false,
          page,
          limit,
          totalPages: 0,
        };
      }
    }

    // Build sort options
    const sortOptions = this.buildSortOptions(query.sort);

    const result = await this.flashSaleProductRepository.findManyWithPagination(
      {
        flashSaleId: flashSale.id,
        filterOptions: {
          search: query.filters?.search,
          categoryIds: query.filters?.categoryIds,
          topicProductIds,
          minPrice: query.filters?.minPrice,
          maxPrice: query.filters?.maxPrice,
        },
        sortOptions,
        paginationOptions: { page, limit },
      },
    );

    const data = await this.mapFlashSaleProductsToProducts(result.docs);

    return {
      data,
      total: result.totalDocs,
      hasNextPage: result.hasNextPage ?? false,
      page: result.page ?? page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  /**
   * Get a single flash sale by ID with paginated products
   */
  async getFlashSaleById(
    id: string,
    query?: ShopFlashSaleByIdQueryDto,
  ): Promise<ShopFlashSaleDetailResponseDto> {
    const flashSale = await this.flashSaleRepository.findById(id);

    if (!flashSale) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('flash-sale.notFound'),
      });
    }

    // Ensure flash sale is active
    const now = new Date();
    const status = this.getFlashSaleStatus(flashSale, now);

    if (status !== 'active') {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('flash-sale.notFound'),
      });
    }

    const page = query?.page ?? 1;
    const limit = Math.min(query?.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

    const result = await this.flashSaleProductRepository.findManyWithPagination(
      {
        flashSaleId: flashSale.id,
        paginationOptions: { page, limit },
      },
    );

    const data = await this.mapFlashSaleProductsToProducts(result.docs);

    return {
      id: flashSale.id,
      name: flashSale.name,
      startTime: flashSale.startTime,
      endTime: flashSale.endTime,
      status: 'active',
      data,
      total: result.totalDocs,
      hasNextPage: result.hasNextPage ?? false,
      page: result.page ?? page,
      limit,
      totalPages: result.totalPages,
    };
  }

  /**
   * Build sort options from query sort DTO
   */
  private buildSortOptions(
    sort?: { orderBy?: string; order?: string } | null,
  ): SortFlashSaleProductDto[] {
    if (sort?.orderBy) {
      const field = SORT_FIELD_MAP[sort.orderBy] ?? 'createdAt';
      const discountFields = ['discount', 'discountPercent'];
      const defaultOrder = discountFields.includes(sort.orderBy)
        ? 'desc'
        : 'asc';
      return [
        {
          orderBy: field,
          order: (sort.order ?? defaultOrder) as 'asc' | 'desc',
        },
      ];
    }
    // Default: admin-defined order first, then in-stock products
    return [
      { orderBy: 'order', order: 'asc' },
      { orderBy: 'stock', order: 'desc' },
    ];
  }

  /**
   * Get flash sale status for customer display
   */
  private getFlashSaleStatus(
    flashSale: FlashSale,
    now: Date,
  ): 'active' | 'upcoming' | 'ended' | 'disabled' {
    if (!flashSale.isEnabled) {
      return 'disabled';
    }
    if (flashSale.endTime < now) {
      return 'ended';
    }
    if (flashSale.startTime > now) {
      return 'upcoming';
    }
    return 'active';
  }

  private async mapFlashSaleProductsToProducts(
    flashSaleProducts: FlashSaleProduct[],
  ): Promise<Product[]> {
    if (flashSaleProducts.length === 0) {
      return [];
    }

    const productIds = flashSaleProducts.map((item) => item.productId);
    const products = await this.productRepository.findByIds(productIds);
    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    const result: Product[] = [];

    for (const fsProduct of flashSaleProducts) {
      const product = productMap.get(fsProduct.productId);
      if (!product || product.status !== ProductStatus.ACTIVE) continue;
      // Ẩn parent đã hết ACTIVE variant và strip non-ACTIVE variants khỏi
      // picker để đồng nhất với `/shop/products` và `/shop/topics/...`.
      if (hasZeroActiveVariants(product)) continue;

      const filtered = filterActiveVariants(product);
      filtered.flashSale = {
        flashSaleId: fsProduct.flashSaleId,
        flashSaleName: fsProduct.flashSaleName,
        originalPrice: fsProduct.originalPrice,
        flashSalePrice: fsProduct.flashSalePrice,
        discountType: fsProduct.discountType,
        discountValue: fsProduct.discountValue,
        discountAmount: fsProduct.discountAmount,
        discountPercent: fsProduct.discountPercent,
        promotionalQuantity: fsProduct.promotionalQuantity,
        soldCount: fsProduct.soldCount,
        remainingStock: fsProduct.remainingStock,
        endTime: fsProduct.endTime,
        effectivePrice:
          fsProduct.remainingStock > 0
            ? fsProduct.effectivePrice
            : fsProduct.originalPrice,
      };

      result.push(filtered);
    }

    return result;
  }
}
