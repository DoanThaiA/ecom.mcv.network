import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from '@/components/faq/HeroSection';
import { Theme } from '@radix-ui/themes';

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => {
    return (key: string) => {
      const translations: Record<string, string> = {
        pageTitle: 'Frequently Asked Questions',
      };
      return translations[key] || key;
    };
  }),
}));

describe('HeroSection', () => {
  const renderWithTheme = async (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  describe('Content rendering', () => {
    it('renders page title', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
    });

    it('displays translated title', async () => {
      await renderWithTheme(await HeroSection());
      const title = screen.getByText('Frequently Asked Questions');
      expect(title).toBeVisible();
    });
  });

  describe('Layout styling', () => {
    it('applies flex column direction', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const flex = container.querySelector('[class*="rt-Flex"]');
      expect(flex).toBeInTheDocument();
    });

    it('applies pt-12 for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const flex = container.querySelector('.pt-12');
      expect(flex).toBeInTheDocument();
    });

    it('applies pb-4 for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const flex = container.querySelector('.pb-4');
      expect(flex).toBeInTheDocument();
    });

    it('applies gap-4 for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const flex = container.querySelector('.gap-4');
      expect(flex).toBeInTheDocument();
    });

    it('applies lg:pt-20 for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const flex = container.querySelector('.lg\\:pt-20');
      expect(flex).toBeInTheDocument();
    });

    it('applies lg:pb-8 for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const flex = container.querySelector('.lg\\:pb-8');
      expect(flex).toBeInTheDocument();
    });

    it('applies lg:gap-6 for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const flex = container.querySelector('.lg\\:gap-6');
      expect(flex).toBeInTheDocument();
    });
  });

  describe('Title styling', () => {
    it('applies text-black to title', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const title = container.querySelector('.text-black');
      expect(title).toBeInTheDocument();
    });

    it('applies font-semibold to title', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const title = container.querySelector('.font-semibold');
      expect(title).toBeInTheDocument();
    });

    it('applies self-stretch to title', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const title = container.querySelector('.self-stretch');
      expect(title).toBeInTheDocument();
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

  describe('Async function', () => {
    it('is an async function', () => {
      expect(HeroSection.constructor.name).toBe('AsyncFunction');
    });

    it('returns a Promise', () => {
      const result = HeroSection();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('Structure', () => {
    it('renders without crashing', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      expect(container).toBeInTheDocument();
    });
  });
});
