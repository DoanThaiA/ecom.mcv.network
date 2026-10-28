import { Box } from '@radix-ui/themes';
import { HeroSection } from './HeroSection';
import { FAQAccordion } from './FAQAccordion';
import { ContactSection } from './ContactSection';

export async function FAQContent() {
  return (
    <Box className="min-h-screen bg-white overflow-x-hidden">
      <Box className="max-w-[800px] mx-auto px-5 md:px-10 lg:px-0">
        <HeroSection />
        <FAQAccordion />
        <ContactSection />
      </Box>
    </Box>
  );
}
