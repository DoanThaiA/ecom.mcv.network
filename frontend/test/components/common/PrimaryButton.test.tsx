import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { Theme } from '@radix-ui/themes';
import { createRef } from 'react';

describe('PrimaryButton', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  describe('Basic rendering', () => {
    it('renders children text', () => {
      renderWithTheme(<PrimaryButton>Click me</PrimaryButton>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('renders as button element', () => {
      renderWithTheme(<PrimaryButton>Click me</PrimaryButton>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Click handling', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      renderWithTheme(<PrimaryButton onClick={onClick}>Click me</PrimaryButton>);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      renderWithTheme(
        <PrimaryButton onClick={onClick} disabled>
          Click me
        </PrimaryButton>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(onClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      renderWithTheme(
        <PrimaryButton onClick={onClick} isLoading>
          Click me
        </PrimaryButton>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Disabled state', () => {
    it('disables button when disabled prop is true', () => {
      renderWithTheme(<PrimaryButton disabled>Click me</PrimaryButton>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('enables button when disabled prop is false', () => {
      renderWithTheme(<PrimaryButton disabled={false}>Click me</PrimaryButton>);
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('enables button when disabled prop is not provided', () => {
      renderWithTheme(<PrimaryButton>Click me</PrimaryButton>);
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('Loading state', () => {
    it('shows loading text when isLoading is true', () => {
      renderWithTheme(<PrimaryButton isLoading>Click me</PrimaryButton>);
      expect(screen.getByText('...')).toBeInTheDocument();
      expect(screen.queryByText('Click me')).not.toBeInTheDocument();
    });

    it('shows children when isLoading is false', () => {
      renderWithTheme(<PrimaryButton isLoading={false}>Click me</PrimaryButton>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
      expect(screen.queryByText('...')).not.toBeInTheDocument();
    });

    it('uses custom loadingText when provided', () => {
      renderWithTheme(
        <PrimaryButton isLoading loadingText="Loading...">
          Click me
        </PrimaryButton>
      );
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Click me')).not.toBeInTheDocument();
    });

    it('disables button when loading', () => {
      renderWithTheme(<PrimaryButton isLoading>Click me</PrimaryButton>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('handles both disabled and loading states', () => {
      renderWithTheme(
        <PrimaryButton disabled isLoading>
          Click me
        </PrimaryButton>
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(screen.getByText('...')).toBeInTheDocument();
    });
  });

  describe('Type prop', () => {
    it('uses type="button" by default', () => {
      renderWithTheme(<PrimaryButton>Click me</PrimaryButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('uses type="submit" when provided', () => {
      renderWithTheme(<PrimaryButton type="submit">Submit</PrimaryButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('uses type="reset" when provided', () => {
      renderWithTheme(<PrimaryButton type="reset">Reset</PrimaryButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('Full width prop', () => {
    it('applies full width by default', () => {
      const { container } = renderWithTheme(<PrimaryButton>Click me</PrimaryButton>);
      const button = container.querySelector('.w-full');
      expect(button).toBeInTheDocument();
    });

    it('applies full width when fullWidth is true', () => {
      const { container } = renderWithTheme(
        <PrimaryButton fullWidth={true}>Click me</PrimaryButton>
      );
      const button = container.querySelector('.w-full');
      expect(button).toBeInTheDocument();
    });

    it('does not apply full width when fullWidth is false', () => {
      const { container } = renderWithTheme(
        <PrimaryButton fullWidth={false}>Click me</PrimaryButton>
      );
      const button = container.querySelector('.w-full');
      expect(button).not.toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('applies default className when not provided', () => {
      const { container } = renderWithTheme(<PrimaryButton>Click me</PrimaryButton>);
      const button = container.querySelector('.bg-primary');
      expect(button).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
      const { container } = renderWithTheme(
        <PrimaryButton className="custom-class">Click me</PrimaryButton>
      );
      const button = container.querySelector('.custom-class');
      expect(button).toBeInTheDocument();
    });

    it('combines custom className with default classes', () => {
      const { container } = renderWithTheme(
        <PrimaryButton className="custom-class">Click me</PrimaryButton>
      );
      const button = container.querySelector('.bg-primary.custom-class');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to button element', () => {
      const ref = createRef<HTMLButtonElement>();
      renderWithTheme(<PrimaryButton ref={ref}>Click me</PrimaryButton>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.textContent).toBe('Click me');
    });

    it('allows accessing button properties through ref', () => {
      const ref = createRef<HTMLButtonElement>();
      renderWithTheme(<PrimaryButton ref={ref}>Click me</PrimaryButton>);
      expect(ref.current?.disabled).toBe(false);
    });

    it('ref points to disabled button when disabled', () => {
      const ref = createRef<HTMLButtonElement>();
      renderWithTheme(
        <PrimaryButton ref={ref} disabled>
          Click me
        </PrimaryButton>
      );
      expect(ref.current?.disabled).toBe(true);
    });
  });

  describe('Styling classes', () => {
    it('applies height class', () => {
      const { container } = renderWithTheme(<PrimaryButton>Click me</PrimaryButton>);
      const button = container.querySelector('.h-\\[3rem\\]');
      expect(button).toBeInTheDocument();
    });

    it('applies rounded corners class', () => {
      const { container } = renderWithTheme(<PrimaryButton>Click me</PrimaryButton>);
      const button = container.querySelector('.rounded-\\[1\\.5rem\\]');
      expect(button).toBeInTheDocument();
    });

    it('applies padding classes', () => {
      const { container } = renderWithTheme(<PrimaryButton>Click me</PrimaryButton>);
      const button = container.querySelector('.px-\\[1rem\\]');
      expect(button).toBeInTheDocument();
    });

    it('applies background color class', () => {
      const { container } = renderWithTheme(<PrimaryButton>Click me</PrimaryButton>);
      const button = container.querySelector('.bg-primary');
      expect(button).toBeInTheDocument();
    });

    it('applies hover background color class', () => {
      const { container } = renderWithTheme(<PrimaryButton>Click me</PrimaryButton>);
      const button = container.querySelector('.hover\\:bg-primary-hover');
      expect(button).toBeInTheDocument();
    });

    it('applies text color class', () => {
      const { container } = renderWithTheme(<PrimaryButton>Click me</PrimaryButton>);
      const button = container.querySelector('.text-white');
      expect(button).toBeInTheDocument();
    });

    it('applies font weight class', () => {
      const { container } = renderWithTheme(<PrimaryButton>Click me</PrimaryButton>);
      const button = container.querySelector('.font-medium');
      expect(button).toBeInTheDocument();
    });

    it('applies text size class', () => {
      const { container } = renderWithTheme(<PrimaryButton>Click me</PrimaryButton>);
      const button = container.querySelector('.text-\\[1rem\\]');
      expect(button).toBeInTheDocument();
    });

    it('applies transition class', () => {
      const { container } = renderWithTheme(<PrimaryButton>Click me</PrimaryButton>);
      const button = container.querySelector('.transition-colors');
      expect(button).toBeInTheDocument();
    });

    it('applies disabled opacity class', () => {
      const { container } = renderWithTheme(<PrimaryButton>Click me</PrimaryButton>);
      const button = container.querySelector('.disabled\\:opacity-70');
      expect(button).toBeInTheDocument();
    });

    it('applies disabled cursor class', () => {
      const { container } = renderWithTheme(<PrimaryButton>Click me</PrimaryButton>);
      const button = container.querySelector('.disabled\\:cursor-not-allowed');
      expect(button).toBeInTheDocument();
    });

    it('applies cursor pointer class', () => {
      const { container } = renderWithTheme(<PrimaryButton>Click me</PrimaryButton>);
      const button = container.querySelector('.cursor-pointer');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('renders with empty children', () => {
      renderWithTheme(<PrimaryButton></PrimaryButton>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.textContent).toBe('');
    });

    it('renders with multiple children', () => {
      renderWithTheme(
        <PrimaryButton>
          <span>Click</span>
          <span>me</span>
        </PrimaryButton>
      );
      expect(screen.getByText('Click')).toBeInTheDocument();
      expect(screen.getByText('me')).toBeInTheDocument();
    });

    it('handles onClick with undefined', async () => {
      const user = userEvent.setup();
      renderWithTheme(<PrimaryButton onClick={undefined}>Click me</PrimaryButton>);
      const button = screen.getByRole('button');
      await user.click(button);
      // Should not throw error
      expect(button).toBeInTheDocument();
    });
  });
});
