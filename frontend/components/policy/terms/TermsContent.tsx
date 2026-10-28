import { Box } from '@radix-ui/themes';
import { HeroSection } from './HeroSection';
import { Section1 } from './Section1';
import { Section2 } from './Section2';
import { Section3 } from './Section3';
import { Section4 } from './Section4';
import { Section5 } from './Section5';
import { Section6 } from './Section6';
import { FeedbackSection } from '@/components/common/FeedbackSection';

export async function TermsContent() {
  return (
    <Box className="min-h-screen bg-white overflow-x-hidden">
      <Box className="max-w-[800px] mx-auto px-5 md:px-10 lg:px-0">
        <HeroSection />
        <Section1 />
        <Section2 />
        <Section3 />
        <Section4 />
        <Section5 />
        <Section6 />
        <FeedbackSection />
      </Box>
    </Box>
  );
}
