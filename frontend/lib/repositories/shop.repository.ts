import { API_BASE_URL } from '@/lib/config/api';
import type { ShopLandingResponse } from '@/types/gen/shop/shop/products/product';
import type {
  GetFlashSaleProductsRequest,
  ShopActiveFlashSaleResponse,
  ShopFlashSaleProductsResponse,
} from '@/types/gen/shop/shop/shop/shop';
import axiosInstance from '../axios';
import { fetchWithTimeout } from '@/lib/utils/fetchWithTimeout';
import { PopupAds } from '@/types/gen/shared/shared/popup-ads/popup-ads';

/**
 * Cache landing data to avoid duplicate fetches during SSR/dev double render.
 */
const FLASH_SALE_REVALIDATE_SECONDS = 60;

class ShopRepository {
  /**
   * Fetch landing page data (server-side compatible)
   * Uses native fetch for SSR compatibility
   */
  async getLandingPageData(): Promise<ShopLandingResponse> {
    try {
      const url = `${API_BASE_URL}/shop/landing`;

      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: {
          revalidate: 60,
        },
        timeout: 5000, // 5 second timeout
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch landing page data: ${response.statusText}`
        );
      }

      const result: ShopLandingResponse = await response.json();
      // Ensure arrays are always returned even if API returns null/undefined
      return {
        featuredProducts: result.featuredProducts ?? [],
        latestProducts: result.latestProducts ?? [],
        categories: result.categories ?? [],
        topics: result.topics ?? [],
        banners: result.banners,
      };
    } catch {
      // Return fallback data on timeout or error
      return {
        featuredProducts: [],
        latestProducts: [],
        categories: [],
        topics: [],
        banners: undefined,
      };
    }
  }

  /**
   * Fetch flash sales data (server-side compatible)
   * Uses native fetch for SSR compatibility
   */
  async getActiveFlashSale(): Promise<ShopActiveFlashSaleResponse | null> {
    try {
      const url = `${API_BASE_URL}/shop/flash-sale`;

      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: {
          revalidate: FLASH_SALE_REVALIDATE_SECONDS,
        },
        timeout: 5000, // 5 second timeout
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch flash sales: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch {
      // Return null on timeout or error
      return null;
    }
  }

  /**
   * Get flash sale products with filters & pagination
   * GET /api/v1/shop/flash-sale/products
   */
  async getFlashSaleProducts(
    request: GetFlashSaleProductsRequest
  ): Promise<ShopFlashSaleProductsResponse> {
    const { page, limit, filters } = request;
    const params: Record<string, any> = {};

    if (typeof page === 'number') {
      params.page = page;
    }

    if (typeof limit === 'number') {
      params.limit = limit;
    }

    if (filters) {
      params.filters = JSON.stringify(filters);
    }

    // console.log('[ShopRepository.getFlashSaleProducts] API Request:', {
    //   url: '/shop/flash-sale/products',
    //   params,
    //   filters,
    // });

    const response = await axiosInstance.get<ShopFlashSaleProductsResponse>(
      '/shop/flash-sale/products',
      { params }
    );

    // console.log('[ShopRepository.getFlashSaleProducts] API Response:', {
    //   status: response.status,
    //   dataKeys: Object.keys(response.data || {}),
    //   total: response.data?.total,
    //   dataLength: response.data?.data?.length || 0,
    //   page: response.data?.page,
    //   limit: response.data?.limit,
    //   totalPages: response.data?.totalPages,
    // });

    return response.data;
  }

  /**
   * Fetch active popup ads within the current time range
   * Used by the homepage to display advertising popups
   */
  async getActivePopupAds(): Promise<PopupAds[]> {
    try {
      const url = `${API_BASE_URL}/shop/popup-ads`;
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
      });

      if (!response.ok) {
        return [];
      }

      return (await response.json()) as PopupAds[];
    } catch {
      return [];
    }
  }
}

export const shopRepository = new ShopRepository();
