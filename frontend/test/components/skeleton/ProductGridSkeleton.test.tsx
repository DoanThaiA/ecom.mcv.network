import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ProductGridSkeleton } from '@/components/skeleton/ProductGridSkeleton';
import { Theme } from '@radix-ui/themes';

describe('ProductGridSkeleton', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  describe('Basic rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton />);
      expect(container).toBeInTheDocument();
    });

    it('renders with default count of 8 items', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton />);
      const items = container.querySelectorAll('.flex.flex-col.gap-2');
      expect(items.length).toBe(8);
    });

    it('renders with custom count', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton count={5} />);
      const items = container.querySelectorAll('.flex.flex-col.gap-2');
      expect(items.length).toBe(5);
    });

    it('renders with count of 1', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton count={1} />);
      const items = container.querySelectorAll('.flex.flex-col.gap-2');
      expect(items.length).toBe(1);
    });

    it('renders with count of 12', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton count={12} />);
      const items = container.querySelectorAll('.flex.flex-col.gap-2');
      expect(items.length).toBe(12);
    });
  });

  describe('Grid layout', () => {
    it('applies grid layout to container', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton />);
      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });

    it('applies grid-cols-2 for mobile', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton />);
      const grid = container.querySelector('.grid-cols-2');
      expect(grid).toBeInTheDocument();
    });

    it('applies md:grid-cols-5 for tablet', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton />);
      const grid = container.querySelector('.md\\:grid-cols-5');
      expect(grid).toBeInTheDocument();
    });

    it('applies lg:grid-cols-6 for desktop', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton />);
      const grid = container.querySelector('.lg\\:grid-cols-6');
      expect(grid).toBeInTheDocument();
    });

    it('applies xl:grid-cols-7 for large desktop', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton />);
      const grid = container.querySelector('.xl\\:grid-cols-7');
      expect(grid).toBeInTheDocument();
    });

    it('applies gap-4 for mobile', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton />);
      const grid = container.querySelector('.gap-4');
      expect(grid).toBeInTheDocument();
    });

    it('applies lg:gap-6 for desktop', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton />);
      const grid = container.querySelector('.lg\\:gap-6');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Skeleton item structure', () => {
    it('each item has flex column layout', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton count={1} />);
      const item = container.querySelector('.flex.flex-col.gap-2');
      expect(item).toBeInTheDocument();
    });

    it('each item has image skeleton', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton count={1} />);
      const imageBox = container.querySelector('.aspect-\\[3\\/4\\]');
      expect(imageBox).toBeInTheDocument();
    });

    it('image skeleton has aspect ratio 3/4', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton count={1} />);
      const imageBox = container.querySelector('.aspect-\\[3\\/4\\]');
      expect(imageBox).toBeInTheDocument();
    });

    it('image skeleton has rounded corners', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton count={1} />);
      const imageBox = container.querySelector('.rounded-lg');
      expect(imageBox).toBeInTheDocument();
    });

    it('image skeleton has gray background', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton count={1} />);
      const imageBox = container.querySelector('.bg-gray-200');
      expect(imageBox).toBeInTheDocument();
    });

    it('each item has tag skeleton group', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton count={1} />);
      const tagGroup = container.querySelector('[class*="rt-Flex"][class*="gap"]');
      expect(tagGroup).toBeInTheDocument();
    });

    it('tag skeleton group has 3 tags', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton count={1} />);
      const tags = container.querySelectorAll('.w-8.h-4.rounded-lg');
      expect(tags.length).toBe(3);
    });

    it('each item has title skeleton', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton count={1} />);
      const title = container.querySelector('.h-4.w-3\\/4');
      expect(title).toBeInTheDocument();
    });

    it('each item has price skeleton', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton count={1} />);
      const price = container.querySelector('.h-4.w-1\\/2');
      expect(price).toBeInTheDocument();
    });
  });

  describe('Multiple items rendering', () => {
    it('renders correct number of image skeletons', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton count={4} />);
      const images = container.querySelectorAll('.aspect-\\[3\\/4\\]');
      expect(images.length).toBe(4);
    });

    it('renders correct number of tag groups', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton count={3} />);
      const tags = container.querySelectorAll('.w-8.h-4.rounded-lg');
      expect(tags.length).toBe(9); // 3 items * 3 tags each
    });

    it('renders correct number of title skeletons', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton count={5} />);
      const titles = container.querySelectorAll('.h-4.w-3\\/4');
      expect(titles.length).toBe(5);
    });

    it('renders correct number of price skeletons', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton count={6} />);
      const prices = container.querySelectorAll('.h-4.w-1\\/2');
      expect(prices.length).toBe(6);
    });
  });

  describe('Edge cases', () => {
    it('renders with count of 0', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton count={0} />);
      const items = container.querySelectorAll('.flex.flex-col.gap-2');
      expect(items.length).toBe(0);
    });

    it('renders with large count', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton count={20} />);
      const items = container.querySelectorAll('.flex.flex-col.gap-2');
      expect(items.length).toBe(20);
    });

    it('each skeleton item has unique key', () => {
      const { container } = renderWithTheme(<ProductGridSkeleton count={3} />);
      const items = container.querySelectorAll('.flex.flex-col.gap-2');
      items.forEach((item, index) => {
        expect(item).toBeInTheDocument();
      });
    });
  });
});
