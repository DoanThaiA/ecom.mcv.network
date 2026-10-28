/**
 * Nhanh ProductBrand API request filters
 */
export class NhanhProductBrandFiltersDto {
  /** ProductBrand IDs (max 100) */
  ids?: number[];

  /** ProductBrand name search */
  name?: string;

  /** ProductBrand code search */
  code?: string;

  /** ProductBrand status: 1=Active, 2=Inactive */
  status?: number;
}

/**
 * Nhanh ProductBrand API response item
 */
export class NhanhProductBrandDto {
  id: number;
  code?: string;
  name: string;
  status: number;
  parentId?: number;
  createdAt?: number;
}
