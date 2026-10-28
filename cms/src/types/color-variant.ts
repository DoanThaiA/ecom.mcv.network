/**
 * Color Variant Display Type Enum
 * Maps to how the color will be visually displayed
 */
export enum ColorVariantDisplayType {
  SOLID = 1, // Màu đơn
  GRADIENT = 2, // Chuyển màu
  STRIPE_VERTICAL = 3, // Sọc dọc
  STRIPE_HORIZONTAL = 4, // Sọc ngang
  DOT = 5, // Chấm bi
  CARO = 6, // Kẻ caro
}

/**
 * Color separators for each display type
 */
export const COLOR_SEPARATORS: Record<ColorVariantDisplayType, string> = {
  [ColorVariantDisplayType.SOLID]: '',
  [ColorVariantDisplayType.GRADIENT]: '/',
  [ColorVariantDisplayType.STRIPE_VERTICAL]: '|',
  [ColorVariantDisplayType.STRIPE_HORIZONTAL]: '-',
  [ColorVariantDisplayType.DOT]: '.',
  [ColorVariantDisplayType.CARO]: ',',
};

/**
 * Color display configuration
 */
export interface ColorVariantDisplay {
  colorValue?: string;
  patternImage?: string;
}

/**
 * Color Variant entity
 */
export interface ColorVariant {
  id: string;
  name: string;
  displayType: ColorVariantDisplayType;
  display: ColorVariantDisplay;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Color Variant request payload
 */
export interface CreateColorVariantRequest {
  name: string;
  displayType: ColorVariantDisplayType;
  display: ColorVariantDisplay;
  order?: number;
}

/**
 * Update Color Variant request payload
 */
export interface UpdateColorVariantRequest {
  name?: string;
  displayType?: ColorVariantDisplayType;
  display?: ColorVariantDisplay;
  order?: number;
}

/**
 * Query Color Variants request parameters
 */
export interface QueryColorVariantsRequest {
  page?: number;
  limit?: number;
  search?: string;
  displayType?: ColorVariantDisplayType;
}

/**
 * Query Color Variants response
 */
export interface QueryColorVariantsResponse {
  data: ColorVariant[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
