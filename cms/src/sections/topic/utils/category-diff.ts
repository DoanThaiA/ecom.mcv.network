import type { TopicCategoryItem } from '../components/topic-categories-tab';

/**
 * Category difference result for sync operations
 */
export interface CategoryDiff {
  /** Categories to add (new categories not in original) */
  toAdd: { categoryId: string; order: number }[];
  /** Category IDs to remove (in original but not in current) */
  toRemove: string[];
  /** Whether the order of categories has changed */
  hasOrderChanged: boolean;
  /** Full reorder list with updated order values */
  reorderList: { categoryId: string; order: number }[];
}

/**
 * Calculate the difference between original and current categories
 * Used to determine which API calls are needed to sync changes
 *
 * @param original - Original categories from server
 * @param current - Current categories after user modifications
 * @returns CategoryDiff with add/remove/reorder information
 */
export function calculateCategoryDiff(
  original: TopicCategoryItem[],
  current: TopicCategoryItem[]
): CategoryDiff {
  const originalIds = new Set(original.map((c) => c.categoryId));
  const currentIds = new Set(current.map((c) => c.categoryId));

  // Categories to add (in current but not in original)
  const toAdd = current
    .filter((c) => !originalIds.has(c.categoryId))
    .map((c) => ({ categoryId: c.categoryId, order: c.order }));

  // Categories to remove (in original but not in current)
  const toRemove = original.filter((c) => !currentIds.has(c.categoryId)).map((c) => c.categoryId);

  // Build reorder list with updated order values (1-based)
  const reorderList = current.map((c, idx) => ({
    categoryId: c.categoryId,
    order: idx + 1,
  }));

  // Check if order changed for remaining categories
  let hasOrderChanged = toAdd.length > 0 || toRemove.length > 0;

  if (!hasOrderChanged) {
    // Compare order of categories that exist in both
    const originalFiltered = original.filter((c) => currentIds.has(c.categoryId));
    const currentFiltered = current.filter((c) => originalIds.has(c.categoryId));

    if (originalFiltered.length !== currentFiltered.length) {
      hasOrderChanged = true;
    } else {
      for (let i = 0; i < originalFiltered.length; i++) {
        if (originalFiltered[i].categoryId !== currentFiltered[i].categoryId) {
          hasOrderChanged = true;
          break;
        }
      }
    }
  }

  return { toAdd, toRemove, hasOrderChanged, reorderList };
}
