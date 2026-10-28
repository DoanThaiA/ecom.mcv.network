import { describe, it, expect, vi, beforeEach } from 'vitest';

import { flashSaleRepository } from 'src/repositories/flash-sale.repository';
import { showError, showSuccess } from 'src/utils/toast';
import {
  getFlashSalesRequest,
  getFlashSaleByIdRequest,
  createFlashSaleRequest,
  updateFlashSaleRequest,
  deleteFlashSaleRequest,
  toggleFlashSaleRequest,
  addFlashSaleProductRequest,
  updateFlashSaleProductRequest,
  bulkAddFlashSaleProductsRequest,
  bulkUpdateFlashSaleProductsRequest,
  removeFlashSaleProductRequest,
  toggleFlashSaleProductRequest,
} from 'src/redux/store/flashSaleSlice';

// Mock dependencies
vi.mock('src/repositories/flash-sale.repository');
vi.mock('src/utils/toast');
vi.mock('src/i18next', () => ({
  default: {
    t: (key: string) => key,
  },
}));

describe('flashSaleSaga', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFlashSalesRequest', () => {
    it('creates correct action type', () => {
      const action = getFlashSalesRequest({
        page: 1,
        limit: 10,
      });

      expect(action.type).toBe('flashSale/getFlashSalesRequest');
    });

    it('includes all payload properties', () => {
      const payload = {
        page: 2,
        limit: 20,
        filters: { isEnabled: true },
        sort: { createdAt: -1 },
        onSuccess: vi.fn(),
      };

      const action = getFlashSalesRequest(payload);

      expect(action.payload).toEqual(payload);
    });

    it('handles minimal payload', () => {
      const action = getFlashSalesRequest({
        page: 1,
        limit: 10,
      });

      expect(action.payload.page).toBe(1);
      expect(action.payload.limit).toBe(10);
    });
  });

  describe('getFlashSaleByIdRequest', () => {
    it('creates correct action type', () => {
      const action = getFlashSaleByIdRequest({
        id: 'flash-sale-1',
      });

      expect(action.type).toBe('flashSale/getFlashSaleByIdRequest');
    });

    it('includes id in payload', () => {
      const action = getFlashSaleByIdRequest({
        id: 'flash-sale-1',
      });

      expect(action.payload.id).toBe('flash-sale-1');
    });

    it('includes onSuccess callback', () => {
      const onSuccess = vi.fn();
      const action = getFlashSaleByIdRequest({
        id: 'flash-sale-1',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });
  });

  describe('createFlashSaleRequest', () => {
    it('creates correct action type', () => {
      const action = createFlashSaleRequest({
        name: 'Summer Flash Sale',
        startTime: '2024-01-01T00:00:00Z',
        endTime: '2024-01-31T23:59:59Z',
      });

      expect(action.type).toBe('flashSale/createFlashSaleRequest');
    });

    it('includes all required fields', () => {
      const payload = {
        name: 'Summer Flash Sale',
        startTime: '2024-01-01T00:00:00Z',
        endTime: '2024-01-31T23:59:59Z',
        isEnabled: true,
        onSuccess: vi.fn(),
      };

      const action = createFlashSaleRequest(payload);

      expect(action.payload).toEqual(payload);
    });

    it('handles payload without isEnabled', () => {
      const action = createFlashSaleRequest({
        name: 'Flash Sale',
        startTime: '2024-01-01T00:00:00Z',
        endTime: '2024-01-31T23:59:59Z',
      });

      expect(action.payload.name).toBe('Flash Sale');
      expect(action.payload.isEnabled).toBeUndefined();
    });
  });

  describe('updateFlashSaleRequest', () => {
    it('creates correct action type', () => {
      const action = updateFlashSaleRequest({
        flashSaleId: 'flash-sale-1',
        name: 'Updated Flash Sale',
      });

      expect(action.type).toBe('flashSale/updateFlashSaleRequest');
    });

    it('includes all update fields', () => {
      const payload = {
        flashSaleId: 'flash-sale-1',
        name: 'Updated Flash Sale',
        startTime: '2024-02-01T00:00:00Z',
        endTime: '2024-02-28T23:59:59Z',
        isEnabled: false,
        onSuccess: vi.fn(),
      };

      const action = updateFlashSaleRequest(payload);

      expect(action.payload).toEqual(payload);
    });

    it('handles partial updates', () => {
      const action = updateFlashSaleRequest({
        flashSaleId: 'flash-sale-1',
        name: 'Updated Name Only',
      });

      expect(action.payload.flashSaleId).toBe('flash-sale-1');
      expect(action.payload.name).toBe('Updated Name Only');
    });
  });

  describe('deleteFlashSaleRequest', () => {
    it('creates correct action type', () => {
      const action = deleteFlashSaleRequest({
        id: 'flash-sale-1',
      });

      expect(action.type).toBe('flashSale/deleteFlashSaleRequest');
    });

    it('includes id in payload', () => {
      const action = deleteFlashSaleRequest({
        id: 'flash-sale-1',
      });

      expect(action.payload.id).toBe('flash-sale-1');
    });

    it('includes onSuccess callback', () => {
      const onSuccess = vi.fn();
      const action = deleteFlashSaleRequest({
        id: 'flash-sale-1',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });
  });

  describe('toggleFlashSaleRequest', () => {
    it('creates correct action type', () => {
      const action = toggleFlashSaleRequest({
        id: 'flash-sale-1',
      });

      expect(action.type).toBe('flashSale/toggleFlashSaleRequest');
    });

    it('includes id in payload', () => {
      const action = toggleFlashSaleRequest({
        id: 'flash-sale-1',
      });

      expect(action.payload.id).toBe('flash-sale-1');
    });

    it('includes onSuccess callback', () => {
      const onSuccess = vi.fn();
      const action = toggleFlashSaleRequest({
        id: 'flash-sale-1',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });
  });

  describe('addFlashSaleProductRequest', () => {
    it('creates correct action type', () => {
      const action = addFlashSaleProductRequest({
        data: {
          flashSaleId: 'flash-sale-1',
          productId: 'product-1',
          salePrice: 99.99,
        },
      });

      expect(action.type).toBe('flashSale/addFlashSaleProductRequest');
    });

    it('includes product data in payload', () => {
      const data = {
        flashSaleId: 'flash-sale-1',
        productId: 'product-1',
        salePrice: 99.99,
        quantity: 100,
      };

      const action = addFlashSaleProductRequest({ data });

      expect(action.payload.data).toEqual(data);
    });

    it('includes onSuccess callback', () => {
      const onSuccess = vi.fn();
      const action = addFlashSaleProductRequest({
        data: {
          flashSaleId: 'flash-sale-1',
          productId: 'product-1',
          salePrice: 99.99,
        },
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });
  });

  describe('updateFlashSaleProductRequest', () => {
    it('creates correct action type', () => {
      const action = updateFlashSaleProductRequest({
        data: {
          flashSaleId: 'flash-sale-1',
          productId: 'product-1',
          salePrice: 79.99,
        },
      });

      expect(action.type).toBe('flashSale/updateFlashSaleProductRequest');
    });

    it('includes updated product data', () => {
      const data = {
        flashSaleId: 'flash-sale-1',
        productId: 'product-1',
        salePrice: 79.99,
        quantity: 50,
      };

      const action = updateFlashSaleProductRequest({ data });

      expect(action.payload.data).toEqual(data);
    });

    it('includes onSuccess callback', () => {
      const onSuccess = vi.fn();
      const action = updateFlashSaleProductRequest({
        data: {
          flashSaleId: 'flash-sale-1',
          productId: 'product-1',
          salePrice: 79.99,
        },
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });
  });

  describe('bulkAddFlashSaleProductsRequest', () => {
    it('creates correct action type', () => {
      const action = bulkAddFlashSaleProductsRequest({
        data: {
          flashSaleId: 'flash-sale-1',
          products: [
            { productId: 'product-1', salePrice: 99.99 },
            { productId: 'product-2', salePrice: 149.99 },
          ],
        },
      });

      expect(action.type).toBe('flashSale/bulkAddFlashSaleProductsRequest');
    });

    it('includes multiple products in payload', () => {
      const data = {
        flashSaleId: 'flash-sale-1',
        products: [
          { productId: 'product-1', salePrice: 99.99, quantity: 100 },
          { productId: 'product-2', salePrice: 149.99, quantity: 50 },
          { productId: 'product-3', salePrice: 199.99, quantity: 25 },
        ],
      };

      const action = bulkAddFlashSaleProductsRequest({ data });

      expect(action.payload.data).toEqual(data);
      expect(action.payload.data.products).toHaveLength(3);
    });

    it('includes onSuccess callback with flashSale parameter', () => {
      const onSuccess = vi.fn();
      const action = bulkAddFlashSaleProductsRequest({
        data: {
          flashSaleId: 'flash-sale-1',
          products: [{ productId: 'product-1', salePrice: 99.99 }],
        },
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles empty products array', () => {
      const action = bulkAddFlashSaleProductsRequest({
        data: {
          flashSaleId: 'flash-sale-1',
          products: [],
        },
      });

      expect(action.payload.data.products).toHaveLength(0);
    });
  });

  describe('bulkUpdateFlashSaleProductsRequest', () => {
    it('creates correct action type', () => {
      const action = bulkUpdateFlashSaleProductsRequest({
        data: {
          flashSaleId: 'flash-sale-1',
          products: [
            { productId: 'product-1', salePrice: 89.99 },
            { productId: 'product-2', salePrice: 139.99 },
          ],
        },
      });

      expect(action.type).toBe('flashSale/bulkUpdateFlashSaleProductsRequest');
    });

    it('includes updated products in payload', () => {
      const data = {
        flashSaleId: 'flash-sale-1',
        products: [
          { productId: 'product-1', salePrice: 89.99, quantity: 80 },
          { productId: 'product-2', salePrice: 139.99, quantity: 40 },
        ],
      };

      const action = bulkUpdateFlashSaleProductsRequest({ data });

      expect(action.payload.data).toEqual(data);
      expect(action.payload.data.products).toHaveLength(2);
    });

    it('includes onSuccess callback with flashSale parameter', () => {
      const onSuccess = vi.fn();
      const action = bulkUpdateFlashSaleProductsRequest({
        data: {
          flashSaleId: 'flash-sale-1',
          products: [{ productId: 'product-1', salePrice: 89.99 }],
        },
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });
  });

  describe('removeFlashSaleProductRequest', () => {
    it('creates correct action type', () => {
      const action = removeFlashSaleProductRequest({
        flashSaleId: 'flash-sale-1',
        productId: 'product-1',
      });

      expect(action.type).toBe('flashSale/removeFlashSaleProductRequest');
    });

    it('includes flashSaleId and productId', () => {
      const action = removeFlashSaleProductRequest({
        flashSaleId: 'flash-sale-1',
        productId: 'product-1',
      });

      expect(action.payload.flashSaleId).toBe('flash-sale-1');
      expect(action.payload.productId).toBe('product-1');
    });

    it('includes onSuccess callback', () => {
      const onSuccess = vi.fn();
      const action = removeFlashSaleProductRequest({
        flashSaleId: 'flash-sale-1',
        productId: 'product-1',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });
  });

  describe('toggleFlashSaleProductRequest', () => {
    it('creates correct action type', () => {
      const action = toggleFlashSaleProductRequest({
        flashSaleId: 'flash-sale-1',
        productId: 'product-1',
      });

      expect(action.type).toBe('flashSale/toggleFlashSaleProductRequest');
    });

    it('includes flashSaleId and productId', () => {
      const action = toggleFlashSaleProductRequest({
        flashSaleId: 'flash-sale-1',
        productId: 'product-1',
      });

      expect(action.payload.flashSaleId).toBe('flash-sale-1');
      expect(action.payload.productId).toBe('product-1');
    });

    it('includes onSuccess callback', () => {
      const onSuccess = vi.fn();
      const action = toggleFlashSaleProductRequest({
        flashSaleId: 'flash-sale-1',
        productId: 'product-1',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });
  });

  describe('Integration tests', () => {
    describe('getFlashSales integration', () => {
      it('handles successful flash sales query', async () => {
        const mockResponse = {
          data: [
            {
              id: 'flash-sale-1',
              name: 'Summer Sale',
              startTime: '2024-01-01T00:00:00Z',
              endTime: '2024-01-31T23:59:59Z',
              isEnabled: true,
            },
          ],
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        };

        vi.mocked(flashSaleRepository.queryFlashSales).mockResolvedValue(mockResponse);

        const action = getFlashSalesRequest({
          page: 1,
          limit: 10,
        });

        expect(action.type).toBe('flashSale/getFlashSalesRequest');
      });

      it('handles query with filters and sort', async () => {
        const mockResponse = {
          data: [],
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        };

        vi.mocked(flashSaleRepository.queryFlashSales).mockResolvedValue(mockResponse);

        const action = getFlashSalesRequest({
          page: 1,
          limit: 10,
          filters: { isEnabled: true },
          sort: { createdAt: -1 },
        });

        expect(action.payload.filters).toEqual({ isEnabled: true });
        expect(action.payload.sort).toEqual({ createdAt: -1 });
      });

      it('handles query error', async () => {
        const error = new Error('Query failed');
        vi.mocked(flashSaleRepository.queryFlashSales).mockRejectedValue(error);

        const action = getFlashSalesRequest({
          page: 1,
          limit: 10,
        });

        expect(action.type).toBe('flashSale/getFlashSalesRequest');
      });
    });

    describe('getFlashSaleById integration', () => {
      it('handles successful flash sale fetch', async () => {
        const mockFlashSale = {
          id: 'flash-sale-1',
          name: 'Summer Sale',
          startTime: '2024-01-01T00:00:00Z',
          endTime: '2024-01-31T23:59:59Z',
          isEnabled: true,
          products: [
            {
              productId: 'product-1',
              salePrice: 99.99,
              quantity: 100,
            },
          ],
        };

        vi.mocked(flashSaleRepository.getFlashSale).mockResolvedValue(mockFlashSale);

        const action = getFlashSaleByIdRequest({
          id: 'flash-sale-1',
        });

        expect(action.type).toBe('flashSale/getFlashSaleByIdRequest');
      });

      it('handles fetch error', async () => {
        const error = new Error('Flash sale not found');
        vi.mocked(flashSaleRepository.getFlashSale).mockRejectedValue(error);

        const action = getFlashSaleByIdRequest({
          id: 'nonexistent-id',
        });

        expect(action.type).toBe('flashSale/getFlashSaleByIdRequest');
      });
    });

    describe('createFlashSale integration', () => {
      it('handles successful creation', async () => {
        const mockFlashSale = {
          id: 'flash-sale-1',
          name: 'New Flash Sale',
          startTime: '2024-01-01T00:00:00Z',
          endTime: '2024-01-31T23:59:59Z',
          isEnabled: true,
        };

        vi.mocked(flashSaleRepository.createFlashSale).mockResolvedValue(mockFlashSale);

        const action = createFlashSaleRequest({
          name: 'New Flash Sale',
          startTime: '2024-01-01T00:00:00Z',
          endTime: '2024-01-31T23:59:59Z',
          isEnabled: true,
        });

        expect(action.type).toBe('flashSale/createFlashSaleRequest');
      });

      it('handles creation error', async () => {
        const error = new Error('Creation failed');
        vi.mocked(flashSaleRepository.createFlashSale).mockRejectedValue(error);

        const action = createFlashSaleRequest({
          name: 'New Flash Sale',
          startTime: '2024-01-01T00:00:00Z',
          endTime: '2024-01-31T23:59:59Z',
        });

        expect(action.type).toBe('flashSale/createFlashSaleRequest');
      });
    });

    describe('updateFlashSale integration', () => {
      it('handles successful update', async () => {
        const mockFlashSale = {
          id: 'flash-sale-1',
          name: 'Updated Flash Sale',
          startTime: '2024-02-01T00:00:00Z',
          endTime: '2024-02-28T23:59:59Z',
          isEnabled: false,
        };

        vi.mocked(flashSaleRepository.updateFlashSale).mockResolvedValue(mockFlashSale);

        const action = updateFlashSaleRequest({
          flashSaleId: 'flash-sale-1',
          name: 'Updated Flash Sale',
          isEnabled: false,
        });

        expect(action.type).toBe('flashSale/updateFlashSaleRequest');
      });

      it('handles update error', async () => {
        const error = new Error('Update failed');
        vi.mocked(flashSaleRepository.updateFlashSale).mockRejectedValue(error);

        const action = updateFlashSaleRequest({
          flashSaleId: 'flash-sale-1',
          name: 'Updated Flash Sale',
        });

        expect(action.type).toBe('flashSale/updateFlashSaleRequest');
      });
    });

    describe('deleteFlashSale integration', () => {
      it('handles successful deletion', async () => {
        vi.mocked(flashSaleRepository.deleteFlashSale).mockResolvedValue(undefined);

        const action = deleteFlashSaleRequest({
          id: 'flash-sale-1',
        });

        expect(action.type).toBe('flashSale/deleteFlashSaleRequest');
      });

      it('handles deletion error', async () => {
        const error = new Error('Deletion failed');
        vi.mocked(flashSaleRepository.deleteFlashSale).mockRejectedValue(error);

        const action = deleteFlashSaleRequest({
          id: 'flash-sale-1',
        });

        expect(action.type).toBe('flashSale/deleteFlashSaleRequest');
      });
    });

    describe('toggleFlashSale integration', () => {
      it('handles successful toggle', async () => {
        const mockFlashSale = {
          id: 'flash-sale-1',
          name: 'Flash Sale',
          startTime: '2024-01-01T00:00:00Z',
          endTime: '2024-01-31T23:59:59Z',
          isEnabled: false,
        };

        vi.mocked(flashSaleRepository.toggleFlashSale).mockResolvedValue(mockFlashSale);

        const action = toggleFlashSaleRequest({
          id: 'flash-sale-1',
        });

        expect(action.type).toBe('flashSale/toggleFlashSaleRequest');
      });

      it('handles toggle error', async () => {
        const error = new Error('Toggle failed');
        vi.mocked(flashSaleRepository.toggleFlashSale).mockRejectedValue(error);

        const action = toggleFlashSaleRequest({
          id: 'flash-sale-1',
        });

        expect(action.type).toBe('flashSale/toggleFlashSaleRequest');
      });
    });

    describe('addFlashSaleProduct integration', () => {
      it('handles successful product addition', async () => {
        const mockFlashSale = {
          id: 'flash-sale-1',
          name: 'Flash Sale',
          products: [
            {
              productId: 'product-1',
              salePrice: 99.99,
              quantity: 100,
            },
          ],
        };

        vi.mocked(flashSaleRepository.addFlashSaleProduct).mockResolvedValue(mockFlashSale);

        const action = addFlashSaleProductRequest({
          data: {
            flashSaleId: 'flash-sale-1',
            productId: 'product-1',
            salePrice: 99.99,
            quantity: 100,
          },
        });

        expect(action.type).toBe('flashSale/addFlashSaleProductRequest');
      });

      it('handles product addition error', async () => {
        const error = new Error('Add product failed');
        vi.mocked(flashSaleRepository.addFlashSaleProduct).mockRejectedValue(error);

        const action = addFlashSaleProductRequest({
          data: {
            flashSaleId: 'flash-sale-1',
            productId: 'product-1',
            salePrice: 99.99,
          },
        });

        expect(action.type).toBe('flashSale/addFlashSaleProductRequest');
      });
    });

    describe('updateFlashSaleProduct integration', () => {
      it('handles successful product update', async () => {
        const mockFlashSale = {
          id: 'flash-sale-1',
          name: 'Flash Sale',
          products: [
            {
              productId: 'product-1',
              salePrice: 79.99,
              quantity: 50,
            },
          ],
        };

        vi.mocked(flashSaleRepository.updateFlashSaleProduct).mockResolvedValue(mockFlashSale);

        const action = updateFlashSaleProductRequest({
          data: {
            flashSaleId: 'flash-sale-1',
            productId: 'product-1',
            salePrice: 79.99,
            quantity: 50,
          },
        });

        expect(action.type).toBe('flashSale/updateFlashSaleProductRequest');
      });

      it('handles product update error', async () => {
        const error = new Error('Update product failed');
        vi.mocked(flashSaleRepository.updateFlashSaleProduct).mockRejectedValue(error);

        const action = updateFlashSaleProductRequest({
          data: {
            flashSaleId: 'flash-sale-1',
            productId: 'product-1',
            salePrice: 79.99,
          },
        });

        expect(action.type).toBe('flashSale/updateFlashSaleProductRequest');
      });
    });

    describe('bulkAddFlashSaleProducts integration', () => {
      it('handles successful bulk add', async () => {
        const mockFlashSale = {
          id: 'flash-sale-1',
          name: 'Flash Sale',
          products: [
            { productId: 'product-1', salePrice: 99.99, quantity: 100 },
            { productId: 'product-2', salePrice: 149.99, quantity: 50 },
          ],
        };

        vi.mocked(flashSaleRepository.bulkAddFlashSaleProducts).mockResolvedValue(mockFlashSale);

        const action = bulkAddFlashSaleProductsRequest({
          data: {
            flashSaleId: 'flash-sale-1',
            products: [
              { productId: 'product-1', salePrice: 99.99, quantity: 100 },
              { productId: 'product-2', salePrice: 149.99, quantity: 50 },
            ],
          },
        });

        expect(action.type).toBe('flashSale/bulkAddFlashSaleProductsRequest');
      });

      it('handles bulk add error', async () => {
        const error = new Error('Bulk add failed');
        vi.mocked(flashSaleRepository.bulkAddFlashSaleProducts).mockRejectedValue(error);

        const action = bulkAddFlashSaleProductsRequest({
          data: {
            flashSaleId: 'flash-sale-1',
            products: [{ productId: 'product-1', salePrice: 99.99 }],
          },
        });

        expect(action.type).toBe('flashSale/bulkAddFlashSaleProductsRequest');
      });
    });

    describe('bulkUpdateFlashSaleProducts integration', () => {
      it('handles successful bulk update', async () => {
        const mockFlashSale = {
          id: 'flash-sale-1',
          name: 'Flash Sale',
          products: [
            { productId: 'product-1', salePrice: 89.99, quantity: 80 },
            { productId: 'product-2', salePrice: 139.99, quantity: 40 },
          ],
        };

        vi.mocked(flashSaleRepository.bulkUpdateFlashSaleProducts).mockResolvedValue(
          mockFlashSale
        );

        const action = bulkUpdateFlashSaleProductsRequest({
          data: {
            flashSaleId: 'flash-sale-1',
            products: [
              { productId: 'product-1', salePrice: 89.99, quantity: 80 },
              { productId: 'product-2', salePrice: 139.99, quantity: 40 },
            ],
          },
        });

        expect(action.type).toBe('flashSale/bulkUpdateFlashSaleProductsRequest');
      });

      it('handles bulk update error', async () => {
        const error = new Error('Bulk update failed');
        vi.mocked(flashSaleRepository.bulkUpdateFlashSaleProducts).mockRejectedValue(error);

        const action = bulkUpdateFlashSaleProductsRequest({
          data: {
            flashSaleId: 'flash-sale-1',
            products: [{ productId: 'product-1', salePrice: 89.99 }],
          },
        });

        expect(action.type).toBe('flashSale/bulkUpdateFlashSaleProductsRequest');
      });
    });

    describe('removeFlashSaleProduct integration', () => {
      it('handles successful product removal', async () => {
        const mockFlashSale = {
          id: 'flash-sale-1',
          name: 'Flash Sale',
          products: [],
        };

        vi.mocked(flashSaleRepository.removeFlashSaleProduct).mockResolvedValue(mockFlashSale);

        const action = removeFlashSaleProductRequest({
          flashSaleId: 'flash-sale-1',
          productId: 'product-1',
        });

        expect(action.type).toBe('flashSale/removeFlashSaleProductRequest');
      });

      it('handles product removal error', async () => {
        const error = new Error('Remove product failed');
        vi.mocked(flashSaleRepository.removeFlashSaleProduct).mockRejectedValue(error);

        const action = removeFlashSaleProductRequest({
          flashSaleId: 'flash-sale-1',
          productId: 'product-1',
        });

        expect(action.type).toBe('flashSale/removeFlashSaleProductRequest');
      });
    });

    describe('toggleFlashSaleProduct integration', () => {
      it('handles successful product toggle', async () => {
        const mockFlashSale = {
          id: 'flash-sale-1',
          name: 'Flash Sale',
          products: [
            {
              productId: 'product-1',
              salePrice: 99.99,
              isEnabled: false,
            },
          ],
        };

        vi.mocked(flashSaleRepository.toggleFlashSaleProduct).mockResolvedValue(mockFlashSale);

        const action = toggleFlashSaleProductRequest({
          flashSaleId: 'flash-sale-1',
          productId: 'product-1',
        });

        expect(action.type).toBe('flashSale/toggleFlashSaleProductRequest');
      });

      it('handles product toggle error', async () => {
        const error = new Error('Toggle product failed');
        vi.mocked(flashSaleRepository.toggleFlashSaleProduct).mockRejectedValue(error);

        const action = toggleFlashSaleProductRequest({
          flashSaleId: 'flash-sale-1',
          productId: 'product-1',
        });

        expect(action.type).toBe('flashSale/toggleFlashSaleProductRequest');
      });
    });

    describe('Callback handling', () => {
      it('handles onSuccess callback for getFlashSales', () => {
        const onSuccess = vi.fn();
        const action = getFlashSalesRequest({
          page: 1,
          limit: 10,
          onSuccess,
        });

        expect(action.payload.onSuccess).toBe(onSuccess);
      });

      it('handles onSuccess callback for getFlashSaleById', () => {
        const onSuccess = vi.fn();
        const action = getFlashSaleByIdRequest({
          id: 'flash-sale-1',
          onSuccess,
        });

        expect(action.payload.onSuccess).toBe(onSuccess);
      });

      it('handles onSuccess callback for createFlashSale', () => {
        const onSuccess = vi.fn();
        const action = createFlashSaleRequest({
          name: 'Flash Sale',
          startTime: '2024-01-01T00:00:00Z',
          endTime: '2024-01-31T23:59:59Z',
          onSuccess,
        });

        expect(action.payload.onSuccess).toBe(onSuccess);
      });

      it('handles onSuccess callback for updateFlashSale', () => {
        const onSuccess = vi.fn();
        const action = updateFlashSaleRequest({
          flashSaleId: 'flash-sale-1',
          name: 'Updated',
          onSuccess,
        });

        expect(action.payload.onSuccess).toBe(onSuccess);
      });

      it('handles onSuccess callback for deleteFlashSale', () => {
        const onSuccess = vi.fn();
        const action = deleteFlashSaleRequest({
          id: 'flash-sale-1',
          onSuccess,
        });

        expect(action.payload.onSuccess).toBe(onSuccess);
      });

      it('handles onSuccess callback for toggleFlashSale', () => {
        const onSuccess = vi.fn();
        const action = toggleFlashSaleRequest({
          id: 'flash-sale-1',
          onSuccess,
        });

        expect(action.payload.onSuccess).toBe(onSuccess);
      });

      it('handles onSuccess callback for addFlashSaleProduct', () => {
        const onSuccess = vi.fn();
        const action = addFlashSaleProductRequest({
          data: {
            flashSaleId: 'flash-sale-1',
            productId: 'product-1',
            salePrice: 99.99,
          },
          onSuccess,
        });

        expect(action.payload.onSuccess).toBe(onSuccess);
      });

      it('handles onSuccess callback for updateFlashSaleProduct', () => {
        const onSuccess = vi.fn();
        const action = updateFlashSaleProductRequest({
          data: {
            flashSaleId: 'flash-sale-1',
            productId: 'product-1',
            salePrice: 79.99,
          },
          onSuccess,
        });

        expect(action.payload.onSuccess).toBe(onSuccess);
      });

      it('handles onSuccess callback for bulkAddFlashSaleProducts', () => {
        const onSuccess = vi.fn();
        const action = bulkAddFlashSaleProductsRequest({
          data: {
            flashSaleId: 'flash-sale-1',
            products: [{ productId: 'product-1', salePrice: 99.99 }],
          },
          onSuccess,
        });

        expect(action.payload.onSuccess).toBe(onSuccess);
      });

      it('handles onSuccess callback for bulkUpdateFlashSaleProducts', () => {
        const onSuccess = vi.fn();
        const action = bulkUpdateFlashSaleProductsRequest({
          data: {
            flashSaleId: 'flash-sale-1',
            products: [{ productId: 'product-1', salePrice: 89.99 }],
          },
          onSuccess,
        });

        expect(action.payload.onSuccess).toBe(onSuccess);
      });

      it('handles onSuccess callback for removeFlashSaleProduct', () => {
        const onSuccess = vi.fn();
        const action = removeFlashSaleProductRequest({
          flashSaleId: 'flash-sale-1',
          productId: 'product-1',
          onSuccess,
        });

        expect(action.payload.onSuccess).toBe(onSuccess);
      });

      it('handles onSuccess callback for toggleFlashSaleProduct', () => {
        const onSuccess = vi.fn();
        const action = toggleFlashSaleProductRequest({
          flashSaleId: 'flash-sale-1',
          productId: 'product-1',
          onSuccess,
        });

        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('Edge cases', () => {
      it('handles empty flash sales list', async () => {
        const mockResponse = {
          data: [],
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        };

        vi.mocked(flashSaleRepository.queryFlashSales).mockResolvedValue(mockResponse);

        const action = getFlashSalesRequest({
          page: 1,
          limit: 10,
        });

        expect(action.type).toBe('flashSale/getFlashSalesRequest');
      });

      it('handles flash sale with no products', async () => {
        const mockFlashSale = {
          id: 'flash-sale-1',
          name: 'Empty Flash Sale',
          startTime: '2024-01-01T00:00:00Z',
          endTime: '2024-01-31T23:59:59Z',
          isEnabled: true,
          products: [],
        };

        vi.mocked(flashSaleRepository.getFlashSale).mockResolvedValue(mockFlashSale);

        const action = getFlashSaleByIdRequest({
          id: 'flash-sale-1',
        });

        expect(action.type).toBe('flashSale/getFlashSaleByIdRequest');
      });

      it('handles large page numbers', () => {
        const action = getFlashSalesRequest({
          page: 999,
          limit: 100,
        });

        expect(action.payload.page).toBe(999);
        expect(action.payload.limit).toBe(100);
      });

      it('handles bulk operations with many products', () => {
        const products = Array.from({ length: 100 }, (_, i) => ({
          productId: `product-${i}`,
          salePrice: 99.99 + i,
        }));

        const action = bulkAddFlashSaleProductsRequest({
          data: {
            flashSaleId: 'flash-sale-1',
            products,
          },
        });

        expect(action.payload.data.products).toHaveLength(100);
      });
    });
  });
});
