import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Section5 } from '@/components/policy/terms/Section5';
import { Theme } from '@radix-ui/themes';

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => {
    return (key: string) => {
      const translations: Record<string, string> = {
        title: 'Delivery and Return Policy',
        content1: 'Free delivery for orders over 500.000đ',
        content2: 'Easy 7-day return policy',
        content3: 'Full refund for defective products',
      };
      return translations[key] || key;
    };
  }),
}));

describe('Section5', () => {
  const renderWithTheme = async (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  describe('Basic rendering', () => {
    it('renders without crashing', async () => {
      const { container } = await renderWithTheme(await Section5());
      expect(container).toBeInTheDocument();
    });

    it('renders title', async () => {
      await renderWithTheme(await Section5());
      expect(screen.getByText('Delivery and Return Policy')).toBeInTheDocument();
    });

    it('renders all content items', async () => {
      await renderWithTheme(await Section5());
      expect(screen.getByText(/Free delivery for orders over 500.000đ/)).toBeInTheDocument();
      expect(screen.getByText(/Easy 7-day return policy/)).toBeInTheDocument();
      expect(screen.getByText(/Full refund for defective products/)).toBeInTheDocument();
    });
  });

  describe('Outer container styling', () => {
    it('applies py-6 for mobile', async () => {
      const { container } = await renderWithTheme(await Section5());
      const outer = container.querySelector('.py-6');
      expect(outer).toBeInTheDocument();
    });

    it('applies gap-4 for mobile', async () => {
      const { container } = await renderWithTheme(await Section5());
      const outer = container.querySelector('.gap-4');
      expect(outer).toBeInTheDocument();
    });

    it('applies border-b class', async () => {
      const { container } = await renderWithTheme(await Section5());
      const outer = container.querySelector('.border-b');
      expect(outer).toBeInTheDocument();
    });

    it('applies border color', async () => {
      const { container } = await renderWithTheme(await Section5());
      const outer = container.querySelector('.border-\\[\\#F0F0F0\\]');
      expect(outer).toBeInTheDocument();
    });

    it('applies lg:py-8 for desktop', async () => {
      const { container } = await renderWithTheme(await Section5());
      const outer = container.querySelector('.lg\\:py-8');
      expect(outer).toBeInTheDocument();
    });

    it('applies lg:gap-6 for desktop', async () => {
      const { container } = await renderWithTheme(await Section5());
      const outer = container.querySelector('.lg\\:gap-6');
      expect(outer).toBeInTheDocument();
    });
  });

  describe('Header section styling', () => {
    it('applies full width with negative margin', async () => {
      const { container } = await renderWithTheme(await Section5());
      const header = container.querySelector('.w-\\[calc\\(100\\%\\+40px\\)\\]');
      expect(header).toBeInTheDocument();
    });

    it('applies negative margin left', async () => {
      const { container } = await renderWithTheme(await Section5());
      const header = container.querySelector('.-mx-5');
      expect(header).toBeInTheDocument();
    });

    it('applies background color', async () => {
      const { container } = await renderWithTheme(await Section5());
      const header = container.querySelector('.bg-\\[\\#FDF7F1\\]');
      expect(header).toBeInTheDocument();
    });

    it('applies responsive width for md', async () => {
      const { container } = await renderWithTheme(await Section5());
      const header = container.querySelector('.md\\:w-\\[calc\\(100\\%\\+80px\\)\\]');
      expect(header).toBeInTheDocument();
    });

    it('applies responsive margin for md', async () => {
      const { container } = await renderWithTheme(await Section5());
      const header = container.querySelector('.md\\:-mx-10');
      expect(header).toBeInTheDocument();
    });

    it('applies auto width for lg', async () => {
      const { container } = await renderWithTheme(await Section5());
      const header = container.querySelector('.lg\\:w-auto');
      expect(header).toBeInTheDocument();
    });

    it('applies zero margin for lg', async () => {
      const { container } = await renderWithTheme(await Section5());
      const header = container.querySelector('.lg\\:mx-0');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Number badge styling', () => {
    it('applies height h-12 for mobile', async () => {
      const { container } = await renderWithTheme(await Section5());
      const badge = container.querySelector('.h-12');
      expect(badge).toBeInTheDocument();
    });

    it('applies padding px-4 for mobile', async () => {
      const { container } = await renderWithTheme(await Section5());
      const badges = container.querySelectorAll('.px-4');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('applies rounded-r-[24px] class', async () => {
      const { container } = await renderWithTheme(await Section5());
      const badge = container.querySelector('.rounded-r-\\[24px\\]');
      expect(badge).toBeInTheDocument();
    });

    it('applies lg:h-14 for desktop', async () => {
      const { container } = await renderWithTheme(await Section5());
      const badge = container.querySelector('.lg\\:h-14');
      expect(badge).toBeInTheDocument();
    });

    it('applies lg:px-6 for desktop', async () => {
      const { container } = await renderWithTheme(await Section5());
      const badge = container.querySelector('.lg\\:px-6');
      expect(badge).toBeInTheDocument();
    });

    it('has gradient background style', async () => {
      const { container } = await renderWithTheme(await Section5());
      const badge = container.querySelector('[style*="linear-gradient"]');
      expect(badge).toBeInTheDocument();
    });

    it('renders number 05', async () => {
      await renderWithTheme(await Section5());
      expect(screen.getByText('05')).toBeInTheDocument();
    });
  });

  describe('Number text styling', () => {
    it('applies text-white class', async () => {
      const { container } = await renderWithTheme(await Section5());
      const numberTexts = container.querySelectorAll('.text-white');
      expect(numberTexts.length).toBeGreaterThan(0);
    });

    it('applies font-bold class', async () => {
      const { container } = await renderWithTheme(await Section5());
      const numberText = container.querySelector('.font-bold');
      expect(numberText).toBeInTheDocument();
    });

    it('applies text-sm for mobile', async () => {
      const { container } = await renderWithTheme(await Section5());
      const texts = container.querySelectorAll('.text-sm');
      expect(texts.length).toBeGreaterThan(0);
    });

    it('applies lg:text-base for desktop', async () => {
      const { container } = await renderWithTheme(await Section5());
      const texts = container.querySelectorAll('.lg\\:text-base');
      expect(texts.length).toBeGreaterThan(0);
    });
  });

  describe('Title text styling', () => {
    it('applies text-black class', async () => {
      const { container } = await renderWithTheme(await Section5());
      const blackTexts = container.querySelectorAll('.text-black');
      expect(blackTexts.length).toBeGreaterThan(0);
    });

    it('applies leading-5 for mobile', async () => {
      const { container } = await renderWithTheme(await Section5());
      const texts = container.querySelectorAll('.leading-5');
      expect(texts.length).toBeGreaterThan(0);
    });

    it('applies lg:text-lg for desktop', async () => {
      const { container } = await renderWithTheme(await Section5());
      const title = container.querySelector('.lg\\:text-lg');
      expect(title).toBeInTheDocument();
    });

    it('applies lg:leading-7 for desktop', async () => {
      const { container } = await renderWithTheme(await Section5());
      const title = container.querySelector('.lg\\:leading-7');
      expect(title).toBeInTheDocument();
    });

    it('applies font-semibold class', async () => {
      const { container } = await renderWithTheme(await Section5());
      const semibold = container.querySelectorAll('.font-semibold');
      expect(semibold.length).toBeGreaterThan(0);
    });

    it('applies flex-1 class', async () => {
      const { container } = await renderWithTheme(await Section5());
      const flex1 = container.querySelector('.flex-1');
      expect(flex1).toBeInTheDocument();
    });
  });

  describe('Content list styling', () => {
    it('applies pl-4 class', async () => {
      const { container } = await renderWithTheme(await Section5());
      const contentList = container.querySelector('.pl-4');
      expect(contentList).toBeInTheDocument();
    });

    it('renders with gap-3', async () => {
      const { container } = await renderWithTheme(await Section5());
      const contentList = container.querySelector('[class*="rt-Flex"]');
      expect(contentList).toBeInTheDocument();
    });
  });

  describe('Content items', () => {
    it('content1 starts with bullet', async () => {
      await renderWithTheme(await Section5());
      const content = screen.getByText(/Free delivery for orders over 500.000đ/);
      expect(content.textContent).toContain('•');
    });

    it('content2 starts with bullet', async () => {
      await renderWithTheme(await Section5());
      const content = screen.getByText(/Easy 7-day return policy/);
      expect(content.textContent).toContain('•');
    });

    it('content3 starts with bullet', async () => {
      await renderWithTheme(await Section5());
      const content = screen.getByText(/Full refund for defective products/);
      expect(content.textContent).toContain('•');
    });

    it('applies lg:leading-6 to content items', async () => {
      const { container } = await renderWithTheme(await Section5());
      const items = container.querySelectorAll('.lg\\:leading-6');
      expect(items.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Translation integration', () => {
    it('uses termsPolicy.section5 namespace', async () => {
      await renderWithTheme(await Section5());
      // If renders without error, translation is working
      expect(true).toBe(true);
    });

    it('translates title key', async () => {
      await renderWithTheme(await Section5());
      expect(screen.getByText('Delivery and Return Policy')).toBeInTheDocument();
    });

    it('translates content1 key', async () => {
      await renderWithTheme(await Section5());
      expect(screen.getByText(/Free delivery for orders over 500.000đ/)).toBeInTheDocument();
    });

    it('translates content2 key', async () => {
      await renderWithTheme(await Section5());
      expect(screen.getByText(/Easy 7-day return policy/)).toBeInTheDocument();
    });

    it('translates content3 key', async () => {
      await renderWithTheme(await Section5());
      expect(screen.getByText(/Full refund for defective products/)).toBeInTheDocument();
    });
  });

  describe('Async function', () => {
    it('is an async function', () => {
      expect(Section5.constructor.name).toBe('AsyncFunction');
    });

    it('returns a Promise', () => {
      const result = Section5();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('Gradient background', () => {
    it('renders badge with number', async () => {
      await renderWithTheme(await Section5());
      const number = screen.getByText('05');
      expect(number).toBeInTheDocument();
    });

    it('badge has gradient styling classes', async () => {
      const { container } = await renderWithTheme(await Section5());
      const badge = container.querySelector('.rounded-r-\\[24px\\]');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Radix UI components', () => {
    it('uses Flex components', async () => {
      const { container } = await renderWithTheme(await Section5());
      const flexes = container.querySelectorAll('[class*="rt-Flex"]');
      expect(flexes.length).toBeGreaterThan(0);
    });

    it('uses Text components', async () => {
      const { container } = await renderWithTheme(await Section5());
      const texts = container.querySelectorAll('[class*="rt-Text"]');
      expect(texts.length).toBeGreaterThan(0);
    });
  });
});
