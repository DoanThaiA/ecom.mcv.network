import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LocationPinIcon } from '@/components/common/icons/LocationPinIcon';
import { Theme } from '@radix-ui/themes';

describe('LocationPinIcon', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  describe('Basic rendering', () => {
    it('renders SVG element', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders as inline SVG', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const svg = container.querySelector('svg');
      expect(svg?.tagName).toBe('svg');
    });
  });

  describe('SVG attributes', () => {
    it('has correct width attribute', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '24');
    });

    it('has correct height attribute', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('height', '34');
    });

    it('has correct viewBox attribute', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 34');
    });

    it('has fill="none" attribute', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('fill', 'none');
    });

    it('has correct xmlns attribute', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    });
  });

  describe('className prop', () => {
    it('applies no className by default', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('class')).toBeFalsy();
    });

    it('applies custom className when provided', () => {
      const { container } = renderWithTheme(<LocationPinIcon className="custom-icon" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('custom-icon');
    });

    it('applies multiple classes when provided', () => {
      const { container } = renderWithTheme(
        <LocationPinIcon className="text-red-500 w-8 h-8" />
      );
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-red-500');
      expect(svg).toHaveClass('w-8');
      expect(svg).toHaveClass('h-8');
    });
  });

  describe('SVG paths', () => {
    it('contains path elements', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBeGreaterThan(0);
    });

    it('contains exactly 2 path elements', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBe(2);
    });

    it('first path has fill attribute', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const paths = container.querySelectorAll('path');
      expect(paths[0]).toHaveAttribute('fill', 'currentColor');
    });

    it('second path has fill attribute', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const paths = container.querySelectorAll('path');
      expect(paths[1]).toHaveAttribute('fill', 'currentColor');
    });

    it('first path has d attribute', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const paths = container.querySelectorAll('path');
      expect(paths[0]).toHaveAttribute('d');
      expect(paths[0].getAttribute('d')).toBeTruthy();
    });

    it('second path has d attribute', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const paths = container.querySelectorAll('path');
      expect(paths[1]).toHaveAttribute('d');
      expect(paths[1].getAttribute('d')).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('renders with empty className', () => {
      const { container } = renderWithTheme(<LocationPinIcon className="" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders with undefined className', () => {
      const { container } = renderWithTheme(<LocationPinIcon className={undefined} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('is an inline graphic element', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const svg = container.querySelector('svg');
      expect(svg?.tagName.toLowerCase()).toBe('svg');
    });

    it('can be styled with className for color', () => {
      const { container } = renderWithTheme(<LocationPinIcon className="text-blue-500" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-blue-500');
    });
  });
});
