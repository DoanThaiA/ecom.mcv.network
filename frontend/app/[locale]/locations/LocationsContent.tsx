'use client';

import { useState } from 'react';
import { AppLocale } from '@/lib/locale';
import { Box } from '@radix-ui/themes';
import {
  HeroSection,
  StoreSelector,
  StoreInfoCard,
  GallerySection,
} from '@/components/locations';
import { FeedbackSection } from '@/components/common/FeedbackSection';
import { STORES } from '@/lib/constants';

interface LocationsContentProps {
  locale: AppLocale;
}

export function LocationsContent({ locale: _locale }: LocationsContentProps) {
  const [selectedStore, setSelectedStore] = useState(STORES[0]);

  return (
    <Box className="min-h-screen bg-white overflow-x-hidden">
      <Box className="max-w-[800px] mx-auto px-5 md:px-10 lg:px-0 lg:pt-12">
        {/* Hero Section with Stats */}
        <HeroSection />

        {/* Store Selector & Info Section */}
        <Box className="py-6 lg:py-8 gap-4 bg-white border-b border-[#F0F0F0]">
          {/* Mobile: Separate boxes */}
          <Box className="lg:hidden">
            <Box className="p-4 gap-4 bg-[#F2F2F2] rounded-2xl mb-4">
              <StoreSelector
                selectedStore={selectedStore}
                onSelectStore={setSelectedStore}
              />
            </Box>
            <StoreInfoCard store={selectedStore} />
          </Box>

          {/* Desktop: Combined box with border - padding 16px, gap 16px */}
          <Box className="hidden lg:block p-4 bg-white border border-[#F0F0F0] rounded-2xl">
            <StoreSelector
              selectedStore={selectedStore}
              onSelectStore={setSelectedStore}
            />
            <StoreInfoCard store={selectedStore} />
          </Box>
        </Box>

        {/* Gallery Section */}
        <GallerySection />

        {/* Feedback Section */}
        <FeedbackSection showBorder={false} />
      </Box>
    </Box>
  );
}
