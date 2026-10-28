import { describe, it, expect, vi, beforeEach } from 'vitest';
import { topicRepository } from 'src/repositories/topic.repository';
import axiosInstance from 'src/utils/axios';
import { TopicStatus } from 'src/types/gen/shared/shared/common/enums';

vi.mock('src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('topicRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports topicRepository instance', () => {
    expect(topicRepository).toBeDefined();
    expect(topicRepository).toHaveProperty('getTopics');
    expect(topicRepository).toHaveProperty('getTopicById');
    expect(topicRepository).toHaveProperty('createTopic');
    expect(topicRepository).toHaveProperty('updateTopic');
    expect(topicRepository).toHaveProperty('deleteTopic');
    expect(topicRepository).toHaveProperty('reorderTopics');
    expect(topicRepository).toHaveProperty('addProductsToTopic');
    expect(topicRepository).toHaveProperty('removeProductsFromTopic');
    expect(topicRepository).toHaveProperty('reorderTopicProducts');
  });

  describe('getTopics', () => {
    it('calls GET /topics with page and limit', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await topicRepository.getTopics({ page: 1, limit: 10 });

      expect(axiosInstance.get).toHaveBeenCalledWith('/topics', {
        params: {
          page: '1',
          limit: '10',
        },
      });
    });

    it('includes filters when provided', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const filters = { name: 'test', status: 'active' };
      await topicRepository.getTopics({ filters });

      expect(axiosInstance.get).toHaveBeenCalledWith('/topics', {
        params: {
          filters: JSON.stringify(filters),
        },
      });
    });

    it('omits filters when empty object', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await topicRepository.getTopics({ filters: {} });

      expect(axiosInstance.get).toHaveBeenCalledWith('/topics', {
        params: {},
      });
    });

    it('includes sort when provided', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const sort = [{ field: 'createdAt', order: 'desc' }];
      await topicRepository.getTopics({ sort });

      expect(axiosInstance.get).toHaveBeenCalledWith('/topics', {
        params: {
          sort: JSON.stringify(sort),
        },
      });
    });

    it('omits sort when empty array', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await topicRepository.getTopics({ sort: [] });

      expect(axiosInstance.get).toHaveBeenCalledWith('/topics', {
        params: {},
      });
    });

    it('returns QueryTopicsResponse', async () => {
      const mockResponse = {
        data: {
          data: [{ id: 't1', name: 'Topic 1' }],
          total: 1,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await topicRepository.getTopics({});

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getTopicById', () => {
    it('calls GET /topics/:id', async () => {
      const mockResponse = {
        data: {
          id: 't1',
          name: 'Topic 1',
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await topicRepository.getTopicById('t1');

      expect(axiosInstance.get).toHaveBeenCalledWith('/topics/t1');
    });

    it('returns Topic', async () => {
      const mockTopic = {
        id: 't1',
        name: 'Test Topic',
      };
      const mockResponse = { data: mockTopic };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await topicRepository.getTopicById('t1');

      expect(result).toEqual(mockTopic);
    });
  });

  describe('createTopic', () => {
    it('calls POST /topics with active status', async () => {
      const mockData = {
        name: 'New Topic',
        status: TopicStatus.TOPIC_STATUS_ACTIVE,
      };
      const mockResponse = {
        data: {
          id: 't1',
          name: 'New Topic',
        },
      };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await topicRepository.createTopic(mockData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/topics', {
        name: 'New Topic',
        status: 'active',
      });
    });

    it('calls POST /topics with inactive status', async () => {
      const mockData = {
        name: 'New Topic',
        status: TopicStatus.TOPIC_STATUS_INACTIVE,
      };
      const mockResponse = {
        data: {
          id: 't1',
          name: 'New Topic',
        },
      };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await topicRepository.createTopic(mockData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/topics', {
        name: 'New Topic',
        status: 'inactive',
      });
    });

    it('handles string active status', async () => {
      const mockData = {
        name: 'New Topic',
        status: 'active' as any,
      };
      const mockResponse = {
        data: {
          id: 't1',
          name: 'New Topic',
        },
      };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await topicRepository.createTopic(mockData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/topics', {
        name: 'New Topic',
        status: 'active',
      });
    });

    it('handles string inactive status', async () => {
      const mockData = {
        name: 'New Topic',
        status: 'inactive' as any,
      };
      const mockResponse = {
        data: {
          id: 't1',
          name: 'New Topic',
        },
      };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await topicRepository.createTopic(mockData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/topics', {
        name: 'New Topic',
        status: 'inactive',
      });
    });

    it('handles undefined status', async () => {
      const mockData = {
        name: 'New Topic',
      };
      const mockResponse = {
        data: {
          id: 't1',
          name: 'New Topic',
        },
      };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await topicRepository.createTopic(mockData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/topics', {
        name: 'New Topic',
        status: undefined,
      });
    });

    it('returns created Topic', async () => {
      const mockData = {
        name: 'New Topic',
        status: TopicStatus.TOPIC_STATUS_ACTIVE,
      };
      const mockTopic = {
        id: 't1',
        name: 'New Topic',
      };
      const mockResponse = { data: mockTopic };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      const result = await topicRepository.createTopic(mockData);

      expect(result).toEqual(mockTopic);
    });
  });

  describe('updateTopic', () => {
    it('calls PATCH /topics/:id with active status', async () => {
      const mockData = {
        name: 'Updated Topic',
        status: TopicStatus.TOPIC_STATUS_ACTIVE,
      };
      const mockResponse = {
        data: {
          id: 't1',
          name: 'Updated Topic',
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await topicRepository.updateTopic('t1', mockData);

      expect(axiosInstance.patch).toHaveBeenCalledWith('/topics/t1', {
        name: 'Updated Topic',
        status: 'active',
      });
    });

    it('calls PATCH /topics/:id with inactive status', async () => {
      const mockData = {
        name: 'Updated Topic',
        status: TopicStatus.TOPIC_STATUS_INACTIVE,
      };
      const mockResponse = {
        data: {
          id: 't1',
          name: 'Updated Topic',
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await topicRepository.updateTopic('t1', mockData);

      expect(axiosInstance.patch).toHaveBeenCalledWith('/topics/t1', {
        name: 'Updated Topic',
        status: 'inactive',
      });
    });

    it('handles string active status', async () => {
      const mockData = {
        name: 'Updated Topic',
        status: 'active' as any,
      };
      const mockResponse = {
        data: {
          id: 't1',
          name: 'Updated Topic',
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await topicRepository.updateTopic('t1', mockData);

      expect(axiosInstance.patch).toHaveBeenCalledWith('/topics/t1', {
        name: 'Updated Topic',
        status: 'active',
      });
    });

    it('handles undefined status', async () => {
      const mockData = {
        name: 'Updated Topic',
      };
      const mockResponse = {
        data: {
          id: 't1',
          name: 'Updated Topic',
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await topicRepository.updateTopic('t1', mockData);

      expect(axiosInstance.patch).toHaveBeenCalledWith('/topics/t1', {
        name: 'Updated Topic',
        status: undefined,
      });
    });

    it('returns updated Topic', async () => {
      const mockData = {
        name: 'Updated Topic',
      };
      const mockTopic = {
        id: 't1',
        name: 'Updated Topic',
      };
      const mockResponse = { data: mockTopic };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      const result = await topicRepository.updateTopic('t1', mockData);

      expect(result).toEqual(mockTopic);
    });
  });

  describe('deleteTopic', () => {
    it('calls DELETE /topics/:id', async () => {
      vi.mocked(axiosInstance.delete).mockResolvedValue({});

      await topicRepository.deleteTopic('t1');

      expect(axiosInstance.delete).toHaveBeenCalledWith('/topics/t1');
    });

    it('returns void', async () => {
      vi.mocked(axiosInstance.delete).mockResolvedValue({});

      const result = await topicRepository.deleteTopic('t1');

      expect(result).toBeUndefined();
    });
  });

  describe('reorderTopics', () => {
    it('calls PATCH /topics/reorder', async () => {
      const topics = [
        { id: 't1', sortOrder: 1 },
        { id: 't2', sortOrder: 2 },
      ];
      vi.mocked(axiosInstance.patch).mockResolvedValue({});

      await topicRepository.reorderTopics(topics);

      expect(axiosInstance.patch).toHaveBeenCalledWith('/topics/reorder', { topics });
    });

    it('returns void', async () => {
      const topics = [{ id: 't1', sortOrder: 1 }];
      vi.mocked(axiosInstance.patch).mockResolvedValue({});

      const result = await topicRepository.reorderTopics(topics);

      expect(result).toBeUndefined();
    });
  });

  describe('addProductsToTopic', () => {
    it('calls POST /topics/:id/products', async () => {
      const products = [
        { productId: 'p1', sortOrder: 1 },
        { productId: 'p2', sortOrder: 2 },
      ];
      const mockResponse = {
        data: {
          id: 't1',
          name: 'Topic 1',
        },
      };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await topicRepository.addProductsToTopic('t1', products);

      expect(axiosInstance.post).toHaveBeenCalledWith('/topics/t1/products', { products });
    });

    it('returns updated Topic', async () => {
      const products = [{ productId: 'p1', sortOrder: 1 }];
      const mockTopic = {
        id: 't1',
        name: 'Topic with products',
      };
      const mockResponse = { data: mockTopic };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      const result = await topicRepository.addProductsToTopic('t1', products);

      expect(result).toEqual(mockTopic);
    });
  });

  describe('removeProductsFromTopic', () => {
    it('calls DELETE /topics/:id/products with productIds', async () => {
      const productIds = ['p1', 'p2', 'p3'];
      const mockResponse = {
        data: {
          id: 't1',
          name: 'Topic 1',
        },
      };
      vi.mocked(axiosInstance.delete).mockResolvedValue(mockResponse);

      await topicRepository.removeProductsFromTopic('t1', productIds);

      expect(axiosInstance.delete).toHaveBeenCalledWith('/topics/t1/products', {
        data: { productIds },
      });
    });

    it('returns updated Topic', async () => {
      const productIds = ['p1'];
      const mockTopic = {
        id: 't1',
        name: 'Topic without products',
      };
      const mockResponse = { data: mockTopic };
      vi.mocked(axiosInstance.delete).mockResolvedValue(mockResponse);

      const result = await topicRepository.removeProductsFromTopic('t1', productIds);

      expect(result).toEqual(mockTopic);
    });
  });

  describe('reorderTopicProducts', () => {
    it('calls PATCH /topics/:id/products/reorder', async () => {
      const products = [
        { productId: 'p1', sortOrder: 2 },
        { productId: 'p2', sortOrder: 1 },
      ];
      const mockResponse = {
        data: {
          id: 't1',
          name: 'Topic 1',
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await topicRepository.reorderTopicProducts('t1', products);

      expect(axiosInstance.patch).toHaveBeenCalledWith('/topics/t1/products/reorder', {
        products,
      });
    });

    it('returns updated Topic', async () => {
      const products = [{ productId: 'p1', sortOrder: 1 }];
      const mockTopic = {
        id: 't1',
        name: 'Topic with reordered products',
      };
      const mockResponse = { data: mockTopic };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      const result = await topicRepository.reorderTopicProducts('t1', products);

      expect(result).toEqual(mockTopic);
    });
  });
});
