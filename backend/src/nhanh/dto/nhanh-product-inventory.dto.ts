/**
 * Nhanh ProductInventory API request filters
 */
export class NhanhProductInventoryFiltersDto {
  /** Product IDs (max 100) */
  ids?: number[];

  /** Product name, code, or barcode */
  name?: string;

  /** Depot/warehouse IDs */
  depotIds?: number[];

  /** Category ID */
  categoryId?: number;

  /** Product status values */
  status?: number[];

  /** ProductBrand IDs */
  brandIds?: number[];

  /** Start datetime for update range (Y-m-d H:i:s format, e.g., 2025-01-01 10:30:00) */
  updatedAtFrom?: string;

  /** End datetime for update range (Y-m-d H:i:s format, e.g., 2025-01-01 10:30:00) */
  updatedAtTo?: string;
}

/**
 * Nhanh ProductInventory API response item
 */
export class NhanhProductInventoryDto {
  productId: number;
  barcode?: string;
  name: string;
  prices?: {
    price: number; // retail price
    wholesale?: number;
    import?: number;
    avgCost?: number;
  };
  inventory: {
    remain: number;
    shipping?: number;
    damaged?: number;
    holding?: number;
    available: number;
    warranty?: {
      remain?: number;
      holding?: number;
    };
    depots: Array<{
      id: number;
      remain: number;
      shipping?: number;
      damaged?: number;
      holding?: number;
      available: number;
      warranty?: {
        remain?: number;
        holding?: number;
      };
    }>;
  };
}
