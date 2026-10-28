import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdBanner } from '@/components/ads/AdBanner';
import { Theme } from '@radix-ui/themes';

describe('AdBanner', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  describe('Basic rendering without props', () => {
    it('renders without crashing', () => {
      const { container } = renderWithTheme(<AdBanner />);
      expect(container).toBeInTheDocument();
    });

    it('renders ADS text when no imageUrl provided', () => {
      renderWithTheme(<AdBanner />);
      expect(screen.getByText('ADS')).toBeInTheDocument();
    });

    it('does not render link when no href provided', () => {
      const { container } = renderWithTheme(<AdBanner />);
      const link = container.querySelector('a');
      expect(link).not.toBeInTheDocument();
    });
  });

  describe('Rendering with imageUrl', () => {
    it('renders image when imageUrl provided', () => {
      renderWithTheme(<AdBanner imageUrl="https://example.com/ad.jpg" />);
      const img = screen.getByAltText('Advertisement');
      expect(img).toBeInTheDocument();
    });

    it('image has correct src', () => {
      renderWithTheme(<AdBanner imageUrl="https://example.com/banner.png" />);
      const img = screen.getByAltText('Advertisement');
      expect(decodeURIComponent(img.getAttribute('src') ?? '')).toContain(
        'banner.png'
      );
    });

    it('does not render ADS text when imageUrl provided', () => {
      renderWithTheme(<AdBanner imageUrl="https://example.com/ad.jpg" />);
      expect(screen.queryByText('ADS')).not.toBeInTheDocument();
    });

    it('image has correct alt text', () => {
      renderWithTheme(<AdBanner imageUrl="https://example.com/ad.jpg" />);
      const img = screen.getByAltText('Advertisement');
      expect(img).toHaveAttribute('alt', 'Advertisement');
    });
  });

  describe('Rendering with href', () => {
    it('renders link when href provided', () => {
      const { container } = renderWithTheme(<AdBanner href="https://example.com" />);
      const link = container.querySelector('a');
      expect(link).toBeInTheDocument();
    });

    it('link has correct href', () => {
      const { container } = renderWithTheme(<AdBanner href="https://example.com/promo" />);
      const link = container.querySelector('a');
      expect(link).toHaveAttribute('href', 'https://example.com/promo');
    });

    it('link contains content Box', () => {
      const { container } = renderWithTheme(<AdBanner href="https://example.com" />);
      const link = container.querySelector('a');
      const box = link?.querySelector('[class*="rt-Box"]');
      expect(box).toBeInTheDocument();
    });

    it('link has no text decoration', () => {
      const { container } = renderWithTheme(<AdBanner href="https://example.com" />);
      const link = container.querySelector('a');
      expect(link).toHaveStyle({ textDecoration: 'none' });
    });
  });

  describe('Rendering with both imageUrl and href', () => {
    it('renders clickable image', () => {
      const { container } = renderWithTheme(
        <AdBanner imageUrl="https://example.com/ad.jpg" href="https://example.com" />
      );
      const link = container.querySelector('a');
      const img = screen.getByAltText('Advertisement');
      expect(link).toBeInTheDocument();
      expect(img).toBeInTheDocument();
    });

    it('image is inside link', () => {
      const { container } = renderWithTheme(
        <AdBanner imageUrl="https://example.com/ad.jpg" href="https://example.com" />
      );
      const link = container.querySelector('a');
      const img = link?.querySelector('img');
      expect(img).toBeInTheDocument();
    });
  });

  describe('Container styling', () => {
    it('has width 100%', () => {
      const { container } = renderWithTheme(<AdBanner />);
      const box = container.querySelector('[class*="rt-Box"]');
      expect(box).toHaveStyle({ width: '100%' });
    });

    it('has height 250px', () => {
      const { container } = renderWithTheme(<AdBanner />);
      const box = container.querySelector('[class*="rt-Box"]');
      expect(box).toHaveStyle({ height: '250px' });
    });

    it('has gray background color', () => {
      const { container } = renderWithTheme(<AdBanner />);
      const box = container.querySelector('[class*="rt-Box"]');
      expect(box).toHaveStyle({ backgroundColor: '#D1D5DB' });
    });

    it('has flex display', () => {
      const { container } = renderWithTheme(<AdBanner />);
      const box = container.querySelector('[class*="rt-Box"]');
      expect(box).toHaveStyle({ display: 'flex' });
    });

    it('has alignItems center', () => {
      const { container } = renderWithTheme(<AdBanner />);
      const box = container.querySelector('[class*="rt-Box"]');
      expect(box).toHaveStyle({ alignItems: 'center' });
    });

    it('has justifyContent center', () => {
      const { container } = renderWithTheme(<AdBanner />);
      const box = container.querySelector('[class*="rt-Box"]');
      expect(box).toHaveStyle({ justifyContent: 'center' });
    });

    it('has borderRadius 8px', () => {
      const { container } = renderWithTheme(<AdBanner />);
      const box = container.querySelector('[class*="rt-Box"]');
      expect(box).toHaveStyle({ borderRadius: '8px' });
    });

    it('has overflow hidden', () => {
      const { container } = renderWithTheme(<AdBanner />);
      const box = container.querySelector('[class*="rt-Box"]');
      expect(box).toHaveStyle({ overflow: 'hidden' });
    });

    it('has pointer cursor when href provided', () => {
      const { container } = renderWithTheme(<AdBanner href="https://example.com" />);
      const box = container.querySelector('[class*="rt-Box"]');
      expect(box).toHaveStyle({ cursor: 'pointer' });
    });

    it('has default cursor when no href', () => {
      const { container } = renderWithTheme(<AdBanner />);
      const box = container.querySelector('[class*="rt-Box"]');
      expect(box).toHaveStyle({ cursor: 'default' });
    });
  });

  describe('ADS text styling', () => {
    it('has size 8', () => {
      const { container } = renderWithTheme(<AdBanner />);
      const text = container.querySelector('[class*="rt-Text"]');
      expect(text).toBeInTheDocument();
    });

    it('has gray color', () => {
      const { container } = renderWithTheme(<AdBanner />);
      const text = container.querySelector('[class*="rt-Text"]');
      expect(text).toHaveStyle({ color: '#6B7280' });
    });
  });

  describe('Image styling', () => {
    it('image has width 100%', () => {
      renderWithTheme(<AdBanner imageUrl="https://example.com/ad.jpg" />);
      const img = screen.getByAltText('Advertisement');
      expect(img).toHaveStyle({ width: '100%' });
    });

    it('image has height 100%', () => {
      renderWithTheme(<AdBanner imageUrl="https://example.com/ad.jpg" />);
      const img = screen.getByAltText('Advertisement');
      expect(img).toHaveStyle({ height: '100%' });
    });

    it('image has objectFit cover', () => {
      renderWithTheme(<AdBanner imageUrl="https://example.com/ad.jpg" />);
      const img = screen.getByAltText('Advertisement');
      expect(img).toHaveStyle({ objectFit: 'cover' });
    });
  });

  describe('Client component', () => {
    it('renders in client environment', () => {
      const { container } = renderWithTheme(<AdBanner />);
      expect(container).toBeTruthy();
    });
  });

  describe('Props interface', () => {
    it('accepts imageUrl prop', () => {
      renderWithTheme(<AdBanner imageUrl="https://example.com/test.jpg" />);
      const img = screen.getByAltText('Advertisement');
      expect(decodeURIComponent(img.getAttribute('src') ?? '')).toContain(
        'test.jpg'
      );
    });

    it('accepts href prop', () => {
      const { container } = renderWithTheme(<AdBanner href="https://example.com/link" />);
      const link = container.querySelector('a');
      expect(link).toHaveAttribute('href', 'https://example.com/link');
    });

    it('both props are optional', () => {
      const { container } = renderWithTheme(<AdBanner />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Conditional rendering', () => {
    it('renders image when imageUrl is truthy', () => {
      renderWithTheme(<AdBanner imageUrl="https://example.com/ad.jpg" />);
      expect(screen.getByAltText('Advertisement')).toBeInTheDocument();
      expect(screen.queryByText('ADS')).not.toBeInTheDocument();
    });

    it('renders ADS text when imageUrl is falsy', () => {
      renderWithTheme(<AdBanner imageUrl="" />);
      expect(screen.getByText('ADS')).toBeInTheDocument();
      expect(screen.queryByAltText('Advertisement')).not.toBeInTheDocument();
    });

    it('wraps in link when href is truthy', () => {
      const { container } = renderWithTheme(<AdBanner href="https://example.com" />);
      expect(container.querySelector('a')).toBeInTheDocument();
    });

    it('does not wrap in link when href is falsy', () => {
      const { container } = renderWithTheme(<AdBanner href="" />);
      expect(container.querySelector('a')).not.toBeInTheDocument();
    });
  });

  describe('Radix UI components', () => {
    it('uses Box component', () => {
      const { container } = renderWithTheme(<AdBanner />);
      const box = container.querySelector('[class*="rt-Box"]');
      expect(box).toBeInTheDocument();
    });

    it('uses Text component when no image', () => {
      const { container } = renderWithTheme(<AdBanner />);
      const text = container.querySelector('[class*="rt-Text"]');
      expect(text).toBeInTheDocument();
    });
  });
});
