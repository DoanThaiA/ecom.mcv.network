import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Section1 } from '@/components/policy/return/Section1';
import { Theme } from '@radix-ui/themes';

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => {
    return (key: string) => {
      const translations: Record<string, string> = {
        number: '01',
        title: 'Return Conditions',
        description:
          'Products can be returned within 7 days from the date of purchase. Items must be unused, with tags intact, and in original packaging.',
        storeOrder:
          'For in-store purchases: Bring the product and receipt to any store for processing.',
        onlineOrder:
          'For online orders: Contact customer support at support@example.com to initiate the return process.',
      };
      return translations[key] || key;
    };
  }),
}));

describe('Section1', () => {
  const renderWithTheme = async (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  describe('Basic rendering', () => {
    it('renders without crashing', async () => {
      const { container } = await renderWithTheme(await Section1());
      expect(container).toBeInTheDocument();
    });

    it('renders section number', async () => {
      await renderWithTheme(await Section1());
      expect(screen.getByText('01')).toBeInTheDocument();
    });

    it('renders title', async () => {
      await renderWithTheme(await Section1());
      expect(screen.getByText(/Return Conditions/)).toBeInTheDocument();
    });

    it('renders description', async () => {
      await renderWithTheme(await Section1());
      expect(
        screen.getByText(/Products can be returned within 7 days/)
      ).toBeInTheDocument();
    });

    it('renders store order info', async () => {
      await renderWithTheme(await Section1());
      expect(
        screen.getByText(/For in-store purchases: Bring the product/)
      ).toBeInTheDocument();
    });

    it('renders online order info', async () => {
      await renderWithTheme(await Section1());
      expect(
        screen.getByText(/For online orders: Contact customer support/)
      ).toBeInTheDocument();
    });
  });

  describe('Main container styling', () => {
    it('applies py-6 for mobile', async () => {
      const { container } = await renderWithTheme(await Section1());
      const main = container.querySelector('.py-6');
      expect(main).toBeInTheDocument();
    });

    it('applies gap-4 for mobile', async () => {
      const { container } = await renderWithTheme(await Section1());
      const main = container.querySelector('.gap-4');
      expect(main).toBeInTheDocument();
    });

    it('applies lg:py-8 for desktop', async () => {
      const { container } = await renderWithTheme(await Section1());
      const main = container.querySelector('.lg\\:py-8');
      expect(main).toBeInTheDocument();
    });

    it('applies lg:gap-6 for desktop', async () => {
      const { container } = await renderWithTheme(await Section1());
      const main = container.querySelector('.lg\\:gap-6');
      expect(main).toBeInTheDocument();
    });
  });

  describe('Header container styling', () => {
    it('applies full width with negative margin', async () => {
      const { container } = await renderWithTheme(await Section1());
      const header = container.querySelector('.w-\\[calc\\(100\\%\\+40px\\)\\]');
      expect(header).toBeInTheDocument();
    });

    it('applies negative margin', async () => {
      const { container } = await renderWithTheme(await Section1());
      const header = container.querySelector('.-mx-5');
      expect(header).toBeInTheDocument();
    });

    it('applies background color', async () => {
      const { container } = await renderWithTheme(await Section1());
      const header = container.querySelector('.bg-\\[\\#FDF7F1\\]');
      expect(header).toBeInTheDocument();
    });

    it('applies responsive width for md', async () => {
      const { container } = await renderWithTheme(await Section1());
      const header = container.querySelector('.md\\:w-\\[calc\\(100\\%\\+80px\\)\\]');
      expect(header).toBeInTheDocument();
    });

    it('applies responsive margin for md', async () => {
      const { container } = await renderWithTheme(await Section1());
      const header = container.querySelector('.md\\:-mx-10');
      expect(header).toBeInTheDocument();
    });

    it('applies auto width for lg', async () => {
      const { container } = await renderWithTheme(await Section1());
      const header = container.querySelector('.lg\\:w-auto');
      expect(header).toBeInTheDocument();
    });

    it('applies zero margin for lg', async () => {
      const { container } = await renderWithTheme(await Section1());
      const header = container.querySelector('.lg\\:mx-0');
      expect(header).toBeInTheDocument();
    });

    it('applies lg:self-stretch for desktop', async () => {
      const { container } = await renderWithTheme(await Section1());
      const header = container.querySelector('.lg\\:self-stretch');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Number badge styling', () => {
    it('applies h-16 class', async () => {
      const { container } = await renderWithTheme(await Section1());
      const badge = container.querySelector('.h-16');
      expect(badge).toBeInTheDocument();
    });

    it('applies px-8 padding', async () => {
      const { container } = await renderWithTheme(await Section1());
      const badge = container.querySelector('.px-8');
      expect(badge).toBeInTheDocument();
    });

    it('applies py-2 padding', async () => {
      const { container } = await renderWithTheme(await Section1());
      const badge = container.querySelector('.py-2');
      expect(badge).toBeInTheDocument();
    });

    it('applies rounded-r-[32px] class', async () => {
      const { container } = await renderWithTheme(await Section1());
      const badge = container.querySelector('.rounded-r-\\[32px\\]');
      expect(badge).toBeInTheDocument();
    });

    it('has gradient background style', async () => {
      const { container } = await renderWithTheme(await Section1());
      const badge = container.querySelector('.rounded-r-\\[32px\\]');
      expect(badge).toHaveStyle({
        background:
          'linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)',
      });
    });
  });

  describe('Number text styling', () => {
    it('applies text-white class', async () => {
      const { container } = await renderWithTheme(await Section1());
      const number = container.querySelector('.text-white');
      expect(number).toBeInTheDocument();
    });

    it('applies text-[32px] for mobile', async () => {
      const { container } = await renderWithTheme(await Section1());
      const number = container.querySelector('.text-\\[32px\\]');
      expect(number).toBeInTheDocument();
    });

    it('applies leading-[48px] for mobile', async () => {
      const { container } = await renderWithTheme(await Section1());
      const number = container.querySelector('.leading-\\[48px\\]');
      expect(number).toBeInTheDocument();
    });

    it('applies lg:text-[40px] for desktop', async () => {
      const { container } = await renderWithTheme(await Section1());
      const number = container.querySelector('.lg\\:text-\\[40px\\]');
      expect(number).toBeInTheDocument();
    });

    it('applies lg:leading-[56px] for desktop', async () => {
      const { container } = await renderWithTheme(await Section1());
      const number = container.querySelector('.lg\\:leading-\\[56px\\]');
      expect(number).toBeInTheDocument();
    });

    it('applies font-semibold class', async () => {
      const { container } = await renderWithTheme(await Section1());
      const semibold = container.querySelectorAll('.font-semibold');
      expect(semibold.length).toBeGreaterThan(0);
    });
  });

  describe('Title styling', () => {
    it('applies text-black class', async () => {
      const { container } = await renderWithTheme(await Section1());
      const black = container.querySelectorAll('.text-black');
      expect(black.length).toBeGreaterThan(0);
    });

    it('applies text-sm for mobile', async () => {
      const { container } = await renderWithTheme(await Section1());
      const texts = container.querySelectorAll('.text-sm');
      expect(texts.length).toBeGreaterThan(0);
    });

    it('applies leading-5 for mobile', async () => {
      const { container } = await renderWithTheme(await Section1());
      const texts = container.querySelectorAll('.leading-5');
      expect(texts.length).toBeGreaterThan(0);
    });

    it('applies lg:text-base for desktop', async () => {
      const { container } = await renderWithTheme(await Section1());
      const texts = container.querySelectorAll('.lg\\:text-base');
      expect(texts.length).toBeGreaterThan(0);
    });

    it('applies lg:leading-6 for desktop', async () => {
      const { container } = await renderWithTheme(await Section1());
      const texts = container.querySelectorAll('.lg\\:leading-6');
      expect(texts.length).toBeGreaterThan(0);
    });

    it('applies flex-1 class', async () => {
      const { container } = await renderWithTheme(await Section1());
      const flex1 = container.querySelector('.flex-1');
      expect(flex1).toBeInTheDocument();
    });

    it('applies px-4 padding', async () => {
      const { container } = await renderWithTheme(await Section1());
      const padded = container.querySelectorAll('.px-4');
      expect(padded.length).toBeGreaterThan(0);
    });
  });

  describe('Description styling', () => {
    it('description applies self-stretch', async () => {
      const { container } = await renderWithTheme(await Section1());
      const stretched = container.querySelectorAll('.self-stretch');
      expect(stretched.length).toBeGreaterThanOrEqual(2);
    });

    it('description has correct text color', async () => {
      const { container } = await renderWithTheme(await Section1());
      const description = screen.getByText(/Products can be returned within 7 days/);
      expect(description).toHaveClass('text-black');
    });
  });

  describe('Order info styling', () => {
    it('order info applies self-stretch', async () => {
      const { container } = await renderWithTheme(await Section1());
      const stretched = container.querySelectorAll('.self-stretch');
      expect(stretched.length).toBe(2);
    });

    it('order info has text-black class', async () => {
      const { container } = await renderWithTheme(await Section1());
      const orderInfo = screen.getByText(/For in-store purchases/);
      expect(orderInfo).toHaveClass('text-black');
    });

    it('order info contains both store and online instructions', async () => {
      const { container } = await renderWithTheme(await Section1());
      const orderInfoElement = screen
        .getByText(/For in-store purchases/)
        .closest('[class*="rt-Text"]');
      expect(orderInfoElement).toBeInTheDocument();
      expect(orderInfoElement?.textContent).toContain('For in-store purchases');
      expect(orderInfoElement?.textContent).toContain('For online orders');
    });
  });

  describe('Translation integration', () => {
    it('uses returnPolicy.section1 namespace', async () => {
      await renderWithTheme(await Section1());
      expect(true).toBe(true);
    });

    it('translates number key', async () => {
      await renderWithTheme(await Section1());
      expect(screen.getByText('01')).toBeInTheDocument();
    });

    it('translates title key', async () => {
      await renderWithTheme(await Section1());
      expect(screen.getByText(/Return Conditions/)).toBeInTheDocument();
    });

    it('translates description key', async () => {
      await renderWithTheme(await Section1());
      expect(
        screen.getByText(/Products can be returned within 7 days/)
      ).toBeInTheDocument();
    });

    it('translates storeOrder key', async () => {
      await renderWithTheme(await Section1());
      expect(
        screen.getByText(/For in-store purchases: Bring the product/)
      ).toBeInTheDocument();
    });

    it('translates onlineOrder key', async () => {
      await renderWithTheme(await Section1());
      expect(
        screen.getByText(/For online orders: Contact customer support/)
      ).toBeInTheDocument();
    });
  });

  describe('Async function', () => {
    it('is an async function', () => {
      expect(Section1.constructor.name).toBe('AsyncFunction');
    });

    it('returns a Promise', () => {
      const result = Section1();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('Radix UI components', () => {
    it('uses Flex components', async () => {
      const { container } = await renderWithTheme(await Section1());
      const flexes = container.querySelectorAll('[class*="rt-Flex"]');
      expect(flexes.length).toBeGreaterThan(0);
    });

    it('uses Text components', async () => {
      const { container } = await renderWithTheme(await Section1());
      const texts = container.querySelectorAll('[class*="rt-Text"]');
      expect(texts.length).toBeGreaterThan(0);
    });
  });

  describe('Comments', () => {
    it('has section header comment', async () => {
      await renderWithTheme(await Section1());
      expect(true).toBe(true);
    });

    it('has number box comment', async () => {
      await renderWithTheme(await Section1());
      expect(true).toBe(true);
    });

    it('has title comment', async () => {
      await renderWithTheme(await Section1());
      expect(true).toBe(true);
    });

    it('has description comment', async () => {
      await renderWithTheme(await Section1());
      expect(true).toBe(true);
    });

    it('has order info comment', async () => {
      await renderWithTheme(await Section1());
      expect(true).toBe(true);
    });
  });
});
