"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AppLocale } from "@/lib/locale";
import { storageService } from "@/lib/services/storage.service";
import { useAppSelector } from "@/lib/store/hooks";
import { AuthStatus } from "@/lib/store/slices/authSlice";
import type { CheckoutSession } from "@/types/gen/shop/shared/checkout-sessions/checkout-session";
import { CartContent } from "./CartContent";
import { CartContentDesktop } from "./CartContentDesktop";

interface CartPageClientProps {
  locale: AppLocale;
}

export function CartPageClient({ locale }: CartPageClientProps) {
  // Auth state to detect logout
  const { status: authStatus } = useAppSelector((state) => state.auth);
  const prevAuthStatusRef = useRef<AuthStatus>(authStatus);

  // Shared checkout session state
  const [checkoutSession, setCheckoutSession] =
    useState<CheckoutSession | null>(null);

  // Detect screen size to determine which component is active
  // Initialize with undefined to prevent premature renders
  const [isDesktop, setIsDesktop] = useState<boolean | undefined>(undefined);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    // Set initial value only once
    if (!isInitializedRef.current) {
      setIsDesktop(mediaQuery.matches);
      isInitializedRef.current = true;
    }

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Clear checkout session state on logout and login
  useEffect(() => {
    const prevStatus = prevAuthStatusRef.current;
    const wasAuthenticated = prevStatus === AuthStatus.AUTHENTICATED;
    const isNowIdle = authStatus === AuthStatus.IDLE;

    // Detect logout: was authenticated, now idle, and session is cleared
    if (wasAuthenticated && isNowIdle) {
      const storedSessionId = storageService.getCheckoutSessionId();
      if (!storedSessionId && checkoutSession) {
        // Clear parent checkout session state on logout
        setCheckoutSession(null);
      }
    }

    // Detect login: was not authenticated, now authenticated, and session is cleared
    const wasNotAuthenticated = prevStatus !== AuthStatus.AUTHENTICATED;
    const isNowAuthenticated = authStatus === AuthStatus.AUTHENTICATED;

    if (wasNotAuthenticated && isNowAuthenticated) {
      // Clear old guest checkout session from localStorage
      storageService.clearCheckoutSession();

      // Clear parent checkout session state on login
      // Child components will detect null session and create new authenticated session with empty checkoutSessionId
      setCheckoutSession(null);
      
    }

    // Update ref for next check
    prevAuthStatusRef.current = authStatus;
  }, [authStatus, checkoutSession]);

  // Callback for child components to update checkout session
  const handleCheckoutSessionUpdate = useCallback(
    (session: CheckoutSession | null) => {
      console.log('[CartPageClient] handleCheckoutSessionUpdate called with:', {
        id: session?.id,
        canPlaceOrder: session?.canPlaceOrder,
      });
      setCheckoutSession(session);
      console.log('[CartPageClient] State updated, should trigger re-render');
    },
    []
  );

  // Don't render until we know the screen size
  if (isDesktop === undefined) {
    return null;
  }

  return isDesktop ? (
    <CartContentDesktop
      locale={locale}
      checkoutSession={checkoutSession}
      onCheckoutSessionUpdate={handleCheckoutSessionUpdate}
      isActive={isDesktop}
    />
  ) : (
    <CartContent
      locale={locale}
      checkoutSession={checkoutSession}
      onCheckoutSessionUpdate={handleCheckoutSessionUpdate}
      isActive={!isDesktop}
    />
  );
}
