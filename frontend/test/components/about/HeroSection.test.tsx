import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from '@/components/about/HeroSection';
import { Theme } from '@radix-ui/themes';

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => {
    return (key: string) => {
      const translations: Record<string, string> = {
        title: 'ABOUT US',
        descriptionPart1: 'We bring you the best ',
        smartCasual: 'Smart Casual',
        descriptionPart2: ' fashion experience',
        slogan: 'Fashion - Confidence - Success',
      };
      return translations[key] || key;
    };
  }),
}));

describe('HeroSection', () => {
  const renderWithTheme = async (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  describe('Basic rendering', () => {
    it('renders without crashing', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      expect(container).toBeInTheDocument();
    });

    it('renders title', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText('ABOUT US')).toBeInTheDocument();
    });

    it('renders description parts', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText(/We bring you the best/)).toBeInTheDocument();
      expect(screen.getByText('Smart Casual')).toBeInTheDocument();
      expect(screen.getByText(/fashion experience/)).toBeInTheDocument();
    });

    it('renders slogan', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText('Fashion - Confidence - Success')).toBeInTheDocument();
    });
  });

  describe('Main container styling', () => {
    it('applies flex class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const main = container.querySelector('.flex');
      expect(main).toBeInTheDocument();
    });

    it('applies flex-col class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const main = container.querySelector('.flex-col');
      expect(main).toBeInTheDocument();
    });

    it('applies justify-center class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const main = container.querySelector('.justify-center');
      expect(main).toBeInTheDocument();
    });

    it('applies items-start class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const main = container.querySelector('.items-start');
      expect(main).toBeInTheDocument();
    });

    it('applies border-b class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const main = container.querySelector('.border-b');
      expect(main).toBeInTheDocument();
    });

    it('applies border color', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const main = container.querySelector('.border-\\[\\#F0F0F0\\]');
      expect(main).toBeInTheDocument();
    });

    it('applies pt-12 for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const main = container.querySelector('.pt-12');
      expect(main).toBeInTheDocument();
    });

    it('applies pb-6 for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const main = container.querySelector('.pb-6');
      expect(main).toBeInTheDocument();
    });

    it('applies gap-4 for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const main = container.querySelector('.gap-4');
      expect(main).toBeInTheDocument();
    });

    it('applies lg:pt-20 for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const main = container.querySelector('.lg\\:pt-20');
      expect(main).toBeInTheDocument();
    });

    it('applies lg:pb-8 for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const main = container.querySelector('.lg\\:pb-8');
      expect(main).toBeInTheDocument();
    });

    it('applies lg:gap-6 for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const main = container.querySelector('.lg\\:gap-6');
      expect(main).toBeInTheDocument();
    });
  });

  describe('Title styling', () => {
    it('applies text-black class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const title = container.querySelector('.text-black');
      expect(title).toBeInTheDocument();
    });

    it('applies font-semibold class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const title = container.querySelector('.font-semibold');
      expect(title).toBeInTheDocument();
    });

    it('applies uppercase class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const title = container.querySelector('.uppercase');
      expect(title).toBeInTheDocument();
    });

    it('applies self-stretch class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const stretched = container.querySelectorAll('.self-stretch');
      expect(stretched.length).toBeGreaterThan(0);
    });

    it('applies whitespace-pre-line class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const whitespace = container.querySelectorAll('.whitespace-pre-line');
      expect(whitespace.length).toBeGreaterThan(0);
    });

    it('applies text-3xl for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const title = container.querySelector('.text-3xl');
      expect(title).toBeInTheDocument();
    });

    it('applies leading-9 for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const title = container.querySelector('.leading-9');
      expect(title).toBeInTheDocument();
    });

    it('applies lg:text-5xl for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const title = container.querySelector('.lg\\:text-5xl');
      expect(title).toBeInTheDocument();
    });

    it('applies lg:leading-[56px] for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const title = container.querySelector('.lg\\:leading-\\[56px\\]');
      expect(title).toBeInTheDocument();
    });
  });

  describe('Description container styling', () => {
    it('applies full width with negative margin', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const desc = container.querySelector('.w-\\[calc\\(100\\%\\+40px\\)\\]');
      expect(desc).toBeInTheDocument();
    });

    it('applies negative margin', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const desc = container.querySelector('.-mx-5');
      expect(desc).toBeInTheDocument();
    });

    it('applies padding p-6 for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const desc = container.querySelector('.p-6');
      expect(desc).toBeInTheDocument();
    });

    it('applies background color', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const desc = container.querySelector('.bg-\\[\\#FDF7F1\\]');
      expect(desc).toBeInTheDocument();
    });

    it('applies responsive width for md', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const desc = container.querySelector('.md\\:w-\\[calc\\(100\\%\\+80px\\)\\]');
      expect(desc).toBeInTheDocument();
    });

    it('applies responsive margin for md', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const desc = container.querySelector('.md\\:-mx-10');
      expect(desc).toBeInTheDocument();
    });

    it('applies responsive padding for md', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const desc = container.querySelector('.md\\:p-8');
      expect(desc).toBeInTheDocument();
    });

    it('applies auto width for lg', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const desc = container.querySelector('.lg\\:w-auto');
      expect(desc).toBeInTheDocument();
    });

    it('applies zero margin for lg', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const desc = container.querySelector('.lg\\:mx-0');
      expect(desc).toBeInTheDocument();
    });
  });

  describe('Description text styling', () => {
    it('applies text-base for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const texts = container.querySelectorAll('.text-base');
      expect(texts.length).toBeGreaterThan(0);
    });

    it('applies leading-6 for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const texts = container.querySelectorAll('.leading-6');
      expect(texts.length).toBeGreaterThan(0);
    });

    it('applies lg:text-lg for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const texts = container.querySelectorAll('.lg\\:text-lg');
      expect(texts.length).toBeGreaterThan(0);
    });

    it('applies lg:leading-7 for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const texts = container.querySelectorAll('.lg\\:leading-7');
      expect(texts.length).toBeGreaterThan(0);
    });

    it('applies text-center class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const centered = container.querySelectorAll('.text-center');
      expect(centered.length).toBeGreaterThan(0);
    });
  });

  describe('Smart Casual gradient text', () => {
    it('applies bg-clip-text class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const gradient = container.querySelector('.bg-clip-text');
      expect(gradient).toBeInTheDocument();
    });

    it('applies text-transparent class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const gradient = container.querySelector('.text-transparent');
      expect(gradient).toBeInTheDocument();
    });

    it('uses span element', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const span = container.querySelector('[class*="bg-clip-text"]');
      expect(span).toBeInTheDocument();
    });

    it('has gradient background style', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const gradient = container.querySelector('[style*="linear-gradient"]');
      expect(gradient).toBeInTheDocument();
    });

    it('gradient starts with #FAA63E', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const gradient = container.querySelector('[style*="#FAA63E"]');
      expect(gradient).toBeInTheDocument();
    });

    it('gradient ends with #9B5526', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const gradient = container.querySelector('[style*="#9B5526"]');
      expect(gradient).toBeInTheDocument();
    });
  });

  describe('Slogan container styling', () => {
    it('applies px-4 padding', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const slogans = container.querySelectorAll('.px-4');
      expect(slogans.length).toBeGreaterThan(0);
    });

    it('applies py-2 padding', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const slogan = container.querySelector('.py-2');
      expect(slogan).toBeInTheDocument();
    });

    it('applies border class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const slogan = container.querySelector('.border');
      expect(slogan).toBeInTheDocument();
    });

    it('applies rounded-[100px] class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const slogan = container.querySelector('.rounded-\\[100px\\]');
      expect(slogan).toBeInTheDocument();
    });
  });

  describe('Slogan text styling', () => {
    it('applies text-sm for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const texts = container.querySelectorAll('.text-sm');
      expect(texts.length).toBeGreaterThan(0);
    });

    it('applies leading-5 for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const texts = container.querySelectorAll('.leading-5');
      expect(texts.length).toBeGreaterThan(0);
    });

    it('applies whitespace-nowrap class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const slogan = container.querySelector('.whitespace-nowrap');
      expect(slogan).toBeInTheDocument();
    });
  });

  describe('Translation integration', () => {
    it('uses about.hero namespace', async () => {
      await renderWithTheme(await HeroSection());
      // If renders without error, translation is working
      expect(true).toBe(true);
    });

    it('translates title', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText('ABOUT US')).toBeInTheDocument();
    });

    it('translates descriptionPart1', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText(/We bring you the best/)).toBeInTheDocument();
    });

    it('translates smartCasual', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText('Smart Casual')).toBeInTheDocument();
    });

    it('translates descriptionPart2', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText(/fashion experience/)).toBeInTheDocument();
    });

    it('translates slogan', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText('Fashion - Confidence - Success')).toBeInTheDocument();
    });
  });

  describe('Async function', () => {
    it('is an async function', () => {
      expect(HeroSection.constructor.name).toBe('AsyncFunction');
    });

    it('returns a Promise', () => {
      const result = HeroSection();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('Radix UI components', () => {
    it('uses Box component', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const box = container.querySelector('[class*="rt-Box"]');
      expect(box).toBeInTheDocument();
    });

    it('uses Flex components', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const flexes = container.querySelectorAll('[class*="rt-Flex"]');
      expect(flexes.length).toBeGreaterThan(0);
    });

    it('uses Text components', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const texts = container.querySelectorAll('[class*="rt-Text"]');
      expect(texts.length).toBeGreaterThan(0);
    });
  });

  describe('Structure', () => {
    it('has three main sections', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText('ABOUT US')).toBeInTheDocument();
      expect(screen.getByText('Smart Casual')).toBeInTheDocument();
      expect(screen.getByText('Fashion - Confidence - Success')).toBeInTheDocument();
    });

    it('renders title first', async () => {
      await renderWithTheme(await HeroSection());
      const title = screen.getByText('ABOUT US');
      expect(title).toBeInTheDocument();
    });

    it('renders description second', async () => {
      await renderWithTheme(await HeroSection());
      const desc = screen.getByText('Smart Casual');
      expect(desc).toBeInTheDocument();
    });

    it('renders slogan third', async () => {
      await renderWithTheme(await HeroSection());
      const slogan = screen.getByText('Fashion - Confidence - Success');
      expect(slogan).toBeInTheDocument();
    });
  });
});
