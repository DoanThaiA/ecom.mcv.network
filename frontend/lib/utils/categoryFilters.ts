import compact from 'lodash/compact';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import type { ProductCategory } from '@/types/gen/shared/shared/product-categories/product-category';

/**
 * Get valid category IDs from applied categories
 * Since we now use IDs directly, this validates that IDs exist in categories
 * @param appliedCategoryIds - Array of category IDs
 * @param categories - Array of ProductCategory objects
 * @param fallbackCategoryId - Optional fallback category ID if no applied categories
 * @returns Array of valid category IDs
 */
export function getValidCategoryIds(
  appliedCategoryIds: string[],
  categories?: ProductCategory[],
  fallbackCategoryId?: string
): string[] {
  if (!isEmpty(appliedCategoryIds) && categories) {
    // Validate that the IDs exist in categories
    const validIds = compact(
      map(appliedCategoryIds, (id) => {
        const cat = find(categories, (c) => c.id === id);
        return cat ? id : null;
      })
    );
    if (!isEmpty(validIds)) {
      return validIds;
    }
  }

  // Fallback to single categoryId if provided
  if (fallbackCategoryId) {
    return [fallbackCategoryId];
  }

  return [];
}

/**
 * @deprecated Use getValidCategoryIds instead. This function is kept for backward compatibility.
 */
export const convertCategoryCodesToIds = getValidCategoryIds;

/**
 * Get the first topic ID from applied topics array
 * @param appliedTopics - Array of topic IDs
 * @returns First topic ID or undefined
 */
export function getFirstTopicId(
  appliedTopics: string[]
): string | undefined {
  return appliedTopics.length > 0 ? appliedTopics[0] : undefined;
}

/**
 * Filter categories to get only top-level categories (level 1)
 * Top-level categories are those without a parentId
 * @param categories - Array of ProductCategory objects
 * @returns Array of top-level categories
 */
export function filterTopLevelCategories(
  categories: ProductCategory[]
): ProductCategory[] {
  if (isEmpty(categories)) return [];
  return categories.filter((category) => isEmpty(category.parentId));
}


