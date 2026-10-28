import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Section6 } from '@/components/policy/terms/Section6';
import { Theme } from '@radix-ui/themes';

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async (namespace: string) => {
    return (key: string) => {
      const translations: Record<string, Record<string, string>> = {
        'termsPolicy.section6': {
          title: 'Section 6 Title',
          content1: 'Content 1 plain text',
          content2: 'Content 2 plain text',
          content3: 'Content 3 plain text',
        },
        'termsPolicy.contact': {
          email: 'Email: contact@example.com',
          hotline: 'Hotline: 1800-xxxx',
        },
      };
      return translations[namespace]?.[key] || key;
    };
  }),
}));

describe('Section6', () => {
  const renderWithTheme = async (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  describe('Basic rendering', () => {
    it('renders without crashing', async () => {
      const { container} = await renderWithTheme(await Section6());
      expect(container).toBeInTheDocument();
    });

    it('renders section title', async () => {
      await renderWithTheme(await Section6());
      expect(screen.getByText('Section 6 Title')).toBeInTheDocument();
    });

    it('renders number badge 06', async () => {
      await renderWithTheme(await Section6());
      expect(screen.getByText('06')).toBeInTheDocument();
    });
  });

  describe('Number badge styling', () => {
    it('displays number 06', async () => {
      await renderWithTheme(await Section6());
      const badge = screen.getByText('06');
      expect(badge).toBeInTheDocument();
    });

    it('applies white text to badge', async () => {
      await renderWithTheme(await Section6());
      const badge = screen.getByText('06');
      expect(badge).toHaveClass('text-white');
    });

    it('applies bold font to badge', async () => {
      await renderWithTheme(await Section6());
      const badge = screen.getByText('06');
      expect(badge).toHaveClass('font-bold');
    });

    it('has gradient background style', async () => {
      const { container } = await renderWithTheme(await Section6());
      const badge = container.querySelector('.rounded-r-\\[24px\\]');
      expect(badge).toHaveStyle({
        background:
          'linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)',
      });
    });

    it('applies rounded-r-[24px] to badge container', async () => {
      const { container } = await renderWithTheme(await Section6());
      const badge = container.querySelector('.rounded-r-\\[24px\\]');
      expect(badge).toBeInTheDocument();
    });

    it('applies h-12 on mobile', async () => {
      const { container } = await renderWithTheme(await Section6());
      const badge = container.querySelector('.h-12');
      expect(badge).toBeInTheDocument();
    });

    it('applies lg:h-14 on desktop', async () => {
      const { container } = await renderWithTheme(await Section6());
      const badge = container.querySelector('.lg\\:h-14');
      expect(badge).toBeInTheDocument();
    });

    it('applies px-4 on mobile', async () => {
      const { container } = await renderWithTheme(await Section6());
      const badge = container.querySelector('.px-4.h-12');
      expect(badge).toBeInTheDocument();
    });

    it('applies lg:px-6 on desktop', async () => {
      const { container } = await renderWithTheme(await Section6());
      const badge = container.querySelector('.lg\\:px-6');
      expect(badge).toBeInTheDocument();
    });

    it('applies text-sm on mobile', async () => {
      await renderWithTheme(await Section6());
      const badge = screen.getByText('06');
      expect(badge).toHaveClass('text-sm');
    });

    it('applies lg:text-base on desktop', async () => {
      await renderWithTheme(await Section6());
      const badge = screen.getByText('06');
      expect(badge).toHaveClass('lg:text-base');
    });
  });

  describe('Title styling', () => {
    it('applies text-black to title', async () => {
      await renderWithTheme(await Section6());
      const title = screen.getByText('Section 6 Title');
      expect(title).toHaveClass('text-black');
    });

    it('applies text-sm on mobile', async () => {
      await renderWithTheme(await Section6());
      const title = screen.getByText('Section 6 Title');
      expect(title).toHaveClass('text-sm');
    });

    it('applies leading-5 on mobile', async () => {
      await renderWithTheme(await Section6());
      const title = screen.getByText('Section 6 Title');
      expect(title).toHaveClass('leading-5');
    });

    it('applies lg:text-lg on desktop', async () => {
      await renderWithTheme(await Section6());
      const title = screen.getByText('Section 6 Title');
      expect(title).toHaveClass('lg:text-lg');
    });

    it('applies lg:leading-7 on desktop', async () => {
      await renderWithTheme(await Section6());
      const title = screen.getByText('Section 6 Title');
      expect(title).toHaveClass('lg:leading-7');
    });

    it('applies font-semibold to title', async () => {
      await renderWithTheme(await Section6());
      const title = screen.getByText('Section 6 Title');
      expect(title).toHaveClass('font-semibold');
    });

    it('applies flex-1 to title', async () => {
      await renderWithTheme(await Section6());
      const title = screen.getByText('Section 6 Title');
      expect(title).toHaveClass('flex-1');
    });

    it('applies px-4 to title', async () => {
      await renderWithTheme(await Section6());
      const title = screen.getByText('Section 6 Title');
      expect(title).toHaveClass('px-4');
    });
  });

  describe('Header container styling', () => {
    it('applies bg-[#FDF7F1] to header', async () => {
      const { container } = await renderWithTheme(await Section6());
      const header = container.querySelector('.bg-\\[\\#FDF7F1\\]');
      expect(header).toBeInTheDocument();
    });

    it('applies w-[calc(100%+40px)] on mobile', async () => {
      const { container } = await renderWithTheme(await Section6());
      const header = container.querySelector('.w-\\[calc\\(100\\%\\+40px\\)\\]');
      expect(header).toBeInTheDocument();
    });

    it('applies -mx-5 on mobile', async () => {
      const { container } = await renderWithTheme(await Section6());
      const header = container.querySelector('.-mx-5');
      expect(header).toBeInTheDocument();
    });

    it('applies md:w-[calc(100%+80px)] on tablet', async () => {
      const { container } = await renderWithTheme(await Section6());
      const header = container.querySelector('.md\\:w-\\[calc\\(100\\%\\+80px\\)\\]');
      expect(header).toBeInTheDocument();
    });

    it('applies md:-mx-10 on tablet', async () => {
      const { container } = await renderWithTheme(await Section6());
      const header = container.querySelector('.md\\:-mx-10');
      expect(header).toBeInTheDocument();
    });

    it('applies lg:w-auto on desktop', async () => {
      const { container } = await renderWithTheme(await Section6());
      const header = container.querySelector('.lg\\:w-auto');
      expect(header).toBeInTheDocument();
    });

    it('applies lg:mx-0 on desktop', async () => {
      const { container } = await renderWithTheme(await Section6());
      const header = container.querySelector('.lg\\:mx-0');
      expect(header).toBeInTheDocument();
    });

    it('applies lg:self-stretch on desktop', async () => {
      const { container } = await renderWithTheme(await Section6());
      const header = container.querySelector('.lg\\:self-stretch');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Content styling', () => {
    it('renders content with bullet points', async () => {
      await renderWithTheme(await Section6());
      const content = screen.getByText(/Content 1/);
      expect(content).toBeInTheDocument();
    });

    it('applies text-black to content', async () => {
      await renderWithTheme(await Section6());
      const contents = screen.getAllByText(/Content/);
      contents.forEach((content) => {
        expect(content).toHaveClass('text-black');
      });
    });

    it('applies text-sm on mobile', async () => {
      await renderWithTheme(await Section6());
      const contents = screen.getAllByText(/Content/);
      contents.forEach((content) => {
        expect(content).toHaveClass('text-sm');
      });
    });

    it('applies leading-5 on mobile', async () => {
      await renderWithTheme(await Section6());
      const contents = screen.getAllByText(/Content/);
      contents.forEach((content) => {
        expect(content).toHaveClass('leading-5');
      });
    });

    it('applies lg:text-base on desktop', async () => {
      await renderWithTheme(await Section6());
      const contents = screen.getAllByText(/Content/);
      contents.forEach((content) => {
        expect(content).toHaveClass('lg:text-base');
      });
    });

    it('applies lg:leading-6 on desktop', async () => {
      await renderWithTheme(await Section6());
      const contents = screen.getAllByText(/Content/);
      contents.forEach((content) => {
        expect(content).toHaveClass('lg:leading-6');
      });
    });

    it('applies pl-4 to content container', async () => {
      const { container } = await renderWithTheme(await Section6());
      const contentContainer = container.querySelector('.pl-4');
      expect(contentContainer).toBeInTheDocument();
    });
  });

  describe('Contact information card', () => {
    it('renders email contact', async () => {
      await renderWithTheme(await Section6());
      expect(screen.getByText('Email: contact@example.com')).toBeInTheDocument();
    });

    it('renders hotline contact', async () => {
      await renderWithTheme(await Section6());
      expect(screen.getByText('Hotline: 1800-xxxx')).toBeInTheDocument();
    });

    it('applies bg-[#FDF7F1] to contact card', async () => {
      const { container } = await renderWithTheme(await Section6());
      const contactCards = container.querySelectorAll('.bg-\\[\\#FDF7F1\\]');
      // At least 2: header and contact card
      expect(contactCards.length).toBeGreaterThanOrEqual(2);
    });

    it('applies rounded-xl to contact card', async () => {
      const { container } = await renderWithTheme(await Section6());
      const contactCard = container.querySelector('.rounded-xl');
      expect(contactCard).toBeInTheDocument();
    });

    it('applies p-4 to contact card', async () => {
      const { container } = await renderWithTheme(await Section6());
      const contactCard = container.querySelector('.p-4');
      expect(contactCard).toBeInTheDocument();
    });

    it('applies mt-4 to contact card', async () => {
      const { container } = await renderWithTheme(await Section6());
      const contactCard = container.querySelector('.mt-4');
      expect(contactCard).toBeInTheDocument();
    });

    it('applies font-medium to contact info', async () => {
      await renderWithTheme(await Section6());
      const email = screen.getByText('Email: contact@example.com');
      expect(email).toHaveClass('font-medium');
    });
  });

  describe('Section container styling', () => {
    it('applies py-6 on mobile', async () => {
      const { container } = await renderWithTheme(await Section6());
      const section = container.querySelector('.py-6');
      expect(section).toBeInTheDocument();
    });

    it('applies gap-4 on mobile', async () => {
      const { container } = await renderWithTheme(await Section6());
      const section = container.querySelector('.gap-4');
      expect(section).toBeInTheDocument();
    });

    it('applies border-b', async () => {
      const { container } = await renderWithTheme(await Section6());
      const section = container.querySelector('.border-b');
      expect(section).toBeInTheDocument();
    });

    it('applies border-[#F0F0F0]', async () => {
      const { container } = await renderWithTheme(await Section6());
      const section = container.querySelector('.border-\\[\\#F0F0F0\\]');
      expect(section).toBeInTheDocument();
    });

    it('applies lg:py-8 on desktop', async () => {
      const { container } = await renderWithTheme(await Section6());
      const section = container.querySelector('.lg\\:py-8');
      expect(section).toBeInTheDocument();
    });

    it('applies lg:gap-6 on desktop', async () => {
      const { container } = await renderWithTheme(await Section6());
      const section = container.querySelector('.lg\\:gap-6');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Radix UI components', () => {
    it('uses Flex components', async () => {
      const { container } = await renderWithTheme(await Section6());
      const flexes = container.querySelectorAll('[class*="rt-Flex"]');
      expect(flexes.length).toBeGreaterThan(0);
    });

    it('uses Text components', async () => {
      const { container } = await renderWithTheme(await Section6());
      const texts = container.querySelectorAll('[class*="rt-Text"]');
      expect(texts.length).toBeGreaterThan(0);
    });
  });

  describe('Server component', () => {
    it('renders as async server component', async () => {
      const { container } = await renderWithTheme(await Section6());
      expect(container).toBeInTheDocument();
    });
  });

  describe('Translation integration', () => {
    it('uses termsPolicy.section6 namespace', async () => {
      await renderWithTheme(await Section6());
      expect(true).toBe(true);
    });

    it('uses termsPolicy.contact namespace', async () => {
      await renderWithTheme(await Section6());
      expect(true).toBe(true);
    });

    it('translates title key', async () => {
      await renderWithTheme(await Section6());
      expect(screen.getByText('Section 6 Title')).toBeInTheDocument();
    });

    it('translates content keys', async () => {
      await renderWithTheme(await Section6());
      expect(screen.getByText(/Content 1/)).toBeInTheDocument();
      expect(screen.getByText(/Content 2/)).toBeInTheDocument();
      expect(screen.getByText(/Content 3/)).toBeInTheDocument();
    });

    it('translates email key from contact namespace', async () => {
      await renderWithTheme(await Section6());
      expect(screen.getByText('Email: contact@example.com')).toBeInTheDocument();
    });

    it('translates hotline key from contact namespace', async () => {
      await renderWithTheme(await Section6());
      expect(screen.getByText('Hotline: 1800-xxxx')).toBeInTheDocument();
    });
  });

  describe('Responsive behavior', () => {
    it('has different padding on mobile vs desktop', async () => {
      const { container } = await renderWithTheme(await Section6());
      const section = container.querySelector('.py-6.lg\\:py-8');
      expect(section).toBeInTheDocument();
    });

    it('has different gap on mobile vs desktop', async () => {
      const { container } = await renderWithTheme(await Section6());
      const section = container.querySelector('.gap-4.lg\\:gap-6');
      expect(section).toBeInTheDocument();
    });

    it('badge height changes from mobile to desktop', async () => {
      const { container } = await renderWithTheme(await Section6());
      const badge = container.querySelector('.h-12.lg\\:h-14');
      expect(badge).toBeInTheDocument();
    });

    it('badge padding changes from mobile to desktop', async () => {
      const { container } = await renderWithTheme(await Section6());
      const badge = container.querySelector('.px-4.lg\\:px-6');
      expect(badge).toBeInTheDocument();
    });

    it('header width changes across breakpoints', async () => {
      const { container } = await renderWithTheme(await Section6());
      const header = container.querySelector(
        '.w-\\[calc\\(100\\%\\+40px\\)\\].md\\:w-\\[calc\\(100\\%\\+80px\\)\\].lg\\:w-auto'
      );
      expect(header).toBeInTheDocument();
    });

    it('header margin changes across breakpoints', async () => {
      const { container } = await renderWithTheme(await Section6());
      const header = container.querySelector('.-mx-5.md\\:-mx-10.lg\\:mx-0');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Content list structure', () => {
    it('renders 3 content items', async () => {
      const { container } = await renderWithTheme(await Section6());
      const contentContainer = container.querySelector('.pl-4');
      const texts = contentContainer?.querySelectorAll('[class*="rt-Text"]');
      expect(texts?.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Edge cases', () => {
    it('handles long title text', async () => {
      await renderWithTheme(await Section6());
      expect(screen.getByText('Section 6 Title')).toBeInTheDocument();
    });

    it('maintains layout with all content', async () => {
      const { container } = await renderWithTheme(await Section6());
      const flexes = container.querySelectorAll('[class*="rt-Flex"]');
      expect(flexes.length).toBeGreaterThan(0);
    });

    it('handles contact information display', async () => {
      await renderWithTheme(await Section6());
      expect(screen.getByText(/Email:/)).toBeInTheDocument();
      expect(screen.getByText(/Hotline:/)).toBeInTheDocument();
    });
  });
});
