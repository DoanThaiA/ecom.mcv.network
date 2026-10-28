import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from '@/components/policy/terms/HeroSection';
import { Theme } from '@radix-ui/themes';

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => {
    return (key: string) => {
      const translations: Record<string, string> = {
        pageTitle: 'Terms of Service',
        lastUpdated: 'Last updated: January 1, 2024',
        intro: 'Welcome to our Terms of Service',
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
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    });

    it('renders last updated text', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText('Last updated: January 1, 2024')).toBeInTheDocument();
    });

    it('renders intro text', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText('Welcome to our Terms of Service')).toBeInTheDocument();
    });

    it('displays all translated content', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText('Terms of Service')).toBeVisible();
      expect(screen.getByText('Last updated: January 1, 2024')).toBeVisible();
      expect(screen.getByText('Welcome to our Terms of Service')).toBeVisible();
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
      const titles = container.querySelectorAll('.text-black');
      expect(titles.length).toBeGreaterThan(0);
    });

    it('applies font-semibold to title', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const title = container.querySelector('.font-semibold');
      expect(title).toBeInTheDocument();
    });

    it('applies self-stretch to title', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const elements = container.querySelectorAll('.self-stretch');
      expect(elements.length).toBeGreaterThan(0);
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

  describe('Last updated styling', () => {
    it('applies text-gray-500 to last updated', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const lastUpdated = container.querySelector('.text-gray-500');
      expect(lastUpdated).toBeInTheDocument();
    });

    it('applies text-sm to last updated', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const smallTexts = container.querySelectorAll('.text-sm');
      expect(smallTexts.length).toBeGreaterThan(0);
    });
  });

  describe('Intro text styling', () => {
    it('applies text-sm for mobile to intro', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const smallTexts = container.querySelectorAll('.text-sm');
      expect(smallTexts.length).toBeGreaterThan(0);
    });

    it('applies leading-5 for mobile to intro', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const intro = container.querySelector('.leading-5');
      expect(intro).toBeInTheDocument();
    });

    it('applies lg:text-base for desktop to intro', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const intro = container.querySelector('.lg\\:text-base');
      expect(intro).toBeInTheDocument();
    });

    it('applies lg:leading-6 for desktop to intro', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const intro = container.querySelector('.lg\\:leading-6');
      expect(intro).toBeInTheDocument();
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

    it('renders three text elements', async () => {
      await renderWithTheme(await HeroSection());
      const texts = screen.getAllByText(/Terms of Service|Last updated|Welcome/);
      expect(texts.length).toBe(3);
    });
  });
});
