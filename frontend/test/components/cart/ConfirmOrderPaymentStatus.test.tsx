import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmOrderPaymentStatus } from '@/components/cart/ConfirmOrderPaymentStatus';
import { Theme } from '@radix-ui/themes';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      processingPayment: 'Processing your payment...',
      retryPayment: 'Retry Payment',
      cancelPayment: 'Cancel Payment',
    };
    return translations[key] || key;
  },
}));

describe('ConfirmOrderPaymentStatus', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  describe('Visibility based on isProcessing', () => {
    it('renders when isProcessing is true', () => {
      const onRetry = vi.fn();
      renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );
      expect(screen.getByText('Processing your payment...')).toBeInTheDocument();
    });

    it('returns null when isProcessing is false', () => {
      const onRetry = vi.fn();
      const { container } = renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={false} onRetry={onRetry} />
      );
      expect(container.firstChild).toBeEmptyDOMElement();
    });

    it('does not render retry button when isProcessing is false', () => {
      const onRetry = vi.fn();
      renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={false} onRetry={onRetry} />
      );
      expect(screen.queryByText('Retry Payment')).not.toBeInTheDocument();
    });
  });

  describe('Content rendering when processing', () => {
    it('displays processing message', () => {
      const onRetry = vi.fn();
      renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );
      expect(screen.getByText('Processing your payment...')).toBeInTheDocument();
    });

    it('displays cancel button', () => {
      const onRetry = vi.fn();
      renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );
      expect(screen.getByRole('button', { name: 'Cancel Payment' })).toBeInTheDocument();
    });

    it('renders spinner element', () => {
      const onRetry = vi.fn();
      const { container } = renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Cancel button behavior', () => {
    it('calls onRetry when the cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();
      renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );

      const cancelButton = screen.getByRole('button', { name: 'Cancel Payment' });
      await user.click(cancelButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('calls onRetry multiple times when the cancel button is clicked multiple times', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();
      renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );

      const cancelButton = screen.getByRole('button', { name: 'Cancel Payment' });
      await user.click(cancelButton);
      await user.click(cancelButton);
      await user.click(cancelButton);

      expect(onRetry).toHaveBeenCalledTimes(3);
    });

    it('cancel button is clickable', () => {
      const onRetry = vi.fn();
      renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );
      const cancelButton = screen.getByRole('button', { name: 'Cancel Payment' });
      expect(cancelButton).not.toBeDisabled();
    });
  });

  describe('Styling classes', () => {
    it('applies container background color', () => {
      const onRetry = vi.fn();
      const { container } = renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );
      const box = container.querySelector('.bg-\\[\\#FEF3CD\\]');
      expect(box).toBeInTheDocument();
    });

    it('applies container border', () => {
      const onRetry = vi.fn();
      const { container } = renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );
      const box = container.querySelector('.border-\\[\\#FFEEBA\\]');
      expect(box).toBeInTheDocument();
    });

    it('applies rounded corners to container', () => {
      const onRetry = vi.fn();
      const { container } = renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );
      const box = container.querySelector('.rounded-lg');
      expect(box).toBeInTheDocument();
    });

    it('applies padding to container', () => {
      const onRetry = vi.fn();
      const { container } = renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );
      const box = container.querySelector('.p-4');
      expect(box).toBeInTheDocument();
    });

    it('applies margin to container', () => {
      const onRetry = vi.fn();
      const { container } = renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );
      const box = container.querySelector('.m-4');
      expect(box).toBeInTheDocument();
    });
  });

  describe('Spinner styling', () => {
    it('applies animate-spin class to spinner', () => {
      const onRetry = vi.fn();
      const { container } = renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('applies rounded-full class to spinner', () => {
      const onRetry = vi.fn();
      const { container } = renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );
      const spinner = container.querySelector('.rounded-full');
      expect(spinner).toBeInTheDocument();
    });

    it('applies size classes to spinner', () => {
      const onRetry = vi.fn();
      const { container } = renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );
      const spinner = container.querySelector('.h-5.w-5');
      expect(spinner).toBeInTheDocument();
    });

    it('applies border classes to spinner', () => {
      const onRetry = vi.fn();
      const { container } = renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );
      const spinner = container.querySelector('.border-2');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Text styling', () => {
    it('applies text color to message', () => {
      const onRetry = vi.fn();
      const { container } = renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );
      const text = container.querySelector('.text-\\[\\#856404\\]');
      expect(text).toBeInTheDocument();
    });

    it('applies text size to message', () => {
      const onRetry = vi.fn();
      const { container } = renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );
      const text = container.querySelector('.text-sm');
      expect(text).toBeInTheDocument();
    });

    it('applies font weight to message', () => {
      const onRetry = vi.fn();
      const { container } = renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );
      const text = container.querySelector('.font-medium');
      expect(text).toBeInTheDocument();
    });

    it('applies flex-1 to message', () => {
      const onRetry = vi.fn();
      const { container } = renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );
      const text = container.querySelector('.flex-1');
      expect(text).toBeInTheDocument();
    });
  });

  describe('Button styling', () => {
    it('applies cursor-pointer to button', () => {
      const onRetry = vi.fn();
      const { container } = renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );
      const button = container.querySelector('.cursor-pointer');
      expect(button).toBeInTheDocument();
    });

    it('applies text color to button', () => {
      const onRetry = vi.fn();
      const { container } = renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );
      const button = container.querySelector('.text-\\[\\#FAA63E\\]');
      expect(button).toBeInTheDocument();
    });

    it('applies background color to button', () => {
      const onRetry = vi.fn();
      const { container } = renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );
      const button = container.querySelector('.bg-white');
      expect(button).toBeInTheDocument();
    });

    it('applies border color to button', () => {
      const onRetry = vi.fn();
      const { container } = renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );
      const button = container.querySelector('.border-\\[\\#FAA63E\\]');
      expect(button).toBeInTheDocument();
    });

    it('applies rounded-full to button', () => {
      const onRetry = vi.fn();
      const { container } = renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );
      const button = container.querySelector('.rounded-full');
      expect(button).toBeInTheDocument();
    });

    it('applies hover background to button', () => {
      const onRetry = vi.fn();
      const { container } = renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );
      const button = container.querySelector('.hover\\:bg-\\[\\#FEF8F1\\]');
      expect(button).toBeInTheDocument();
    });

    it('applies padding to button', () => {
      const onRetry = vi.fn();
      const { container } = renderWithTheme(
        <ConfirmOrderPaymentStatus isProcessing={true} onRetry={onRetry} />
      );
      const button = container.querySelector('.px-4.py-2');
      expect(button).toBeInTheDocument();
    });
  });
});
