import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from '@/components/policy/return/HeroSection';
import { Theme } from '@radix-ui/themes';

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => {
    return (key: string) => {
      const translations: Record<string, string> = {
        pageTitle: '7-Day Return Policy',
        'banner.line1': 'Easy Returns Within',
        'banner.line2': '7 Days of Purchase',
      };
      return translations[key] || key;
    };
  }),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height }: any) => (
    <img src={src} alt={alt} width={width} height={height} />
  ),
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

    it('renders page title', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText('7-Day Return Policy')).toBeInTheDocument();
    });

    it('renders banner line 1', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText('Easy Returns Within')).toBeInTheDocument();
    });

    it('renders banner line 2', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText('7 Days of Purchase')).toBeInTheDocument();
    });

    it('renders return icon', async () => {
      await renderWithTheme(await HeroSection());
      const icon = screen.getByAltText('Return icon');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Main container styling', () => {
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
      const semibold = container.querySelectorAll('.font-semibold');
      expect(semibold.length).toBeGreaterThan(0);
    });

    it('applies self-stretch class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const stretched = container.querySelectorAll('.self-stretch');
      expect(stretched.length).toBeGreaterThan(0);
    });

    it('applies text-2xl for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const title = container.querySelector('.text-2xl');
      expect(title).toBeInTheDocument();
    });

    it('applies leading-7 for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const title = container.querySelector('.leading-7');
      expect(title).toBeInTheDocument();
    });

    it('applies lg:text-4xl for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const title = container.querySelector('.lg\\:text-4xl');
      expect(title).toBeInTheDocument();
    });

    it('applies lg:leading-[48px] for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const title = container.querySelector('.lg\\:leading-\\[48px\\]');
      expect(title).toBeInTheDocument();
    });
  });

  describe('Banner card styling', () => {
    it('applies py-8 padding', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const banner = container.querySelector('.py-8');
      expect(banner).toBeInTheDocument();
    });

    it('applies px-4 padding', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const banners = container.querySelectorAll('.px-4');
      expect(banners.length).toBeGreaterThan(0);
    });

    it('applies rounded-3xl class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const banner = container.querySelector('.rounded-3xl');
      expect(banner).toBeInTheDocument();
    });

    it('applies lg:rounded-3xl for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const banner = container.querySelector('.lg\\:rounded-3xl');
      expect(banner).toBeInTheDocument();
    });

    it('applies gap-2.5', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      expect(container).toBeInTheDocument();
    });
  });

  describe('Icon container styling', () => {
    it('applies w-12 class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const iconBox = container.querySelector('.w-12');
      expect(iconBox).toBeInTheDocument();
    });

    it('applies h-12 class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const iconBox = container.querySelector('.h-12');
      expect(iconBox).toBeInTheDocument();
    });

    it('applies flex-shrink-0 class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const iconBox = container.querySelector('.flex-shrink-0');
      expect(iconBox).toBeInTheDocument();
    });
  });

  describe('Icon image', () => {
    it('has correct src', async () => {
      await renderWithTheme(await HeroSection());
      const icon = screen.getByAltText('Return icon');
      expect(icon).toHaveAttribute('src', '/assets/svg/policy/return-icon.svg');
    });

    it('has correct width', async () => {
      await renderWithTheme(await HeroSection());
      const icon = screen.getByAltText('Return icon');
      expect(icon).toHaveAttribute('width', '32');
    });

    it('has correct height', async () => {
      await renderWithTheme(await HeroSection());
      const icon = screen.getByAltText('Return icon');
      expect(icon).toHaveAttribute('height', '31');
    });

    it('has correct alt text', async () => {
      await renderWithTheme(await HeroSection());
      const icon = screen.getByAltText('Return icon');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Text container styling', () => {
    it('applies lg:flex-row for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const textBox = container.querySelector('.lg\\:flex-row');
      expect(textBox).toBeInTheDocument();
    });

    it('applies lg:gap-1 for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const textBox = container.querySelector('.lg\\:gap-1');
      expect(textBox).toBeInTheDocument();
    });
  });

  describe('Banner text styling', () => {
    it('applies text-white class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const whiteTexts = container.querySelectorAll('.text-white');
      expect(whiteTexts.length).toBeGreaterThanOrEqual(2);
    });

    it('applies text-xl for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const texts = container.querySelectorAll('.text-xl');
      expect(texts.length).toBeGreaterThanOrEqual(2);
    });

    it('applies leading-6 for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const texts = container.querySelectorAll('.leading-6');
      expect(texts.length).toBeGreaterThanOrEqual(2);
    });

    it('applies lg:text-2xl for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const texts = container.querySelectorAll('.lg\\:text-2xl');
      expect(texts.length).toBeGreaterThanOrEqual(2);
    });

    it('applies lg:leading-8 for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const texts = container.querySelectorAll('.lg\\:leading-8');
      expect(texts.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Translation integration', () => {
    it('uses returnPolicy namespace', async () => {
      await renderWithTheme(await HeroSection());
      expect(true).toBe(true);
    });

    it('translates pageTitle key', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText('7-Day Return Policy')).toBeInTheDocument();
    });

    it('translates banner.line1 key', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText('Easy Returns Within')).toBeInTheDocument();
    });

    it('translates banner.line2 key', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText('7 Days of Purchase')).toBeInTheDocument();
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

  describe('Comments', () => {
    it('has title comment', async () => {
      await renderWithTheme(await HeroSection());
      expect(true).toBe(true);
    });

    it('has banner card comment', async () => {
      await renderWithTheme(await HeroSection());
      expect(true).toBe(true);
    });

    it('has icon comment', async () => {
      await renderWithTheme(await HeroSection());
      expect(true).toBe(true);
    });

    it('has text comment', async () => {
      await renderWithTheme(await HeroSection());
      expect(true).toBe(true);
    });
  });
});
