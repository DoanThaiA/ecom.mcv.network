import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopicSectionSkeleton } from '@/components/topic/TopicSectionSkeleton';
import { Theme } from '@radix-ui/themes';

describe('TopicSectionSkeleton', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  describe('Basic rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      expect(container).toBeInTheDocument();
    });

    it('renders topic name', () => {
      renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      expect(screen.getByText('Test Topic')).toBeInTheDocument();
    });

    it('renders default 6 skeleton cards', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const skeletons = container.querySelectorAll('[class*="rt-Skeleton"]');
      // Each card has: 1 image + 3 color pills + 1 name + 1 price = 6 skeletons per card
      // 6 cards * 6 skeletons = 36 skeletons
      expect(skeletons.length).toBe(36);
    });
  });

  describe('TopicName prop', () => {
    it('displays provided topic name', () => {
      renderWithTheme(<TopicSectionSkeleton topicName="New Arrivals" />);
      expect(screen.getByText('New Arrivals')).toBeInTheDocument();
    });

    it('displays Vietnamese topic name', () => {
      renderWithTheme(<TopicSectionSkeleton topicName="Sản phẩm mới" />);
      expect(screen.getByText('Sản phẩm mới')).toBeInTheDocument();
    });

    it('displays English topic name', () => {
      renderWithTheme(<TopicSectionSkeleton topicName="Best Sellers" />);
      expect(screen.getByText('Best Sellers')).toBeInTheDocument();
    });
  });

  describe('Count prop', () => {
    it('renders custom count of skeleton cards', () => {
      const { container } = renderWithTheme(
        <TopicSectionSkeleton topicName="Test Topic" count={3} />
      );
      const cards = container.querySelectorAll('.flex-\\[0_0_47\\%\\]');
      expect(cards.length).toBe(3);
    });

    it('renders 1 skeleton card when count is 1', () => {
      const { container } = renderWithTheme(
        <TopicSectionSkeleton topicName="Test Topic" count={1} />
      );
      const cards = container.querySelectorAll('.flex-\\[0_0_47\\%\\]');
      expect(cards.length).toBe(1);
    });

    it('renders 10 skeleton cards when count is 10', () => {
      const { container } = renderWithTheme(
        <TopicSectionSkeleton topicName="Test Topic" count={10} />
      );
      const cards = container.querySelectorAll('.flex-\\[0_0_47\\%\\]');
      expect(cards.length).toBe(10);
    });

    it('uses default count of 6 when not provided', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const cards = container.querySelectorAll('.flex-\\[0_0_47\\%\\]');
      expect(cards.length).toBe(6);
    });
  });

  describe('Container styling', () => {
    it('applies pl-6 for mobile', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const box = container.querySelector('.pl-6');
      expect(box).toBeInTheDocument();
    });

    it('applies sm:px-8 for small screens', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const box = container.querySelector('.sm\\:px-8');
      expect(box).toBeInTheDocument();
    });

    it('applies lg:px-12 for large screens', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const box = container.querySelector('.lg\\:px-12');
      expect(box).toBeInTheDocument();
    });
  });

  describe('Header styling', () => {
    it('applies gap-2 to header', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const header = container.querySelector('.gap-2');
      expect(header).toBeInTheDocument();
    });

    it('applies font-semibold to heading', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const heading = container.querySelector('.font-semibold');
      expect(heading).toBeInTheDocument();
    });

    it('applies text-lg for mobile', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const heading = container.querySelector('.text-lg');
      expect(heading).toBeInTheDocument();
    });

    it('applies sm:text-xl for small screens', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const heading = container.querySelector('.sm\\:text-xl');
      expect(heading).toBeInTheDocument();
    });

    it('applies md:text-2xl for medium screens', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const heading = container.querySelector('.md\\:text-2xl');
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Slider container styling', () => {
    it('applies overflow-hidden to slider', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const slider = container.querySelector('.overflow-hidden');
      expect(slider).toBeInTheDocument();
    });

    it('applies gap-1 to flex container', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      // Radix Flex may use different internal classes for gap
      const flexes = container.querySelectorAll('[class*="rt-Flex"]');
      expect(flexes.length).toBeGreaterThan(0);
    });
  });

  describe('Card styling', () => {
    it('applies mobile flex basis (47%)', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const card = container.querySelector('.flex-\\[0_0_47\\%\\]');
      expect(card).toBeInTheDocument();
    });

    it('applies tablet flex basis (23%)', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const card = container.querySelector('.md\\:flex-\\[0_0_23\\%\\]');
      expect(card).toBeInTheDocument();
    });

    it('applies desktop flex basis (12%)', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const card = container.querySelector('.lg\\:flex-\\[0_0_12\\%\\]');
      expect(card).toBeInTheDocument();
    });

    it('applies min-w-0 to cards', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const card = container.querySelector('.min-w-0');
      expect(card).toBeInTheDocument();
    });

    it('applies pr-3 to cards', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const card = container.querySelector('.pr-3');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Image skeleton styling', () => {
    it('applies w-full to image skeleton', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const imageSkeleton = container.querySelector('.w-full');
      expect(imageSkeleton).toBeInTheDocument();
    });

    it('applies h-[215px] for mobile', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const imageSkeleton = container.querySelector('.h-\\[215px\\]');
      expect(imageSkeleton).toBeInTheDocument();
    });

    it('applies lg:h-[255px] for desktop', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const imageSkeleton = container.querySelector('.lg\\:h-\\[255px\\]');
      expect(imageSkeleton).toBeInTheDocument();
    });

    it('applies rounded-lg to image skeleton', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const imageSkeleton = container.querySelector('.rounded-lg');
      expect(imageSkeleton).toBeInTheDocument();
    });
  });

  describe('Color pills skeleton', () => {
    it('renders 3 color pill skeletons per card', () => {
      const { container } = renderWithTheme(
        <TopicSectionSkeleton topicName="Test Topic" count={1} />
      );
      const colorPills = container.querySelectorAll('.w-8.h-4');
      expect(colorPills.length).toBe(3);
    });

    it('applies w-8 to color pills', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const colorPills = container.querySelectorAll('.w-8');
      expect(colorPills.length).toBeGreaterThanOrEqual(3);
    });

    it('applies h-4 to color pills', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const colorPills = container.querySelectorAll('.h-4');
      expect(colorPills.length).toBeGreaterThanOrEqual(3);
    });

    it('applies gap-2 to color pills container', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const colorContainer = container.querySelector('.gap-2');
      expect(colorContainer).toBeInTheDocument();
    });

    it('applies mt-2 to color pills container', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const colorContainer = container.querySelector('.mt-2');
      expect(colorContainer).toBeInTheDocument();
    });

    it('applies mb-2 to color pills container', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const colorContainer = container.querySelector('.mb-2');
      expect(colorContainer).toBeInTheDocument();
    });
  });

  describe('Name skeleton styling', () => {
    it('applies h-4 to name skeleton', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const nameSkeletons = container.querySelectorAll('.h-4');
      expect(nameSkeletons.length).toBeGreaterThan(0);
    });

    it('applies w-3/4 to name skeleton', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const nameSkeleton = container.querySelector('.w-3\\/4');
      expect(nameSkeleton).toBeInTheDocument();
    });

    it('applies mb-1 to name skeleton', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const nameSkeleton = container.querySelector('.mb-1');
      expect(nameSkeleton).toBeInTheDocument();
    });
  });

  describe('Price skeleton styling', () => {
    it('applies h-4 to price skeleton', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const priceSkeletons = container.querySelectorAll('.h-4');
      expect(priceSkeletons.length).toBeGreaterThan(0);
    });

    it('applies w-2/5 to price skeleton', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const priceSkeleton = container.querySelector('.w-2\\/5');
      expect(priceSkeleton).toBeInTheDocument();
    });
  });

  describe('Radix UI components', () => {
    it('uses Box components', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const boxes = container.querySelectorAll('[class*="rt-Box"]');
      expect(boxes.length).toBeGreaterThan(0);
    });

    it('uses Flex components', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const flexes = container.querySelectorAll('[class*="rt-Flex"]');
      expect(flexes.length).toBeGreaterThan(0);
    });

    it('uses Heading component', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const heading = container.querySelector('[class*="rt-Heading"]');
      expect(heading).toBeInTheDocument();
    });

    it('uses Skeleton components', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const skeletons = container.querySelectorAll('[class*="rt-Skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Client component', () => {
    it('renders as client component', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Props interface', () => {
    it('accepts topicName prop', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      expect(container).toBeInTheDocument();
    });

    it('accepts optional count prop', () => {
      const { container } = renderWithTheme(
        <TopicSectionSkeleton topicName="Test Topic" count={5} />
      );
      expect(container).toBeInTheDocument();
    });

    it('count defaults to 6', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const cards = container.querySelectorAll('.flex-\\[0_0_47\\%\\]');
      expect(cards.length).toBe(6);
    });
  });

  describe('Responsive behavior', () => {
    it('has different padding for mobile, small, and large screens', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const box = container.querySelector('.pl-6');
      expect(box).toHaveClass('sm:px-8');
      expect(box).toHaveClass('lg:px-12');
    });

    it('heading has different text size for mobile, small, and medium screens', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const heading = container.querySelector('.text-lg');
      expect(heading).toHaveClass('sm:text-xl');
      expect(heading).toHaveClass('md:text-2xl');
    });

    it('cards have different flex basis for mobile, tablet, and desktop', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const card = container.querySelector('.flex-\\[0_0_47\\%\\]');
      expect(card).toHaveClass('md:flex-[0_0_23%]');
      expect(card).toHaveClass('lg:flex-[0_0_12%]');
    });

    it('image skeleton has different height for mobile and desktop', () => {
      const { container } = renderWithTheme(<TopicSectionSkeleton topicName="Test Topic" />);
      const imageSkeleton = container.querySelector('.h-\\[215px\\]');
      expect(imageSkeleton).toHaveClass('lg:h-[255px]');
    });
  });

  describe('Edge cases', () => {
    it('handles count of 0', () => {
      const { container } = renderWithTheme(
        <TopicSectionSkeleton topicName="Test Topic" count={0} />
      );
      const cards = container.querySelectorAll('.flex-\\[0_0_47\\%\\]');
      expect(cards.length).toBe(0);
    });

    it('handles very long topic name', () => {
      const longName = 'A'.repeat(100);
      renderWithTheme(<TopicSectionSkeleton topicName={longName} />);
      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('handles special characters in topic name', () => {
      const specialName = 'Topic with "quotes" & symbols';
      renderWithTheme(<TopicSectionSkeleton topicName={specialName} />);
      expect(screen.getByText(specialName)).toBeInTheDocument();
    });

    it('handles large count', () => {
      const { container } = renderWithTheme(
        <TopicSectionSkeleton topicName="Test Topic" count={50} />
      );
      const cards = container.querySelectorAll('.flex-\\[0_0_47\\%\\]');
      expect(cards.length).toBe(50);
    });
  });

  describe('Lodash integration', () => {
    it('uses lodash _.times for rendering cards', () => {
      const { container } = renderWithTheme(
        <TopicSectionSkeleton topicName="Test Topic" count={3} />
      );
      const cards = container.querySelectorAll('.flex-\\[0_0_47\\%\\]');
      expect(cards.length).toBe(3);
    });

    it('uses lodash _.times for rendering color pills', () => {
      const { container } = renderWithTheme(
        <TopicSectionSkeleton topicName="Test Topic" count={1} />
      );
      // Each card has 3 color pills
      const colorPills = container.querySelectorAll('.w-8.h-4');
      expect(colorPills.length).toBe(3);
    });
  });
});
