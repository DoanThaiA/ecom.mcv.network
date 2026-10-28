import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Theme } from '@radix-ui/themes';
import { OrderSuccessContent } from '@/components/order/OrderSuccessContent';
import { AuthStatus } from '@/lib/store/slices/authSlice';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock store hooks
vi.mock('@/lib/store/hooks', () => ({
  useAppSelector: vi.fn((selector: any) =>
    selector({
      auth: {
        status: 'IDLE',
        user: null,
        error: null,
      },
    })
  ),
}));

import { useAppSelector } from '@/lib/store/hooks';
const mockUseAppSelector = vi.mocked(useAppSelector);

// Mock storageService
vi.mock('@/lib/services/storage.service', () => ({
  storageService: {
    getOrderCustomerData: vi.fn(() => null),
    clearOrderCustomerData: vi.fn(),
  },
}));

import { storageService } from '@/lib/services/storage.service';

// Mock orderRepository
vi.mock('@/lib/repositories/order.repository', () => ({
  orderRepository: {
    getOrderByNumber: vi.fn(() => Promise.resolve(null)),
  },
}));

// Mock child components
vi.mock('@/components/auth/SignUpDialog', () => ({
  SignUpDialog: ({ open }: any) => (
    open ? <div data-testid="signup-dialog">SignUpDialog</div> : null
  ),
}));

vi.mock('@/components/order/CrossSellSection', () => ({
  CrossSellSection: () => <div data-testid="cross-sell">CrossSellSection</div>,
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

const renderWithTheme = (ui: React.ReactElement) => render(<Theme>{ui}</Theme>);

describe('OrderSuccessContent', () => {
  const defaultProps = {
    locale: 'vi' as const,
    orderNumber: 'ORD-001',
  };

  beforeEach(() => {
    mockPush.mockClear();
    mockUseAppSelector.mockImplementation((selector: any) =>
      selector({
        auth: {
          status: AuthStatus.IDLE,
          user: null,
          error: null,
        },
      })
    );
    vi.mocked(storageService.getOrderCustomerData).mockReturnValue(null);
  });

  describe('Success illustration', () => {
    it('renders success image', () => {
      renderWithTheme(<OrderSuccessContent {...defaultProps} />);
      const img = screen.getByAltText('Order Success');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/assets/svg/order-success.svg');
    });
  });

  describe('Title and message', () => {
    it('renders title', () => {
      renderWithTheme(<OrderSuccessContent {...defaultProps} />);
      expect(screen.getByText('title')).toBeInTheDocument();
    });

    it('renders message', () => {
      renderWithTheme(<OrderSuccessContent {...defaultProps} />);
      expect(screen.getByText('message')).toBeInTheDocument();
    });
  });

  describe('Order number display', () => {
    it('displays order number from prop', () => {
      renderWithTheme(<OrderSuccessContent {...defaultProps} />);
      expect(screen.getByText('ORD-001')).toBeInTheDocument();
    });

    it('displays orderCode label', () => {
      renderWithTheme(<OrderSuccessContent {...defaultProps} />);
      expect(screen.getByText(/orderCode/)).toBeInTheDocument();
    });

    it('displays order number from localStorage when no prop', () => {
      vi.mocked(storageService.getOrderCustomerData).mockReturnValue({
        name: 'Test',
        phone: '0123',
        email: '',
        orderNumber: 'ORD-LOCAL',
      });
      renderWithTheme(<OrderSuccessContent locale="vi" />);
      expect(screen.getByText('ORD-LOCAL')).toBeInTheDocument();
    });

    it('hides order number section when neither prop nor localStorage', () => {
      renderWithTheme(<OrderSuccessContent locale="vi" />);
      expect(screen.queryByText(/orderCode/)).not.toBeInTheDocument();
    });
  });

  describe('Copy button', () => {
    it('renders copy button next to order number', () => {
      const { container } = renderWithTheme(<OrderSuccessContent {...defaultProps} />);
      const iconButton = container.querySelector('.cursor-pointer');
      expect(iconButton).toBeInTheDocument();
    });
  });

  describe('Authenticated user', () => {
    beforeEach(() => {
      mockUseAppSelector.mockImplementation((selector: any) =>
        selector({
          auth: {
            status: AuthStatus.AUTHENTICATED,
            user: { id: 'user-1' },
            error: null,
          },
        })
      );
    });

    it('renders Track Order button', async () => {
      renderWithTheme(<OrderSuccessContent {...defaultProps} />);
      // Wait for mounted state
      await act(async () => {});
      expect(screen.getByText('trackOrderButton')).toBeInTheDocument();
    });

    it('navigates to order history on Track Order click', async () => {
      const user = userEvent.setup();
      renderWithTheme(<OrderSuccessContent {...defaultProps} />);
      await act(async () => {});
      await user.click(screen.getByText('trackOrderButton'));
      expect(mockPush).toHaveBeenCalledWith('/vi/account/order-history');
    });

    it('does not show sign up message', async () => {
      renderWithTheme(<OrderSuccessContent {...defaultProps} />);
      await act(async () => {});
      expect(screen.queryByText('signUpMessage')).not.toBeInTheDocument();
    });
  });

  describe('Guest user', () => {
    it('renders sign up message', async () => {
      renderWithTheme(<OrderSuccessContent {...defaultProps} />);
      await act(async () => {});
      expect(screen.getByText('signUpMessage')).toBeInTheDocument();
    });

    it('renders Sign Up Now button', async () => {
      renderWithTheme(<OrderSuccessContent {...defaultProps} />);
      await act(async () => {});
      expect(screen.getByText('signUpNow')).toBeInTheDocument();
    });

    it('opens SignUpDialog when Sign Up Now clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<OrderSuccessContent {...defaultProps} />);
      await act(async () => {});
      await user.click(screen.getByText('signUpNow'));
      expect(screen.getByTestId('signup-dialog')).toBeInTheDocument();
    });

    it('does not show track order button', async () => {
      renderWithTheme(<OrderSuccessContent {...defaultProps} />);
      await act(async () => {});
      expect(screen.queryByText('trackOrderButton')).not.toBeInTheDocument();
    });
  });

  describe('Cleanup', () => {
    it('clears customer data on unmount', () => {
      const { unmount } = renderWithTheme(<OrderSuccessContent {...defaultProps} />);
      unmount();
      expect(storageService.clearOrderCustomerData).toHaveBeenCalled();
    });
  });
});
