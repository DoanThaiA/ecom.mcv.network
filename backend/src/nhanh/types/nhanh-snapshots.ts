/**
 * Snapshot types for storing raw Nhanh data
 * These types represent the raw data received from Nhanh.vn API
 * stored without any processing in the 'snapshot' field
 */

/**
 * Raw Nhanh product data snapshot
 * Corresponds to NhanhProductListItemDto or NhanhProductDetailDto
 * Stores complete raw data from Nhanh API without processing
 */
export interface NhanhProductSnapshot {
  id: number;
  parentId?: number;
  code: string;
  barcode?: string;
  name: string;
  otherName?: string;
  status: string | number;
  /** Category ID from detail API */
  categoryId?: number;
  category?: {
    id: number;
    code?: string;
    name: string;
  };
  internalCategory?: {
    id: number;
    code?: string;
    name: string;
  };
  prices: {
    retail: number;
    import?: number;
    old?: number;
    wholesale?: number;
    avgCost?: number;
  };
  vat?: number;
  images?: {
    avatar?: string;
    others?: string[];
  };
  /** Product description (short) */
  description?: string;
  /** Product content (detailed HTML content) */
  content?: string;
  /** Product videos */
  videos?: Array<{
    title?: string;
    src?: string;
  }>;
  warranty?: any; // Can be array or object from Nhanh
  brand?: {
    id: number;
    name: string;
  };
  brandId?: number; // From list API
  type?:
    | {
        id: number;
        name: string;
      }
    | number; // Can be object (detail) or number (list)
  shipping?: {
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
  };
  countryName?: string;
  inventory?: {
    remain: number;
    shipping?: number;
    damaged?: number;
    holding?: number;
    warranty?: {
      remain?: number;
      holding?: number;
    };
    holdingNew?: number;
    shippingExport?: number;
    available: number;
    depots?: Array<{
      id: number;
      remain: number;
      shipping?: number;
      damaged?: number;
      holding?: number;
      warranty?: {
        remain?: number;
        holding?: number;
      };
      warrantyHolding?: number;
      holdingNew?: number;
      shippingExport?: number;
      available: number;
    }>;
  };
  attributes?: Array<{
    id?: number | string;
    name: string;
    value: string;
  }>;
  /** Unit measurements with pricing */
  units?: {
    name?: string;
    list?: Array<{
      id?: number;
      name?: string;
      quantity?: number;
      price?: {
        retail?: number;
        import?: number;
        wholesale?: number;
      };
    }>;
  };
  /** Branch-specific pricing */
  branchPrices?: Array<{
    branch?: {
      id?: number;
      name?: string;
    };
    price?: number;
    wholesalePrice?: number;
  }>;
  /** Child products (variants) */
  childs?: Array<NhanhProductSnapshot>;
  suppliers?: {
    id: number;
    name: string;
    mobile?: string;
  };
  updatedAt: number;
  createdAt: number;
}

/**
 * Raw Nhanh category data snapshot
 * Corresponds to NhanhProductCategoryDto
 */
export interface NhanhProductCategorySnapshot {
  id: number;
  parentId?: number;
  code: string;
  name: string;
  order?: number;
  image?: string;
  content?: string;
  status: number;
}

/**
 * Raw Nhanh brand data snapshot
 * Corresponds to NhanhProductBrandDto
 */
export interface NhanhProductBrandSnapshot {
  id: number;
  code?: string;
  name: string;
  status: number;
  parentId?: number;
  createdAt?: number;
}

/**
 * Raw Nhanh inventory data snapshot
 * Corresponds to NhanhProductInventoryDto
 */
export interface NhanhProductInventorySnapshot {
  productId: number;
  barcode?: string;
  name: string;
  prices?: {
    price: number;
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

/**
 * Raw Nhanh depot location data
 * Nested object containing address and geographic identifiers
 */
export interface NhanhDepotLocationSnapshot {
  cityId?: number;
  cityName?: string;
  districtId?: number;
  districtName?: string;
  wardId?: number;
  wardName?: string;
  address?: string;
}

/**
 * Raw Nhanh depot data snapshot
 * Corresponds to NhanhDepotDto from /v3.0/business/depot API
 * @see https://apidocs.nhanh.vn/v3/business/depot
 */
export interface NhanhDepotSnapshot {
  id: number;
  code?: string;
  name: string;
  mobile?: string;
  location?: NhanhDepotLocationSnapshot;
}
