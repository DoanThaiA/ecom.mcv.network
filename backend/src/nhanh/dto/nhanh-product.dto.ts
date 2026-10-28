/**
 * Nhanh Product List API request filters
 */
export class NhanhProductListFiltersDto {
  /** Product IDs (max 100) */
  ids?: number[];

  /** Product name, code, or barcode */
  name?: string;

  /** Parent product ID (-1: independent, -2: parent) */
  parentId?: number;

  /** Category ID */
  categoryId?: number;

  /** Product status values */
  status?: number[];

  /** Price range */
  price?: {
    from?: number;
    to?: number;
  };

  /** ProductBrand ID */
  brandId?: number;

  /** IMEI number */
  imei?: string;

  /** Start Unix timestamp for product updates (seconds) */
  updatedAtFrom?: number;

  /** End Unix timestamp for product updates (seconds) */
  updatedAtTo?: number;
}
