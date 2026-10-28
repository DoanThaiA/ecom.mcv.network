"use client";

import { useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { storageService } from "@/lib/services/storage.service";
import { affiliateRepository } from "@/lib/repositories/affiliate.repository";

const AFFILIATE_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Sets the aff_code cookie so the backend can read it when creating a checkout session.
 */
function setAffiliateCookie(code: string): void {
  document.cookie = `aff_code=${encodeURIComponent(code)}; path=/; max-age=${AFFILIATE_COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * Handles affiliate code detection and tracking.
 * - Reads ?ref=<code> from the URL on landing
 * - Persists the code in localStorage and as a cookie (aff_code)
 * - Fires a click tracking event to the backend
 * - Restores the cookie from localStorage on subsequent visits (in case the cookie expired)
 */
export function AffiliateTracker() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const refCode = searchParams.get("ref");

    if (refCode) {
      // New affiliate landing — save code and track click
      storageService.setAffiliateCode(refCode);
      setAffiliateCookie(refCode);

      // Skip generic click tracking on product pages — ProductDetailContent
      // handles it with the correct productId
      const isProductPage = /\/products\//.test(pathname);
      if (!isProductPage) {
        void affiliateRepository.trackClick(refCode);
      }
    } else {
      // No ref in URL — restore cookie from localStorage if code is stored
      const storedCode = storageService.getAffiliateCode();
      if (storedCode) {
        setAffiliateCookie(storedCode);
      }
    }
  }, []);

  return null;
}
