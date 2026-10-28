import { describe, it, expect, beforeEach, vi } from 'vitest';
import { returnRequestRepository } from '@/lib/repositories/returnRequest.repository';
import axiosInstance from '@/lib/axios';
import type {
  ReturnRequest,
  ReturnRequestListResponse,
} from '@/types/gen/shared/shared/returns/return';
import type { ReturnRequestPayload } from '@/types/returnRequest';

// Mock axios
vi.mock('@/lib/axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('ReturnRequestRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submitReturnRequest', () => {
    it('submits return request successfully', async () => {
      const payload: ReturnRequestPayload = {
        orderId: 'ORDER-123',
        requestType: 'return',
        returnReasons: ['wrongItem', 'defective'],
        otherReason: 'Test reason',
        images: [
          { id: 'img-1', url: 'http://example.com/img1.jpg' },
          { id: 'img-2', url: 'http://example.com/img2.jpg' },
        ],
        bankInfo: {
          accountNumber: '1234567890',
          bankName: 'Test Bank',
          accountHolder: 'John Doe',
        },
      };

      const mockResponse: ReturnRequest = {
        id: 'request-123',
        orderNumber: 'ORDER-123',
      } as ReturnRequest;

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await returnRequestRepository.submitReturnRequest(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/shop/return-requests',
        {
          orderNumber: 'ORDER-123',
          requestType: 'return',
          returnReasons: ['wrong_product', 'defective'],
          exchangeReasons: [],
          otherReason: 'Test reason',
          imageIds: ['img-1', 'img-2'],
          bankInfo: {
            accountNumber: '1234567890',
            bankName: 'Test Bank',
            accountHolder: 'John Doe',
          },
        }
      );

      expect(result).toEqual({
        success: true,
        message: 'Yêu cầu đổi trả đã được gửi thành công!',
        requestId: 'request-123',
      });
    });

    it('submits exchange request successfully', async () => {
      const payload: ReturnRequestPayload = {
        orderId: 'ORDER-456',
        requestType: 'exchange',
        exchangeReasons: ['size', 'color'],
        otherReason: '',
        images: [],
      };

      const mockResponse: ReturnRequest = {
        id: 'request-456',
        orderNumber: 'ORDER-456',
      } as ReturnRequest;

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockResponse,
      });

      await returnRequestRepository.submitReturnRequest(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/shop/return-requests',
        expect.objectContaining({
          requestType: 'exchange',
          exchangeReasons: ['wrong_size', 'wrong_color'],
        })
      );
    });

    it('maps return reasons correctly', async () => {
      const payload: ReturnRequestPayload = {
        orderId: 'ORDER-123',
        requestType: 'return',
        returnReasons: ['wrongItem', 'defective', 'notAsDescribed', 'notSatisfied', 'other'],
        images: [],
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: { id: 'req-1' } as ReturnRequest,
      });

      await returnRequestRepository.submitReturnRequest(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          returnReasons: ['wrong_product', 'defective', 'damaged', 'poor_quality', 'other'],
        })
      );
    });

    it('maps exchange reasons correctly', async () => {
      const payload: ReturnRequestPayload = {
        orderId: 'ORDER-123',
        requestType: 'exchange',
        exchangeReasons: ['size', 'color', 'model', 'other'],
        images: [],
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: { id: 'req-1' } as ReturnRequest,
      });

      await returnRequestRepository.submitReturnRequest(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          exchangeReasons: ['wrong_size', 'wrong_color', 'defective', 'other'],
        })
      );
    });

    it('handles unknown return reasons as "other"', async () => {
      const payload: ReturnRequestPayload = {
        orderId: 'ORDER-123',
        requestType: 'return',
        returnReasons: ['unknownReason', 'anotherUnknown'],
        images: [],
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: { id: 'req-1' } as ReturnRequest,
      });

      await returnRequestRepository.submitReturnRequest(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          returnReasons: ['other', 'other'],
        })
      );
    });

    it('handles unknown exchange reasons as "other"', async () => {
      const payload: ReturnRequestPayload = {
        orderId: 'ORDER-123',
        requestType: 'exchange',
        exchangeReasons: ['unknownReason'],
        images: [],
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: { id: 'req-1' } as ReturnRequest,
      });

      await returnRequestRepository.submitReturnRequest(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          exchangeReasons: ['other'],
        })
      );
    });

    it('handles empty reasons arrays', async () => {
      const payload: ReturnRequestPayload = {
        orderId: 'ORDER-123',
        requestType: 'return',
        images: [],
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: { id: 'req-1' } as ReturnRequest,
      });

      await returnRequestRepository.submitReturnRequest(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          returnReasons: [],
          exchangeReasons: [],
        })
      );
    });

    it('handles undefined reasons arrays', async () => {
      const payload: ReturnRequestPayload = {
        orderId: 'ORDER-123',
        requestType: 'return',
        returnReasons: undefined,
        exchangeReasons: undefined,
        images: [],
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: { id: 'req-1' } as ReturnRequest,
      });

      await returnRequestRepository.submitReturnRequest(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          returnReasons: [],
          exchangeReasons: [],
        })
      );
    });

    it('handles empty images array', async () => {
      const payload: ReturnRequestPayload = {
        orderId: 'ORDER-123',
        requestType: 'return',
        returnReasons: ['defective'],
        images: [],
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: { id: 'req-1' } as ReturnRequest,
      });

      await returnRequestRepository.submitReturnRequest(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          imageIds: [],
        })
      );
    });

    it('handles undefined images', async () => {
      const payload: ReturnRequestPayload = {
        orderId: 'ORDER-123',
        requestType: 'return',
        returnReasons: ['defective'],
        images: undefined,
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: { id: 'req-1' } as ReturnRequest,
      });

      await returnRequestRepository.submitReturnRequest(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          imageIds: [],
        })
      );
    });

    it('extracts image IDs from images array', async () => {
      const payload: ReturnRequestPayload = {
        orderId: 'ORDER-123',
        requestType: 'return',
        returnReasons: ['defective'],
        images: [
          { id: 'img-1', url: 'url1' },
          { id: 'img-2', url: 'url2' },
          { id: 'img-3', url: 'url3' },
        ],
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: { id: 'req-1' } as ReturnRequest,
      });

      await returnRequestRepository.submitReturnRequest(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          imageIds: ['img-1', 'img-2', 'img-3'],
        })
      );
    });

    it('handles missing bank info', async () => {
      const payload: ReturnRequestPayload = {
        orderId: 'ORDER-123',
        requestType: 'return',
        returnReasons: ['defective'],
        images: [],
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: { id: 'req-1' } as ReturnRequest,
      });

      await returnRequestRepository.submitReturnRequest(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          bankInfo: undefined,
        })
      );
    });

    it('propagates API errors', async () => {
      const payload: ReturnRequestPayload = {
        orderId: 'ORDER-123',
        requestType: 'return',
        returnReasons: ['defective'],
        images: [],
      };

      vi.mocked(axiosInstance.post).mockRejectedValueOnce(
        new Error('Order not found')
      );

      await expect(
        returnRequestRepository.submitReturnRequest(payload)
      ).rejects.toThrow('Order not found');
    });
  });

  describe('getMyReturnRequests', () => {
    it('fetches return requests with default pagination', async () => {
      const mockResponse: ReturnRequestListResponse = {
        requests: [
          { id: 'req-1', orderNumber: 'ORDER-1' } as ReturnRequest,
          { id: 'req-2', orderNumber: 'ORDER-2' } as ReturnRequest,
        ],
        total: 2,
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await returnRequestRepository.getMyReturnRequests();

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/return-requests',
        {
          params: { page: 1, limit: 10 },
        }
      );

      expect(result).toEqual(mockResponse);
      expect(result.requests).toHaveLength(2);
    });

    it('fetches return requests with custom pagination', async () => {
      const mockResponse: ReturnRequestListResponse = {
        requests: [],
        total: 0,
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockResponse,
      });

      await returnRequestRepository.getMyReturnRequests(2, 20);

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/return-requests',
        {
          params: { page: 2, limit: 20 },
        }
      );
    });

    it('handles page parameter', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { requests: [], total: 0 },
      });

      await returnRequestRepository.getMyReturnRequests(5);

      expect(axiosInstance.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({ page: 5 }),
        })
      );
    });

    it('handles limit parameter', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { requests: [], total: 0 },
      });

      await returnRequestRepository.getMyReturnRequests(1, 50);

      expect(axiosInstance.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({ limit: 50 }),
        })
      );
    });

    it('handles empty results', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { requests: [], total: 0 },
      });

      const result = await returnRequestRepository.getMyReturnRequests();

      expect(result.requests).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(
        new Error('Unauthorized')
      );

      await expect(
        returnRequestRepository.getMyReturnRequests()
      ).rejects.toThrow('Unauthorized');
    });
  });
});
