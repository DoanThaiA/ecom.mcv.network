import axiosInstance from '@/lib/axios';
import { storageService } from '@/lib/services/storage.service';

class AffiliateRepository {
  /**
   * Track an affiliate click event.
   * Always sends x-session-id regardless of auth state,
   * because the tracking endpoint requires it for deduplication.
   * Fire-and-forget — errors are silently swallowed.
   */
  async trackClick(affiliateCode: string, productId?: string): Promise<void> {
    try {
      const sessionId = storageService.getXSessionId();
      await axiosInstance.post(
        '/affiliate-tracking/track',
        {
          affiliateCode,
          ...(productId ? { productId } : {}),
          type: 'CLICK',
        },
        { headers: { 'x-session-id': sessionId } },
      );
    } catch {
      // Intentionally ignored — tracking failures must not affect UX
    }
  }
}

export const affiliateRepository = new AffiliateRepository();
