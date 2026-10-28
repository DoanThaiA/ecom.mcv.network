import { Box } from '@radix-ui/themes';
import { HeroSection } from './HeroSection';
import { Section1 } from './Section1';
import { Section2 } from './Section2';
import { ReturnRequestButton } from './ReturnRequestButton';
import { FeedbackSection } from '@/components/common/FeedbackSection';

export async function ReturnPolicyContent() {
  return (
    <Box className="min-h-screen bg-white overflow-x-hidden">
      <Box className="max-w-[800px] mx-auto px-5 md:px-10 lg:px-0">
        {/* Hero Section */}
        <HeroSection />

        {/* Section 01: Thời gian đổi / trả */}
        <Section1 />

        {/* Section 02: Chính sách áp dụng */}
        <Section2 />

        {/* Return Request Button */}
        <ReturnRequestButton />

        {/* Feedback */}
        <FeedbackSection />
      </Box>
    </Box>
  );
}

