import type { TopicProductItem } from '../components/topic-products-tab';

/**
 * Product difference result for sync operations
 */
export interface ProductDiff {
  /** Products to add (new products not in original) */
  toAdd: { productId: string; order: number }[];
  /** Product IDs to remove (in original but not in current) */
  toRemove: string[];
  /** Whether the order of products has changed */
  hasOrderChanged: boolean;
  /** Full reorder list with updated order values */
  reorderList: { productId: string; order: number }[];
}

/**
 * Calculate the difference between original and current products
 * Used to determine which API calls are needed to sync changes
 *
 * @param original - Original products from server
 * @param current - Current products after user modifications
 * @returns ProductDiff with add/remove/reorder information
 */
export function calculateProductDiff(
  original: TopicProductItem[],
  current: TopicProductItem[]
): ProductDiff {
  const originalIds = new Set(original.map((p) => p.productId));
  const currentIds = new Set(current.map((p) => p.productId));

  // Products to add (in current but not in original)
  const toAdd = current
    .filter((p) => !originalIds.has(p.productId))
    .map((p) => ({ productId: p.productId, order: p.order }));

  // Products to remove (in original but not in current)
  const toRemove = original.filter((p) => !currentIds.has(p.productId)).map((p) => p.productId);

  // Build reorder list with updated order values (1-based)
  const reorderList = current.map((p, idx) => ({
    productId: p.productId,
    order: idx + 1,
  }));

  // Check if order changed for remaining products
  let hasOrderChanged = toAdd.length > 0 || toRemove.length > 0;

  if (!hasOrderChanged) {
    // Compare order of products that exist in both
    const originalFiltered = original.filter((p) => currentIds.has(p.productId));
    const currentFiltered = current.filter((p) => originalIds.has(p.productId));

    if (originalFiltered.length !== currentFiltered.length) {
      hasOrderChanged = true;
    } else {
      for (let i = 0; i < originalFiltered.length; i++) {
        if (originalFiltered[i].productId !== currentFiltered[i].productId) {
          hasOrderChanged = true;
          break;
        }
      }
    }
  }

  return { toAdd, toRemove, hasOrderChanged, reorderList };
}
