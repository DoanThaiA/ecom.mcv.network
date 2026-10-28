import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { AllConfigType } from '@app/config/config.type';
import { throwException } from '@app/utils/errors/throw-exception';
import { NhanhAuthService } from '@app/nhanh/services/nhanh-auth.service';
import { ProductRepository } from '@app/products/domain/product.repository';
import { ProductCategoryRepository } from '@app/product-categories/domain/product-category.repository';
import { ProductInventoryRepository } from '@app/product-inventories/domain/product-inventory.repository';
import { ProductBrandRepository } from '@app/product-brands/domain/product-brand.repository';
import { DepotRepository } from '@app/depots/domain/depot.repository';
import { NhanhProductListFiltersDto } from '@app/nhanh/dto/nhanh-product.dto';
import { NhanhProductSnapshot } from '@app/nhanh/types/nhanh-snapshots';
import {
  NhanhProductCategoryFiltersDto,
  NhanhProductCategoryDto,
} from '@app/nhanh/dto/nhanh-product-category.dto';
import {
  NhanhProductInventoryFiltersDto,
  NhanhProductInventoryDto,
} from '@app/nhanh/dto/nhanh-product-inventory.dto';
import {
  NhanhProductBrandFiltersDto,
  NhanhProductBrandDto,
} from '@app/nhanh/dto/nhanh-product-brand.dto';
import { NhanhDepotDto } from '@app/nhanh/dto/nhanh-depot.dto';
import {
  NhanhProductMapper,
  CategoryInfo,
} from '@app/nhanh/mappers/nhanh-product.mapper';
import { NhanhProductCategoryMapper } from '@app/nhanh/mappers/nhanh-product-category.mapper';
import { NhanhProductInventoryMapper } from '@app/nhanh/mappers/nhanh-product-inventory.mapper';
import { NhanhProductBrandMapper } from '@app/nhanh/mappers/nhanh-product-brand.mapper';
import { NhanhDepotMapper } from '@app/nhanh/mappers/nhanh-depot.mapper';
import { NhanhApiClient } from '@app/nhanh/utils/nhanh-api-client';

/**
 * Worker-only service for syncing data from Nhanh.vn API
 * Contains all sync business logic - should only be used in worker context
 */
@Injectable()
export class NhanhSyncService {
  private readonly logger = new Logger(NhanhSyncService.name);

  // Cursor state for paginated sync (used by syncProductsPage)
  private productSyncCursor: any = null;
  private productSyncCategoryMapping: Map<string, CategoryInfo> | null = null;

  constructor(
    private configService: ConfigService<AllConfigType>,
    private i18n: I18nService,
    private nhanhAuthService: NhanhAuthService,
    private productRepository: ProductRepository,
    private categoryRepository: ProductCategoryRepository,
    private inventoryRepository: ProductInventoryRepository,
    private brandRepository: ProductBrandRepository,
    private depotRepository: DepotRepository,
  ) {}

  /**
   * Sync a single page of products from Nhanh.vn
   * Used by job processor for heartbeat-aware pagination
   *
   * @param filters - Optional filters for product list
   * @param page - Page number (1-based, used for logging only)
   * @returns Object with synced count and hasMore flag
   */
  async syncProductsPage(
    filters?: NhanhProductListFiltersDto,
    page?: number,
  ): Promise<{ synced: number; hasMore: boolean }> {
    // Get businessId from token
    const tokenData = await this.nhanhAuthService.getAccessToken();
    if (!tokenData) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('nhanh.noAccessToken'),
      });
    }
    const businessId = tokenData.businessId.toString();

    // Build category mapping on first page (or if not cached)
    if (!this.productSyncCategoryMapping || page === 1) {
      this.logger.debug('Building category mapping...');
      this.productSyncCategoryMapping = await this.buildCategoryMapping();
      this.productSyncCursor = null; // Reset cursor on first page
      this.logger.debug(
        `Category mapping built with ${this.productSyncCategoryMapping.size} entries`,
      );
    }

    this.logger.debug(`Fetching products page ${page || 'next'}`);

    // Strip date filters (updatedAtFrom/updatedAtTo) to ensure full sync without date restrictions
    const { updatedAtFrom, updatedAtTo, ...safeFilters } = filters ?? {};
    const effectiveFilters = {
      ...safeFilters,
      status: [2, 4],
    };

    const response = await NhanhApiClient.call<NhanhProductSnapshot[]>(
      '/v3.0/product/list',
      {
        filters: effectiveFilters,
        paginator: {
          size: 100,
          sort: { id: 'desc' },
          ...(this.productSyncCursor ? { next: this.productSyncCursor } : {}),
        },
      },
      tokenData,
      this.configService,
      this.i18n,
    );

    let synced = 0;
    if (response.data && response.data.length > 0) {
      // Map all products in batch
      const productsBatch = response.data
        .map((nhanhProduct) => {
          try {
            return NhanhProductMapper.toDomain(
              nhanhProduct,
              businessId,
              this.productSyncCategoryMapping!,
            );
          } catch (error) {
            this.logger.error(
              `Failed to map product ${nhanhProduct.code}: ${error.message}`,
            );
            return null;
          }
        })
        .filter((p) => p !== null);

      // Bulk upsert all products in one operation
      synced = await this.productRepository.bulkUpsert(productsBatch);
      this.logger.debug(`Bulk upserted ${synced} products from page ${page}`);
    }

    // Update cursor for next page
    const hasMore = !!response.paginator?.next;
    this.productSyncCursor = response.paginator?.next;

    // Clear cache when done
    if (!hasMore) {
      this.productSyncCategoryMapping = null;
      this.productSyncCursor = null;
    }

    return { synced, hasMore };
  }

  /**
   * Sync all products from Nhanh.vn (legacy method, no heartbeat support)
   * Consider using syncProductsPage for heartbeat-aware sync
   */
  async syncProducts(filters?: NhanhProductListFiltersDto): Promise<void> {
    this.logger.log('Starting product sync from Nhanh.vn');

    let page = 0;
    let hasMore = true;
    let totalSynced = 0;

    while (hasMore) {
      page++;
      const result = await this.syncProductsPage(filters, page);
      totalSynced += result.synced;
      hasMore = result.hasMore;
    }

    this.logger.log(`Product sync completed. Total synced: ${totalSynced}`);
  }

  /**
   * Synchronize a single product detail from Nhanh.vn
   *
   * @param nhanhProductId - Nhanh product ID
   * @returns Synced product
   */
  async syncProductById(nhanhProductId: number): Promise<void> {
    this.logger.log(`Syncing product detail for ID: ${nhanhProductId}`);

    // Get businessId from token
    const tokenData = await this.nhanhAuthService.getAccessToken();
    if (!tokenData) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('nhanh.noAccessToken'),
      });
    }
    const businessId = tokenData.businessId.toString();

    // Build category mapping for product category resolution
    const categoryMapping = await this.buildCategoryMapping();

    const response = await NhanhApiClient.call<NhanhProductSnapshot>(
      '/v3.0/product/detail',
      {
        filters: { id: nhanhProductId },
      },
      tokenData,
      this.configService,
      this.i18n,
    );

    if (!response.data) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('nhanh.productNotFound'),
      });
    }

    const productData = NhanhProductMapper.toDomain(
      response.data,
      businessId,
      categoryMapping,
    );

    // Check if product already exists using snapshot.id
    const snapshotId = (productData.snapshot as any)?.id;
    const existing = snapshotId
      ? await this.productRepository.findBySnapshotId(snapshotId, 'nhanh')
      : null;

    if (existing) {
      // Exclude description and content from update to preserve CMS customizations
      const { description, content, ...updateData } = productData;
      await this.productRepository.update(existing.id, updateData);
      this.logger.log(`Updated product detail: ${productData.code}`);
    } else {
      await this.productRepository.create(productData);
      this.logger.log(`Created product from detail: ${productData.code}`);
    }
  }

  /**
   * Synchronize categories from Nhanh.vn to our database
   * Categories are synced with parent-child relationships resolved in a second pass
   * Handles pagination automatically using cursor-based pagination
   *
   * @param filters - Optional filters for category sync
   * @returns Promise that resolves when sync completes
   */
  async syncProductCategories(
    filters?: NhanhProductCategoryFiltersDto,
  ): Promise<void> {
    this.logger.log('Starting category sync from Nhanh.vn');

    // Get businessId from token
    const tokenData = await this.nhanhAuthService.getAccessToken();
    if (!tokenData) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('nhanh.noAccessToken'),
      });
    }
    const businessId = tokenData.businessId.toString();

    // Phase 1: Fetch all categories with pagination and upsert them
    let page = 0;
    let hasMore = true;
    let nextCursor: any = null;
    let totalSynced = 0;
    const allNhanhCategories: NhanhProductCategoryDto[] = [];

    while (hasMore) {
      page++;
      this.logger.debug(`Fetching categories page ${page}`);

      const response = await NhanhApiClient.call<NhanhProductCategoryDto[]>(
        '/v3.0/product/category',
        {
          filters: filters || {},
          paginator: {
            size: 100,
            sort: { id: 'desc' },
            ...(nextCursor ? { next: nextCursor } : {}),
          },
        },
        tokenData,
        this.configService,
        this.i18n,
      );

      if (response.data && response.data.length > 0) {
        // Store categories for parent mapping phase
        allNhanhCategories.push(...response.data);

        // Map all categories in batch
        const categoriesBatch = response.data
          .map((nhanhCategory) => {
            try {
              return NhanhProductCategoryMapper.toDomain(
                nhanhCategory,
                businessId,
              );
            } catch (error) {
              this.logger.error(
                `Failed to map category ${nhanhCategory.name}: ${error.message}`,
              );
              return null;
            }
          })
          .filter((c) => c !== null);

        // Bulk upsert all categories in one operation
        const upserted =
          await this.categoryRepository.bulkUpsert(categoriesBatch);
        totalSynced += upserted;
        this.logger.debug(
          `Bulk upserted ${upserted} categories from page ${page}`,
        );
      }

      // Check for next page
      hasMore = !!response.paginator?.next;
      nextCursor = response.paginator?.next;
    }

    if (allNhanhCategories.length === 0) {
      this.logger.log('No categories to sync');
      return;
    }

    this.logger.log(`Upserted ${totalSynced} categories`);

    // Phase 2: Build parent mapping and update parentId fields
    const snapshotIdToMongoId =
      await this.categoryRepository.buildSnapshotIdMapping(businessId, 'nhanh');
    this.logger.debug(`Built mapping with ${snapshotIdToMongoId.size} entries`);

    // Build updates for categories that have a parent
    const parentUpdates: Array<{ id: string; parentId: string }> = [];
    for (const nhanhCategory of allNhanhCategories) {
      // Skip root categories (parentId = 0 or undefined)
      if (!nhanhCategory.parentId || nhanhCategory.parentId === 0) {
        continue;
      }

      // Get MongoDB _id for this category
      const categoryMongoId = snapshotIdToMongoId.get(
        nhanhCategory.id.toString(),
      );
      if (!categoryMongoId) {
        this.logger.warn(
          `Category ${nhanhCategory.name} (id: ${nhanhCategory.id}) not found in mapping`,
        );
        continue;
      }

      // Get MongoDB _id for parent category
      const parentMongoId = snapshotIdToMongoId.get(
        nhanhCategory.parentId.toString(),
      );
      if (!parentMongoId) {
        this.logger.warn(
          `Parent category (id: ${nhanhCategory.parentId}) not found for ${nhanhCategory.name}`,
        );
        continue;
      }

      parentUpdates.push({
        id: categoryMongoId,
        parentId: parentMongoId,
      });
    }

    if (parentUpdates.length > 0) {
      const updated =
        await this.categoryRepository.bulkUpdateParentIds(parentUpdates);
      this.logger.log(`Updated ${updated} parent relationships`);
    }

    this.logger.log(`Category sync completed. Total synced: ${totalSynced}`);
  }

  /**
   * Synchronize brands from Nhanh.vn to our database
   * Handles pagination automatically using cursor-based pagination
   *
   * @param filters - Optional filters for brand sync
   * @returns Promise that resolves when sync completes
   */
  async syncProductBrands(
    filters?: NhanhProductBrandFiltersDto,
  ): Promise<void> {
    this.logger.log('Starting brand sync from Nhanh.vn');

    // Get businessId from token
    const tokenData = await this.nhanhAuthService.getAccessToken();
    if (!tokenData) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('nhanh.noAccessToken'),
      });
    }
    const businessId = tokenData.businessId.toString();

    let page = 0;
    let hasMore = true;
    let nextCursor: any = null;
    let totalSynced = 0;

    while (hasMore) {
      page++;
      this.logger.debug(`Fetching brands page ${page}`);

      const response = await NhanhApiClient.call<NhanhProductBrandDto[]>(
        '/v3.0/product/brand',
        {
          filters: filters || {},
          paginator: {
            size: 100,
            sort: { id: 'desc' },
            ...(nextCursor ? { next: nextCursor } : {}),
          },
        },
        tokenData,
        this.configService,
        this.i18n,
      );

      if (response.data && response.data.length > 0) {
        // Map all brands in batch
        const brandsBatch = response.data
          .map((nhanhProductBrand) => {
            try {
              return NhanhProductBrandMapper.toDomain(
                nhanhProductBrand,
                businessId,
              );
            } catch (error) {
              this.logger.error(
                `Failed to map brand ${nhanhProductBrand.name}: ${error.message}`,
              );
              return null;
            }
          })
          .filter((b) => b !== null);

        // Bulk upsert all brands in one operation
        const upserted = await this.brandRepository.bulkUpsert(brandsBatch);
        totalSynced += upserted;
        this.logger.debug(`Bulk upserted ${upserted} brands from page ${page}`);
      }

      // Check for next page
      hasMore = !!response.paginator?.next;
      nextCursor = response.paginator?.next;

      if (!hasMore) {
        this.logger.log(
          `ProductBrand sync completed. Total synced: ${totalSynced}`,
        );
      }
    }
  }

  /**
   * Synchronize inventory from Nhanh.vn to our database
   * Handles pagination automatically
   *
   * @param filters - Optional filters for inventory sync
   * @returns Promise that resolves when sync completes
   */
  async syncProductInventories(
    filters?: NhanhProductInventoryFiltersDto,
  ): Promise<void> {
    this.logger.log('Starting inventory sync from Nhanh.vn');

    // Get businessId from token
    const tokenData = await this.nhanhAuthService.getAccessToken();
    if (!tokenData) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('nhanh.noAccessToken'),
      });
    }
    const businessId = tokenData.businessId.toString();

    // Build product mapping (Nhanh ID -> Internal Product ID) to avoid individual lookups
    this.logger.debug('Building product ID mapping...');
    const productMapping = await this.buildProductMapping();
    this.logger.debug(
      `Product mapping built with ${productMapping.size} entries`,
    );

    let page = 0;
    let hasMore = true;
    let nextCursor: any = null;
    let totalSynced = 0;

    while (hasMore) {
      page++;
      this.logger.debug(`Fetching inventory page ${page}`);

      // Strip date filters — inventory sync always fetches full live data
      const { updatedAtFrom, updatedAtTo, ...safeFilters } = filters ?? {};
      const effectiveFilters = {
        ...safeFilters,
        status: [2, 4],
      };

      const response = await NhanhApiClient.call<NhanhProductInventoryDto[]>(
        '/v3.0/product/inventory',
        {
          filters: effectiveFilters,
          paginator: {
            size: 100,
            sort: { productId: 'desc' },
            ...(nextCursor ? { next: nextCursor } : {}),
          },
        },
        tokenData,
        this.configService,
        this.i18n,
      );

      if (response.data && response.data.length > 0) {
        // Map all inventories in batch
        const inventoryBatch = response.data
          .map((nhanhProductInventory) => {
            const productId = productMapping.get(
              nhanhProductInventory.productId.toString(),
            );

            if (!productId) {
              this.logger.warn(
                `Product not found for inventory sync: ${nhanhProductInventory.productId}`,
              );
              return null;
            }

            try {
              return NhanhProductInventoryMapper.toDomain(
                nhanhProductInventory,
                businessId,
                productId,
              );
            } catch (error) {
              this.logger.error(
                `Failed to map inventory for product ${nhanhProductInventory.productId}: ${error.message}`,
              );
              return null;
            }
          })
          .filter((i) => i !== null);

        // Bulk upsert all inventories in one operation
        const upserted =
          await this.inventoryRepository.bulkUpsert(inventoryBatch);
        totalSynced += upserted;
        this.logger.debug(
          `Bulk upserted ${upserted} inventories from page ${page}`,
        );
      }

      // Check for next page
      hasMore = !!response.paginator?.next;
      nextCursor = response.paginator?.next;

      if (!hasMore) {
        this.logger.log(
          `ProductInventory sync completed. Total synced: ${totalSynced}`,
        );
      }
    }
  }

  /**
   * Synchronize depots from Nhanh.vn to our database
   * Depots are warehouses used as shipping origins
   *
   * @returns Promise that resolves when sync completes
   */
  async syncDepots(): Promise<void> {
    this.logger.log('Starting depot sync from Nhanh.vn');

    // Get businessId from token
    const tokenData = await this.nhanhAuthService.getAccessToken();
    if (!tokenData) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('nhanh.noAccessToken'),
      });
    }
    const businessId = tokenData.businessId.toString();

    const response = await NhanhApiClient.call<NhanhDepotDto[]>(
      '/v3.0/business/depot',
      {},
      tokenData,
      this.configService,
      this.i18n,
    );

    if (!response.data || response.data.length === 0) {
      this.logger.log('No depots to sync');
      return;
    }

    // Map all depots
    const depotsBatch = response.data
      .map((nhanhDepot) => {
        try {
          return NhanhDepotMapper.toDomain(nhanhDepot, businessId);
        } catch (error) {
          this.logger.error(
            `Failed to map depot ${nhanhDepot.name}: ${error.message}`,
          );
          return null;
        }
      })
      .filter((d) => d !== null);

    // Bulk upsert all depots
    const upserted = await this.depotRepository.bulkUpsert(depotsBatch);
    this.logger.log(`Depot sync completed. Total synced: ${upserted}`);
  }

  /**
   * Embed variants into parent products after sync
   * This eliminates N+1 queries at read time by pre-computing the relationship
   *
   * @param businessId - Business ID to process
   * @returns Number of parent products updated
   */
  async embedVariantsInParents(businessId: string): Promise<number> {
    this.logger.log(
      `Embedding variants into parent products for business: ${businessId}`,
    );

    const updated = await this.productRepository.embedVariantsInParents(
      businessId,
      'nhanh',
    );

    this.logger.log(`Embedded variants into ${updated} parent products`);
    return updated;
  }

  /**
   * Populate parent metadata for all variant products after sync
   * This enables efficient parent lookup in shopping flow (cart, checkout)
   * for applying flash sales and combos to variants
   *
   * @param businessId - Business ID to process
   * @returns Number of variants updated
   */
  async populateParentMetadata(businessId: string): Promise<number> {
    this.logger.log(
      `Populating parent metadata for variants in business: ${businessId}`,
    );

    const updated = await this.productRepository.populateParentMetadata(
      businessId,
      'nhanh',
    );

    this.logger.log(`Populated parent metadata for ${updated} variants`);
    return updated;
  }

  /**
   * Build a mapping of Nhanh category IDs to our category info (id + name)
   * This allows resolving product categories during sync
   * @private
   */
  private async buildCategoryMapping(): Promise<Map<string, CategoryInfo>> {
    const mapping = new Map<string, CategoryInfo>();

    // Fetch all categories from Nhanh source
    let page = 1;
    const limit = 1000;
    let hasMore = true;

    while (hasMore) {
      const result = await this.categoryRepository.findManyWithPagination({
        filterOptions: { source: 'nhanh' },
        paginationOptions: { page, limit },
      });

      for (const category of result.docs) {
        // Extract source ID from snapshot
        const snapshotId = (category.snapshot as any)?.id;
        if (category.source === 'nhanh' && snapshotId) {
          mapping.set(snapshotId.toString(), {
            id: category.id,
            name: category.name,
          });
        }
      }

      hasMore = result.hasNextPage ?? false;
      page++;
    }

    return mapping;
  }

  /**
   * Build a mapping of Nhanh product IDs to internal product IDs
   * This avoids individual database lookups during inventory sync
   * Uses snapshot.id from the snapshot field
   * @private
   */
  private async buildProductMapping(): Promise<Map<string, string>> {
    return this.productRepository.getNhanhIdMapping();
  }
}
