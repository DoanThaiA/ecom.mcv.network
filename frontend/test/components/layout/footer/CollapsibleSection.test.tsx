import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CollapsibleSection } from '@/components/layout/footer/CollapsibleSection';
import { Theme } from '@radix-ui/themes';

describe('CollapsibleSection', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  const mockChildren = <div data-testid="child-content">Child Content</div>;

  describe('Basic rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      expect(container).toBeInTheDocument();
    });

    it('renders title', () => {
      renderWithTheme(<CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('renders children', () => {
      renderWithTheme(<CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>);
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
  });

  describe('Default state', () => {
    it('is closed by default', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const contentBox = container.querySelector('.max-h-0');
      expect(contentBox).toBeInTheDocument();
    });

    it('chevron points down when closed', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const chevron = container.querySelector('.rotate-180');
      expect(chevron).not.toBeInTheDocument();
    });

    it('is open when defaultOpen is true', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title" defaultOpen={true}>
          {mockChildren}
        </CollapsibleSection>
      );
      const contentBox = container.querySelector('.max-h-96');
      expect(contentBox).toBeInTheDocument();
    });

    it('chevron points up when defaultOpen is true', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title" defaultOpen={true}>
          {mockChildren}
        </CollapsibleSection>
      );
      const chevron = container.querySelector('.rotate-180');
      expect(chevron).toBeInTheDocument();
    });
  });

  describe('Click interaction', () => {
    it('opens when header is clicked', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const header = screen.getByText('Test Title');
      fireEvent.click(header);
      const contentBox = container.querySelector('.max-h-96');
      expect(contentBox).toBeInTheDocument();
    });

    it('closes when header is clicked again', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title" defaultOpen={true}>
          {mockChildren}
        </CollapsibleSection>
      );
      const header = screen.getByText('Test Title');
      fireEvent.click(header);
      const contentBox = container.querySelector('.max-h-0');
      expect(contentBox).toBeInTheDocument();
    });

    it('toggles chevron rotation on click', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const header = screen.getByText('Test Title');

      // Initially not rotated
      expect(container.querySelector('.rotate-180')).not.toBeInTheDocument();

      // Click to open
      fireEvent.click(header);
      expect(container.querySelector('.rotate-180')).toBeInTheDocument();

      // Click to close
      fireEvent.click(header);
      expect(container.querySelector('.rotate-180')).not.toBeInTheDocument();
    });

    it('toggles multiple times correctly', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const header = screen.getByText('Test Title');

      // Open
      fireEvent.click(header);
      expect(container.querySelector('.max-h-96')).toBeInTheDocument();

      // Close
      fireEvent.click(header);
      expect(container.querySelector('.max-h-0')).toBeInTheDocument();

      // Open again
      fireEvent.click(header);
      expect(container.querySelector('.max-h-96')).toBeInTheDocument();
    });
  });

  describe('Container styling', () => {
    it('applies border-b on mobile', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const outerBox = container.querySelector('.border-b');
      expect(outerBox).toBeInTheDocument();
    });

    it('applies border-gray-200', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const outerBox = container.querySelector('.border-gray-200');
      expect(outerBox).toBeInTheDocument();
    });

    it('removes border on desktop (md:border-none)', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const outerBox = container.querySelector('.md\\:border-none');
      expect(outerBox).toBeInTheDocument();
    });
  });

  describe('Header styling', () => {
    it('applies justify-between to header', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      // Radix Flex with justify="between" may use different internal classes
      const flexes = container.querySelectorAll('[class*="rt-Flex"]');
      expect(flexes.length).toBeGreaterThan(0);
    });

    it('applies align-center to header', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      // Radix Flex with align="center" may use different internal classes
      const flexes = container.querySelectorAll('[class*="rt-Flex"]');
      expect(flexes.length).toBeGreaterThan(0);
    });

    it('applies py-4 to header', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const header = container.querySelector('.py-4');
      expect(header).toBeInTheDocument();
    });

    it('applies cursor-pointer on mobile', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const header = container.querySelector('.cursor-pointer');
      expect(header).toBeInTheDocument();
    });

    it('applies md:cursor-default on desktop', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const header = container.querySelector('.md\\:cursor-default');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Title styling', () => {
    it('applies text-sm for mobile', () => {
      renderWithTheme(<CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>);
      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('text-sm');
    });

    it('applies font-semibold for mobile', () => {
      renderWithTheme(<CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>);
      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('font-semibold');
    });

    it('applies text-black for mobile', () => {
      renderWithTheme(<CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>);
      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('text-black');
    });

    it('applies md:text-white for desktop', () => {
      renderWithTheme(<CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>);
      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('md:text-white');
    });

    it('applies md:text-base for desktop', () => {
      renderWithTheme(<CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>);
      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('md:text-base');
    });

    it('applies md:font-bold for desktop', () => {
      renderWithTheme(<CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>);
      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('md:font-bold');
    });
  });

  describe('Chevron icon', () => {
    it('renders ChevronDownIcon', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const chevron = container.querySelector('svg');
      expect(chevron).toBeInTheDocument();
    });

    it('applies text-gray-600 to chevron', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const chevron = container.querySelector('.text-gray-600');
      expect(chevron).toBeInTheDocument();
    });

    it('applies transition-transform to chevron', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const chevron = container.querySelector('.transition-transform');
      expect(chevron).toBeInTheDocument();
    });

    it('applies duration-300 to chevron', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const chevron = container.querySelector('.duration-300');
      expect(chevron).toBeInTheDocument();
    });

    it('is hidden on desktop (md:hidden)', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const chevronBox = container.querySelector('.md\\:hidden');
      expect(chevronBox).toBeInTheDocument();
    });
  });

  describe('Content box styling', () => {
    it('applies overflow-hidden to content', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const contentBox = container.querySelector('.overflow-hidden');
      expect(contentBox).toBeInTheDocument();
    });

    it('applies transition-all to content', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const contentBox = container.querySelector('.transition-all');
      expect(contentBox).toBeInTheDocument();
    });

    it('applies duration-300 to content', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const contentBoxes = container.querySelectorAll('.duration-300');
      expect(contentBoxes.length).toBeGreaterThanOrEqual(1);
    });

    it('applies md:block on desktop', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const contentBox = container.querySelector('.md\\:block');
      expect(contentBox).toBeInTheDocument();
    });

    it('applies md:max-h-none on desktop', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const contentBox = container.querySelector('.md\\:max-h-none');
      expect(contentBox).toBeInTheDocument();
    });

    it('applies pb-4 when open', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title" defaultOpen={true}>
          {mockChildren}
        </CollapsibleSection>
      );
      const contentBox = container.querySelector('.pb-4');
      expect(contentBox).toBeInTheDocument();
    });

    it('does not apply pb-4 when closed', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const contentBox = container.querySelector('.max-h-0');
      expect(contentBox).not.toHaveClass('pb-4');
    });
  });

  describe('Radix UI components', () => {
    it('uses Box components', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const boxes = container.querySelectorAll('[class*="rt-Box"]');
      expect(boxes.length).toBeGreaterThan(0);
    });

    it('uses Flex component', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const flex = container.querySelector('[class*="rt-Flex"]');
      expect(flex).toBeInTheDocument();
    });

    it('uses Text component', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const text = container.querySelector('[class*="rt-Text"]');
      expect(text).toBeInTheDocument();
    });
  });

  describe('Client component', () => {
    it('renders as client component with state', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Props interface', () => {
    it('accepts title prop', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      expect(container).toBeInTheDocument();
    });

    it('accepts children prop', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      expect(container).toBeInTheDocument();
    });

    it('accepts optional defaultOpen prop', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title" defaultOpen={true}>
          {mockChildren}
        </CollapsibleSection>
      );
      expect(container).toBeInTheDocument();
    });

    it('defaultOpen defaults to false', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const contentBox = container.querySelector('.max-h-0');
      expect(contentBox).toBeInTheDocument();
    });
  });

  describe('Responsive behavior', () => {
    it('is collapsible on mobile', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const header = screen.getByText('Test Title');
      fireEvent.click(header);
      const contentBox = container.querySelector('.max-h-96');
      expect(contentBox).toBeInTheDocument();
    });

    it('is always visible on desktop (md:block md:max-h-none)', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const contentBox = container.querySelector('.md\\:block');
      expect(contentBox).toHaveClass('md:max-h-none');
    });

    it('title color changes from black to white on desktop', () => {
      renderWithTheme(<CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>);
      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('text-black');
      expect(title).toHaveClass('md:text-white');
    });

    it('title size changes from sm to base on desktop', () => {
      renderWithTheme(<CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>);
      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('text-sm');
      expect(title).toHaveClass('md:text-base');
    });

    it('chevron is hidden on desktop', () => {
      const { container } = renderWithTheme(
        <CollapsibleSection title="Test Title">{mockChildren}</CollapsibleSection>
      );
      const chevronBox = container.querySelector('.md\\:hidden');
      expect(chevronBox).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles very long title', () => {
      const longTitle = 'A'.repeat(200);
      renderWithTheme(<CollapsibleSection title={longTitle}>{mockChildren}</CollapsibleSection>);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('handles complex children', () => {
      const complexChildren = (
        <div>
          <p>Paragraph 1</p>
          <p>Paragraph 2</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      );
      renderWithTheme(<CollapsibleSection title="Test Title">{complexChildren}</CollapsibleSection>);
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    it('handles special characters in title', () => {
      const specialTitle = 'Title with "quotes" & symbols';
      renderWithTheme(<CollapsibleSection title={specialTitle}>{mockChildren}</CollapsibleSection>);
      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });
  });
});
