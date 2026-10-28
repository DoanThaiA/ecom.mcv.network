import { describe, it, expect } from 'vitest';
import type {
  Product,
  ProductBrand,
  ProductAttribute,
  ProductSupplier,
  ProductShipping,
  ProductExtended,
  GetProductsRequest,
  GetProductsResponse,
  UpdateProductPayload,
  ProductReview,
  GetProductReviewsRequest,
  GetProductReviewsResponse,
  BulkHideProductItem,
  BulkHideProductsRequest,
  BulkHideProductsResponse,
} from 'src/types/products';

describe('types/products', () => {
  describe('Type Exports', () => {
    it('exports Product type', () => {
      const product: Product = {
        id: 'p1',
        name: 'Test Product',
      } as Product;
      expect(product).toBeDefined();
    });
  });

  describe('ProductBrand', () => {
    it('type is valid', () => {
      const brand: ProductBrand = {
        id: 'b1',
        name: 'Nike',
      };
      expect(brand).toBeDefined();
      expect(brand.id).toBe('b1');
      expect(brand.name).toBe('Nike');
    });
  });

  describe('ProductAttribute', () => {
    it('type is valid with all fields', () => {
      const attribute: ProductAttribute = {
        id: 'a1',
        name: 'Color',
        value: 'Red',
      };
      expect(attribute).toBeDefined();
    });

    it('type is valid without optional id', () => {
      const attribute: ProductAttribute = {
        name: 'Size',
        value: 'Large',
      };
      expect(attribute).toBeDefined();
    });
  });

  describe('ProductSupplier', () => {
    it('type is valid', () => {
      const supplier: ProductSupplier = {
        id: 's1',
        name: 'ABC Supplier',
      };
      expect(supplier).toBeDefined();
    });
  });

  describe('ProductShipping', () => {
    it('type is valid with all fields', () => {
      const shipping: ProductShipping = {
        length: 10,
        width: 20,
        height: 30,
        weight: 500,
      };
      expect(shipping).toBeDefined();
    });

    it('type is valid with partial fields', () => {
      const shipping: ProductShipping = {
        weight: 500,
      };
      expect(shipping).toBeDefined();
    });
  });

  describe('ProductExtended', () => {
    it('type is valid with extended fields', () => {
      const product: ProductExtended = {
        id: 'p1',
        name: 'Test Product',
        sourceId: 'src1',
        otherName: 'Alternative Name',
        countryName: 'Vietnam',
        brand: { id: 'b1', name: 'Nike' },
        suppliers: { id: 's1', name: 'ABC' },
        internalCategory: { id: 'c1', name: 'Shoes' },
        shipping: { weight: 500 },
        sourceUpdatedAt: new Date(),
        availableQuantity: 100,
      } as ProductExtended;
      expect(product).toBeDefined();
    });
  });

  describe('GetProductsRequest', () => {
    it('type is valid with all fields', () => {
      const request: GetProductsRequest = {
        page: 1,
        limit: 10,
        filters: {},
        sort: [],
      };
      expect(request).toBeDefined();
    });

    it('type is valid without optional fields', () => {
      const request: GetProductsRequest = {
        page: 1,
        limit: 10,
      };
      expect(request).toBeDefined();
    });
  });

  describe('GetProductsResponse', () => {
    it('type is valid', () => {
      const response: GetProductsResponse = {
        data: [],
        hasNextPage: false,
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      expect(response).toBeDefined();
    });
  });

  describe('UpdateProductPayload', () => {
    it('type is valid with callback', () => {
      const payload: UpdateProductPayload = {
        id: 'p1',
        data: {},
        onSuccess: () => console.log('success'),
      };
      expect(payload).toBeDefined();
    });

    it('type is valid without callback', () => {
      const payload: UpdateProductPayload = {
        id: 'p1',
        data: {},
      };
      expect(payload).toBeDefined();
    });
  });

  describe('ProductReview', () => {
    it('type is valid with all fields', () => {
      const review: ProductReview = {
        id: 'r1',
        customerName: 'John Doe',
        customerPhone: '0123456789',
        rating: 5,
        content: 'Great product',
        images: ['img1.jpg', 'img2.jpg'],
        reviewDate: new Date(),
      };
      expect(review).toBeDefined();
    });

    it('type is valid without optional images', () => {
      const review: ProductReview = {
        id: 'r1',
        customerName: 'John Doe',
        customerPhone: '0123456789',
        rating: 4,
        content: 'Good',
        reviewDate: new Date(),
      };
      expect(review).toBeDefined();
    });
  });

  describe('GetProductReviewsRequest', () => {
    it('type is valid', () => {
      const request: GetProductReviewsRequest = {
        productId: 'p1',
        page: 1,
        limit: 10,
      };
      expect(request).toBeDefined();
    });
  });

  describe('GetProductReviewsResponse', () => {
    it('type is valid', () => {
      const response: GetProductReviewsResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      expect(response).toBeDefined();
    });
  });

  describe('BulkHideProductItem', () => {
    it('type is valid', () => {
      const item: BulkHideProductItem = {
        productId: 'p1',
        hide: true,
      };
      expect(item).toBeDefined();
    });
  });

  describe('BulkHideProductsRequest', () => {
    it('type is valid', () => {
      const request: BulkHideProductsRequest = {
        items: [
          { productId: 'p1', hide: true },
          { productId: 'p2', hide: false },
        ],
      };
      expect(request).toBeDefined();
    });
  });

  describe('BulkHideProductsResponse', () => {
    it('type is valid', () => {
      const response: BulkHideProductsResponse = {
        updatedCount: 5,
      };
      expect(response).toBeDefined();
    });
  });
});
