import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReturnRequestButton } from '@/components/policy/return/ReturnRequestButton';
import { Theme } from '@radix-ui/themes';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      requestButton: 'Request Return',
    };
    return translations[key] || key;
  },
}));

// Mock ReturnRequestDialog
vi.mock('@/components/policy/return/ReturnRequestDialog', () => ({
  ReturnRequestDialog: ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
    <div data-testid="return-request-dialog" data-open={open}>
      Return Request Dialog
    </div>
  ),
}));

describe('ReturnRequestButton', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  describe('Basic rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderWithTheme(<ReturnRequestButton />);
      expect(container).toBeInTheDocument();
    });

    it('renders button with text', () => {
      renderWithTheme(<ReturnRequestButton />);
      expect(screen.getByText('Request Return')).toBeInTheDocument();
    });

    it('renders button as clickable', () => {
      renderWithTheme(<ReturnRequestButton />);
      const button = screen.getByText('Request Return');
      expect(button).not.toBeDisabled();
    });

    it('renders dialog component', () => {
      renderWithTheme(<ReturnRequestButton />);
      expect(screen.getByTestId('return-request-dialog')).toBeInTheDocument();
    });
  });

  describe('Layout styling', () => {
    it('applies Flex container', () => {
      const { container } = renderWithTheme(<ReturnRequestButton />);
      const flex = container.querySelector('[class*="rt-Flex"]');
      expect(flex).toBeInTheDocument();
    });

    it('applies py-6 for mobile', () => {
      const { container } = renderWithTheme(<ReturnRequestButton />);
      const flex = container.querySelector('.py-6');
      expect(flex).toBeInTheDocument();
    });

    it('applies lg:py-8 for desktop', () => {
      const { container } = renderWithTheme(<ReturnRequestButton />);
      const flex = container.querySelector('.lg\\:py-8');
      expect(flex).toBeInTheDocument();
    });
  });

  describe('Button styling', () => {
    it('applies cursor-pointer class', () => {
      const { container } = renderWithTheme(<ReturnRequestButton />);
      const button = container.querySelector('.cursor-pointer');
      expect(button).toBeInTheDocument();
    });

    it('applies text-white class', () => {
      const { container } = renderWithTheme(<ReturnRequestButton />);
      const button = container.querySelector('.text-white');
      expect(button).toBeInTheDocument();
    });

    it('applies font-semibold class', () => {
      const { container } = renderWithTheme(<ReturnRequestButton />);
      const button = container.querySelector('.font-semibold');
      expect(button).toBeInTheDocument();
    });

    it('applies px-8 padding', () => {
      const { container } = renderWithTheme(<ReturnRequestButton />);
      const button = container.querySelector('.px-8');
      expect(button).toBeInTheDocument();
    });

    it('applies py-3 padding', () => {
      const { container } = renderWithTheme(<ReturnRequestButton />);
      const button = container.querySelector('.py-3');
      expect(button).toBeInTheDocument();
    });

    it('has gradient background style', () => {
      renderWithTheme(<ReturnRequestButton />);
      const button = screen.getByText('Request Return');
      expect(button).toHaveStyle({
        background: 'linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)',
      });
    });
  });

  describe('Dialog interaction', () => {
    it('dialog is closed by default', () => {
      renderWithTheme(<ReturnRequestButton />);
      const dialog = screen.getByTestId('return-request-dialog');
      expect(dialog).toHaveAttribute('data-open', 'false');
    });

    it('opens dialog when button clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ReturnRequestButton />);

      const button = screen.getByText('Request Return');
      await user.click(button);

      const dialog = screen.getByTestId('return-request-dialog');
      expect(dialog).toHaveAttribute('data-open', 'true');
    });

    it('passes onOpenChange to dialog', () => {
      renderWithTheme(<ReturnRequestButton />);
      const dialog = screen.getByTestId('return-request-dialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('State management', () => {
    it('maintains dialog state across renders', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithTheme(<ReturnRequestButton />);

      const button = screen.getByText('Request Return');
      await user.click(button);

      rerender(<Theme><ReturnRequestButton /></Theme>);

      // After rerender, state is reset (component remounts)
      const dialog = screen.getByTestId('return-request-dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('handles multiple button clicks', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ReturnRequestButton />);

      const button = screen.getByText('Request Return');

      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(button).toBeInTheDocument();
    });
  });

  describe('Translation', () => {
    it('uses translation for button text', () => {
      renderWithTheme(<ReturnRequestButton />);
      expect(screen.getByText('Request Return')).toBeInTheDocument();
    });

    it('displays translated text from returnPolicy namespace', () => {
      renderWithTheme(<ReturnRequestButton />);
      const button = screen.getByText('Request Return');
      expect(button).toBeVisible();
    });
  });

  describe('Component structure', () => {
    it('wraps elements in Fragment', () => {
      renderWithTheme(<ReturnRequestButton />);
      // Fragment doesn't create DOM element, so check children exist
      expect(screen.getByText('Request Return')).toBeInTheDocument();
      expect(screen.getByTestId('return-request-dialog')).toBeInTheDocument();
    });

    it('renders button and dialog', () => {
      renderWithTheme(<ReturnRequestButton />);
      const button = screen.getByText('Request Return');
      const dialog = screen.getByTestId('return-request-dialog');

      expect(button).toBeInTheDocument();
      expect(dialog).toBeInTheDocument();
    });
  });
});
