import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LocationPinIcon } from '@/components/common/icons/LocationPinIcon';
import { Theme } from '@radix-ui/themes';

describe('LocationPinIcon', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  describe('Basic rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      expect(container).toBeInTheDocument();
    });

    it('renders svg element', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders two path elements', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBe(2);
    });
  });

  describe('SVG attributes', () => {
    it('has width of 24', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '24');
    });

    it('has height of 34', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('height', '34');
    });

    it('has correct viewBox', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 34');
    });

    it('has fill="none" attribute', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('fill', 'none');
    });

    it('has correct xmlns', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    });
  });

  describe('Path elements', () => {
    it('first path has fill="currentColor"', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const paths = container.querySelectorAll('path');
      expect(paths[0]).toHaveAttribute('fill', 'currentColor');
    });

    it('second path has fill="currentColor"', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const paths = container.querySelectorAll('path');
      expect(paths[1]).toHaveAttribute('fill', 'currentColor');
    });

    it('first path has correct d attribute', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const paths = container.querySelectorAll('path');
      expect(paths[0]).toHaveAttribute(
        'd',
        'M20.4906 30.5189C20.4906 32.3389 16.6106 33.8189 11.8206 33.8189C7.03062 33.8189 3.14062 32.3489 3.14062 30.5189C3.14062 29.4389 4.50063 28.4789 6.61063 27.8789C8.28063 29.2689 10.0506 29.9989 11.8206 29.9989C13.5906 29.9989 15.3706 29.2689 17.0306 27.8789C19.1406 28.4789 20.5006 29.4389 20.5006 30.5189'
      );
    });

    it('second path has correct d attribute', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const paths = container.querySelectorAll('path');
      expect(paths[1]).toHaveAttribute(
        'd',
        'M11.82 0C5.29001 0 0 5.29001 0 11.81C0 16.78 3.07001 24.35 7.42001 27.67C8.78001 28.71 10.27 29.34 11.82 29.34C13.37 29.34 14.86 28.72 16.22 27.67C20.56 24.35 23.63 16.78 23.63 11.82C23.63 5.3 18.34 0.0100021 11.82 0.0100021M11.82 15.85C8.75001 15.85 6.27002 13.36 6.27002 10.3C6.27002 7.24 8.76001 4.75 11.82 4.75C14.88 4.75 17.37 7.24 17.37 10.3C17.37 13.36 14.89 15.85 11.82 15.85Z'
      );
    });
  });

  describe('ClassName prop', () => {
    it('applies no className when not provided', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const svg = container.querySelector('svg');
      expect(svg?.getAttribute("class")).toBeNull();
    });

    it('applies custom className when provided', () => {
      const { container } = renderWithTheme(<LocationPinIcon className="custom-class" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('custom-class');
    });

    it('applies multiple classes', () => {
      const { container } = renderWithTheme(
        <LocationPinIcon className="text-red-500 w-6 h-6" />
      );
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-red-500');
      expect(svg).toHaveClass('w-6');
      expect(svg).toHaveClass('h-6');
    });

    it('applies Tailwind color classes', () => {
      const { container } = renderWithTheme(<LocationPinIcon className="text-blue-600" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-blue-600');
    });

    it('applies Tailwind size classes', () => {
      const { container } = renderWithTheme(<LocationPinIcon className="w-8 h-8" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-8');
      expect(svg).toHaveClass('h-8');
    });
  });

  describe('Props interface', () => {
    it('className is optional', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      expect(container).toBeInTheDocument();
    });

    it('accepts string className', () => {
      const { container } = renderWithTheme(<LocationPinIcon className="test-class" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('test-class');
    });
  });

  describe('currentColor fill', () => {
    it('uses currentColor for dynamic coloring', () => {
      const { container } = renderWithTheme(<LocationPinIcon className="text-green-500" />);
      const paths = container.querySelectorAll('path');
      expect(paths[0]).toHaveAttribute('fill', 'currentColor');
      expect(paths[1]).toHaveAttribute('fill', 'currentColor');
    });

    it('both paths inherit text color', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const paths = container.querySelectorAll('path');
      Array.from(paths).forEach((path) => {
        expect(path).toHaveAttribute('fill', 'currentColor');
      });
    });
  });

  describe('Icon structure', () => {
    it('has consistent path structure', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const svg = container.querySelector('svg');
      const paths = svg?.querySelectorAll('path');
      expect(paths?.length).toBe(2);
    });

    it('svg is direct child of container', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const svg = container.querySelector('svg');
      expect(svg?.parentElement).toBe(container.firstChild);
    });
  });

  describe('No extra props', () => {
    it('does not accept onClick prop', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const svg = container.querySelector('svg');
      expect(svg).not.toHaveAttribute('onClick');
    });

    it('renders as static icon', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Aspect ratio', () => {
    it('has portrait aspect ratio (24:34)', () => {
      const { container } = renderWithTheme(<LocationPinIcon />);
      const svg = container.querySelector('svg');
      const width = svg?.getAttribute('width');
      const height = svg?.getAttribute('height');
      expect(width).toBe('24');
      expect(height).toBe('34');
      // 24/34 ≈ 0.706
      expect(Number(width) / Number(height)).toBeCloseTo(0.706, 2);
    });
  });

  describe('Rendering variations', () => {
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

    it('renders multiple instances independently', () => {
      const { container } = renderWithTheme(
        <div>
          <LocationPinIcon className="first" />
          <LocationPinIcon className="second" />
          <LocationPinIcon className="third" />
        </div>
      );
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(3);
      expect(svgs[0]).toHaveClass('first');
      expect(svgs[1]).toHaveClass('second');
      expect(svgs[2]).toHaveClass('third');
    });
  });
});
