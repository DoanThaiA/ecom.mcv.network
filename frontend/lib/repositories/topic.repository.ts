import type {
  ShopTopicListResponse,
} from '@/types/gen/shop/shop/topics/topic';
import type { ShopTopicResponse } from '@/types/gen/shared/shared/topics/topic';
import { API_BASE_URL } from '@/lib/config/api';
import type { GetShopTopicRequest, ShopTopicProductsResponse } from '@/types/gen/shop/shop/products/product';
import axiosInstance from '../axios';

/**
 * Cache topics list to avoid duplicate fetches during SSR/dev double render.
 */
const TOPIC_LIST_REVALIDATE_SECONDS = 300;

/**
 * Topic Repository
 * Handles all topic-related API calls
 */
class TopicRepository {
  /**
   * Fetch shop topics list (server-side compatible)
   * Uses native fetch for SSR compatibility
   */
  async getShopTopics(): Promise<ShopTopicListResponse> {
    const url = `${API_BASE_URL}/shop/topics`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: {
          revalidate: TOPIC_LIST_REVALIDATE_SECONDS,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch shop topics: ${response.statusText}`);
      }

      return await response.json();
    } catch {
      return {
        topics: [],
      };
    }
  }

  /**
   * Fetch topic by slug (client-side)
   * Returns full topic details including products and categories
   */
  async getTopicBySlug(slug: string): Promise<ShopTopicResponse> {
    const response = await axiosInstance.get<ShopTopicResponse>(
      `/shop/topics/${slug}`
    );

    return response.data;
  }

  /**
   * Fetch topic products by slug (client-side)
   * Uses axios instance
   */
  async getTopicProducts(
    request: GetShopTopicRequest
  ): Promise<ShopTopicProductsResponse> {
    const { slug, page = 1, limit = 20 } = request;

    // Construct query parameters
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await axiosInstance.get<ShopTopicProductsResponse>(
      `/shop/topics/${slug}/products`,
      {
        params: {
          page,
          limit,
        },
      }
    );

    return response.data;
  }
}

export const topicRepository = new TopicRepository();

// Exporting legacy functions for backward compatibility/during refactor if needed, 
// but based on plan we are updating consumers. 
// However, the original file had named exports.
// To follow the pattern of product.repository.ts, we usually export the instance.
// But some files might import { getShopTopics } from ...
// Let's checks consumers.
// They imported { getShopTopics } from '@/lib/repositories';
// We should preferably update consumers to use topicRepository.getShopTopics
// OR double export for easier transition. 
// Given the instruction "Refactor ... request is GetShopTopicRequest ... architecture lib/repositories/product.repository.ts"
// product.repository.ts exports `export const productRepository = new ProductRepository();`
// The plan said "Update consumers". So I will NOT export standalone functions anymore.

