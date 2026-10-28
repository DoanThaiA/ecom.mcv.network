import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FooterCopyright } from '@/components/layout/footer/FooterCopyright';
import { Theme } from '@radix-ui/themes';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      copyright: '© 2024 CCHAT. All rights reserved.',
    };
    return translations[key] || key;
  },
}));

describe('FooterCopyright', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  describe('Content rendering', () => {
    it('renders copyright text', () => {
      renderWithTheme(<FooterCopyright />);
      const copyrightTexts = screen.getAllByText('© 2024 CCHAT. All rights reserved.');
      // Should render twice (mobile and desktop versions)
      expect(copyrightTexts).toHaveLength(2);
    });

    it('displays copyright text from translations', () => {
      renderWithTheme(<FooterCopyright />);
      expect(screen.getAllByText('© 2024 CCHAT. All rights reserved.')).toBeTruthy();
    });
  });

  describe('Mobile version', () => {
    it('renders mobile container', () => {
      const { container } = renderWithTheme(<FooterCopyright />);
      const mobileBox = container.querySelector('.md\\:hidden');
      expect(mobileBox).toBeInTheDocument();
    });

    it('applies centered text on mobile', () => {
      const { container } = renderWithTheme(<FooterCopyright />);
      const mobileBox = container.querySelector('.md\\:hidden.text-center');
      expect(mobileBox).toBeInTheDocument();
    });

    it('applies padding on mobile', () => {
      const { container } = renderWithTheme(<FooterCopyright />);
      const mobileBox = container.querySelector('.md\\:hidden.py-4');
      expect(mobileBox).toBeInTheDocument();
    });

    it('has flex column layout on mobile', () => {
      const { container } = renderWithTheme(<FooterCopyright />);
      const mobileFlex = container.querySelector('.md\\:hidden .rt-Flex');
      expect(mobileFlex).toBeInTheDocument();
    });

    it('applies text size to mobile text', () => {
      const { container } = renderWithTheme(<FooterCopyright />);
      const mobileText = container.querySelector('.md\\:hidden .text-sm');
      expect(mobileText).toBeInTheDocument();
    });

    it('applies text color to mobile text', () => {
      const { container } = renderWithTheme(<FooterCopyright />);
      const mobileText = container.querySelector('.md\\:hidden .text-gray-500');
      expect(mobileText).toBeInTheDocument();
    });

    it('has gap between elements on mobile', () => {
      const { container } = renderWithTheme(<FooterCopyright />);
      const mobileFlex = container.querySelector('.md\\:hidden [class*="gap"]');
      expect(mobileFlex).toBeInTheDocument();
    });
  });

  describe('Desktop version', () => {
    it('renders desktop container', () => {
      const { container } = renderWithTheme(<FooterCopyright />);
      const desktopBox = container.querySelector('.hidden.md\\:block');
      expect(desktopBox).toBeInTheDocument();
    });

    it('applies text size to desktop text', () => {
      const { container } = renderWithTheme(<FooterCopyright />);
      const desktopText = container.querySelector('.hidden.md\\:block .text-xs');
      expect(desktopText).toBeInTheDocument();
    });

    it('applies line height to desktop text', () => {
      const { container } = renderWithTheme(<FooterCopyright />);
      const desktopText = container.querySelector('.hidden.md\\:block .leading-3');
      expect(desktopText).toBeInTheDocument();
    });

    it('applies text color to desktop text', () => {
      const { container } = renderWithTheme(<FooterCopyright />);
      const desktopText = container.querySelector('.hidden.md\\:block .text-black');
      expect(desktopText).toBeInTheDocument();
    });
  });

  describe('Responsive behavior', () => {
    it('renders both mobile and desktop versions', () => {
      const { container } = renderWithTheme(<FooterCopyright />);
      const mobileBox = container.querySelector('.md\\:hidden');
      const desktopBox = container.querySelector('.hidden.md\\:block');
      expect(mobileBox).toBeInTheDocument();
      expect(desktopBox).toBeInTheDocument();
    });

    it('mobile version uses different styling than desktop', () => {
      const { container } = renderWithTheme(<FooterCopyright />);
      const mobileText = container.querySelector('.md\\:hidden .text-sm.text-gray-500');
      const desktopText = container.querySelector('.hidden.md\\:block .text-xs.text-black');
      expect(mobileText).toBeInTheDocument();
      expect(desktopText).toBeInTheDocument();
    });
  });

  describe('Structure', () => {
    it('renders without wrapper elements', () => {
      const { container } = renderWithTheme(<FooterCopyright />);
      // Component uses Fragment, so both mobile and desktop boxes exist
      const mobileBox = container.querySelector('.md\\:hidden');
      const desktopBox = container.querySelector('.hidden.md\\:block');
      expect(mobileBox).toBeInTheDocument();
      expect(desktopBox).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('copyright text is accessible', () => {
      renderWithTheme(<FooterCopyright />);
      const copyrightTexts = screen.getAllByText('© 2024 CCHAT. All rights reserved.');
      copyrightTexts.forEach((text) => {
        expect(text).toBeVisible();
      });
    });
  });
});
