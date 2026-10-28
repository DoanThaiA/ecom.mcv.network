import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ThumbDownIcon } from '@/components/common/icons/ThumbDownIcon';
import { Theme } from '@radix-ui/themes';

describe('ThumbDownIcon', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  describe('Basic rendering', () => {
    it('renders SVG element', () => {
      const { container } = renderWithTheme(<ThumbDownIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders as inline SVG', () => {
      const { container } = renderWithTheme(<ThumbDownIcon />);
      const svg = container.querySelector('svg');
      expect(svg?.tagName).toBe('svg');
    });
  });

  describe('SVG attributes', () => {
    it('has correct width attribute', () => {
      const { container } = renderWithTheme(<ThumbDownIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '83');
    });

    it('has correct height attribute', () => {
      const { container } = renderWithTheme(<ThumbDownIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('height', '56');
    });

    it('has correct viewBox attribute', () => {
      const { container } = renderWithTheme(<ThumbDownIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 83 56');
    });

    it('has fill="none" attribute', () => {
      const { container } = renderWithTheme(<ThumbDownIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('fill', 'none');
    });

    it('has correct xmlns attribute', () => {
      const { container } = renderWithTheme(<ThumbDownIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    });
  });

  describe('className prop', () => {
    it('applies no className by default', () => {
      const { container } = renderWithTheme(<ThumbDownIcon />);
      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('class')).toBeFalsy();
    });

    it('applies custom className when provided', () => {
      const { container } = renderWithTheme(<ThumbDownIcon className="custom-icon" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('custom-icon');
    });

    it('applies multiple classes when provided', () => {
      const { container } = renderWithTheme(
        <ThumbDownIcon className="text-red-500 w-8 h-8" />
      );
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-red-500');
      expect(svg).toHaveClass('w-8');
      expect(svg).toHaveClass('h-8');
    });
  });

  describe('selected prop - unselected state', () => {
    it('defaults to unselected when prop not provided', () => {
      const { container } = renderWithTheme(<ThumbDownIcon />);
      const rect = container.querySelector('rect');
      expect(rect).toHaveAttribute('fill', 'white');
    });

    it('renders white fill for rect when selected is false', () => {
      const { container } = renderWithTheme(<ThumbDownIcon selected={false} />);
      const rect = container.querySelector('rect');
      expect(rect).toHaveAttribute('fill', 'white');
    });

    it('renders stroke for rect when unselected', () => {
      const { container } = renderWithTheme(<ThumbDownIcon selected={false} />);
      const rect = container.querySelector('rect');
      expect(rect).toHaveAttribute('stroke', '#E2E2E2');
    });

    it('renders black fill for paths when unselected', () => {
      const { container } = renderWithTheme(<ThumbDownIcon selected={false} />);
      const paths = container.querySelectorAll('path');
      paths.forEach((path) => {
        expect(path).toHaveAttribute('fill', 'black');
      });
    });
  });

  describe('selected prop - selected state', () => {
    it('renders gradient fill for rect when selected is true', () => {
      const { container } = renderWithTheme(<ThumbDownIcon selected={true} />);
      const rect = container.querySelector('rect');
      expect(rect).toHaveAttribute('fill', 'url(#thumb-down-gradient-bg)');
    });

    it('renders no stroke for rect when selected', () => {
      const { container } = renderWithTheme(<ThumbDownIcon selected={true} />);
      const rect = container.querySelector('rect');
      expect(rect).toHaveAttribute('stroke', 'none');
    });

    it('renders white fill for paths when selected', () => {
      const { container } = renderWithTheme(<ThumbDownIcon selected={true} />);
      const paths = container.querySelectorAll('path');
      paths.forEach((path) => {
        expect(path).toHaveAttribute('fill', 'white');
      });
    });
  });

  describe('SVG structure', () => {
    it('contains rect element', () => {
      const { container } = renderWithTheme(<ThumbDownIcon />);
      const rect = container.querySelector('rect');
      expect(rect).toBeInTheDocument();
    });

    it('rect has correct x position', () => {
      const { container } = renderWithTheme(<ThumbDownIcon />);
      const rect = container.querySelector('rect');
      expect(rect).toHaveAttribute('x', '0.268555');
    });

    it('rect has correct y position', () => {
      const { container } = renderWithTheme(<ThumbDownIcon />);
      const rect = container.querySelector('rect');
      expect(rect).toHaveAttribute('y', '0.268555');
    });

    it('rect has correct width', () => {
      const { container } = renderWithTheme(<ThumbDownIcon />);
      const rect = container.querySelector('rect');
      expect(rect).toHaveAttribute('width', '82.1855');
    });

    it('rect has correct height', () => {
      const { container } = renderWithTheme(<ThumbDownIcon />);
      const rect = container.querySelector('rect');
      expect(rect).toHaveAttribute('height', '55.463');
    });

    it('rect has rounded corners', () => {
      const { container } = renderWithTheme(<ThumbDownIcon />);
      const rect = container.querySelector('rect');
      expect(rect).toHaveAttribute('rx', '7.73');
    });

    it('contains path elements', () => {
      const { container } = renderWithTheme(<ThumbDownIcon />);
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBeGreaterThan(0);
    });

    it('contains exactly 2 path elements', () => {
      const { container } = renderWithTheme(<ThumbDownIcon />);
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBe(2);
    });

    it('paths have d attribute', () => {
      const { container } = renderWithTheme(<ThumbDownIcon />);
      const paths = container.querySelectorAll('path');
      paths.forEach((path) => {
        expect(path).toHaveAttribute('d');
        expect(path.getAttribute('d')).toBeTruthy();
      });
    });

    it('contains g elements with transform', () => {
      const { container } = renderWithTheme(<ThumbDownIcon />);
      const groups = container.querySelectorAll('g');
      expect(groups.length).toBeGreaterThan(0);
    });

    it('contains defs element', () => {
      const { container } = renderWithTheme(<ThumbDownIcon />);
      const defs = container.querySelector('defs');
      expect(defs).toBeInTheDocument();
    });

    it('contains linearGradient in defs', () => {
      const { container } = renderWithTheme(<ThumbDownIcon />);
      const gradient = container.querySelector('linearGradient');
      expect(gradient).toBeInTheDocument();
    });

    it('linearGradient has correct id', () => {
      const { container } = renderWithTheme(<ThumbDownIcon />);
      const gradient = container.querySelector('linearGradient');
      expect(gradient).toHaveAttribute('id', 'thumb-down-gradient-bg');
    });

    it('linearGradient contains stop elements', () => {
      const { container } = renderWithTheme(<ThumbDownIcon />);
      const stops = container.querySelectorAll('stop');
      expect(stops.length).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    it('renders with empty className', () => {
      const { container } = renderWithTheme(<ThumbDownIcon className="" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders with undefined className', () => {
      const { container } = renderWithTheme(<ThumbDownIcon className={undefined} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders with undefined selected', () => {
      const { container } = renderWithTheme(<ThumbDownIcon selected={undefined} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      const rect = container.querySelector('rect');
      expect(rect).toHaveAttribute('fill', 'white');
    });
  });

  describe('Combined props', () => {
    it('applies className when selected is true', () => {
      const { container } = renderWithTheme(
        <ThumbDownIcon selected={true} className="custom-class" />
      );
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('custom-class');
      const rect = container.querySelector('rect');
      expect(rect).toHaveAttribute('fill', 'url(#thumb-down-gradient-bg)');
    });

    it('applies className when selected is false', () => {
      const { container } = renderWithTheme(
        <ThumbDownIcon selected={false} className="custom-class" />
      );
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('custom-class');
      const rect = container.querySelector('rect');
      expect(rect).toHaveAttribute('fill', 'white');
    });
  });
});
