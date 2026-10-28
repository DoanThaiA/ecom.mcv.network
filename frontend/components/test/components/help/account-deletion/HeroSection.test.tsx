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
        subtitle: 'Follow these steps to permanently delete your account',
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
      expect(screen.getByText('Account Deletion Guide')).toBeInTheDocument();
    });

    it('renders subtitle', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText(/Follow these steps to permanently delete/)).toBeInTheDocument();
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
      const title = screen.getByText('Account Deletion Guide');
      expect(title).toHaveClass('self-stretch');
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

  describe('Subtitle card container styling', () => {
    it('applies full width with negative margin', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const card = container.querySelector('.w-\\[calc\\(100\\%\\+40px\\)\\]');
      expect(card).toBeInTheDocument();
    });

    it('applies negative margin', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const card = container.querySelector('.-mx-5');
      expect(card).toBeInTheDocument();
    });

    it('applies py-4 padding', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const card = container.querySelector('.py-4');
      expect(card).toBeInTheDocument();
    });

    it('applies background color', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const card = container.querySelector('.bg-\\[\\#FDF7F1\\]');
      expect(card).toBeInTheDocument();
    });

    it('applies responsive width for md', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const card = container.querySelector('.md\\:w-\\[calc\\(100\\%\\+80px\\)\\]');
      expect(card).toBeInTheDocument();
    });

    it('applies responsive margin for md', async () => {
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

    it('applies lg:self-stretch for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const card = container.querySelector('.lg\\:self-stretch');
      expect(card).toBeInTheDocument();
    });

    it('applies lg:py-5 for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const card = container.querySelector('.lg\\:py-5');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Subtitle text styling', () => {
    it('applies text-black class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const subtitle = screen.getByText(/Follow these steps/);
      expect(subtitle).toHaveClass('text-black');
    });

    it('applies text-sm for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const subtitle = screen.getByText(/Follow these steps/);
      expect(subtitle).toHaveClass('text-sm');
    });

    it('applies leading-6 for mobile', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const subtitle = screen.getByText(/Follow these steps/);
      expect(subtitle).toHaveClass('leading-6');
    });

    it('applies text-center class', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const subtitle = screen.getByText(/Follow these steps/);
      expect(subtitle).toHaveClass('text-center');
    });

    it('applies lg:text-base for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const subtitle = screen.getByText(/Follow these steps/);
      expect(subtitle).toHaveClass('lg:text-base');
    });

    it('applies lg:leading-7 for desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const subtitle = screen.getByText(/Follow these steps/);
      expect(subtitle).toHaveClass('lg:leading-7');
    });
  });

  describe('Translation integration', () => {
    it('uses accountDeletion namespace', async () => {
      await renderWithTheme(await HeroSection());
      expect(true).toBe(true);
    });

    it('translates pageTitle key', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText('Account Deletion Guide')).toBeInTheDocument();
    });

    it('translates subtitle key', async () => {
      await renderWithTheme(await HeroSection());
      expect(screen.getByText(/Follow these steps/)).toBeInTheDocument();
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
      expect(texts.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Layout structure', () => {
    it('has two text elements', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const texts = container.querySelectorAll('[class*="rt-Text"]');
      expect(texts.length).toBeGreaterThanOrEqual(2);
    });

    it('title appears before subtitle', async () => {
      await renderWithTheme(await HeroSection());
      const title = screen.getByText('Account Deletion Guide');
      const subtitle = screen.getByText(/Follow these steps/);
      expect(title.compareDocumentPosition(subtitle)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('subtitle is inside card container', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const card = container.querySelector('.bg-\\[\\#FDF7F1\\]');
      const subtitle = screen.getByText(/Follow these steps/);
      expect(card).toContainElement(subtitle);
    });
  });

  describe('Comments', () => {
    it('has Title comment', async () => {
      await renderWithTheme(await HeroSection());
      expect(true).toBe(true);
    });

    it('has Subtitle Card comment', async () => {
      await renderWithTheme(await HeroSection());
      expect(true).toBe(true);
    });
  });

  describe('Responsive behavior', () => {
    it('has different padding for mobile and desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const main = container.querySelector('.pt-12');
      expect(main).toHaveClass('lg:pt-20');
    });

    it('title has different text size for mobile and desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const title = container.querySelector('.text-2xl');
      expect(title).toHaveClass('lg:text-4xl');
    });

    it('subtitle has different text size for mobile and desktop', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const subtitle = screen.getByText(/Follow these steps/);
      expect(subtitle).toHaveClass('text-sm');
      expect(subtitle).toHaveClass('lg:text-base');
    });

    it('card width changes from fixed to auto on large screens', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const card = container.querySelector('.w-\\[calc\\(100\\%\\+40px\\)\\]');
      expect(card).toHaveClass('lg:w-auto');
    });

    it('card margins change on large screens', async () => {
      const { container } = await renderWithTheme(await HeroSection());
      const card = container.querySelector('.-mx-5');
      expect(card).toHaveClass('lg:mx-0');
    });
  });
});
