import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from '@/components/help/account-deletion/HeroSection';
import { Theme } from '@radix-ui/themes';

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => {
    return (key: string) => {
      const translations: Record<string, string> = {
        pageTitle: 'Account Deletion Guide',
        subtitle: 'Learn how to permanently delete your account',
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
      expect(screen.getByText('Account Deletion Guide')).toBeInTheDocument();
    });

    it('renders subtitle', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText('Learn how to permanently delete your account')).toBeInTheDocument();
    });

    it('displays all translated content', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText('Account Deletion Guide')).toBeVisible();
      expect(screen.getByText('Learn how to permanently delete your account')).toBeVisible();
    });
  });

  describe('Outer flex layout', () => {
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

    it('applies pb-6 for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const flex = container.querySelector('.pb-6');
      expect(flex).toBeInTheDocument();
    });

    it('applies gap-4 for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const flex = container.querySelector('.gap-4');
      expect(flex).toBeInTheDocument();
    });

    it('applies border-b class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const flex = container.querySelector('.border-b');
      expect(flex).toBeInTheDocument();
    });

    it('applies border color', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const flex = container.querySelector('.border-\\[\\#F0F0F0\\]');
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

    it('applies leading-8 for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const title = container.querySelector('.leading-8');
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

  describe('Subtitle card styling', () => {
    it('applies py-4 for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const card = container.querySelector('.py-4');
      expect(card).toBeInTheDocument();
    });

    it('applies background color', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const card = container.querySelector('.bg-\\[\\#FDF7F1\\]');
      expect(card).toBeInTheDocument();
    });

    it('applies full width on mobile with negative margin', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const card = container.querySelector('.w-\\[calc\\(100\\%\\+40px\\)\\]');
      expect(card).toBeInTheDocument();
    });

    it('applies -mx-5 negative margin for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const card = container.querySelector('.-mx-5');
      expect(card).toBeInTheDocument();
    });

    it('applies md:w-[calc(100%+80px)] for tablet', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const card = container.querySelector('.md\\:w-\\[calc\\(100\\%\\+80px\\)\\]');
      expect(card).toBeInTheDocument();
    });

    it('applies md:-mx-10 for tablet', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const card = container.querySelector('.md\\:-mx-10');
      expect(card).toBeInTheDocument();
    });

    it('applies lg:w-auto for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const card = container.querySelector('.lg\\:w-auto');
      expect(card).toBeInTheDocument();
    });

    it('applies lg:mx-0 for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const card = container.querySelector('.lg\\:mx-0');
      expect(card).toBeInTheDocument();
    });

    it('applies lg:py-5 for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const card = container.querySelector('.lg\\:py-5');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Subtitle text styling', () => {
    it('applies text-sm for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const subtitle = container.querySelector('.text-sm');
      expect(subtitle).toBeInTheDocument();
    });

    it('applies leading-6 for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const subtitle = container.querySelector('.leading-6');
      expect(subtitle).toBeInTheDocument();
    });

    it('applies text-center', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const subtitle = container.querySelector('.text-center');
      expect(subtitle).toBeInTheDocument();
    });

    it('applies lg:text-base for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const subtitle = container.querySelector('.lg\\:text-base');
      expect(subtitle).toBeInTheDocument();
    });

    it('applies lg:leading-7 for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const subtitle = container.querySelector('.lg\\:leading-7');
      expect(subtitle).toBeInTheDocument();
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

    it('renders two Flex components', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const flexes = container.querySelectorAll('[class*="rt-Flex"]');
      expect(flexes.length).toBe(2);
    });

    it('renders two text elements', async () => {
      await renderWithTheme(await HeroSection());
      const texts = screen.getAllByText(/Account Deletion Guide|Learn how to permanently delete/);
      expect(texts.length).toBe(2);
    });
  });
});
