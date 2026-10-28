import { Box } from "@radix-ui/themes";
import {
  HeroSection,
  TimelineSection,
  VisionMissionSection,
  CustomerValueSection,
  CoreValueSection,
  BrandManifestoSection,
  BrandStorySection,
  BrandPersonalitySection,
  BrandDNASection,
} from "@/components/about";
import { FeedbackSection } from "@/components/common/FeedbackSection";

export async function AboutContent() {
  return (
    <Box className="min-h-screen bg-white">
      <Box className="max-w-[800px] mx-auto px-5 md:px-10 lg:px-0">
        {/* Section: Hero - Brand Introduction */}
        <HeroSection />

        {/* Section 01: Timeline - Development Journey */}
        <TimelineSection />

        {/* Section 02: Vision & Mission */}
        <VisionMissionSection />

        {/* Section 03: Customer Value */}
        <CustomerValueSection />

        {/* Section 04: Core Value */}
        <CoreValueSection />

        {/* Section 05: Brand Manifesto */}
        <BrandManifestoSection />

        {/* Section 06: Brand Story */}
        <BrandStorySection />

        {/* Section 07: Brand Personality */}
        <BrandPersonalitySection />

        {/* Section 08: Brand DNA */}
        <BrandDNASection />

        {/* Feedback */}
        <FeedbackSection />
      </Box>
    </Box>
  );
}
