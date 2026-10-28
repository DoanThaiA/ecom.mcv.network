import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DualAdSection } from '@/components/ads/DualAdSection';
import { Theme } from '@radix-ui/themes';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, fill, className, sizes, priority }: any) => (
    <img
      src={src}
      alt={alt}
      data-fill={fill}
      className={className}
      data-sizes={sizes}
      data-priority={priority}
    />
  ),
}));

describe('DualAdSection', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  const mockAds: [any, any] = [
    {
      imageUrl: 'https://example.com/ad1.jpg',
      href: 'https://example.com/page1',
      alt: 'Advertisement 1',
    },
    {
      imageUrl: 'https://example.com/ad2.jpg',
      href: 'https://example.com/page2',
      alt: 'Advertisement 2',
    },
  ];

  describe('Basic rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderWithTheme(<DualAdSection ads={mockAds} />);
      expect(container).toBeInTheDocument();
    });

    it('renders two ad images', () => {
      renderWithTheme(<DualAdSection ads={mockAds} />);
      const images = screen.getAllByRole('img');
      expect(images.length).toBe(2);
    });

    it('renders first ad with correct src', () => {
      renderWithTheme(<DualAdSection ads={mockAds} />);
      const img = screen.getByAltText('Advertisement 1');
      expect(img).toHaveAttribute('src', 'https://example.com/ad1.jpg');
    });

    it('renders second ad with correct src', () => {
      renderWithTheme(<DualAdSection ads={mockAds} />);
      const img = screen.getByAltText('Advertisement 2');
      expect(img).toHaveAttribute('src', 'https://example.com/ad2.jpg');
    });
  });

  describe('Alt text handling', () => {
    it('uses provided alt text for first ad', () => {
      renderWithTheme(<DualAdSection ads={mockAds} />);
      expect(screen.getByAltText('Advertisement 1')).toBeInTheDocument();
    });

    it('uses provided alt text for second ad', () => {
      renderWithTheme(<DualAdSection ads={mockAds} />);
      expect(screen.getByAltText('Advertisement 2')).toBeInTheDocument();
    });

    it('uses default alt text when not provided for first ad', () => {
      const adsWithoutAlt: [any, any] = [
        { imageUrl: 'https://example.com/ad1.jpg' },
        { imageUrl: 'https://example.com/ad2.jpg' },
      ];
      renderWithTheme(<DualAdSection ads={adsWithoutAlt} />);
      expect(screen.getByAltText('Advertisement 1')).toBeInTheDocument();
    });

    it('uses default alt text when not provided for second ad', () => {
      const adsWithoutAlt: [any, any] = [
        { imageUrl: 'https://example.com/ad1.jpg' },
        { imageUrl: 'https://example.com/ad2.jpg' },
      ];
      renderWithTheme(<DualAdSection ads={adsWithoutAlt} />);
      expect(screen.getByAltText('Advertisement 2')).toBeInTheDocument();
    });
  });

  describe('Link handling', () => {
    it('renders link when href is provided for first ad', () => {
      const { container } = renderWithTheme(<DualAdSection ads={mockAds} />);
      const links = container.querySelectorAll('a');
      expect(links.length).toBe(2);
      expect(links[0]).toHaveAttribute('href', 'https://example.com/page1');
    });

    it('renders link when href is provided for second ad', () => {
      const { container } = renderWithTheme(<DualAdSection ads={mockAds} />);
      const links = container.querySelectorAll('a');
      expect(links[1]).toHaveAttribute('href', 'https://example.com/page2');
    });

    it('does not render link when href is not provided', () => {
      const adsWithoutHref: [any, any] = [
        { imageUrl: 'https://example.com/ad1.jpg' },
        { imageUrl: 'https://example.com/ad2.jpg' },
      ];
      const { container } = renderWithTheme(<DualAdSection ads={adsWithoutHref} />);
      const links = container.querySelectorAll('a');
      expect(links.length).toBe(0);
    });

    it('applies correct classes to link', () => {
      const { container } = renderWithTheme(<DualAdSection ads={mockAds} />);
      const link = container.querySelector('a');
      expect(link).toHaveClass('block');
      expect(link).toHaveClass('no-underline');
      expect(link).toHaveClass('flex-1');
    });

    it('wraps content in div when no href provided', () => {
      const adsWithoutHref: [any, any] = [
        { imageUrl: 'https://example.com/ad1.jpg' },
        { imageUrl: 'https://example.com/ad2.jpg' },
      ];
      const { container } = renderWithTheme(<DualAdSection ads={adsWithoutHref} />);
      const flexDivs = container.querySelectorAll('.flex-1');
      expect(flexDivs.length).toBe(2);
    });
  });

  describe('Image component props', () => {
    it('applies fill prop to images', () => {
      renderWithTheme(<DualAdSection ads={mockAds} />);
      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveAttribute('data-fill', 'true');
      expect(images[1]).toHaveAttribute('data-fill', 'true');
    });

    it('applies object-cover class to images', () => {
      renderWithTheme(<DualAdSection ads={mockAds} />);
      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveClass('object-cover');
      expect(images[1]).toHaveClass('object-cover');
    });

    it('applies responsive sizes to images', () => {
      renderWithTheme(<DualAdSection ads={mockAds} />);
      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveAttribute('data-sizes', '(max-width: 640px) 100vw, 50vw');
      expect(images[1]).toHaveAttribute('data-sizes', '(max-width: 640px) 100vw, 50vw');
    });

    it('sets priority to false', () => {
      renderWithTheme(<DualAdSection ads={mockAds} />);
      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveAttribute('data-priority', 'false');
      expect(images[1]).toHaveAttribute('data-priority', 'false');
    });
  });

  describe('Container styling', () => {
    it('applies w-full to outer Box', () => {
      const { container } = renderWithTheme(<DualAdSection ads={mockAds} />);
      const box = container.querySelector('.w-full');
      expect(box).toBeInTheDocument();
    });

    it('applies flex container classes', () => {
      const { container } = renderWithTheme(<DualAdSection ads={mockAds} />);
      const flexContainer = container.querySelector('.flex');
      expect(flexContainer).toHaveClass('flex-col');
      expect(flexContainer).toHaveClass('sm:flex-row');
    });

    it('applies gap classes for mobile and tablet', () => {
      const { container } = renderWithTheme(<DualAdSection ads={mockAds} />);
      const flexContainer = container.querySelector('.flex');
      expect(flexContainer).toHaveClass('gap-3');
      expect(flexContainer).toHaveClass('sm:gap-4');
    });

    it('applies w-full to flex container', () => {
      const { container } = renderWithTheme(<DualAdSection ads={mockAds} />);
      const flexContainer = container.querySelector('.flex');
      expect(flexContainer).toHaveClass('w-full');
    });
  });

  describe('Image container styling', () => {
    it('applies relative positioning to image containers', () => {
      const { container } = renderWithTheme(<DualAdSection ads={mockAds} />);
      const imageContainers = container.querySelectorAll('.relative');
      expect(imageContainers.length).toBeGreaterThanOrEqual(2);
    });

    it('applies w-full to image containers', () => {
      const { container } = renderWithTheme(<DualAdSection ads={mockAds} />);
      const imageContainers = container.querySelectorAll('.relative');
      imageContainers.forEach((container) => {
        expect(container).toHaveClass('w-full');
      });
    });

    it('applies overflow-hidden to image containers', () => {
      const { container } = renderWithTheme(<DualAdSection ads={mockAds} />);
      const imageContainers = container.querySelectorAll('.overflow-hidden');
      expect(imageContainers.length).toBeGreaterThanOrEqual(2);
    });

    it('applies rounded-lg to image containers', () => {
      const { container } = renderWithTheme(<DualAdSection ads={mockAds} />);
      const imageContainers = container.querySelectorAll('.rounded-lg');
      expect(imageContainers.length).toBeGreaterThanOrEqual(2);
    });

    it('applies mobile aspect ratio', () => {
      const { container } = renderWithTheme(<DualAdSection ads={mockAds} />);
      const imageContainers = container.querySelectorAll('.aspect-\\[16\\/9\\]');
      expect(imageContainers.length).toBe(2);
    });

    it('applies tablet+ aspect ratio', () => {
      const { container } = renderWithTheme(<DualAdSection ads={mockAds} />);
      const imageContainers = container.querySelectorAll('.sm\\:aspect-\\[892\\/500\\]');
      expect(imageContainers.length).toBe(2);
    });
  });

  describe('Radix UI components', () => {
    it('uses Box component', () => {
      const { container } = renderWithTheme(<DualAdSection ads={mockAds} />);
      const box = container.querySelector('[class*="rt-Box"]');
      expect(box).toBeInTheDocument();
    });
  });

  describe('Props interface', () => {
    it('accepts ads prop with exactly 2 items', () => {
      const { container } = renderWithTheme(<DualAdSection ads={mockAds} />);
      expect(container).toBeInTheDocument();
    });

    it('renders both ads in correct order', () => {
      renderWithTheme(<DualAdSection ads={mockAds} />);
      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveAttribute('src', 'https://example.com/ad1.jpg');
      expect(images[1]).toHaveAttribute('src', 'https://example.com/ad2.jpg');
    });
  });

  describe('Responsive behavior', () => {
    it('stacks vertically on mobile (flex-col)', () => {
      const { container } = renderWithTheme(<DualAdSection ads={mockAds} />);
      const flexContainer = container.querySelector('.flex-col');
      expect(flexContainer).toBeInTheDocument();
    });

    it('displays side by side on tablet+ (sm:flex-row)', () => {
      const { container } = renderWithTheme(<DualAdSection ads={mockAds} />);
      const flexContainer = container.querySelector('.sm\\:flex-row');
      expect(flexContainer).toBeInTheDocument();
    });

    it('uses different gaps for mobile and tablet+', () => {
      const { container } = renderWithTheme(<DualAdSection ads={mockAds} />);
      const flexContainer = container.querySelector('.gap-3');
      expect(flexContainer).toHaveClass('sm:gap-4');
    });

    it('uses 16:9 aspect ratio on mobile', () => {
      const { container } = renderWithTheme(<DualAdSection ads={mockAds} />);
      const imageContainers = container.querySelectorAll('.aspect-\\[16\\/9\\]');
      expect(imageContainers.length).toBe(2);
    });

    it('uses 892:500 aspect ratio on tablet+', () => {
      const { container } = renderWithTheme(<DualAdSection ads={mockAds} />);
      const imageContainers = container.querySelectorAll('.sm\\:aspect-\\[892\\/500\\]');
      expect(imageContainers.length).toBe(2);
    });
  });

  describe('Mixed href scenarios', () => {
    it('renders first ad with link, second without', () => {
      const mixedAds: [any, any] = [
        { imageUrl: 'https://example.com/ad1.jpg', href: 'https://example.com/page1' },
        { imageUrl: 'https://example.com/ad2.jpg' },
      ];
      const { container } = renderWithTheme(<DualAdSection ads={mixedAds} />);
      const links = container.querySelectorAll('a');
      expect(links.length).toBe(1);
      expect(links[0]).toHaveAttribute('href', 'https://example.com/page1');
    });

    it('renders first ad without link, second with', () => {
      const mixedAds: [any, any] = [
        { imageUrl: 'https://example.com/ad1.jpg' },
        { imageUrl: 'https://example.com/ad2.jpg', href: 'https://example.com/page2' },
      ];
      const { container } = renderWithTheme(<DualAdSection ads={mixedAds} />);
      const links = container.querySelectorAll('a');
      expect(links.length).toBe(1);
      expect(links[0]).toHaveAttribute('href', 'https://example.com/page2');
    });
  });

  describe('Edge cases', () => {
    it('handles very long URLs', () => {
      const longUrlAds: [any, any] = [
        { imageUrl: 'https://example.com/' + 'a'.repeat(200) + '.jpg' },
        { imageUrl: 'https://example.com/' + 'b'.repeat(200) + '.jpg' },
      ];
      const { container } = renderWithTheme(<DualAdSection ads={longUrlAds} />);
      expect(container).toBeInTheDocument();
    });

    it('handles special characters in alt text', () => {
      const specialAds: [any, any] = [
        { imageUrl: 'https://example.com/ad1.jpg', alt: 'Ad with "quotes" & symbols' },
        { imageUrl: 'https://example.com/ad2.jpg', alt: "Ad with 'apostrophe'" },
      ];
      renderWithTheme(<DualAdSection ads={specialAds} />);
      expect(screen.getByAltText('Ad with "quotes" & symbols')).toBeInTheDocument();
      expect(screen.getByAltText("Ad with 'apostrophe'")).toBeInTheDocument();
    });
  });
});
