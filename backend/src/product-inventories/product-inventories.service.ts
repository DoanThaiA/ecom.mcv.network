import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { PaginateResult } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ProductInventoryRepository } from './domain/product-inventory.repository';
import { ProductInventory } from './domain/product-inventory';
import { QueryProductInventoryDto } from './dto/query-product-inventory.dto';
import { throwException } from '../utils/errors/throw-exception';
import { NhanhAuthService } from '../nhanh/services/nhanh-auth.service';
import { ProductRepository } from '../products/domain/product.repository';

/**
 * Service for managing inventory (our business domain)
 * Interacts ONLY with our domain models
 */
@Injectable()
export class ProductInventoriesService {
  private readonly logger = new Logger(ProductInventoriesService.name);

  constructor(
    private readonly productInventoryRepository: ProductInventoryRepository,
    private readonly productRepository: ProductRepository,
    private readonly i18n: I18nService,
    private readonly nhanhAuthService: NhanhAuthService,
  ) {}

  /**
   * Find inventory records with filtering and pagination
   *
   * @param query - Query parameters for filtering
   * @returns Array of inventory records
   */
  async findAll(
    query: QueryProductInventoryDto,
  ): Promise<PaginateResult<ProductInventory>> {
    this.logger.debug(`Finding inventory with query: ${JSON.stringify(query)}`);

    // Get businessId from cached token
    const tokenData = await this.nhanhAuthService.getAccessToken();
    const businessId = tokenData?.businessId.toString();

    // Add businessId to filter options
    const filterOptions = {
      ...query.filters,
      ...(businessId && { businessId }),
    };

    return this.productInventoryRepository.findManyWithPagination({
      filterOptions,
      sortOptions: query.sort,
      paginationOptions: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
      },
    });
  }

  /**
   * Find inventory by ID with variant inventories
   *
   * @param id - ProductInventory ID
   * @returns ProductInventory record with variant inventories for parent products
   */
  async findOne(id: string): Promise<ProductInventory> {
    const inventory = await this.productInventoryRepository.findById(id);

    if (!inventory) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('product-inventory.notFound'),
      });
    }

    return this.attachVariantInventories(inventory);
  }

  /**
   * Find inventory by product ID with variant inventories
   * For parent products without their own inventory, returns variant inventories
   *
   * @param productId - Product ID
   * @returns ProductInventory record with variant inventories, or just variant inventories for parent products
   */
  async findByProductId(productId: string): Promise<ProductInventory> {
    const inventory =
      await this.productInventoryRepository.findByProductId(productId);

    if (inventory) {
      return this.attachVariantInventories(inventory);
    }

    // No inventory found - check if this is a parent product with variants
    const product = await this.productRepository.findById(productId);

    if (product?.variants?.length) {
      // Parent product - return aggregated inventory from variants
      const variantIds = product.variants.map((v) => v.id);
      const variantInventories =
        await this.productInventoryRepository.findByProductIds(variantIds);

      // Enrich variant inventories with product metadata
      const enrichedVariantInventories = this.enrichInventoriesWithProductData(
        variantInventories,
        product.variants,
      );

      // Aggregate totals from all variant inventories
      const aggregated = this.aggregateVariantInventories(variantInventories);

      return {
        id: '',
        businessId: product.businessId,
        productId: product.id,
        source: product.source,
        productName: product.name,
        image: product.images,
        totalRemain: aggregated.totalRemain,
        totalAvailable: aggregated.totalAvailable,
        totalShipping: aggregated.totalShipping,
        totalDamaged: aggregated.totalDamaged,
        totalHolding: aggregated.totalHolding,
        depots: aggregated.depots,
        createdAt: new Date(),
        updatedAt: new Date(),
        variantInventories: enrichedVariantInventories,
      };
    }

    throwException({
      status: HttpStatus.NOT_FOUND,
      message: this.i18n.t('product-inventory.notFound'),
    });
  }

  /**
   * Check if a product is available (has stock)
   *
   * @param productId - Product ID
   * @returns true if product has available stock
   */
  async checkAvailability(productId: string): Promise<boolean> {
    const inventory =
      await this.productInventoryRepository.findByProductId(productId);

    if (!inventory) {
      return false;
    }

    return inventory.totalAvailable > 0;
  }

  /**
   * Get available quantity for a product
   *
   * @param productId - Product ID
   * @returns Available quantity
   */
  async getAvailableQuantity(productId: string): Promise<number> {
    const inventory =
      await this.productInventoryRepository.findByProductId(productId);

    if (!inventory) {
      return 0;
    }

    return inventory.totalAvailable;
  }

  /**
   * Get inventory statistics
   *
   * @returns Statistics object
   */
  getStatistics(): {
    totalProducts: number;
    totalStock: number;
    totalAvailable: number;
    outOfStock: number;
  } {
    // TODO: Implement aggregation queries
    this.logger.debug('Getting inventory statistics');

    return {
      totalProducts: 0,
      totalStock: 0,
      totalAvailable: 0,
      outOfStock: 0,
    };
  }

  /**
   * Attach variant inventories to a parent product's inventory
   * For parent products, fetches inventory records for all embedded variants
   * and enriches them with product metadata (name, image)
   *
   * @param inventory - Parent inventory record
   * @returns Inventory with variantInventories array (empty for non-parent products)
   */
  private async attachVariantInventories(
    inventory: ProductInventory,
  ): Promise<ProductInventory> {
    // Fetch the product to get embedded variants
    const product = await this.productRepository.findById(inventory.productId);

    // If no product or no variants, return inventory as-is
    if (!product?.variants?.length) {
      return inventory;
    }

    // Extract variant product IDs and fetch their inventories in batch
    const variantIds = product.variants.map((v) => v.id);
    const variantInventories =
      await this.productInventoryRepository.findByProductIds(variantIds);

    // Enrich variant inventories with product metadata
    const enrichedVariantInventories = this.enrichInventoriesWithProductData(
      variantInventories,
      product.variants,
    );

    return {
      ...inventory,
      variantInventories: enrichedVariantInventories,
    };
  }

  /**
   * Enrich inventory records with product metadata
   * Overrides productName, barcode and adds image from the corresponding Product
   *
   * @param inventories - Array of inventory records
   * @param products - Array of Product records to use for enrichment
   * @returns Enriched inventory records
   */
  private enrichInventoriesWithProductData(
    inventories: ProductInventory[],
    products: Array<{
      id: string;
      name: string;
      barcode?: string | null;
      images: { avatar?: string | null; others?: string[] };
    }>,
  ): ProductInventory[] {
    // Create a map for O(1) lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    return inventories.map((inv) => {
      const product = productMap.get(inv.productId);
      if (!product) {
        return inv;
      }

      return {
        ...inv,
        productName: product.name,
        barcode: product.barcode,
        image: product.images,
      };
    });
  }

  /**
   * Aggregate inventory data from multiple variant inventories
   * Sums up totals and merges depot inventories
   *
   * @param variantInventories - Array of variant inventory records
   * @returns Aggregated inventory totals and depot breakdown
   */
  private aggregateVariantInventories(
    variantInventories: ProductInventory[],
  ): Pick<
    ProductInventory,
    | 'totalRemain'
    | 'totalAvailable'
    | 'totalShipping'
    | 'totalDamaged'
    | 'totalHolding'
    | 'depots'
  > {
    const depotMap = new Map<
      string,
      {
        depotId: string;
        remain: number;
        available: number;
        shipping: number;
        damaged: number;
        holding: number;
      }
    >();

    let totalRemain = 0;
    let totalAvailable = 0;
    let totalShipping = 0;
    let totalDamaged = 0;
    let totalHolding = 0;

    for (const inv of variantInventories) {
      totalRemain += inv.totalRemain ?? 0;
      totalAvailable += inv.totalAvailable ?? 0;
      totalShipping += inv.totalShipping ?? 0;
      totalDamaged += inv.totalDamaged ?? 0;
      totalHolding += inv.totalHolding ?? 0;

      // Aggregate depot-level inventories
      for (const depot of inv.depots ?? []) {
        const existing = depotMap.get(depot.depotId);
        if (existing) {
          existing.remain += depot.remain ?? 0;
          existing.available += depot.available ?? 0;
          existing.shipping += depot.shipping ?? 0;
          existing.damaged += depot.damaged ?? 0;
          existing.holding += depot.holding ?? 0;
        } else {
          depotMap.set(depot.depotId, {
            depotId: depot.depotId,
            remain: depot.remain ?? 0,
            available: depot.available ?? 0,
            shipping: depot.shipping ?? 0,
            damaged: depot.damaged ?? 0,
            holding: depot.holding ?? 0,
          });
        }
      }
    }

    return {
      totalRemain,
      totalAvailable,
      totalShipping,
      totalDamaged,
      totalHolding,
      depots: Array.from(depotMap.values()),
    };
  }
}
