import type { ShopSortProduct } from '@/types/gen/shop/shop/products/product';

const VALID_ORDER_BY = ['name', 'price', 'createdAt', 'discount', 'discountPercent'];
const VALID_ORDER = ['asc', 'desc'];
const SIZE_PATTERN_SORT = [
  "xs",
  "s",
  "m",
  "l",
  "xl",
  "xxl",
  "2xl",
  "3xl",
  "4xl",
  "5xl",
  "6xl",
  "7xl",
  "8xl",
] as const;

/**
 * Convert sort select value to ShopSortProduct
 * Value format: '{orderBy}-{order}' (e.g., 'price-asc', 'createdAt-desc')
 * Returns undefined for 'default' or invalid values
 */
export const getSortFromValue = (value: string): ShopSortProduct | undefined => {
  if (value === 'default') return undefined;

  const lastDashIndex = value.lastIndexOf('-');
  if (lastDashIndex === -1) return undefined;

  const orderBy = value.substring(0, lastDashIndex);
  const order = value.substring(lastDashIndex + 1);

  if (VALID_ORDER_BY.includes(orderBy) && VALID_ORDER.includes(order)) {
    return { orderBy, order };
  }

  return undefined;
};

export function sortSizesByPattern(input: string[]) {
  const rankMap = new Map<string, number>(
    SIZE_PATTERN_SORT.map((v, i) => [v.toLowerCase(), i])
  );

  return [...input].sort((a, b) => {
    const ra = rankMap.get(a.toLowerCase()) ?? Number.POSITIVE_INFINITY;
    const rb = rankMap.get(b.toLowerCase()) ?? Number.POSITIVE_INFINITY;

    // cùng "hạng" (ví dụ đều không có trong pattern) thì fallback theo alphabet
    if (ra === rb) return a.localeCompare(b, "vi");
    return ra - rb;
  });
}
