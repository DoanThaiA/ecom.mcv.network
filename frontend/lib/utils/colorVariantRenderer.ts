import type { ColorVariant } from '@/types/colorVariant';
import { ColorVariantDisplayType } from '@/types/colorVariant';

/**
 * Color name to hex code mapping for Vietnamese color names
 */
const COLOR_NAME_TO_HEX: Record<string, string> = {
  // Basic colors
  đen: '#000000',
  trắng: '#FFFFFF',
  xám: '#808080',
  đỏ: '#FF0000',
  vàng: '#FFFF00',
  cam: '#FFA500',
  hồng: '#FFC0CB',
  tím: '#800080',
  nâu: '#8B4513',
  // Blue variations
  'xanh dương': '#0000FF',
  'xanh da trời': '#87CEEB',
  'xanh navy': '#000080',
  'xanh đậm': '#00008B',
  // Green variations
  'xanh lá': '#00FF00',
  'xanh lá cây': '#228B22',
  'xanh rêu': '#556B2F',
  'xanh olive': '#808000',
  // Neutral tones
  be: '#F5F5DC',
  kem: '#FFFDD0',
  'xám nhạt': '#D3D3D3',
  'xám đậm': '#A9A9A9',
  // Other common colors
  bạc: '#C0C0C0',
  'vàng đồng': '#FFD700',
  'đỏ đô': '#8B0000',
  'hồng nhạt': '#FFB6C1',
  'tím than': '#4B0082',
  'xanh ngọc': '#40E0D0',
  'xanh mint': '#98FF98',
};

/**
 * Get hex color code from Vietnamese color name (fallback)
 */
export const getColorHex = (colorName: string): string => {
  const normalized = colorName.toLowerCase().trim();
  return COLOR_NAME_TO_HEX[normalized] || '#CCCCCC';
};

/**
 * CSS style object type for color rendering
 */
export interface ColorStyle {
  background?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
}

/**
 * Parse color value string and detect display type based on separator
 * Separators:
 * - `/` → GRADIENT
 * - `|` → STRIPE_VERTICAL
 * - `-` → STRIPE_HORIZONTAL
 * - `.` → DOT
 * - `,` → CARO
 */
export const parseColorValue = (
  colorValue: string,
): { colors: string[]; separator: string | null } => {
  const separators = ['/', '-', '|', '.', ','];

  for (const sep of separators) {
    if (colorValue.includes(sep)) {
      const colors = colorValue.split(sep).map((c) => c.trim());
      return { colors, separator: sep };
    }
  }

  // Single color (SOLID)
  return { colors: [colorValue.trim()], separator: null };
};

/**
 * Get display type from separator
 */
export const getDisplayTypeFromSeparator = (
  separator: string | null,
): ColorVariantDisplayType => {
  switch (separator) {
    case '/':
      return ColorVariantDisplayType.GRADIENT;
    case '|':
      return ColorVariantDisplayType.STRIPE_VERTICAL;
    case '-':
      return ColorVariantDisplayType.STRIPE_HORIZONTAL;
    case '.':
      return ColorVariantDisplayType.DOT;
    case ',':
      return ColorVariantDisplayType.CARO;
    default:
      return ColorVariantDisplayType.SOLID;
  }
};

/**
 * Generate CSS gradient for solid color
 */
const generateSolidStyle = (color: string): ColorStyle => ({
  backgroundColor: color,
});

/**
 * Generate CSS linear gradient
 */
const generateGradientStyle = (colors: string[]): ColorStyle => ({
  background: `linear-gradient(to right, ${colors.join(', ')})`,
});

/**
 * Generate CSS for vertical stripes (top to bottom)
 */
const generateStripeVerticalStyle = (colors: string[]): ColorStyle => {
  const stripeWidth = 100 / colors.length;
  const stops = colors
    .map((color, index) => {
      const start = index * stripeWidth;
      const end = (index + 1) * stripeWidth;
      return `${color} ${start}%, ${color} ${end}%`;
    })
    .join(', ');

  return {
    background: `linear-gradient(to bottom, ${stops})`,
  };
};

/**
 * Generate CSS for horizontal stripes (left to right)
 */
const generateStripeHorizontalStyle = (colors: string[]): ColorStyle => {
  const stripeWidth = 100 / colors.length;
  const stops = colors
    .map((color, index) => {
      const start = index * stripeWidth;
      const end = (index + 1) * stripeWidth;
      return `${color} ${start}%, ${color} ${end}%`;
    })
    .join(', ');

  return {
    background: `linear-gradient(to right, ${stops})`,
  };
};

/**
 * Generate CSS for polka dot pattern
 */
const generateDotStyle = (colors: string[]): ColorStyle => {
  const bgColor = colors[0] || '#FFFFFF';
  const dotColor = colors[1] || colors[0] || '#000000';

  return {
    backgroundColor: bgColor,
    backgroundImage: `
  radial-gradient(${dotColor} 20%, transparent 20%),
  radial-gradient(${dotColor} 20%, transparent 20%)
`,
    backgroundPosition: 'center',
    backgroundSize: '8px 6px',
  };
};

/**
 * Generate CSS for checkered (caro) pattern
 */
const generateCaroStyle = (colors: string[]): ColorStyle => {
  const color1 = colors[0] || '#FFFFFF';
  const color2 = colors[1] || colors[0] || '#000000';

  return {
    backgroundColor: color1,
    backgroundImage: `repeating-conic-gradient(${color2} 0% 25%, ${color1} 0% 50%)`,
    backgroundSize: '10px 10px',
  };
};

/**
 * Get CSS style object for a color variant
 * @param variant - Color variant from API (optional)
 * @param colorName - Fallback color name for local mapping
 * @returns CSS style object
 */
export const getColorVariantStyle = (
  variant?: ColorVariant,
  colorName?: string,
): ColorStyle => {
  // If variant has display.colorValue, use it
  if (variant?.display?.colorValue) {
    const { colors, separator } = parseColorValue(variant.display.colorValue);
    const displayType =
      variant.displayType || getDisplayTypeFromSeparator(separator);

    switch (displayType) {
      case ColorVariantDisplayType.SOLID:
        return generateSolidStyle(colors[0]);
      case ColorVariantDisplayType.GRADIENT:
        return generateGradientStyle(colors);
      case ColorVariantDisplayType.STRIPE_VERTICAL:
        return generateStripeVerticalStyle(colors);
      case ColorVariantDisplayType.STRIPE_HORIZONTAL:
        return generateStripeHorizontalStyle(colors);
      case ColorVariantDisplayType.DOT:
        return generateDotStyle(colors);
      case ColorVariantDisplayType.CARO:
        return generateCaroStyle(colors);
      default:
        return generateSolidStyle(colors[0]);
    }
  }

  // Fallback to local color mapping
  if (colorName) {
    return generateSolidStyle(getColorHex(colorName));
  }

  // Default gray
  return generateSolidStyle('#CCCCCC');
};

/**
 * Check if a color variant has a pattern image
 */
export const hasPatternImage = (variant?: ColorVariant): boolean => {
  return Boolean(variant?.display?.patternImage);
};

/**
 * Get pattern image URL from variant
 */
export const getPatternImageUrl = (variant?: ColorVariant): string | null => {
  return variant?.display?.patternImage ?? null;
};

/**
 * Get complete swatch style (pattern image or color)
 * Priority: patternImage → colorValue → getColorHex fallback
 */
export const getColorSwatchStyle = (
  variant?: ColorVariant,
  colorName?: string,
): ColorStyle => {
  const patternUrl = variant?.display?.patternImage;

  if (patternUrl) {
    return {
      backgroundImage: `url(${patternUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }

  return getColorVariantStyle(variant, colorName);
};
