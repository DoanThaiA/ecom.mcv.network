import { API_BASE_URL } from '@/lib/config/api';
import { parseProductPromotionHighlightsResponse } from '@/lib/helpers/productPromotionHighlightResponseHelper';
import { fetchWithTimeout } from '@/lib/utils/fetchWithTimeout';
import type { ProductPromotionHighlightsResponse } from '@/types/gen/shop/shop/shop/shop';

const FAILURE_LOG_THROTTLE_MS = 60_000;
const failureLogTimestamps = new Map<string, number>();

const reportFailure = (key: string, message: string): void => {
  const now = Date.now();
  const lastReportedAt = failureLogTimestamps.get(key);
  if (
    lastReportedAt !== undefined &&
    now - lastReportedAt < FAILURE_LOG_THROTTLE_MS
  ) {
    return;
  }

  failureLogTimestamps.set(key, now);
  // eslint-disable-next-line no-console -- optional PDP data must fail soft but remain observable server-side
  console.warn(`[ProductPromotionHighlights] ${message}`);
};

/** Server-side, fail-soft data source used only by the streamed PDP slot. */
class ProductPromotionHighlightsRepository {
  getByProductId = async (
    productId: string,
  ): Promise<ProductPromotionHighlightsResponse | null> => {
    if (!productId) return null;

    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/shop/products/${encodeURIComponent(productId)}/promotion-highlights`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
          timeout: 2500,
        },
      );

      if (!response.ok) {
        reportFailure(
          `http-${response.status}`,
          `Endpoint returned HTTP ${response.status}`,
        );
        return null;
      }

      const highlights = parseProductPromotionHighlightsResponse(
        await response.json(),
      );
      if (!highlights) {
        reportFailure('invalid-response', 'Endpoint returned an invalid payload');
      }
      return highlights;
    } catch (error) {
      reportFailure(
        'request-failed',
        `Request failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      return null;
    }
  };
}

export const productPromotionHighlightsRepository =
  new ProductPromotionHighlightsRepository();
