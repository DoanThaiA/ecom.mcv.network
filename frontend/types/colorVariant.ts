/**
 * Color Variant Display Types
 * Enum representing different ways to render color variants
 */
export enum ColorVariantDisplayType {
  SOLID = 1,
  GRADIENT = 2,
  STRIPE_VERTICAL = 3,
  STRIPE_HORIZONTAL = 4,
  DOT = 5,
  CARO = 6,
}

/**
 * Color Variant Display object
 * Contains colorValue and patternImage
 */
export interface ColorVariantDisplay {
  colorValue?: string;
  patternImage?: string | null;
}

/**
 * Color Variant interface
 * Represents a color variant from the API
 */
export interface ColorVariant {
  id: string;
  name: string;
  nameNormalized?: string;
  displayType: ColorVariantDisplayType;
  display: ColorVariantDisplay;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}
