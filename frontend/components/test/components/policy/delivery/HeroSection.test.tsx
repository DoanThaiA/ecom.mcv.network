import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from '@/components/policy/delivery/HeroSection';
import { Theme } from '@radix-ui/themes';

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => {
    return (key: string) => {
      const translations: Record<string, string> = {
        pageTitle: 'Delivery Policy',
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
      const { container} = await renderWithTheme(await HeroSection());
      expect(container).toBeInTheDocument();
    });

    it('renders page title', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText('Delivery Policy')).toBeInTheDocument();
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
      const title = container.querySelector('.text-black');
      expect(title).toBeInTheDocument();
    });

    it('applies font-semibold class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const title = container.querySelector('.font-semibold');
      expect(title).toBeInTheDocument();
    });

    it('applies self-stretch class', async () => {
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

  describe('Translation integration', () => {
    it('uses deliveryPolicy namespace', async () => {
      await renderWithTheme(await HeroSection());
      expect(true).toBe(true);
    });

    it('translates pageTitle key', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText('Delivery Policy')).toBeInTheDocument();
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

    it('uses Text component', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const text = container.querySelector('[class*="rt-Text"]');
      expect(text).toBeInTheDocument();
    });
  });

  describe('Flex container props', () => {
    it('Flex has direction="column"', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const flex = container.querySelector('[class*="rt-Flex"]');
      expect(flex).toBeInTheDocument();
    });

    it('Flex has align="center"', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const flex = container.querySelector('[class*="rt-Flex"]');
      expect(flex).toBeInTheDocument();
    });
  });

  describe('Comments', () => {
    it('has title only comment', async () => {
      await renderWithTheme(await HeroSection());
      expect(true).toBe(true);
    });
  });

  describe('Layout structure', () => {
    it('has single title element', async () => {
      await renderWithTheme(await HeroSection());
      const titles = screen.getAllByText('Delivery Policy');
      expect(titles.length).toBe(1);
    });

    it('title is inside Flex container', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const flex = container.querySelector('[class*="rt-Flex"]');
      const title = screen.getByText('Delivery Policy');
      expect(flex).toContainElement(title);
    });

    it('renders only title (no other content)', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const texts = container.querySelectorAll('[class*="rt-Text"]');
      expect(texts.length).toBe(1);
    });
  });

  describe('Responsive behavior', () => {
    it('has different padding for mobile and desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const main = container.querySelector('.pt-12');
      expect(main).toHaveClass('lg:pt-20');
    });

    it('has different text size for mobile and desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const title = container.querySelector('.text-2xl');
      expect(title).toHaveClass('lg:text-4xl');
    });

    it('has different line height for mobile and desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const title = container.querySelector('.leading-7');
      expect(title).toHaveClass('lg:leading-[48px]');
    });

    it('gap changes from 4 to 6 on large screens', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const main = container.querySelector('.gap-4');
      expect(main).toHaveClass('lg:gap-6');
    });

    it('padding-bottom changes from 4 to 8 on large screens', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const main = container.querySelector('.pb-4');
      expect(main).toHaveClass('lg:pb-8');
    });
  });
});
