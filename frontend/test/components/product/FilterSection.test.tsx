import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterSection } from '@/components/product/FilterSection';
import { Theme } from '@radix-ui/themes';

describe('FilterSection', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  const defaultProps = {
    title: 'Test Filter',
    isOpen: false,
    onToggle: vi.fn(),
    children: <div>Filter Content</div>,
  };

  describe('Basic rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderWithTheme(<FilterSection {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });

    it('renders title text', () => {
      renderWithTheme(<FilterSection {...defaultProps} title="Price Range" />);
      expect(screen.getByText('Price Range')).toBeInTheDocument();
    });

    it('renders with custom title', () => {
      renderWithTheme(<FilterSection {...defaultProps} title="Categories" />);
      expect(screen.getByText('Categories')).toBeInTheDocument();
    });

    it('renders button element', () => {
      const { container } = renderWithTheme(<FilterSection {...defaultProps} />);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Container styling', () => {
    it('applies border-b class', () => {
      const { container } = renderWithTheme(<FilterSection {...defaultProps} />);
      const box = container.querySelector('.border-b');
      expect(box).toBeInTheDocument();
    });

    it('applies border-gray-200 class', () => {
      const { container } = renderWithTheme(<FilterSection {...defaultProps} />);
      const box = container.querySelector('.border-gray-200');
      expect(box).toBeInTheDocument();
    });

    it('applies pb-4 class', () => {
      const { container } = renderWithTheme(<FilterSection {...defaultProps} />);
      const box = container.querySelector('.pb-4');
      expect(box).toBeInTheDocument();
    });

    it('applies mb-4 class', () => {
      const { container } = renderWithTheme(<FilterSection {...defaultProps} />);
      const box = container.querySelector('.mb-4');
      expect(box).toBeInTheDocument();
    });
  });

  describe('Button styling', () => {
    it('applies w-full class', () => {
      const { container } = renderWithTheme(<FilterSection {...defaultProps} />);
      const button = container.querySelector('.w-full');
      expect(button).toBeInTheDocument();
    });

    it('applies flex class', () => {
      const { container } = renderWithTheme(<FilterSection {...defaultProps} />);
      const button = container.querySelector('.flex');
      expect(button).toBeInTheDocument();
    });

    it('applies justify-between class', () => {
      const { container } = renderWithTheme(<FilterSection {...defaultProps} />);
      const button = container.querySelector('.justify-between');
      expect(button).toBeInTheDocument();
    });

    it('applies items-center class', () => {
      const { container } = renderWithTheme(<FilterSection {...defaultProps} />);
      const button = container.querySelector('.items-center');
      expect(button).toBeInTheDocument();
    });

    it('applies mb-3 class', () => {
      const { container } = renderWithTheme(<FilterSection {...defaultProps} />);
      const button = container.querySelector('.mb-3');
      expect(button).toBeInTheDocument();
    });

    it('applies cursor-pointer class', () => {
      const { container } = renderWithTheme(<FilterSection {...defaultProps} />);
      const button = container.querySelector('.cursor-pointer');
      expect(button).toBeInTheDocument();
    });

    it('applies bg-transparent class', () => {
      const { container } = renderWithTheme(<FilterSection {...defaultProps} />);
      const button = container.querySelector('.bg-transparent');
      expect(button).toBeInTheDocument();
    });

    it('applies border-none class', () => {
      const { container } = renderWithTheme(<FilterSection {...defaultProps} />);
      const button = container.querySelector('.border-none');
      expect(button).toBeInTheDocument();
    });

    it('applies p-0 class', () => {
      const { container } = renderWithTheme(<FilterSection {...defaultProps} />);
      const button = container.querySelector('.p-0');
      expect(button).toBeInTheDocument();
    });

    it('has type="button" attribute', () => {
      const { container } = renderWithTheme(<FilterSection {...defaultProps} />);
      const button = container.querySelector('button[type="button"]');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Title styling', () => {
    it('applies font-semibold class', () => {
      const { container } = renderWithTheme(<FilterSection {...defaultProps} />);
      const title = container.querySelector('.font-semibold');
      expect(title).toBeInTheDocument();
    });

    it('applies text-base class', () => {
      const { container } = renderWithTheme(<FilterSection {...defaultProps} />);
      const title = container.querySelector('.text-base');
      expect(title).toBeInTheDocument();
    });

    it('renders title in Text component', () => {
      renderWithTheme(<FilterSection {...defaultProps} title="Brand" />);
      const title = screen.getByText('Brand');
      expect(title).toBeInTheDocument();
    });
  });

  describe('Toggle behavior', () => {
    it('calls onToggle when button clicked', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const { container } = renderWithTheme(
        <FilterSection {...defaultProps} onToggle={onToggle} />
      );

      const button = container.querySelector('button');
      if (button) {
        await user.click(button);
      }

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('does not call onToggle on render', () => {
      const onToggle = vi.fn();
      renderWithTheme(<FilterSection {...defaultProps} onToggle={onToggle} />);
      expect(onToggle).not.toHaveBeenCalled();
    });

    it('calls onToggle multiple times', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const { container } = renderWithTheme(
        <FilterSection {...defaultProps} onToggle={onToggle} />
      );

      const button = container.querySelector('button');
      if (button) {
        await user.click(button);
        await user.click(button);
        await user.click(button);
      }

      expect(onToggle).toHaveBeenCalledTimes(3);
    });
  });

  describe('Children rendering when closed', () => {
    it('does not render children when isOpen is false', () => {
      renderWithTheme(<FilterSection {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Filter Content')).not.toBeInTheDocument();
    });

    it('hides children by default', () => {
      renderWithTheme(
        <FilterSection {...defaultProps} isOpen={false}>
          <div>Hidden Content</div>
        </FilterSection>
      );
      expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument();
    });
  });

  describe('Children rendering when open', () => {
    it('renders children when isOpen is true', () => {
      renderWithTheme(<FilterSection {...defaultProps} isOpen={true} />);
      expect(screen.getByText('Filter Content')).toBeInTheDocument();
    });

    it('shows children content when open', () => {
      renderWithTheme(
        <FilterSection {...defaultProps} isOpen={true}>
          <div>Visible Content</div>
        </FilterSection>
      );
      expect(screen.getByText('Visible Content')).toBeInTheDocument();
    });

    it('renders complex children when open', () => {
      renderWithTheme(
        <FilterSection {...defaultProps} isOpen={true}>
          <div>
            <p>Child 1</p>
            <p>Child 2</p>
          </div>
        </FilterSection>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
  });

  describe('Icon rendering when closed', () => {
    it('shows ChevronDownIcon when closed', () => {
      const { container } = renderWithTheme(<FilterSection {...defaultProps} isOpen={false} />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('icon has correct size when closed', () => {
      const { container } = renderWithTheme(<FilterSection {...defaultProps} isOpen={false} />);
      const icon = container.querySelector('svg[width="20"][height="20"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Icon rendering when open', () => {
    it('shows ChevronUpIcon when open', () => {
      const { container } = renderWithTheme(<FilterSection {...defaultProps} isOpen={true} />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('icon has correct size when open', () => {
      const { container } = renderWithTheme(<FilterSection {...defaultProps} isOpen={true} />);
      const icon = container.querySelector('svg[width="20"][height="20"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Props interface', () => {
    it('accepts title prop', () => {
      renderWithTheme(<FilterSection {...defaultProps} title="Size" />);
      expect(screen.getByText('Size')).toBeInTheDocument();
    });

    it('accepts sectionKey prop', () => {
      const { container } = renderWithTheme(
        <FilterSection {...defaultProps} sectionKey="price" />
      );
      expect(container).toBeInTheDocument();
    });

    it('accepts isOpen prop', () => {
      renderWithTheme(<FilterSection {...defaultProps} isOpen={true} />);
      expect(screen.getByText('Filter Content')).toBeInTheDocument();
    });

    it('accepts onToggle prop', () => {
      const onToggle = vi.fn();
      renderWithTheme(<FilterSection {...defaultProps} onToggle={onToggle} />);
      expect(onToggle).not.toHaveBeenCalled();
    });

    it('accepts children prop', () => {
      renderWithTheme(
        <FilterSection {...defaultProps} isOpen={true}>
          <div>Custom Child</div>
        </FilterSection>
      );
      expect(screen.getByText('Custom Child')).toBeInTheDocument();
    });
  });

  describe('State changes', () => {
    it('re-renders when isOpen changes from false to true', () => {
      const { rerender } = renderWithTheme(<FilterSection {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Filter Content')).not.toBeInTheDocument();

      rerender(
        <Theme>
          <FilterSection {...defaultProps} isOpen={true} />
        </Theme>
      );
      expect(screen.getByText('Filter Content')).toBeInTheDocument();
    });

    it('re-renders when isOpen changes from true to false', () => {
      const { rerender } = renderWithTheme(<FilterSection {...defaultProps} isOpen={true} />);
      expect(screen.getByText('Filter Content')).toBeInTheDocument();

      rerender(
        <Theme>
          <FilterSection {...defaultProps} isOpen={false} />
        </Theme>
      );
      expect(screen.queryByText('Filter Content')).not.toBeInTheDocument();
    });

    it('updates title when prop changes', () => {
      const { rerender } = renderWithTheme(<FilterSection {...defaultProps} title="Color" />);
      expect(screen.getByText('Color')).toBeInTheDocument();

      rerender(
        <Theme>
          <FilterSection {...defaultProps} title="Material" />
        </Theme>
      );
      expect(screen.getByText('Material')).toBeInTheDocument();
      expect(screen.queryByText('Color')).not.toBeInTheDocument();
    });
  });

  describe('Client component', () => {
    it('renders in client environment', () => {
      const { container } = renderWithTheme(<FilterSection {...defaultProps} />);
      expect(container).toBeTruthy();
    });

    it('handles user interactions', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const { container } = renderWithTheme(
        <FilterSection {...defaultProps} onToggle={onToggle} />
      );

      const button = container.querySelector('button');
      if (button) {
        await user.click(button);
      }

      expect(onToggle).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('button is keyboard accessible', () => {
      const { container } = renderWithTheme(<FilterSection {...defaultProps} />);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      expect(button?.tagName).toBe('BUTTON');
    });

    it('button has proper type attribute', () => {
      const { container } = renderWithTheme(<FilterSection {...defaultProps} />);
      const button = container.querySelector('button');
      expect(button?.getAttribute('type')).toBe('button');
    });
  });
});
