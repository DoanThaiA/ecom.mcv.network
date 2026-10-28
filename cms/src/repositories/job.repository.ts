import axiosInstance from 'src/utils/axios';
import { JobResponse } from 'src/types/gen/cms/cms/jobs/job';
import type { JobStatusResponse } from 'src/types/import-session';

export interface ListJobsResponse {
  data: JobResponse[];
  hasNextPage: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListJobsParams {
  type?: string;
  page?: number;
  limit?: number;
}

// API returns lowercase snake_case strings (e.g. "nhanh_brand_sync", "completed")
// Proto expects uppercase format (e.g. "JOB_TYPE_NHANH_BRAND_SYNC", "JOB_STATUS_COMPLETED")
const convertApiTypeToProto = (type: string): string => {
  // Map API format to proto format
  const typeMap: Record<string, string> = {
    nhanh_product_list_sync: 'JOB_TYPE_NHANH_PRODUCT_LIST_SYNC',
    nhanh_category_sync: 'JOB_TYPE_NHANH_CATEGORY_SYNC',
    nhanh_inventory_sync: 'JOB_TYPE_NHANH_INVENTORY_SYNC',
    nhanh_brand_sync: 'JOB_TYPE_NHANH_BRAND_SYNC',
    nhanh_depot_sync: 'JOB_TYPE_NHANH_DEPOT_SYNC',
    nhanh_product_detail_sync: 'JOB_TYPE_NHANH_PRODUCT_DETAIL_SYNC',
    nhanh_product_embed_sync: 'JOB_TYPE_NHANH_PRODUCT_EMBED_SYNC',
  };
  return typeMap[type] || 'JOB_TYPE_UNSPECIFIED';
};

const convertApiStatusToProto = (status: string): string => {
  // Map API format to proto format
  const statusMap: Record<string, string> = {
    pending: 'JOB_STATUS_PENDING',
    running: 'JOB_STATUS_RUNNING',
    completed: 'JOB_STATUS_COMPLETED',
    failed: 'JOB_STATUS_FAILED',
    cancelled: 'JOB_STATUS_CANCELLED',
  };
  return statusMap[status] || 'JOB_STATUS_UNSPECIFIED';
};

class JobRepository {
  /**
   * Get a single job by ID (raw API format, for polling)
   * GET /api/v1/jobs/{id}
   */
  getJob = async (jobId: string): Promise<JobStatusResponse> => {
    const response = await axiosInstance.get<JobStatusResponse>(`/jobs/${jobId}`);
    return response.data;
  };

  listJobs = async (params: ListJobsParams): Promise<ListJobsResponse> => {
    const response = await axiosInstance.get('/jobs', { params });
    const apiData = response.data;

    // Convert API response to proto format
    const convertedData = apiData.data.map((item: any) =>
      JobResponse.fromJSON({
        ...item,
        type: convertApiTypeToProto(item.type),
        status: convertApiStatusToProto(item.status),
      })
    );

    return {
      ...apiData,
      data: convertedData,
    };
  };
}

export const jobRepository = new JobRepository();
