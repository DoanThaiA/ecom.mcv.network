/**
 * Color variant display type enumeration
 * Defines how the color should be visually rendered
 */
export enum ColorVariantDisplayType {
  /** Single solid color (#000000) */
  SOLID = 1,
  /** Multi-color gradient, left-to-right with blended transition (colors separated by /) */
  GRADIENT = 2,
  /** Vertical stripes, top-to-bottom with hard edges (colors separated by |) */
  STRIPE_VERTICAL = 3,
  /** Horizontal stripes, left-to-right with hard edges (colors separated by -) */
  STRIPE_HORIZONTAL = 4,
  /** Dot/polka pattern (colors separated by .) */
  DOT = 5,
  /** Checkered/caro pattern (colors separated by ,) */
  CARO = 6,
}

/**
 * Color value separator symbols by display type
 * Used for parsing colorValue string into individual colors
 */
export const COLOR_VALUE_SEPARATORS: Record<
  ColorVariantDisplayType,
  string | null
> = {
  [ColorVariantDisplayType.SOLID]: null,
  [ColorVariantDisplayType.GRADIENT]: '/',
  [ColorVariantDisplayType.STRIPE_VERTICAL]: '|',
  [ColorVariantDisplayType.STRIPE_HORIZONTAL]: '-',
  [ColorVariantDisplayType.DOT]: '.',
  [ColorVariantDisplayType.CARO]: ',',
};
