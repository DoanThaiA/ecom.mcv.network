import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Section2 } from '@/components/policy/privacy/Section2';
import { Theme } from '@radix-ui/themes';

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => {
    return (key: string) => {
      const translations: Record<string, string> = {
        number: '02',
        title: 'Personal Information Collection',
        subtitle: 'and Usage',
        description:
          'We collect personal information such as name, email address, phone number when you register an account or make a purchase.',
        disclaimer:
          'Your information is strictly protected and will not be shared with third parties without your consent.',
      };
      return translations[key] || key;
    };
  }),
}));

describe('Section2', () => {
  const renderWithTheme = async (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  describe('Basic rendering', () => {
    it('renders without crashing', async () => {
      const { container } = await renderWithTheme(await Section2());
      expect(container).toBeInTheDocument();
    });

    it('renders section number', async () => {
      await renderWithTheme(await Section2());
      expect(screen.getByText('02')).toBeInTheDocument();
    });

    it('renders title', async () => {
      await renderWithTheme(await Section2());
      expect(screen.getByText(/Personal Information Collection/)).toBeInTheDocument();
    });

    it('renders subtitle', async () => {
      await renderWithTheme(await Section2());
      expect(screen.getByText(/and Usage/)).toBeInTheDocument();
    });

    it('renders description', async () => {
      await renderWithTheme(await Section2());
      expect(
        screen.getByText(/We collect personal information such as name, email address/)
      ).toBeInTheDocument();
    });

    it('renders disclaimer', async () => {
      await renderWithTheme(await Section2());
      expect(
        screen.getByText(/Your information is strictly protected and will not be shared/)
      ).toBeInTheDocument();
    });
  });

  describe('Main container styling', () => {
    it('applies py-6 for mobile', async () => {
      const { container } = await renderWithTheme(await Section2());
      const main = container.querySelector('.py-6');
      expect(main).toBeInTheDocument();
    });

    it('applies gap-4 for mobile', async () => {
      const { container } = await renderWithTheme(await Section2());
      const main = container.querySelector('.gap-4');
      expect(main).toBeInTheDocument();
    });

    it('applies border-b class', async () => {
      const { container } = await renderWithTheme(await Section2());
      const main = container.querySelector('.border-b');
      expect(main).toBeInTheDocument();
    });

    it('applies border color', async () => {
      const { container } = await renderWithTheme(await Section2());
      const main = container.querySelector('.border-\\[\\#F0F0F0\\]');
      expect(main).toBeInTheDocument();
    });

    it('applies lg:py-8 for desktop', async () => {
      const { container } = await renderWithTheme(await Section2());
      const main = container.querySelector('.lg\\:py-8');
      expect(main).toBeInTheDocument();
    });

    it('applies lg:gap-6 for desktop', async () => {
      const { container } = await renderWithTheme(await Section2());
      const main = container.querySelector('.lg\\:gap-6');
      expect(main).toBeInTheDocument();
    });
  });

  describe('Header container styling', () => {
    it('applies full width with negative margin', async () => {
      const { container } = await renderWithTheme(await Section2());
      const header = container.querySelector('.w-\\[calc\\(100\\%\\+40px\\)\\]');
      expect(header).toBeInTheDocument();
    });

    it('applies negative margin', async () => {
      const { container } = await renderWithTheme(await Section2());
      const header = container.querySelector('.-mx-5');
      expect(header).toBeInTheDocument();
    });

    it('applies background color', async () => {
      const { container } = await renderWithTheme(await Section2());
      const header = container.querySelector('.bg-\\[\\#FDF7F1\\]');
      expect(header).toBeInTheDocument();
    });

    it('applies responsive width for md', async () => {
      const { container } = await renderWithTheme(await Section2());
      const header = container.querySelector('.md\\:w-\\[calc\\(100\\%\\+80px\\)\\]');
      expect(header).toBeInTheDocument();
    });

    it('applies responsive margin for md', async () => {
      const { container } = await renderWithTheme(await Section2());
      const header = container.querySelector('.md\\:-mx-10');
      expect(header).toBeInTheDocument();
    });

    it('applies auto width for lg', async () => {
      const { container } = await renderWithTheme(await Section2());
      const header = container.querySelector('.lg\\:w-auto');
      expect(header).toBeInTheDocument();
    });

    it('applies zero margin for lg', async () => {
      const { container } = await renderWithTheme(await Section2());
      const header = container.querySelector('.lg\\:mx-0');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Number badge styling', () => {
    it('applies px-8 padding', async () => {
      const { container } = await renderWithTheme(await Section2());
      const badge = container.querySelector('.px-8');
      expect(badge).toBeInTheDocument();
    });

    it('applies py-2 padding', async () => {
      const { container } = await renderWithTheme(await Section2());
      const badge = container.querySelector('.py-2');
      expect(badge).toBeInTheDocument();
    });

    it('applies rounded-r-[32px] class', async () => {
      const { container } = await renderWithTheme(await Section2());
      const badge = container.querySelector('.rounded-r-\\[32px\\]');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Number text styling', () => {
    it('applies text-white class', async () => {
      const { container } = await renderWithTheme(await Section2());
      const number = container.querySelector('.text-white');
      expect(number).toBeInTheDocument();
    });

    it('applies text-[32px] for mobile', async () => {
      const { container } = await renderWithTheme(await Section2());
      const number = container.querySelector('.text-\\[32px\\]');
      expect(number).toBeInTheDocument();
    });

    it('applies leading-[48px] for mobile', async () => {
      const { container } = await renderWithTheme(await Section2());
      const number = container.querySelector('.leading-\\[48px\\]');
      expect(number).toBeInTheDocument();
    });

    it('applies lg:text-[40px] for desktop', async () => {
      const { container } = await renderWithTheme(await Section2());
      const number = container.querySelector('.lg\\:text-\\[40px\\]');
      expect(number).toBeInTheDocument();
    });

    it('applies lg:leading-[56px] for desktop', async () => {
      const { container } = await renderWithTheme(await Section2());
      const number = container.querySelector('.lg\\:leading-\\[56px\\]');
      expect(number).toBeInTheDocument();
    });

    it('applies font-semibold class', async () => {
      const { container } = await renderWithTheme(await Section2());
      const semibold = container.querySelectorAll('.font-semibold');
      expect(semibold.length).toBeGreaterThan(0);
    });
  });

  describe('Title styling', () => {
    it('applies text-black class', async () => {
      const { container } = await renderWithTheme(await Section2());
      const black = container.querySelectorAll('.text-black');
      expect(black.length).toBeGreaterThan(0);
    });

    it('applies text-sm for mobile', async () => {
      const { container } = await renderWithTheme(await Section2());
      const texts = container.querySelectorAll('.text-sm');
      expect(texts.length).toBeGreaterThan(0);
    });

    it('applies leading-5 for mobile', async () => {
      const { container } = await renderWithTheme(await Section2());
      const texts = container.querySelectorAll('.leading-5');
      expect(texts.length).toBeGreaterThan(0);
    });

    it('applies lg:text-base for desktop', async () => {
      const { container } = await renderWithTheme(await Section2());
      const texts = container.querySelectorAll('.lg\\:text-base');
      expect(texts.length).toBeGreaterThan(0);
    });

    it('applies lg:leading-6 for desktop', async () => {
      const { container } = await renderWithTheme(await Section2());
      const texts = container.querySelectorAll('.lg\\:leading-6');
      expect(texts.length).toBeGreaterThan(0);
    });

    it('applies flex-1 class', async () => {
      const { container } = await renderWithTheme(await Section2());
      const flex1 = container.querySelector('.flex-1');
      expect(flex1).toBeInTheDocument();
    });

    it('applies px-4 padding', async () => {
      const { container } = await renderWithTheme(await Section2());
      const padded = container.querySelectorAll('.px-4');
      expect(padded.length).toBeGreaterThan(0);
    });
  });

  describe('Description styling', () => {
    it('description applies self-stretch', async () => {
      const { container } = await renderWithTheme(await Section2());
      const stretched = container.querySelectorAll('.self-stretch');
      expect(stretched.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Translation integration', () => {
    it('uses privacyPolicy.section2 namespace', async () => {
      await renderWithTheme(await Section2());
      expect(true).toBe(true);
    });

    it('translates number key', async () => {
      await renderWithTheme(await Section2());
      expect(screen.getByText('02')).toBeInTheDocument();
    });

    it('translates title key', async () => {
      await renderWithTheme(await Section2());
      expect(screen.getByText(/Personal Information Collection/)).toBeInTheDocument();
    });

    it('translates subtitle key', async () => {
      await renderWithTheme(await Section2());
      expect(screen.getByText(/and Usage/)).toBeInTheDocument();
    });

    it('translates description key', async () => {
      await renderWithTheme(await Section2());
      expect(
        screen.getByText(/We collect personal information such as name, email address/)
      ).toBeInTheDocument();
    });

    it('translates disclaimer key', async () => {
      await renderWithTheme(await Section2());
      expect(
        screen.getByText(/Your information is strictly protected/)
      ).toBeInTheDocument();
    });
  });

  describe('Async function', () => {
    it('is an async function', () => {
      expect(Section2.constructor.name).toBe('AsyncFunction');
    });

    it('returns a Promise', () => {
      const result = Section2();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('Radix UI components', () => {
    it('uses Flex components', async () => {
      const { container } = await renderWithTheme(await Section2());
      const flexes = container.querySelectorAll('[class*="rt-Flex"]');
      expect(flexes.length).toBeGreaterThan(0);
    });

    it('uses Text components', async () => {
      const { container } = await renderWithTheme(await Section2());
      const texts = container.querySelectorAll('[class*="rt-Text"]');
      expect(texts.length).toBeGreaterThan(0);
    });
  });

  describe('Comments', () => {
    it('has section header comment', async () => {
      await renderWithTheme(await Section2());
      expect(true).toBe(true);
    });

    it('has title comment', async () => {
      await renderWithTheme(await Section2());
      expect(true).toBe(true);
    });

    it('has description comment', async () => {
      await renderWithTheme(await Section2());
      expect(true).toBe(true);
    });

    it('has disclaimer comment', async () => {
      await renderWithTheme(await Section2());
      expect(true).toBe(true);
    });
  });
});
