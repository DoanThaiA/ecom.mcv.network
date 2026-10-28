import { describe, it, expect } from 'vitest';
import { calculateProductDiff, type ProductDiff } from 'src/sections/topic/utils/product-diff';
import type { TopicProductItem } from 'src/sections/topic/components/topic-products-tab';

describe('sections/topic/utils/product-diff', () => {
  describe('calculateProductDiff', () => {
    it('returns empty diff when arrays are identical', () => {
      const products: TopicProductItem[] = [
        { productId: 'p1', order: 1, name: 'Product 1', image: '' },
        { productId: 'p2', order: 2, name: 'Product 2', image: '' },
      ];

      const result = calculateProductDiff(products, products);

      expect(result.toAdd).toEqual([]);
      expect(result.toRemove).toEqual([]);
      expect(result.hasOrderChanged).toBe(false);
      expect(result.reorderList).toHaveLength(2);
    });

    it('detects products to add', () => {
      const original: TopicProductItem[] = [
        { productId: 'p1', order: 1, name: 'Product 1', image: '' },
      ];
      const current: TopicProductItem[] = [
        { productId: 'p1', order: 1, name: 'Product 1', image: '' },
        { productId: 'p2', order: 2, name: 'Product 2', image: '' },
      ];

      const result = calculateProductDiff(original, current);

      expect(result.toAdd).toEqual([{ productId: 'p2', order: 2 }]);
      expect(result.toRemove).toEqual([]);
      expect(result.hasOrderChanged).toBe(true);
    });

    it('detects products to remove', () => {
      const original: TopicProductItem[] = [
        { productId: 'p1', order: 1, name: 'Product 1', image: '' },
        { productId: 'p2', order: 2, name: 'Product 2', image: '' },
      ];
      const current: TopicProductItem[] = [
        { productId: 'p1', order: 1, name: 'Product 1', image: '' },
      ];

      const result = calculateProductDiff(original, current);

      expect(result.toAdd).toEqual([]);
      expect(result.toRemove).toEqual(['p2']);
      expect(result.hasOrderChanged).toBe(true);
    });

    it('detects order changes', () => {
      const original: TopicProductItem[] = [
        { productId: 'p1', order: 1, name: 'Product 1', image: '' },
        { productId: 'p2', order: 2, name: 'Product 2', image: '' },
      ];
      const current: TopicProductItem[] = [
        { productId: 'p2', order: 1, name: 'Product 2', image: '' },
        { productId: 'p1', order: 2, name: 'Product 1', image: '' },
      ];

      const result = calculateProductDiff(original, current);

      expect(result.toAdd).toEqual([]);
      expect(result.toRemove).toEqual([]);
      expect(result.hasOrderChanged).toBe(true);
    });

    it('builds correct reorder list with 1-based indexing', () => {
      const original: TopicProductItem[] = [];
      const current: TopicProductItem[] = [
        { productId: 'p1', order: 5, name: 'Product 1', image: '' },
        { productId: 'p2', order: 10, name: 'Product 2', image: '' },
        { productId: 'p3', order: 15, name: 'Product 3', image: '' },
      ];

      const result = calculateProductDiff(original, current);

      expect(result.reorderList).toEqual([
        { productId: 'p1', order: 1 },
        { productId: 'p2', order: 2 },
        { productId: 'p3', order: 3 },
      ]);
    });

    it('handles complex changes with add, remove and reorder', () => {
      const original: TopicProductItem[] = [
        { productId: 'p1', order: 1, name: 'Product 1', image: '' },
        { productId: 'p2', order: 2, name: 'Product 2', image: '' },
        { productId: 'p3', order: 3, name: 'Product 3', image: '' },
      ];
      const current: TopicProductItem[] = [
        { productId: 'p3', order: 1, name: 'Product 3', image: '' },
        { productId: 'p4', order: 2, name: 'Product 4', image: '' },
        { productId: 'p1', order: 3, name: 'Product 1', image: '' },
      ];

      const result = calculateProductDiff(original, current);

      expect(result.toAdd).toEqual([{ productId: 'p4', order: 2 }]);
      expect(result.toRemove).toEqual(['p2']);
      expect(result.hasOrderChanged).toBe(true);
      expect(result.reorderList).toEqual([
        { productId: 'p3', order: 1 },
        { productId: 'p4', order: 2 },
        { productId: 'p1', order: 3 },
      ]);
    });

    it('handles empty original array', () => {
      const original: TopicProductItem[] = [];
      const current: TopicProductItem[] = [
        { productId: 'p1', order: 1, name: 'Product 1', image: '' },
      ];

      const result = calculateProductDiff(original, current);

      expect(result.toAdd).toEqual([{ productId: 'p1', order: 1 }]);
      expect(result.toRemove).toEqual([]);
      expect(result.hasOrderChanged).toBe(true);
    });

    it('handles empty current array', () => {
      const original: TopicProductItem[] = [
        { productId: 'p1', order: 1, name: 'Product 1', image: '' },
      ];
      const current: TopicProductItem[] = [];

      const result = calculateProductDiff(original, current);

      expect(result.toAdd).toEqual([]);
      expect(result.toRemove).toEqual(['p1']);
      expect(result.hasOrderChanged).toBe(true);
      expect(result.reorderList).toEqual([]);
    });

    it('handles both arrays empty', () => {
      const result = calculateProductDiff([], []);

      expect(result.toAdd).toEqual([]);
      expect(result.toRemove).toEqual([]);
      expect(result.hasOrderChanged).toBe(false);
      expect(result.reorderList).toEqual([]);
    });

    it('returns ProductDiff type correctly', () => {
      const result: ProductDiff = calculateProductDiff([], []);
      
      expect(result).toHaveProperty('toAdd');
      expect(result).toHaveProperty('toRemove');
      expect(result).toHaveProperty('hasOrderChanged');
      expect(result).toHaveProperty('reorderList');
    });
  });
});
