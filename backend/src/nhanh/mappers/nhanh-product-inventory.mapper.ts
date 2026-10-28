import {
  ProductInventory,
  DepotProductInventory,
} from '../../product-inventories/domain/product-inventory';
import { NhanhProductInventoryDto } from '../dto/nhanh-product-inventory.dto';
import { NhanhProductInventorySnapshot } from '../types/nhanh-snapshots';

/**
 * Mapper for converting Nhanh inventory data to domain ProductInventory entity
 *
 * Data architecture:
 * - Stores raw Nhanh data in `snapshot` field without modification
 * - Derives domain fields from snapshot data with appropriate conversions
 */
export class NhanhProductInventoryMapper {
  /**
   * Convert Nhanh product inventory to ProductInventory domain entity
   * @param nhanhProductInventory - Nhanh inventory data
   * @param businessId - The business ID from Nhanh token
   * @param productId - Internal product ID
   * @param depotMapping - Map of source depot IDs to internal depot IDs (optional)
   * @returns ProductInventory domain entity with snapshot
   */
  static toDomain(
    nhanhProductInventory: NhanhProductInventoryDto,
    businessId: string,
    productId: string,
    depotMapping?: Map<string, string>,
  ): Omit<ProductInventory, 'id' | 'createdAt' | 'updatedAt'> {
    // Store raw data as snapshot
    const snapshot: NhanhProductInventorySnapshot = {
      ...nhanhProductInventory,
    };

    // Map depot data
    const depots: DepotProductInventory[] =
      nhanhProductInventory.inventory.depots.map((depot) => ({
        depotId: depotMapping?.get(depot.id.toString()) || depot.id.toString(),
        remain: depot.remain,
        available: depot.available,
        shipping: depot.shipping || 0,
        damaged: depot.damaged || 0,
        holding: depot.holding || 0,
        // Convert empty array or invalid warranty to undefined
        warranty:
          depot.warranty &&
          typeof depot.warranty === 'object' &&
          !Array.isArray(depot.warranty)
            ? depot.warranty
            : undefined,
      }));

    return {
      businessId,
      productId,
      source: 'nhanh',
      snapshot,
      // Derive domain fields from snapshot
      barcode: nhanhProductInventory.barcode || null,
      productName: nhanhProductInventory.name,
      totalRemain: nhanhProductInventory.inventory.remain,
      totalAvailable: nhanhProductInventory.inventory.available,
      totalShipping: nhanhProductInventory.inventory.shipping || 0,
      totalDamaged: nhanhProductInventory.inventory.damaged || 0,
      totalHolding: nhanhProductInventory.inventory.holding || 0,
      prices: {
        ...nhanhProductInventory.prices,
        retail: nhanhProductInventory.prices?.price || 0,
      },
      depots,
    };
  }
}
