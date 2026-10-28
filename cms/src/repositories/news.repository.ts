import axiosInstance from 'src/utils/axios';
import type {
  News,
  NewsStatus,
  GetNewsListRequest,
  GetNewsListResponse,
  CreateNewsRequest,
  UpdateNewsRequest,
} from 'src/types/news';

/** Backend article status enum values */
const STATUS_TO_BACKEND: Record<NewsStatus, number> = {
  active: 1,
  inactive: 2,
};

const STATUS_FROM_BACKEND: Record<number, NewsStatus> = {
  1: 'active',
  2: 'inactive',
};

/** Backend paginated response shape */
interface BackendArticleResponse {
  data: BackendArticle[];
  hasNextPage: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface BackendArticle {
  id: string;
  title: string;
  titleLocalization?: { vi?: string; en?: string } | null;
  content: string;
  contentLocalization?: { vi?: string; en?: string } | null;
  thumbnail: string;
  status: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

/**
 * Map backend article to CMS News type
 */
function mapToNews(article: BackendArticle): News {
  return {
    id: article.id,
    title: article.title,
    titleLocalization: article.titleLocalization || null,
    content: article.content,
    contentLocalization: article.contentLocalization || null,
    thumbnail: article.thumbnail,
    status: STATUS_FROM_BACKEND[article.status] || 'inactive',
    publishedAt: article.publishedAt,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
}

/**
 * News Repository
 * Handles all news-related API calls
 */
class NewsRepository {
  /**
   * Get news list with filters and pagination
   * GET /api/v1/cms/articles
   */
  getNewsList = async (params: GetNewsListRequest): Promise<GetNewsListResponse> => {
    const queryParams: Record<string, string> = {};

    if (params.page !== undefined) {
      queryParams.page = params.page.toString();
    }
    if (params.limit !== undefined) {
      queryParams.limit = params.limit.toString();
    }
    if (params.search) {
      queryParams.filters = JSON.stringify({ search: params.search });
    }

    const response = await axiosInstance.get<BackendArticleResponse>('/cms/articles', {
      params: queryParams,
    });

    const result = response.data;

    return {
      data: result.data.map(mapToNews),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  };

  /**
   * Get single news by ID
   * GET /api/v1/cms/articles/{id}
   */
  getNewsById = async (id: string): Promise<News | null> => {
    const response = await axiosInstance.get<BackendArticle>(`/cms/articles/${id}`);
    return mapToNews(response.data);
  };

  /**
   * Create a new news
   * POST /api/v1/cms/articles
   */
  createNews = async (data: CreateNewsRequest): Promise<News> => {
    const response = await axiosInstance.post<BackendArticle>('/cms/articles', {
      title: data.title,
      titleLocalization: data.titleLocalization,
      content: data.content,
      contentLocalization: data.contentLocalization,
      thumbnail: data.thumbnail,
      status: STATUS_TO_BACKEND[data.status],
      publishedAt: data.publishedAt,
    });

    return mapToNews(response.data);
  };

  /**
   * Update an existing news
   * PATCH /api/v1/cms/articles/{id}
   */
  updateNews = async (id: string, data: UpdateNewsRequest): Promise<News> => {
    const response = await axiosInstance.patch<BackendArticle>(`/cms/articles/${id}`, {
      title: data.title,
      titleLocalization: data.titleLocalization,
      content: data.content,
      contentLocalization: data.contentLocalization,
      thumbnail: data.thumbnail,
      status: STATUS_TO_BACKEND[data.status],
      publishedAt: data.publishedAt,
    });

    return mapToNews(response.data);
  };

  /**
   * Toggle news status (active <-> inactive)
   * PATCH /api/v1/cms/articles/{id}
   */
  toggleNewsStatus = async (id: string, currentStatus: NewsStatus): Promise<News> => {
    const newStatus: NewsStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const response = await axiosInstance.patch<BackendArticle>(`/cms/articles/${id}`, {
      status: STATUS_TO_BACKEND[newStatus],
    });

    return mapToNews(response.data);
  };

  /**
   * Delete a news
   * DELETE /api/v1/cms/articles/{id}
   */
  deleteNews = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/cms/articles/${id}`);
  };
}

export const newsRepository = new NewsRepository();
