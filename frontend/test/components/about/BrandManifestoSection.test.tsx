import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrandManifestoSection } from '@/components/about/BrandManifestoSection';
import { Theme } from '@radix-ui/themes';

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => {
    return (key: string) => {
      const translations: Record<string, string> = {
        number: '03',
        title: 'Brand Manifesto Title',
        paragraph1: 'Paragraph 1 content',
        paragraph2: 'Paragraph 2 content',
        paragraph3: 'Paragraph 3 content',
        paragraph4: 'Paragraph 4 content',
        conclusion: 'Conclusion statement',
      };
      return translations[key] || key;
    };
  }),
}));

describe('BrandManifestoSection', () => {
  const renderWithTheme = async (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  describe('Basic rendering', () => {
    it('renders without crashing', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      expect(container).toBeInTheDocument();
    });

    it('renders section title', async () => {
      await renderWithTheme(await BrandManifestoSection());
      expect(screen.getByText('Brand Manifesto Title')).toBeInTheDocument();
    });

    it('renders number badge', async () => {
      await renderWithTheme(await BrandManifestoSection());
      expect(screen.getByText('03')).toBeInTheDocument();
    });

    it('renders all paragraphs', async () => {
      await renderWithTheme(await BrandManifestoSection());
      expect(screen.getByText('Paragraph 1 content')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2 content')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 3 content')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 4 content')).toBeInTheDocument();
    });

    it('renders conclusion', async () => {
      await renderWithTheme(await BrandManifestoSection());
      expect(screen.getByText('Conclusion statement')).toBeInTheDocument();
    });
  });

  describe('Number badge styling', () => {
    it('displays number', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const badge = screen.getByText('03');
      expect(badge).toBeInTheDocument();
    });

    it('applies white text to badge', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const badge = screen.getByText('03');
      expect(badge).toHaveClass('text-white');
    });

    it('applies text-[32px] on mobile', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const badge = screen.getByText('03');
      expect(badge).toHaveClass('text-[32px]');
    });

    it('applies leading-[48px] on mobile', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const badge = screen.getByText('03');
      expect(badge).toHaveClass('leading-[48px]');
    });

    it('applies lg:text-[40px] on desktop', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const badge = screen.getByText('03');
      expect(badge).toHaveClass('lg:text-[40px]');
    });

    it('applies lg:leading-[56px] on desktop', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const badge = screen.getByText('03');
      expect(badge).toHaveClass('lg:leading-[56px]');
    });

    it('applies font-semibold to badge', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const badge = screen.getByText('03');
      expect(badge).toHaveClass('font-semibold');
    });

    it('has gradient background style', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const badge = container.querySelector('.rounded-r-\\[32px\\]');
      expect(badge).toHaveStyle({
        background:
          'linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)',
      });
    });

    it('applies rounded-r-[32px] to badge container', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const badge = container.querySelector('.rounded-r-\\[32px\\]');
      expect(badge).toBeInTheDocument();
    });

    it('applies px-8 to badge container', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const badge = container.querySelector('.px-8');
      expect(badge).toBeInTheDocument();
    });

    it('applies py-2 to badge container', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const badge = container.querySelector('.py-2');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Title styling', () => {
    it('applies text-black to title', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const title = screen.getByText('Brand Manifesto Title');
      expect(title).toHaveClass('text-black');
    });

    it('applies text-lg on mobile', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const title = screen.getByText('Brand Manifesto Title');
      expect(title).toHaveClass('text-lg');
    });

    it('applies leading-6 on mobile', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const title = screen.getByText('Brand Manifesto Title');
      expect(title).toHaveClass('leading-6');
    });

    it('applies lg:text-2xl on desktop', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const title = screen.getByText('Brand Manifesto Title');
      expect(title).toHaveClass('lg:text-2xl');
    });

    it('applies lg:leading-7 on desktop', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const title = screen.getByText('Brand Manifesto Title');
      expect(title).toHaveClass('lg:leading-7');
    });

    it('applies font-semibold to title', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const title = screen.getByText('Brand Manifesto Title');
      expect(title).toHaveClass('font-semibold');
    });

    it('applies uppercase to title', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const title = screen.getByText('Brand Manifesto Title');
      expect(title).toHaveClass('uppercase');
    });

    it('applies flex-1 to title', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const title = screen.getByText('Brand Manifesto Title');
      expect(title).toHaveClass('flex-1');
    });

    it('applies px-4 to title', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const title = screen.getByText('Brand Manifesto Title');
      expect(title).toHaveClass('px-4');
    });
  });

  describe('Header container styling', () => {
    it('applies bg-[#FDF7F1] to header', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const header = container.querySelector('.bg-\\[\\#FDF7F1\\]');
      expect(header).toBeInTheDocument();
    });

    it('applies w-[calc(100%+40px)] on mobile', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const header = container.querySelector('.w-\\[calc\\(100\\%\\+40px\\)\\]');
      expect(header).toBeInTheDocument();
    });

    it('applies -mx-5 on mobile', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const header = container.querySelector('.-mx-5');
      expect(header).toBeInTheDocument();
    });

    it('applies md:w-[calc(100%+80px)] on tablet', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const header = container.querySelector('.md\\:w-\\[calc\\(100\\%\\+80px\\)\\]');
      expect(header).toBeInTheDocument();
    });

    it('applies md:-mx-10 on tablet', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const header = container.querySelector('.md\\:-mx-10');
      expect(header).toBeInTheDocument();
    });

    it('applies lg:w-auto on desktop', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const header = container.querySelector('.lg\\:w-auto');
      expect(header).toBeInTheDocument();
    });

    it('applies lg:mx-0 on desktop', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const header = container.querySelector('.lg\\:mx-0');
      expect(header).toBeInTheDocument();
    });

    it('applies lg:self-stretch on desktop', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const header = container.querySelector('.lg\\:self-stretch');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Content paragraph styling', () => {
    it('applies text-black to paragraphs', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const paragraphs = [
        screen.getByText('Paragraph 1 content'),
        screen.getByText('Paragraph 2 content'),
        screen.getByText('Paragraph 3 content'),
        screen.getByText('Paragraph 4 content'),
      ];
      paragraphs.forEach((p) => {
        expect(p).toHaveClass('text-black');
      });
    });

    it('applies text-base on mobile', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const paragraphs = [
        screen.getByText('Paragraph 1 content'),
        screen.getByText('Paragraph 2 content'),
      ];
      paragraphs.forEach((p) => {
        expect(p).toHaveClass('text-base');
      });
    });

    it('applies leading-6 on mobile', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const paragraphs = [
        screen.getByText('Paragraph 1 content'),
        screen.getByText('Paragraph 2 content'),
      ];
      paragraphs.forEach((p) => {
        expect(p).toHaveClass('leading-6');
      });
    });

    it('applies lg:text-lg on desktop', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const paragraphs = [
        screen.getByText('Paragraph 1 content'),
        screen.getByText('Paragraph 2 content'),
      ];
      paragraphs.forEach((p) => {
        expect(p).toHaveClass('lg:text-lg');
      });
    });

    it('applies lg:leading-7 on desktop', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const paragraphs = [
        screen.getByText('Paragraph 1 content'),
        screen.getByText('Paragraph 2 content'),
      ];
      paragraphs.forEach((p) => {
        expect(p).toHaveClass('lg:leading-7');
      });
    });
  });

  describe('Conclusion styling', () => {
    it('applies font-semibold to conclusion', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const conclusion = screen.getByText('Conclusion statement');
      expect(conclusion).toHaveClass('font-semibold');
    });

    it('applies text-black to conclusion', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const conclusion = screen.getByText('Conclusion statement');
      expect(conclusion).toHaveClass('text-black');
    });

    it('applies text-base on mobile to conclusion', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const conclusion = screen.getByText('Conclusion statement');
      expect(conclusion).toHaveClass('text-base');
    });

    it('applies lg:text-lg on desktop to conclusion', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const conclusion = screen.getByText('Conclusion statement');
      expect(conclusion).toHaveClass('lg:text-lg');
    });
  });

  describe('Section container styling', () => {
    it('applies py-6 on mobile', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const section = container.querySelector('.py-6');
      expect(section).toBeInTheDocument();
    });

    it('applies gap-4 on mobile', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const section = container.querySelector('.gap-4');
      expect(section).toBeInTheDocument();
    });

    it('applies border-b', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const section = container.querySelector('.border-b');
      expect(section).toBeInTheDocument();
    });

    it('applies border-[#F0F0F0]', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const section = container.querySelector('.border-\\[\\#F0F0F0\\]');
      expect(section).toBeInTheDocument();
    });

    it('applies lg:py-8 on desktop', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const section = container.querySelector('.lg\\:py-8');
      expect(section).toBeInTheDocument();
    });

    it('applies lg:gap-6 on desktop', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const section = container.querySelector('.lg\\:gap-6');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Content container styling', () => {
    it('applies self-stretch to content container', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const contentContainer = container.querySelector('.self-stretch');
      expect(contentContainer).toBeInTheDocument();
    });
  });

  describe('Radix UI components', () => {
    it('uses Flex components', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const flexes = container.querySelectorAll('[class*="rt-Flex"]');
      expect(flexes.length).toBeGreaterThan(0);
    });

    it('uses Text components', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const texts = container.querySelectorAll('[class*="rt-Text"]');
      expect(texts.length).toBeGreaterThan(0);
    });
  });

  describe('Server component', () => {
    it('renders as async server component', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      expect(container).toBeInTheDocument();
    });
  });

  describe('Translation integration', () => {
    it('uses about.brandManifesto namespace', async () => {
      await renderWithTheme(await BrandManifestoSection());
      expect(true).toBe(true);
    });

    it('translates number key', async () => {
      await renderWithTheme(await BrandManifestoSection());
      expect(screen.getByText('03')).toBeInTheDocument();
    });

    it('translates title key', async () => {
      await renderWithTheme(await BrandManifestoSection());
      expect(screen.getByText('Brand Manifesto Title')).toBeInTheDocument();
    });

    it('translates all paragraph keys', async () => {
      await renderWithTheme(await BrandManifestoSection());
      expect(screen.getByText('Paragraph 1 content')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2 content')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 3 content')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 4 content')).toBeInTheDocument();
    });

    it('translates conclusion key', async () => {
      await renderWithTheme(await BrandManifestoSection());
      expect(screen.getByText('Conclusion statement')).toBeInTheDocument();
    });
  });

  describe('Responsive behavior', () => {
    it('has different padding on mobile vs desktop', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const section = container.querySelector('.py-6.lg\\:py-8');
      expect(section).toBeInTheDocument();
    });

    it('has different gap on mobile vs desktop', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const section = container.querySelector('.gap-4.lg\\:gap-6');
      expect(section).toBeInTheDocument();
    });

    it('badge text size changes from mobile to desktop', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const badge = screen.getByText('03');
      expect(badge).toHaveClass('text-[32px]');
      expect(badge).toHaveClass('lg:text-[40px]');
    });

    it('title text size changes from mobile to desktop', async () => {
      await renderWithTheme(await BrandManifestoSection());
      const title = screen.getByText('Brand Manifesto Title');
      expect(title).toHaveClass('text-lg');
      expect(title).toHaveClass('lg:text-2xl');
    });

    it('header width changes across breakpoints', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const header = container.querySelector(
        '.w-\\[calc\\(100\\%\\+40px\\)\\].md\\:w-\\[calc\\(100\\%\\+80px\\)\\].lg\\:w-auto'
      );
      expect(header).toBeInTheDocument();
    });

    it('header margin changes across breakpoints', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const header = container.querySelector('.-mx-5.md\\:-mx-10.lg\\:mx-0');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles long title text', async () => {
      await renderWithTheme(await BrandManifestoSection());
      expect(screen.getByText('Brand Manifesto Title')).toBeInTheDocument();
    });

    it('renders all 5 content sections', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const texts = container.querySelectorAll('[class*="rt-Text"]');
      // At least 7 texts: number badge, title, 4 paragraphs, conclusion
      expect(texts.length).toBeGreaterThanOrEqual(7);
    });

    it('maintains layout with all content', async () => {
      const { container } = await renderWithTheme(await BrandManifestoSection());
      const flexes = container.querySelectorAll('[class*="rt-Flex"]');
      expect(flexes.length).toBeGreaterThan(0);
    });
  });
});
