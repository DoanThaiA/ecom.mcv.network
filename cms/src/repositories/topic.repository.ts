import axiosInstance from 'src/utils/axios';
import type { Topic } from 'src/types/gen/shared/shared/topics/topic';
import type {
  QueryTopicsRequest,
  QueryTopicsResponse,
  CreateTopicRequest,
  UpdateTopicRequest,
  CreateTopicProduct,
  CreateTopicCategory,
  ReorderTopicItem,
  ReorderProductItem,
  ReorderCategoryItem,
} from 'src/types/gen/cms/cms/topics/topic';
import { TopicStatus } from 'src/types/gen/shared/shared/common/enums';
import type {
  ImportSessionResponse,
  PaginatedImportSessionRows,
  QueryImportSessionRowsParams,
  ConfirmImportSessionResponse,
} from 'src/types/import-session';

/**
 * Convert TopicStatus (enum or string) to API string format
 * API expects 'active' | 'inactive' instead of enum values
 */
const toApiStatus = (status?: TopicStatus | string): string | undefined => {
  if (status === TopicStatus.TOPIC_STATUS_ACTIVE || status === 'active') {
    return 'active';
  }
  if (status === TopicStatus.TOPIC_STATUS_INACTIVE || status === 'inactive') {
    return 'inactive';
  }
  return undefined;
};

/**
 * Topic Repository
 * Handles all topic-related API calls
 */
class TopicRepository {
  /**
   * Get topics with filters, sorting, and pagination
   */
  getTopics = async (params: QueryTopicsRequest): Promise<QueryTopicsResponse> => {
    const { page, limit, filters, sort } = params;

    // Build query params
    const queryParams: Record<string, string> = {};

    if (page !== undefined) {
      queryParams.page = page.toString();
    }
    if (limit !== undefined) {
      queryParams.limit = limit.toString();
    }

    // Add filters if provided
    if (filters && Object.keys(filters).length > 0) {
      queryParams.filters = JSON.stringify(filters);
    }

    // Add sort if provided
    if (sort && sort.length > 0) {
      queryParams.sort = JSON.stringify(sort);
    }

    const response = await axiosInstance.get<QueryTopicsResponse>('/topics', {
      params: queryParams,
    });

    return response.data;
  };

  /**
   * Get single topic by ID
   */
  getTopicById = async (id: string): Promise<Topic> => {
    const response = await axiosInstance.get<Topic>(`/topics/${id}`);
    return response.data;
  };

  /**
   * Create a new topic
   */
  createTopic = async (data: CreateTopicRequest): Promise<Topic> => {
    const apiData = {
      ...data,
      status: toApiStatus(data.status as TopicStatus | string),
      // Ensure type is sent as number, not enum name
      type: data.type !== undefined ? Number(data.type) : undefined,
    };

    const response = await axiosInstance.post<Topic>('/topics', apiData);
    return response.data;
  };

  /**
   * Update an existing topic
   */
  updateTopic = async (id: string, data: Omit<UpdateTopicRequest, 'topicId'>): Promise<Topic> => {
    const apiData = {
      ...data,
      status: toApiStatus(data.status as TopicStatus | string),
    };

    const response = await axiosInstance.patch<Topic>(`/topics/${id}`, apiData);
    return response.data;
  };

  /**
   * Delete a topic
   */
  deleteTopic = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/topics/${id}`);
  };

  /**
   * Bulk reorder topics
   */
  reorderTopics = async (topics: ReorderTopicItem[]): Promise<void> => {
    await axiosInstance.patch('/topics/reorder', { topics });
  };

  /**
   * Add products to a topic
   */
  addProductsToTopic = async (id: string, products: CreateTopicProduct[]): Promise<Topic> => {
    const response = await axiosInstance.post<Topic>(`/topics/${id}/products`, { products });
    return response.data;
  };

  /**
   * Remove products from a topic
   */
  removeProductsFromTopic = async (id: string, productIds: string[]): Promise<Topic> => {
    const response = await axiosInstance.delete<Topic>(`/topics/${id}/products`, {
      data: { productIds },
    });
    return response.data;
  };

  /**
   * Reorder products within a topic
   */
  reorderTopicProducts = async (id: string, products: ReorderProductItem[]): Promise<Topic> => {
    const response = await axiosInstance.patch<Topic>(`/topics/${id}/products/reorder`, {
      products,
    });
    return response.data;
  };

  /**
   * Add categories to a topic
   */
  addCategoriesToTopic = async (id: string, categories: CreateTopicCategory[]): Promise<Topic> => {
    const response = await axiosInstance.post<Topic>(`/topics/${id}/categories`, { categories });
    return response.data;
  };

  /**
   * Remove categories from a topic
   */
  removeCategoriesFromTopic = async (id: string, categoryIds: string[]): Promise<Topic> => {
    const response = await axiosInstance.delete<Topic>(`/topics/${id}/categories`, {
      data: { categoryIds },
    });
    return response.data;
  };

  /**
   * Reorder categories within a topic
   */
  reorderTopicCategories = async (
    id: string,
    categories: ReorderCategoryItem[]
  ): Promise<Topic> => {
    const response = await axiosInstance.patch<Topic>(`/topics/${id}/categories/reorder`, {
      categories,
    });
    return response.data;
  };

  /**
   * Add banners to a topic
   */
  addBannersToTopic = async (
    id: string,
    banners: { mediaType: number; media: object; link?: string; order?: number }[]
  ): Promise<Topic> => {
    const response = await axiosInstance.post<Topic>(`/topics/${id}/banners`, { banners });
    return response.data;
  };

  /**
   * Remove banners from a topic
   */
  removeBannersFromTopic = async (id: string, bannerIds: string[]): Promise<Topic> => {
    const response = await axiosInstance.delete<Topic>(`/topics/${id}/banners`, {
      data: { bannerIds },
    });
    return response.data;
  };

  /**
   * Update a single banner in a topic
   */
  updateTopicBanner = async (
    topicId: string,
    bannerId: string,
    data: { mediaType?: number; media?: object; link?: string; order?: number }
  ): Promise<Topic> => {
    const response = await axiosInstance.patch<Topic>(
      `/topics/${topicId}/banners/${bannerId}`,
      data
    );
    return response.data;
  };

  /**
   * Reorder banners within a topic
   */
  reorderTopicBanners = async (
    id: string,
    banners: { bannerId: string; order: number }[]
  ): Promise<Topic> => {
    const response = await axiosInstance.patch<Topic>(`/topics/${id}/banners/reorder`, {
      banners,
    });
    return response.data;
  };

  // ─── Import Session Methods ─────────────────────────────────────────────

  /**
   * Create a topic product import session by uploading an Excel file
   * POST /api/v1/topics/{topicId}/import-session
   */
  createImportSession = async (topicId: string, file: File): Promise<ImportSessionResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post<ImportSessionResponse>(
      `/topics/${topicId}/import-session`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  };

  /**
   * Get import session summary
   * GET /api/v1/topics/import-session/{sessionId}
   */
  getImportSession = async (sessionId: string): Promise<ImportSessionResponse> => {
    const response = await axiosInstance.get<ImportSessionResponse>(
      `/topics/import-session/${sessionId}`
    );
    return response.data;
  };

  /**
   * Get paginated import session rows
   * GET /api/v1/topics/import-session/{sessionId}/rows
   */
  getImportSessionRows = async (
    sessionId: string,
    params: QueryImportSessionRowsParams
  ): Promise<PaginatedImportSessionRows> => {
    const queryParams: Record<string, string> = {
      page: params.page.toString(),
      limit: params.limit.toString(),
    };
    if (params.isValid !== undefined) {
      queryParams.isValid = params.isValid.toString();
    }
    if (params.search) {
      queryParams.search = params.search;
    }

    const response = await axiosInstance.get<PaginatedImportSessionRows>(
      `/topics/import-session/${sessionId}/rows`,
      { params: queryParams }
    );
    return response.data;
  };

  /**
   * Delete a session row before confirming
   * DELETE /api/v1/topics/import-session/{sessionId}/rows/{rowId}
   */
  deleteImportSessionRow = async (
    sessionId: string,
    rowId: string
  ): Promise<ImportSessionResponse> => {
    const response = await axiosInstance.delete<ImportSessionResponse>(
      `/topics/import-session/${sessionId}/rows/${rowId}`
    );
    return response.data;
  };

  /**
   * Confirm import session and start processing job
   * POST /api/v1/topics/import-session/{sessionId}/confirm
   */
  confirmImportSession = async (sessionId: string): Promise<ConfirmImportSessionResponse> => {
    const response = await axiosInstance.post<ConfirmImportSessionResponse>(
      `/topics/import-session/${sessionId}/confirm`
    );
    return response.data;
  };
}

export const topicRepository = new TopicRepository();
