import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContactSection } from '@/components/faq/ContactSection';
import { Theme } from '@radix-ui/themes';

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => {
    return (key: string) => {
      const translations: Record<string, string> = {
        title: 'Still have questions?',
        description: 'Contact us for more information',
        hotline: '1900-xxxx',
        hotlineTime: 'Mon - Sun: 8:00 - 22:00',
        email: 'support@example.com',
      };
      return translations[key] || key;
    };
  }),
}));

describe('ContactSection', () => {
  const renderWithTheme = async (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  describe('Content rendering', () => {
    it('renders title', async () => {
      await renderWithTheme(await ContactSection());
      expect(screen.getByText('Still have questions?')).toBeInTheDocument();
    });

    it('renders description', async () => {
      await renderWithTheme(await ContactSection());
      expect(screen.getByText('Contact us for more information')).toBeInTheDocument();
    });

    it('renders hotline', async () => {
      await renderWithTheme(await ContactSection());
      expect(screen.getByText('1900-xxxx')).toBeInTheDocument();
    });

    it('renders hotline time', async () => {
      await renderWithTheme(await ContactSection());
      expect(screen.getByText('Mon - Sun: 8:00 - 22:00')).toBeInTheDocument();
    });

    it('renders email', async () => {
      await renderWithTheme(await ContactSection());
      expect(screen.getByText('support@example.com')).toBeInTheDocument();
    });

    it('displays all content visible', async () => {
      await renderWithTheme(await ContactSection());
      expect(screen.getByText('Still have questions?')).toBeVisible();
      expect(screen.getByText('Contact us for more information')).toBeVisible();
      expect(screen.getByText('1900-xxxx')).toBeVisible();
      expect(screen.getByText('Mon - Sun: 8:00 - 22:00')).toBeVisible();
      expect(screen.getByText('support@example.com')).toBeVisible();
    });
  });

  describe('Outer box styling', () => {
    it('applies py-6 for mobile', async () => {
      const { container } = await renderWithTheme(await ContactSection());
      const box = container.querySelector('.py-6');
      expect(box).toBeInTheDocument();
    });

    it('applies lg:py-8 for desktop', async () => {
      const { container } = await renderWithTheme(await ContactSection());
      const box = container.querySelector('.lg\\:py-8');
      expect(box).toBeInTheDocument();
    });

    it('applies border-t class', async () => {
      const { container } = await renderWithTheme(await ContactSection());
      const box = container.querySelector('.border-t');
      expect(box).toBeInTheDocument();
    });

    it('applies border color', async () => {
      const { container } = await renderWithTheme(await ContactSection());
      const box = container.querySelector('.border-\\[\\#F0F0F0\\]');
      expect(box).toBeInTheDocument();
    });
  });

  describe('Card styling', () => {
    it('applies padding', async () => {
      const { container } = await renderWithTheme(await ContactSection());
      const card = container.querySelector('.p-6');
      expect(card).toBeInTheDocument();
    });

    it('applies background color', async () => {
      const { container } = await renderWithTheme(await ContactSection());
      const card = container.querySelector('.bg-\\[\\#FDF7F1\\]');
      expect(card).toBeInTheDocument();
    });

    it('applies rounded corners', async () => {
      const { container } = await renderWithTheme(await ContactSection());
      const card = container.querySelector('.rounded-2xl');
      expect(card).toBeInTheDocument();
    });

    it('applies gap between elements', async () => {
      const { container } = await renderWithTheme(await ContactSection());
      const card = container.querySelector('.gap-4');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Title styling', () => {
    it('applies text-black to title', async () => {
      const { container } = await renderWithTheme(await ContactSection());
      const titles = container.querySelectorAll('.text-black');
      expect(titles.length).toBeGreaterThan(0);
    });

    it('applies text-lg for mobile', async () => {
      const { container } = await renderWithTheme(await ContactSection());
      const title = container.querySelector('.text-lg');
      expect(title).toBeInTheDocument();
    });

    it('applies lg:text-xl for desktop', async () => {
      const { container } = await renderWithTheme(await ContactSection());
      const title = container.querySelector('.lg\\:text-xl');
      expect(title).toBeInTheDocument();
    });

    it('applies font-semibold to title', async () => {
      const { container } = await renderWithTheme(await ContactSection());
      const title = container.querySelector('.font-semibold');
      expect(title).toBeInTheDocument();
    });

    it('applies text-center to title', async () => {
      const { container } = await renderWithTheme(await ContactSection());
      const centered = container.querySelectorAll('.text-center');
      expect(centered.length).toBeGreaterThan(0);
    });
  });

  describe('Description styling', () => {
    it('applies text-gray-600', async () => {
      const { container } = await renderWithTheme(await ContactSection());
      const description = container.querySelector('.text-gray-600');
      expect(description).toBeInTheDocument();
    });

    it('applies text-sm for mobile', async () => {
      const { container } = await renderWithTheme(await ContactSection());
      const smallTexts = container.querySelectorAll('.text-sm');
      expect(smallTexts.length).toBeGreaterThan(0);
    });

    it('applies lg:text-base for desktop', async () => {
      const { container } = await renderWithTheme(await ContactSection());
      const baseTexts = container.querySelectorAll('.lg\\:text-base');
      expect(baseTexts.length).toBeGreaterThan(0);
    });
  });

  describe('Hotline styling', () => {
    it('applies font-medium to hotline', async () => {
      const { container } = await renderWithTheme(await ContactSection());
      const hotline = container.querySelector('.font-medium');
      expect(hotline).toBeInTheDocument();
    });

    it('hotline text is visible', async () => {
      await renderWithTheme(await ContactSection());
      const hotline = screen.getByText('1900-xxxx');
      expect(hotline).toBeVisible();
    });
  });

  describe('Hotline time styling', () => {
    it('applies text-gray-500 to hotline time', async () => {
      const { container } = await renderWithTheme(await ContactSection());
      const hotlineTime = container.querySelector('.text-gray-500');
      expect(hotlineTime).toBeInTheDocument();
    });

    it('applies text-xs for mobile', async () => {
      const { container } = await renderWithTheme(await ContactSection());
      const xsText = container.querySelector('.text-xs');
      expect(xsText).toBeInTheDocument();
    });

    it('applies lg:text-sm for desktop', async () => {
      const { container } = await renderWithTheme(await ContactSection());
      const smText = container.querySelector('.lg\\:text-sm');
      expect(smText).toBeInTheDocument();
    });
  });

  describe('Contact info container', () => {
    it('applies flex column direction', async () => {
      const { container } = await renderWithTheme(await ContactSection());
      const flexes = container.querySelectorAll('[class*="rt-Flex"]');
      expect(flexes.length).toBeGreaterThan(1);
    });

    it('renders multiple flex containers', async () => {
      const { container } = await renderWithTheme(await ContactSection());
      const flexes = container.querySelectorAll('[class*="rt-Flex"]');
      expect(flexes.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Async function', () => {
    it('is an async function', () => {
      expect(ContactSection.constructor.name).toBe('AsyncFunction');
    });

    it('returns a Promise', () => {
      const result = ContactSection();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('Structure', () => {
    it('renders without crashing', async () => {
      const { container } = await renderWithTheme(await ContactSection());
      expect(container).toBeInTheDocument();
    });

    it('renders all text elements', async () => {
      await renderWithTheme(await ContactSection());
      const allTexts = screen.getAllByText(/Still have|Contact us|1900|Mon - Sun|support/);
      expect(allTexts.length).toBe(5);
    });
  });
});
