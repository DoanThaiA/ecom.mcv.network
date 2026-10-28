import { Box } from '@radix-ui/themes';
import {
  HeroSection,
  IntroSection,
  StepsSection,
  DataSection,
  RedirectSection,
} from '@/components/help/account-deletion';
import { FeedbackSection } from '@/components/common/FeedbackSection';

export async function AccountDeletionContent() {
  return (
    <Box className="min-h-screen bg-white overflow-x-hidden">
      <Box className="max-w-[800px] mx-auto px-5 md:px-10 lg:px-0">
        {/* Hero Section */}
        <HeroSection />

        {/* Section 01: Quyền xóa dữ liệu */}
        <IntroSection />

        {/* Section 02: Cách yêu cầu xóa tài khoản */}
        <StepsSection />

        {/* Section 03: Dữ liệu sẽ bị xóa */}
        <DataSection />

        {/* Section 04: Redirect to Account */}
        <RedirectSection />

        {/* Feedback */}
        <FeedbackSection />
      </Box>
    </Box>
  );
}
