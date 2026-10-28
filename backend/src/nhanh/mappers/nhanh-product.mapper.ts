import { Product } from '../../products/domain/product';
import { ProductStatus } from '../../products/domain/product-status.enum';
import { ProductType } from '../../products/domain/product-type.enum';
import { NhanhProductSnapshot } from '../types/nhanh-snapshots';

/**
 * Category info for mapping
 */
export interface CategoryInfo {
  id: string;
  name: string;
}

/**
 * Mapper for converting Nhanh product data to domain Product entity
 *
 * Data architecture:
 * - Stores raw Nhanh data in `snapshot` field without modification
 * - Derives domain fields from snapshot data with appropriate conversions
 *
 * Nhanh Status Mapping:
 * 1 -> NEW (offline only)
 * 2 -> ACTIVE (selling)
 * 3 -> DISCONTINUED (hidden)
 * 4 -> OUT_OF_STOCK
 */
export class NhanhProductMapper {
  /**
   * Convert Nhanh product data to Product domain entity
   * Works with both list API and detail API responses
   * @param snapshot - Nhanh product data from API
   * @param businessId - The business ID from Nhanh token
   * @param categoryMapping - Optional map of Nhanh category ID to our category info
   * @returns Product domain entity with snapshot
   */
  static toDomain(
    snapshot: NhanhProductSnapshot,
    businessId: string,
    categoryMapping?: Map<string, CategoryInfo>,
  ): Omit<Product, 'id' | 'createdAt' | 'updatedAt'> {
    // Get category from mapping using categoryId or category.id from snapshot
    const nhanhCategoryId =
      snapshot.categoryId?.toString() || snapshot.category?.id?.toString();
    const category =
      nhanhCategoryId && categoryMapping
        ? categoryMapping.get(nhanhCategoryId) || null
        : null;

    return {
      businessId,
      source: 'nhanh',
      snapshot,
      // Derive domain fields from snapshot
      code: snapshot.code,
      barcode: snapshot.barcode || null,
      name: snapshot.name,
      description: snapshot.description || null,
      content: snapshot.content || null,
      prices: {
        retail: snapshot.prices.retail,
        wholesale: snapshot.prices.wholesale,
        import: snapshot.prices.import,
        old: snapshot.prices.old,
        avgCost: snapshot.prices.avgCost,
      },
      vat: snapshot.vat || null,
      images: {
        avatar: snapshot.images?.avatar || null,
        others: snapshot.images?.others || [],
      },
      // Don't sync inventory.depots from snapshot
      inventory: snapshot.inventory
        ? {
            remain: snapshot.inventory.remain,
            shipping: snapshot.inventory.shipping,
            damaged: snapshot.inventory.damaged,
            holding: snapshot.inventory.holding,
            warranty: snapshot.inventory.warranty?.remain,
            warrantyHolding: snapshot.inventory.warranty?.holding,
            holdingNew: snapshot.inventory.holdingNew,
            shippingExport: snapshot.inventory.shippingExport,
            available: snapshot.inventory.available,
          }
        : null,
      // Stock for sorting: for parent products, this is updated during variant embedding
      // For standalone products, it equals inventory.available
      stock: snapshot.inventory?.available ?? 0,
      status: snapshot.status as ProductStatus,
      type: ProductType.REGULAR,
      category,
      deletedAt: null,
      attributes: snapshot.attributes || undefined,
      hide: false,
    };
  }
}
