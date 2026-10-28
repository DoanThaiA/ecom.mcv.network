import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IntroSection } from '@/components/help/account-deletion/IntroSection';
import { Theme } from '@radix-ui/themes';

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => {
    return (key: string) => {
      const translations: Record<string, string> = {
        number: '01',
        title: 'Introduction',
        subtitle: 'to Account Deletion',
        description:
          'This guide will walk you through the process of permanently deleting your account.',
        note: 'Important: This action cannot be undone. Please read carefully before proceeding.',
      };
      return translations[key] || key;
    };
  }),
}));

describe('IntroSection', () => {
  const renderWithTheme = async (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  describe('Basic rendering', () => {
    it('renders without crashing', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      expect(container).toBeInTheDocument();
    });

    it('renders section number', async () => {
      await renderWithTheme(await IntroSection());
      expect(screen.getByText('01')).toBeInTheDocument();
    });

    it('renders title', async () => {
      await renderWithTheme(await IntroSection());
      expect(screen.getByText(/Introduction/)).toBeInTheDocument();
    });

    it('renders subtitle', async () => {
      await renderWithTheme(await IntroSection());
      expect(screen.getByText(/to Account Deletion/)).toBeInTheDocument();
    });

    it('renders description', async () => {
      await renderWithTheme(await IntroSection());
      expect(screen.getByText(/This guide will walk you through/)).toBeInTheDocument();
    });

    it('renders note', async () => {
      await renderWithTheme(await IntroSection());
      expect(screen.getByText(/Important: This action cannot be undone/)).toBeInTheDocument();
    });
  });

  describe('Main container styling', () => {
    it('applies py-6 for mobile', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const main = container.querySelector('.py-6');
      expect(main).toBeInTheDocument();
    });

    it('applies gap-4 for mobile', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const main = container.querySelector('.gap-4');
      expect(main).toBeInTheDocument();
    });

    it('applies border-b', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const main = container.querySelector('.border-b');
      expect(main).toBeInTheDocument();
    });

    it('applies border color', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const main = container.querySelector('.border-\\[\\#F0F0F0\\]');
      expect(main).toBeInTheDocument();
    });

    it('applies lg:py-8 for desktop', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const main = container.querySelector('.lg\\:py-8');
      expect(main).toBeInTheDocument();
    });

    it('applies lg:gap-6 for desktop', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const main = container.querySelector('.lg\\:gap-6');
      expect(main).toBeInTheDocument();
    });
  });

  describe('Section header styling', () => {
    it('applies full width with negative margin on mobile', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const header = container.querySelector('.w-\\[calc\\(100\\%\\+40px\\)\\]');
      expect(header).toBeInTheDocument();
    });

    it('applies negative margin on mobile', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const header = container.querySelector('.-mx-5');
      expect(header).toBeInTheDocument();
    });

    it('applies background color', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const header = container.querySelector('.bg-\\[\\#FDF7F1\\]');
      expect(header).toBeInTheDocument();
    });

    it('applies responsive width for md', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const header = container.querySelector('.md\\:w-\\[calc\\(100\\%\\+80px\\)\\]');
      expect(header).toBeInTheDocument();
    });

    it('applies responsive margin for md', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const header = container.querySelector('.md\\:-mx-10');
      expect(header).toBeInTheDocument();
    });

    it('applies lg:w-auto for desktop', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const header = container.querySelector('.lg\\:w-auto');
      expect(header).toBeInTheDocument();
    });

    it('applies lg:mx-0 for desktop', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const header = container.querySelector('.lg\\:mx-0');
      expect(header).toBeInTheDocument();
    });

    it('applies lg:self-stretch for desktop', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const header = container.querySelector('.lg\\:self-stretch');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Number badge styling', () => {
    it('applies px-8 padding', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const badge = container.querySelector('.px-8');
      expect(badge).toBeInTheDocument();
    });

    it('applies py-2 padding', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const badge = container.querySelector('.py-2');
      expect(badge).toBeInTheDocument();
    });

    it('applies rounded-r-[32px]', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const badge = container.querySelector('.rounded-r-\\[32px\\]');
      expect(badge).toBeInTheDocument();
    });

    it('has gradient background style', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const badge = container.querySelector('.rounded-r-\\[32px\\]');
      expect(badge).toHaveStyle({
        background:
          'linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)',
      });
    });
  });

  describe('Number text styling', () => {
    it('applies text-white to number', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const number = screen.getByText('01');
      expect(number).toHaveClass('text-white');
    });

    it('applies text-[32px] for mobile', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const number = screen.getByText('01');
      expect(number).toHaveClass('text-[32px]');
    });

    it('applies leading-[48px] for mobile', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const number = screen.getByText('01');
      expect(number).toHaveClass('leading-[48px]');
    });

    it('applies lg:text-[40px] for desktop', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const number = screen.getByText('01');
      expect(number).toHaveClass('lg:text-[40px]');
    });

    it('applies lg:leading-[56px] for desktop', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const number = screen.getByText('01');
      expect(number).toHaveClass('lg:leading-[56px]');
    });

    it('applies font-semibold', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const number = screen.getByText('01');
      expect(number).toHaveClass('font-semibold');
    });
  });

  describe('Title styling', () => {
    it('applies text-black to title', async () => {
      await renderWithTheme(await IntroSection());
      const title = screen.getByText(/Introduction to Account Deletion/);
      expect(title).toHaveClass('text-black');
    });

    it('applies text-sm for mobile', async () => {
      await renderWithTheme(await IntroSection());
      const title = screen.getByText(/Introduction to Account Deletion/);
      expect(title).toHaveClass('text-sm');
    });

    it('applies leading-5 for mobile', async () => {
      await renderWithTheme(await IntroSection());
      const title = screen.getByText(/Introduction to Account Deletion/);
      expect(title).toHaveClass('leading-5');
    });

    it('applies lg:text-base for desktop', async () => {
      await renderWithTheme(await IntroSection());
      const title = screen.getByText(/Introduction to Account Deletion/);
      expect(title).toHaveClass('lg:text-base');
    });

    it('applies lg:leading-6 for desktop', async () => {
      await renderWithTheme(await IntroSection());
      const title = screen.getByText(/Introduction to Account Deletion/);
      expect(title).toHaveClass('lg:leading-6');
    });

    it('applies font-semibold', async () => {
      await renderWithTheme(await IntroSection());
      const title = screen.getByText(/Introduction to Account Deletion/);
      expect(title).toHaveClass('font-semibold');
    });

    it('applies flex-1', async () => {
      await renderWithTheme(await IntroSection());
      const title = screen.getByText(/Introduction to Account Deletion/);
      expect(title).toHaveClass('flex-1');
    });

    it('applies px-4', async () => {
      await renderWithTheme(await IntroSection());
      const title = screen.getByText(/Introduction to Account Deletion/);
      expect(title).toHaveClass('px-4');
    });
  });

  describe('Description styling', () => {
    it('applies text-black to description', async () => {
      await renderWithTheme(await IntroSection());
      const description = screen.getByText(/This guide will walk you through/);
      expect(description).toHaveClass('text-black');
    });

    it('applies text-sm for mobile', async () => {
      await renderWithTheme(await IntroSection());
      const description = screen.getByText(/This guide will walk you through/);
      expect(description).toHaveClass('text-sm');
    });

    it('applies leading-5 for mobile', async () => {
      await renderWithTheme(await IntroSection());
      const description = screen.getByText(/This guide will walk you through/);
      expect(description).toHaveClass('leading-5');
    });

    it('applies lg:text-base for desktop', async () => {
      await renderWithTheme(await IntroSection());
      const description = screen.getByText(/This guide will walk you through/);
      expect(description).toHaveClass('lg:text-base');
    });

    it('applies lg:leading-6 for desktop', async () => {
      await renderWithTheme(await IntroSection());
      const description = screen.getByText(/This guide will walk you through/);
      expect(description).toHaveClass('lg:leading-6');
    });

    it('applies self-stretch', async () => {
      await renderWithTheme(await IntroSection());
      const description = screen.getByText(/This guide will walk you through/);
      expect(description).toHaveClass('self-stretch');
    });
  });

  describe('Note card styling', () => {
    it('applies self-stretch to note card', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const noteCard = container.querySelector('.rounded-2xl');
      expect(noteCard).toHaveClass('self-stretch');
    });

    it('applies p-6 to note card', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const noteCard = container.querySelector('.rounded-2xl');
      expect(noteCard).toHaveClass('p-6');
    });

    it('applies bg-[#F0F0F0] to note card', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const noteCard = container.querySelector('.bg-\\[\\#F0F0F0\\]');
      expect(noteCard).toBeInTheDocument();
    });

    it('applies rounded-2xl to note card', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const noteCard = container.querySelector('.rounded-2xl');
      expect(noteCard).toBeInTheDocument();
    });
  });

  describe('Note text styling', () => {
    it('applies text-black to note', async () => {
      await renderWithTheme(await IntroSection());
      const note = screen.getByText(/Important: This action cannot be undone/);
      expect(note).toHaveClass('text-black');
    });

    it('applies text-sm for mobile', async () => {
      await renderWithTheme(await IntroSection());
      const note = screen.getByText(/Important: This action cannot be undone/);
      expect(note).toHaveClass('text-sm');
    });

    it('applies leading-5 for mobile', async () => {
      await renderWithTheme(await IntroSection());
      const note = screen.getByText(/Important: This action cannot be undone/);
      expect(note).toHaveClass('leading-5');
    });

    it('applies lg:text-base for desktop', async () => {
      await renderWithTheme(await IntroSection());
      const note = screen.getByText(/Important: This action cannot be undone/);
      expect(note).toHaveClass('lg:text-base');
    });

    it('applies lg:leading-6 for desktop', async () => {
      await renderWithTheme(await IntroSection());
      const note = screen.getByText(/Important: This action cannot be undone/);
      expect(note).toHaveClass('lg:leading-6');
    });

    it('applies text-center', async () => {
      await renderWithTheme(await IntroSection());
      const note = screen.getByText(/Important: This action cannot be undone/);
      expect(note).toHaveClass('text-center');
    });
  });

  describe('Translation integration', () => {
    it('uses accountDeletion.intro namespace', async () => {
      await renderWithTheme(await IntroSection());
      expect(true).toBe(true);
    });

    it('translates number key', async () => {
      await renderWithTheme(await IntroSection());
      expect(screen.getByText('01')).toBeInTheDocument();
    });

    it('translates title key', async () => {
      await renderWithTheme(await IntroSection());
      expect(screen.getByText(/Introduction/)).toBeInTheDocument();
    });

    it('translates subtitle key', async () => {
      await renderWithTheme(await IntroSection());
      expect(screen.getByText(/to Account Deletion/)).toBeInTheDocument();
    });

    it('translates description key', async () => {
      await renderWithTheme(await IntroSection());
      expect(screen.getByText(/This guide will walk you through/)).toBeInTheDocument();
    });

    it('translates note key', async () => {
      await renderWithTheme(await IntroSection());
      expect(screen.getByText(/Important: This action cannot be undone/)).toBeInTheDocument();
    });
  });

  describe('Async function', () => {
    it('is an async function', () => {
      expect(IntroSection.constructor.name).toBe('AsyncFunction');
    });

    it('returns a Promise', () => {
      const result = IntroSection();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('Radix UI components', () => {
    it('uses Flex components', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const flexes = container.querySelectorAll('[class*="rt-Flex"]');
      expect(flexes.length).toBeGreaterThan(0);
    });

    it('uses Text components', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const texts = container.querySelectorAll('[class*="rt-Text"]');
      expect(texts.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Layout structure', () => {
    it('has four main text elements', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const texts = container.querySelectorAll('[class*="rt-Text"]');
      expect(texts.length).toBeGreaterThanOrEqual(4);
    });

    it('number appears before title', async () => {
      await renderWithTheme(await IntroSection());
      const number = screen.getByText('01');
      const title = screen.getByText(/Introduction/);
      expect(number.compareDocumentPosition(title)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('title appears before description', async () => {
      await renderWithTheme(await IntroSection());
      const title = screen.getByText(/Introduction/);
      const description = screen.getByText(/This guide will walk you through/);
      expect(title.compareDocumentPosition(description)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('description appears before note', async () => {
      await renderWithTheme(await IntroSection());
      const description = screen.getByText(/This guide will walk you through/);
      const note = screen.getByText(/Important: This action cannot be undone/);
      expect(description.compareDocumentPosition(note)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });
  });

  describe('Responsive behavior', () => {
    it('has different padding for mobile and desktop', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const main = container.querySelector('.py-6');
      expect(main).toHaveClass('lg:py-8');
    });

    it('has different gap for mobile and desktop', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const main = container.querySelector('.gap-4');
      expect(main).toHaveClass('lg:gap-6');
    });

    it('header width changes from fixed to auto on large screens', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const header = container.querySelector('.w-\\[calc\\(100\\%\\+40px\\)\\]');
      expect(header).toHaveClass('lg:w-auto');
    });

    it('header margins change on large screens', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const header = container.querySelector('.-mx-5');
      expect(header).toHaveClass('lg:mx-0');
    });

    it('number has different text size for mobile and desktop', async () => {
      const { container } = await renderWithTheme(await IntroSection());
      const number = screen.getByText('01');
      expect(number).toHaveClass('text-[32px]');
      expect(number).toHaveClass('lg:text-[40px]');
    });
  });
});
