import { ColorVariantDisplayType, COLOR_SEPARATORS } from 'src/types/color-variant';

/**
 * Parse color value string into array of colors based on display type
 */
export const parseColorValue = (
  colorValue: string | undefined,
  displayType: ColorVariantDisplayType
): string[] => {
  if (!colorValue) return ['#000000'];

  if (displayType === ColorVariantDisplayType.SOLID) {
    return [colorValue];
  }

  const separator = COLOR_SEPARATORS[displayType];
  if (!separator) return [colorValue];

  // Handle pipe separator specially since it's a regex special character
  const colors = separator === '|' ? colorValue.split(/\|/) : colorValue.split(separator);

  return colors.filter((c) => c.trim().length > 0);
};

/**
 * Join array of colors into a color value string based on display type
 */
export const joinColorValue = (colors: string[], displayType: ColorVariantDisplayType): string => {
  if (displayType === ColorVariantDisplayType.SOLID) {
    return colors[0] || '#000000';
  }

  const separator = COLOR_SEPARATORS[displayType];
  return colors.join(separator);
};

/**
 * Get minimum number of colors required for a display type
 */
export const getMinColors = (displayType: ColorVariantDisplayType): number => {
  switch (displayType) {
    case ColorVariantDisplayType.SOLID:
      return 1;
    case ColorVariantDisplayType.GRADIENT:
    case ColorVariantDisplayType.STRIPE_VERTICAL:
    case ColorVariantDisplayType.STRIPE_HORIZONTAL:
    case ColorVariantDisplayType.DOT:
    case ColorVariantDisplayType.CARO:
      return 2;
    default:
      return 1;
  }
};

/**
 * Get maximum number of colors allowed for a display type
 */
export const getMaxColors = (displayType: ColorVariantDisplayType): number => {
  switch (displayType) {
    case ColorVariantDisplayType.SOLID:
      return 1;
    case ColorVariantDisplayType.GRADIENT:
      return 5; // Allow up to 5 colors for gradients
    case ColorVariantDisplayType.STRIPE_VERTICAL:
    case ColorVariantDisplayType.STRIPE_HORIZONTAL:
      return 5; // Allow up to 5 colors for stripes
    case ColorVariantDisplayType.DOT:
    case ColorVariantDisplayType.CARO:
      return 2; // Only 2 colors for patterns
    default:
      return 1;
  }
};

/**
 * Validate if the number of colors is valid for a display type
 */
export const isValidColorCount = (
  colorCount: number,
  displayType: ColorVariantDisplayType
): boolean => {
  const min = getMinColors(displayType);
  const max = getMaxColors(displayType);
  return colorCount >= min && colorCount <= max;
};

/**
 * Get default colors for a display type
 */
export const getDefaultColors = (displayType: ColorVariantDisplayType): string[] => {
  const min = getMinColors(displayType);
  const colors: string[] = [];
  for (let i = 0; i < min; i++) {
    colors.push(i === 0 ? '#000000' : '#FFFFFF');
  }
  return colors;
};

/**
 * Get display type label key for i18n
 */
export const getDisplayTypeLabelKey = (displayType: ColorVariantDisplayType): string => {
  switch (displayType) {
    case ColorVariantDisplayType.SOLID:
      return 'displayTypeSolid';
    case ColorVariantDisplayType.GRADIENT:
      return 'displayTypeGradient';
    case ColorVariantDisplayType.STRIPE_VERTICAL:
      return 'displayTypeStripeVertical';
    case ColorVariantDisplayType.STRIPE_HORIZONTAL:
      return 'displayTypeStripeHorizontal';
    case ColorVariantDisplayType.DOT:
      return 'displayTypeDot';
    case ColorVariantDisplayType.CARO:
      return 'displayTypeCaro';
    default:
      return 'displayTypeSolid';
  }
};

/**
 * Get all display type options for select
 */
export const getDisplayTypeOptions = (): { value: ColorVariantDisplayType; labelKey: string }[] => [
  { value: ColorVariantDisplayType.SOLID, labelKey: 'displayTypeSolid' },
  { value: ColorVariantDisplayType.GRADIENT, labelKey: 'displayTypeGradient' },
  { value: ColorVariantDisplayType.STRIPE_VERTICAL, labelKey: 'displayTypeStripeVertical' },
  { value: ColorVariantDisplayType.STRIPE_HORIZONTAL, labelKey: 'displayTypeStripeHorizontal' },
  { value: ColorVariantDisplayType.DOT, labelKey: 'displayTypeDot' },
  { value: ColorVariantDisplayType.CARO, labelKey: 'displayTypeCaro' },
];
