'use client';

import { useEffect } from 'react';
import { PopupAdsDialog } from '@/components/popup-ads/PopupAdsDialog';

interface HomePageClientProps {
  children: React.ReactNode;
}

export function HomePageClient({ children }: HomePageClientProps) {
  // Scroll to top on mount to ignore cached scroll position
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {children}
      <PopupAdsDialog />
    </>
  );
}
