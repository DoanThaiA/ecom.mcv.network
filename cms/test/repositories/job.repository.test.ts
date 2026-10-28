import { describe, it, expect, vi, beforeEach } from 'vitest';
import { jobRepository } from 'src/repositories/job.repository';
import type { ListJobsParams, ListJobsResponse } from 'src/repositories/job.repository';
import axiosInstance from 'src/utils/axios';
import { JobResponse } from 'src/types/gen/cms/cms/jobs/job';

vi.mock('src/utils/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('src/types/gen/cms/cms/jobs/job', () => ({
  JobResponse: {
    fromJSON: vi.fn((data) => data),
  },
}));

describe('jobRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports jobRepository instance', () => {
    expect(jobRepository).toBeDefined();
    expect(jobRepository).toHaveProperty('listJobs');
  });

  it('listJobs is a function', () => {
    expect(typeof jobRepository.listJobs).toBe('function');
  });

  describe('listJobs', () => {
    it('calls axios get with correct endpoint', async () => {
      const mockResponse = {
        data: {
          data: [],
          hasNextPage: false,
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await jobRepository.listJobs({});
      expect(axiosInstance.get).toHaveBeenCalledWith('/jobs', { params: {} });
    });

    it('passes params to axios', async () => {
      const mockResponse = {
        data: {
          data: [],
          hasNextPage: false,
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const params: ListJobsParams = {
        type: 'nhanh_product_list_sync',
        page: 2,
        limit: 20,
      };

      await jobRepository.listJobs(params);
      expect(axiosInstance.get).toHaveBeenCalledWith('/jobs', { params });
    });

    it('returns ListJobsResponse structure', async () => {
      const mockResponse = {
        data: {
          data: [],
          hasNextPage: true,
          total: 100,
          page: 1,
          limit: 10,
          totalPages: 10,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await jobRepository.listJobs({});
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('hasNextPage');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('totalPages');
    });

    it('converts API type to proto format', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: 'job1',
              type: 'nhanh_product_list_sync',
              status: 'completed',
            },
          ],
          hasNextPage: false,
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await jobRepository.listJobs({});
      expect(JobResponse.fromJSON).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'JOB_TYPE_NHANH_PRODUCT_LIST_SYNC',
        })
      );
    });

    it('converts API status to proto format', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: 'job1',
              type: 'nhanh_category_sync',
              status: 'running',
            },
          ],
          hasNextPage: false,
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await jobRepository.listJobs({});
      expect(JobResponse.fromJSON).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'JOB_STATUS_RUNNING',
        })
      );
    });

    it('handles all job types', async () => {
      const types = [
        'nhanh_product_list_sync',
        'nhanh_category_sync',
        'nhanh_inventory_sync',
        'nhanh_brand_sync',
        'nhanh_depot_sync',
        'nhanh_product_detail_sync',
        'nhanh_product_embed_sync',
      ];

      const expectedTypes = [
        'JOB_TYPE_NHANH_PRODUCT_LIST_SYNC',
        'JOB_TYPE_NHANH_CATEGORY_SYNC',
        'JOB_TYPE_NHANH_INVENTORY_SYNC',
        'JOB_TYPE_NHANH_BRAND_SYNC',
        'JOB_TYPE_NHANH_DEPOT_SYNC',
        'JOB_TYPE_NHANH_PRODUCT_DETAIL_SYNC',
        'JOB_TYPE_NHANH_PRODUCT_EMBED_SYNC',
      ];

      for (let i = 0; i < types.length; i++) {
        vi.clearAllMocks();
        const mockResponse = {
          data: {
            data: [{ id: 'job1', type: types[i], status: 'pending' }],
            hasNextPage: false,
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        };
        vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

        await jobRepository.listJobs({});
        expect(JobResponse.fromJSON).toHaveBeenCalledWith(
          expect.objectContaining({
            type: expectedTypes[i],
          })
        );
      }
    });

    it('handles all job statuses', async () => {
      const statuses = ['pending', 'running', 'completed', 'failed', 'cancelled'];
      const expectedStatuses = [
        'JOB_STATUS_PENDING',
        'JOB_STATUS_RUNNING',
        'JOB_STATUS_COMPLETED',
        'JOB_STATUS_FAILED',
        'JOB_STATUS_CANCELLED',
      ];

      for (let i = 0; i < statuses.length; i++) {
        vi.clearAllMocks();
        const mockResponse = {
          data: {
            data: [{ id: 'job1', type: 'nhanh_brand_sync', status: statuses[i] }],
            hasNextPage: false,
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        };
        vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

        await jobRepository.listJobs({});
        expect(JobResponse.fromJSON).toHaveBeenCalledWith(
          expect.objectContaining({
            status: expectedStatuses[i],
          })
        );
      }
    });

    it('handles unknown type with UNSPECIFIED', async () => {
      const mockResponse = {
        data: {
          data: [{ id: 'job1', type: 'unknown_type', status: 'pending' }],
          hasNextPage: false,
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await jobRepository.listJobs({});
      expect(JobResponse.fromJSON).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'JOB_TYPE_UNSPECIFIED',
        })
      );
    });

    it('handles unknown status with UNSPECIFIED', async () => {
      const mockResponse = {
        data: {
          data: [{ id: 'job1', type: 'nhanh_brand_sync', status: 'unknown_status' }],
          hasNextPage: false,
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await jobRepository.listJobs({});
      expect(JobResponse.fromJSON).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'JOB_STATUS_UNSPECIFIED',
        })
      );
    });

    it('handles multiple jobs in response', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: 'job1', type: 'nhanh_brand_sync', status: 'completed' },
            { id: 'job2', type: 'nhanh_inventory_sync', status: 'running' },
            { id: 'job3', type: 'nhanh_depot_sync', status: 'pending' },
          ],
          hasNextPage: true,
          total: 50,
          page: 1,
          limit: 10,
          totalPages: 5,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await jobRepository.listJobs({});
      expect(result.data).toHaveLength(3);
      expect(JobResponse.fromJSON).toHaveBeenCalledTimes(3);
    });

    it('preserves other response properties', async () => {
      const mockResponse = {
        data: {
          data: [],
          hasNextPage: true,
          total: 100,
          page: 3,
          limit: 25,
          totalPages: 4,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await jobRepository.listJobs({});
      expect(result.hasNextPage).toBe(true);
      expect(result.total).toBe(100);
      expect(result.page).toBe(3);
      expect(result.limit).toBe(25);
      expect(result.totalPages).toBe(4);
    });
  });
});
