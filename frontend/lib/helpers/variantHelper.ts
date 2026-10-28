import type {
  Product,
  ProductImages,
} from '@/types/gen/shared/shared/products/product';

/**
 * Parse variant info from productName
 * Format: "{ProductName} - {Color} - {Size}"
 * Example: "Áo măng tô - Hồng - S" → { color: "Hồng", size: "S" }
 */
export function parseVariantFromProductName(productName: string): {
  color: string;
  size: string;
} {
  const parts = productName.split(' - ');

  // Handle different cases:
  // Case 1: "Product - Color - Size" (3+ parts) - take last 2 as color and size
  // Case 2: "Product - Size" (2 parts) - take last as size, no color
  // Case 3: "Product" (1 part) - no variant info

  if (parts.length >= 3) {
    return {
      color: parts[parts.length - 2].trim(), // Second to last part
      size: parts[parts.length - 1].trim(), // Last part
    };
  } else if (parts.length === 2) {
    return {
      color: '',
      size: parts[1].trim(), // Assume last part is size
    };
  }

  return { color: '', size: '' };
}

/**
 * Extract color from variant code
 * Handles both underscore and dash separators
 * @param variantCode - e.g., "AH023_trắng-S" or "AH023-đen-M"
 * @param productCode - e.g., "AH023"
 * @returns color string or null
 */
export function extractColorFromVariantCode(
  variantCode: string,
  productCode: string
): string | null {
  const normalizedCode = variantCode.toLowerCase();
  const normalizedProductCode = productCode.toLowerCase();

  // Remove product code prefix and separators
  let colorPart = normalizedCode;

  // Try underscore separator first
  if (colorPart.startsWith(`${normalizedProductCode}_`)) {
    colorPart = colorPart.substring(normalizedProductCode.length + 1);
  }
  // Try dash separator
  else if (colorPart.startsWith(`${normalizedProductCode}-`)) {
    colorPart = colorPart.substring(normalizedProductCode.length + 1);
  }

  // Extract color before the last dash (size separator)
  const lastDashIndex = colorPart.lastIndexOf('-');
  if (lastDashIndex > 0) {
    // Format: "color-size" → extract color
    return colorPart.substring(0, lastDashIndex).trim();
  }

  // No dash found → entire colorPart is the color
  // Format: "color" (no size component)
  if (colorPart.length > 0) {
    return colorPart.trim();
  }

  return null;
}

/**
 * Count total images in a variant (avatar + others)
 * @param images - ProductImages object
 * @returns total image count
 */
export function countVariantImages(
  images: ProductImages | undefined
): number {
  if (!images) return 0;

  const avatarCount = images.avatar ? 1 : 0;
  const othersCount = images.others?.length ?? 0;

  return avatarCount + othersCount;
}

/**
 * Find variant with same color that has the most images
 * @param variants - Array of product variants
 * @param targetColor - Color to match (normalized)
 * @param productCode - Product code for extraction
 * @returns Variant with most images or null
 */
export function findBestVariantWithColor(
  variants: Product[] | undefined,
  targetColor: string,
  productCode: string
): Product | null {
  if (!variants?.length) return null;

  const normalizedTargetColor = targetColor.toLowerCase().trim();

  // Filter variants with matching color
  const sameColorVariants = variants.filter((variant) => {
    if (!variant.code) return false;

    const variantColor = extractColorFromVariantCode(variant.code, productCode);
    return variantColor === normalizedTargetColor;
  });

  if (sameColorVariants.length === 0) return null;

  // Find variant with most images
  let bestVariant: Product | null = null;
  let maxImageCount = 0;

  sameColorVariants.forEach((variant) => {
    const imageCount = countVariantImages(variant.images);
    if (imageCount > maxImageCount) {
      maxImageCount = imageCount;
      bestVariant = variant;
    }
  });

  return maxImageCount > 0 ? bestVariant : null;
}

/**
 * A contiguous run of gallery images belonging to one colour.
 * `startIndex` is the position of this colour's first image in the flattened
 * gallery, so the carousel can jump straight to it.
 */
export interface ColorImageGroup {
  /** Empty string when the group is the colourless parent-product fallback */
  color: string;
  images: string[];
  startIndex: number;
}

/**
 * Flatten a ProductImages object into an ordered, de-duplicated URL list.
 * The avatar always comes first so each colour opens on its cover shot.
 */
function toImageList(images: ProductImages | undefined): string[] {
  if (!images) return [];

  const avatar = images.avatar?.trim();
  const others = (images.others ?? [])
    .map((url) => url?.trim())
    .filter((url): url is string => !!url);

  return Array.from(new Set(avatar ? [avatar, ...others] : others));
}

/**
 * Group every colour's images into one continuous gallery, in the order the
 * colours appear on the product. Lets the customer swipe from the last image
 * of one colour straight into the first image of the next.
 *
 * Fallback order per colour mirrors the previous single-colour gallery:
 * the colour's richest variant first, then the parent product's images.
 * When no colour carries images at all the parent images become a single
 * colourless group, so simple products keep working unchanged.
 *
 * @param colors - Colour values in display order
 * @param variants - Product variants to source per-colour images from
 * @param productCode - Parent product code, used to parse variant codes
 * @param productImages - Parent product images, used as the fallback
 */
export function buildColorImageGroups(
  colors: string[],
  variants: Product[] | undefined,
  productCode: string,
  productImages: ProductImages | undefined
): ColorImageGroup[] {
  const parentImages = toImageList(productImages);

  const perColor = colors.map((color) => ({
    color,
    images: toImageList(
      findBestVariantWithColor(variants, color, productCode)?.images
    ),
  }));

  // No colour carries its own images - fall back to a single parent group
  // rather than repeating the same parent images once per colour.
  if (!perColor.some((entry) => entry.images.length > 0)) {
    return parentImages.length > 0
      ? [{ color: '', images: parentImages, startIndex: 0 }]
      : [];
  }

  const groups: ColorImageGroup[] = [];
  let startIndex = 0;

  perColor.forEach(({ color, images }) => {
    const groupImages = images.length > 0 ? images : parentImages;
    if (groupImages.length === 0) return;

    groups.push({ color, images: groupImages, startIndex });
    startIndex += groupImages.length;
  });

  return groups;
}

/**
 * Resolve which colour the image at `index` belongs to.
 * @returns the colour, or null when the index is outside every group or the
 * gallery is the colourless parent fallback
 */
export function findColorAtIndex(
  groups: ColorImageGroup[],
  index: number
): string | null {
  const group = groups.find(
    (candidate) =>
      index >= candidate.startIndex &&
      index < candidate.startIndex + candidate.images.length
  );

  return group?.color || null;
}
