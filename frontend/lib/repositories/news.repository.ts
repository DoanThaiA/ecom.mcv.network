import type { NewsArticle, NewsListResponse, GetNewsListParams } from '@/types/news';
import { API_BASE_URL } from '@/lib/config/api';
import axiosInstance from '@/lib/axios';

/** Backend article response shape */
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
}

/** Backend paginated response shape */
interface BackendArticleListResponse {
  data: BackendArticle[];
  hasNextPage: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Generate excerpt from HTML content
 */
function generateExcerpt(html: string, maxLength = 150): string {
  const text = html.replace(/<[^>]*>/g, '').trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + '...';
}

/**
 * Map backend article to frontend NewsArticle
 */
function mapToNewsArticle(article: BackendArticle): NewsArticle {
  return {
    id: article.id,
    title: article.title,
    titleLocalization: article.titleLocalization || null,
    content: article.content,
    contentLocalization: article.contentLocalization || null,
    thumbnail: article.thumbnail,
    publishedAt: article.publishedAt,
    excerpt: generateExcerpt(article.content),
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
}

/** Revalidation interval for SSR fetch calls */
const NEWS_REVALIDATE_SECONDS = 300;

/**
 * News Repository
 * Handles all news-related data operations
 */
class NewsRepository {
  /**
   * Get list of news articles with pagination (client-side)
   */
  async getNewsList(params: GetNewsListParams = {}): Promise<NewsListResponse> {
    const { page = 1, limit = 10 } = params;

    const response = await axiosInstance.get<BackendArticleListResponse>('/shop/articles', {
      params: { page, limit },
    });

    const result = response.data;

    return {
      data: result.data.map(mapToNewsArticle),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  /**
   * Get single news article by ID (SSR-compatible)
   * Uses native fetch for Next.js server-side rendering
   */
  async getNewsById(id: string): Promise<NewsArticle | null> {
    try {
      const url = `${API_BASE_URL}/shop/articles/${id}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: NEWS_REVALIDATE_SECONDS },
      });

      if (!response.ok) return null;

      const article: BackendArticle = await response.json();
      return mapToNewsArticle(article);
    } catch {
      return null;
    }
  }

  /**
   * Get featured news (first/latest article)
   */
  async getFeaturedNews(): Promise<NewsArticle | null> {
    try {
      const response = await axiosInstance.get<BackendArticleListResponse>('/shop/articles', {
        params: { page: 1, limit: 1 },
      });

      const articles = response.data.data;
      return articles.length > 0 ? mapToNewsArticle(articles[0]) : null;
    } catch {
      return null;
    }
  }

  /**
   * Get latest news (excluding featured)
   */
  async getLatestNews(limit: number = 6): Promise<NewsArticle[]> {
    const response = await axiosInstance.get<BackendArticleListResponse>('/shop/articles', {
      params: { page: 1, limit: limit + 1 },
    });

    const articles = response.data.data;
    // Skip first article (featured) and take the rest
    return articles.slice(1, limit + 1).map(mapToNewsArticle);
  }

  /**
   * Get related news (exclude current article)
   */
  async getRelatedNews(currentId: string, limit: number = 3): Promise<NewsArticle[]> {
    const response = await axiosInstance.get<BackendArticleListResponse>('/shop/articles', {
      params: { page: 1, limit: limit + 1 },
    });

    const articles = response.data.data;
    return articles
      .filter((a) => a.id !== currentId)
      .slice(0, limit)
      .map(mapToNewsArticle);
  }
}

export const newsRepository = new NewsRepository();
