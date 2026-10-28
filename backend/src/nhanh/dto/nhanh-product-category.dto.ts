/**
 * Nhanh ProductCategory API request filters
 */
export class NhanhProductCategoryFiltersDto {
  /** ProductCategory name */
  name?: string;

  /** ProductCategory code */
  code?: string;

  /** ProductCategory status (1=Active, 2=Inactive) */
  status?: number;
}

/**
 * Nhanh ProductCategory API response item
 */
export class NhanhProductCategoryDto {
  id: number;
  parentId?: number;
  code: string;
  name: string;
  order?: number;
  image?: string;
  content?: string;
  status: number;
}
