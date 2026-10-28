import { describe, it, expect } from 'vitest';
import {
  getValidCategoryIds,
  convertCategoryCodesToIds,
  getFirstTopicId,
  filterTopLevelCategories,
} from '@/lib/utils/categoryFilters';
import type { ProductCategory } from '@/types/gen/shared/shared/product-categories/product-category';

describe('getValidCategoryIds', () => {
  const mockCategories: ProductCategory[] = [
    { id: 'cat-1', name: 'Category 1' } as ProductCategory,
    { id: 'cat-2', name: 'Category 2' } as ProductCategory,
    { id: 'cat-3', name: 'Category 3' } as ProductCategory,
  ];

  it('returns valid category IDs that exist in categories', () => {
    const result = getValidCategoryIds(['cat-1', 'cat-2'], mockCategories);
    expect(result).toEqual(['cat-1', 'cat-2']);
  });

  it('filters out invalid category IDs', () => {
    const result = getValidCategoryIds(
      ['cat-1', 'invalid-id', 'cat-2'],
      mockCategories
    );
    expect(result).toEqual(['cat-1', 'cat-2']);
  });

  it('returns empty array when all IDs are invalid', () => {
    const result = getValidCategoryIds(['invalid-1', 'invalid-2'], mockCategories);
    expect(result).toEqual([]);
  });

  it('returns empty array when appliedCategoryIds is empty', () => {
    const result = getValidCategoryIds([], mockCategories);
    expect(result).toEqual([]);
  });

  it('returns fallback category ID when appliedCategoryIds is empty', () => {
    const result = getValidCategoryIds([], mockCategories, 'fallback-id');
    expect(result).toEqual(['fallback-id']);
  });

  it('returns fallback category ID when all applied IDs are invalid', () => {
    const result = getValidCategoryIds(
      ['invalid-1'],
      mockCategories,
      'fallback-id'
    );
    expect(result).toEqual(['fallback-id']);
  });

  it('prefers valid applied IDs over fallback', () => {
    const result = getValidCategoryIds(['cat-1'], mockCategories, 'fallback-id');
    expect(result).toEqual(['cat-1']);
  });

  it('handles undefined categories', () => {
    const result = getValidCategoryIds(['cat-1'], undefined);
    expect(result).toEqual([]);
  });

  it('handles undefined categories with fallback', () => {
    const result = getValidCategoryIds(['cat-1'], undefined, 'fallback-id');
    expect(result).toEqual(['fallback-id']);
  });

  it('handles empty categories array', () => {
    const result = getValidCategoryIds(['cat-1'], []);
    expect(result).toEqual([]);
  });

  it('handles empty categories array with fallback', () => {
    const result = getValidCategoryIds(['cat-1'], [], 'fallback-id');
    expect(result).toEqual(['fallback-id']);
  });

  it('returns empty array when no fallback provided and no valid IDs', () => {
    const result = getValidCategoryIds([], mockCategories);
    expect(result).toEqual([]);
  });

  it('preserves order of valid IDs', () => {
    const result = getValidCategoryIds(['cat-3', 'cat-1', 'cat-2'], mockCategories);
    expect(result).toEqual(['cat-3', 'cat-1', 'cat-2']);
  });

  it('handles duplicate IDs', () => {
    const result = getValidCategoryIds(['cat-1', 'cat-1', 'cat-2'], mockCategories);
    expect(result).toEqual(['cat-1', 'cat-1', 'cat-2']);
  });
});

describe('convertCategoryCodesToIds', () => {
  it('is deprecated alias for getValidCategoryIds', () => {
    expect(convertCategoryCodesToIds).toBe(getValidCategoryIds);
  });

  it('works the same as getValidCategoryIds', () => {
    const mockCategories: ProductCategory[] = [
      { id: 'cat-1', name: 'Category 1' } as ProductCategory,
    ];
    const result = convertCategoryCodesToIds(['cat-1'], mockCategories);
    expect(result).toEqual(['cat-1']);
  });
});

describe('getFirstTopicId', () => {
  it('returns first topic ID from non-empty array', () => {
    expect(getFirstTopicId(['topic-1', 'topic-2', 'topic-3'])).toBe('topic-1');
  });

  it('returns undefined for empty array', () => {
    expect(getFirstTopicId([])).toBeUndefined();
  });

  it('returns first ID even if array has one element', () => {
    expect(getFirstTopicId(['topic-1'])).toBe('topic-1');
  });

  it('ignores subsequent elements', () => {
    expect(getFirstTopicId(['topic-1', 'topic-2'])).toBe('topic-1');
  });
});

describe('filterTopLevelCategories', () => {
  it('filters categories without parentId', () => {
    const categories: ProductCategory[] = [
      { id: 'cat-1', name: 'Top 1', parentId: '' } as ProductCategory,
      { id: 'cat-2', name: 'Top 2', parentId: '' } as ProductCategory,
      { id: 'cat-3', name: 'Child', parentId: 'cat-1' } as ProductCategory,
    ];

    const result = filterTopLevelCategories(categories);
    expect(result).toHaveLength(2);
    expect(result).toEqual([categories[0], categories[1]]);
  });

  it('returns empty array for empty input', () => {
    expect(filterTopLevelCategories([])).toEqual([]);
  });

  it('handles all top-level categories', () => {
    const categories: ProductCategory[] = [
      { id: 'cat-1', name: 'Top 1', parentId: '' } as ProductCategory,
      { id: 'cat-2', name: 'Top 2', parentId: '' } as ProductCategory,
    ];

    const result = filterTopLevelCategories(categories);
    expect(result).toHaveLength(2);
    expect(result).toEqual(categories);
  });

  it('handles all child categories', () => {
    const categories: ProductCategory[] = [
      { id: 'cat-1', name: 'Child 1', parentId: 'parent-1' } as ProductCategory,
      { id: 'cat-2', name: 'Child 2', parentId: 'parent-2' } as ProductCategory,
    ];

    const result = filterTopLevelCategories(categories);
    expect(result).toEqual([]);
  });

  it('treats categories with undefined parentId as top-level', () => {
    const categories: ProductCategory[] = [
      { id: 'cat-1', name: 'Top' } as ProductCategory, // no parentId field
      { id: 'cat-2', name: 'Child', parentId: 'cat-1' } as ProductCategory,
    ];

    const result = filterTopLevelCategories(categories);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('cat-1');
  });

  it('treats categories with null parentId as top-level', () => {
    const categories: ProductCategory[] = [
      { id: 'cat-1', name: 'Top', parentId: null as any } as ProductCategory,
      { id: 'cat-2', name: 'Child', parentId: 'cat-1' } as ProductCategory,
    ];

    const result = filterTopLevelCategories(categories);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('cat-1');
  });

  it('preserves order of top-level categories', () => {
    const categories: ProductCategory[] = [
      { id: 'cat-3', name: 'Top 3', parentId: '' } as ProductCategory,
      { id: 'cat-1', name: 'Top 1', parentId: '' } as ProductCategory,
      { id: 'cat-2', name: 'Top 2', parentId: '' } as ProductCategory,
    ];

    const result = filterTopLevelCategories(categories);
    expect(result.map(c => c.id)).toEqual(['cat-3', 'cat-1', 'cat-2']);
  });
});
