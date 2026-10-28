import { Box } from '@radix-ui/themes';
import {
  HeroSection,
  Section1,
  Section2,
  Section3,
  Section4,
} from '@/components/policy/privacy';
import { FeedbackSection } from '@/components/common/FeedbackSection';

export async function PrivacyPolicyContent() {
  return (
    <Box className="min-h-screen bg-white overflow-x-hidden">
      <Box className="max-w-[800px] mx-auto px-5 md:px-10 lg:px-0">
        {/* Hero Section */}
        <HeroSection />

        {/* Section 01: Mục đích thu thập và sử dụng thông tin */}
        <Section1 />

        {/* Section 02: Cách thức bảo mật thông tin */}
        <Section2 />

        {/* Section 03: Trách nhiệm bảo mật thông tin của khách hàng */}
        <Section3 />

        {/* Section 04: Luật áp dụng khi xảy ra tranh chấp */}
        <Section4 />

        {/* Feedback */}
        <FeedbackSection />
      </Box>
    </Box>
  );
}
