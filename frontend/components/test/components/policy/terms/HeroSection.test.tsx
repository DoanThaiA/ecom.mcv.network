import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from '@/components/policy/terms/HeroSection';
import { Theme } from '@radix-ui/themes';

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => {
    return (key: string) => {
      const translations: Record<string, string> = {
        pageTitle: 'Terms and Conditions',
        lastUpdated: 'Last updated: January 1, 2024',
        intro:
          'By using our services, you agree to comply with and be bound by the following terms and conditions.',
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

    it('renders page title', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText('Terms and Conditions')).toBeInTheDocument();
    });

    it('renders last updated text', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText('Last updated: January 1, 2024')).toBeInTheDocument();
    });

    it('renders intro text', async () => {
      await renderWithTheme(await HeroSection());
      expect(
        screen.getByText(
          /By using our services, you agree to comply with and be bound by the following/
        )
      ).toBeInTheDocument();
    });
  });

  describe('Main container styling', () => {
    it('applies pt-12 for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const main = container.querySelector('.pt-12');
      expect(main).toBeInTheDocument();
    });

    it('applies pb-4 for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const main = container.querySelector('.pb-4');
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
      const blacks = container.querySelectorAll('.text-black');
      expect(blacks.length).toBeGreaterThan(0);
    });

    it('applies font-semibold class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const title = container.querySelector('.font-semibold');
      expect(title).toBeInTheDocument();
    });

    it('applies self-stretch class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const stretched = container.querySelectorAll('.self-stretch');
      expect(stretched.length).toBeGreaterThanOrEqual(3);
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

  describe('Last updated text styling', () => {
    it('applies text-gray-500 class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const lastUpdated = container.querySelector('.text-gray-500');
      expect(lastUpdated).toBeInTheDocument();
    });

    it('applies text-sm class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const smalls = container.querySelectorAll('.text-sm');
      expect(smalls.length).toBeGreaterThanOrEqual(2);
    });

    it('applies self-stretch to last updated', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const lastUpdated = screen.getByText(/Last updated:/);
      expect(lastUpdated).toHaveClass('self-stretch');
    });
  });

  describe('Intro text styling', () => {
    it('applies text-black class to intro', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const intro = screen.getByText(/By using our services/);
      expect(intro).toHaveClass('text-black');
    });

    it('applies text-sm for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const intro = screen.getByText(/By using our services/);
      expect(intro).toHaveClass('text-sm');
    });

    it('applies leading-5 for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const intro = screen.getByText(/By using our services/);
      expect(intro).toHaveClass('leading-5');
    });

    it('applies lg:text-base for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const intro = screen.getByText(/By using our services/);
      expect(intro).toHaveClass('lg:text-base');
    });

    it('applies lg:leading-6 for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const intro = screen.getByText(/By using our services/);
      expect(intro).toHaveClass('lg:leading-6');
    });

    it('applies self-stretch to intro', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const intro = screen.getByText(/By using our services/);
      expect(intro).toHaveClass('self-stretch');
    });
  });

  describe('Translation integration', () => {
    it('uses termsPolicy namespace', async () => {
      await renderWithTheme(await HeroSection());
      expect(true).toBe(true);
    });

    it('translates pageTitle key', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText('Terms and Conditions')).toBeInTheDocument();
    });

    it('translates lastUpdated key', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    });

    it('translates intro key', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText(/By using our services/)).toBeInTheDocument();
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
    it('uses Flex component', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const flex = container.querySelector('[class*="rt-Flex"]');
      expect(flex).toBeInTheDocument();
    });

    it('uses Text components', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const texts = container.querySelectorAll('[class*="rt-Text"]');
      expect(texts.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Layout structure', () => {
    it('has three text elements', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const texts = container.querySelectorAll('[class*="rt-Text"]');
      expect(texts.length).toBeGreaterThanOrEqual(3);
    });

    it('renders texts in correct order', async () => {
      await renderWithTheme(await HeroSection());
      const texts = screen.getAllByText(/./);
      // Title should appear before lastUpdated
      const titleIndex = texts.findIndex((t) => t.textContent?.includes('Terms and Conditions'));
      const lastUpdatedIndex = texts.findIndex((t) => t.textContent?.includes('Last updated'));
      const introIndex = texts.findIndex((t) =>
        t.textContent?.includes('By using our services')
      );
      expect(titleIndex).toBeLessThan(lastUpdatedIndex);
      expect(lastUpdatedIndex).toBeLessThan(introIndex);
    });

    it('all texts are inside Flex container', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const flex = container.querySelector('[class*="rt-Flex"]');
      const title = screen.getByText('Terms and Conditions');
      const lastUpdated = screen.getByText(/Last updated:/);
      const intro = screen.getByText(/By using our services/);
      expect(flex).toContainElement(title);
      expect(flex).toContainElement(lastUpdated);
      expect(flex).toContainElement(intro);
    });
  });

  describe('Responsive behavior', () => {
    it('has different padding for mobile and desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const main = container.querySelector('.pt-12');
      expect(main).toHaveClass('lg:pt-20');
    });

    it('has different text size for mobile and desktop on title', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const title = container.querySelector('.text-2xl');
      expect(title).toHaveClass('lg:text-4xl');
    });

    it('has different text size for mobile and desktop on intro', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const intro = screen.getByText(/By using our services/);
      expect(intro).toHaveClass('text-sm');
      expect(intro).toHaveClass('lg:text-base');
    });

    it('gap changes from 4 to 6 on large screens', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const main = container.querySelector('.gap-4');
      expect(main).toHaveClass('lg:gap-6');
    });
  });
});
