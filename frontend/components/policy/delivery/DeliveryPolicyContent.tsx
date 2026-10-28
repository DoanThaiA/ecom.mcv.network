import { Box } from '@radix-ui/themes';
import { HeroSection } from './HeroSection';
import { Section1 } from './Section1';
import { Section2 } from './Section2';
import { FeedbackSection } from '@/components/common/FeedbackSection';

export async function DeliveryPolicyContent() {
  return (
    <Box className="min-h-screen bg-white overflow-x-hidden">
      <Box className="max-w-[800px] mx-auto px-5 md:px-10 lg:px-0">
        {/* Hero Section */}
        <HeroSection />

        {/* Section 01: Thời gian giao hàng */}
        <Section1 />

        {/* Section 02: Delay reasons & Check order */}
        <Section2 />

        {/* Feedback */}
        <FeedbackSection />
      </Box>
    </Box>
  );
}
