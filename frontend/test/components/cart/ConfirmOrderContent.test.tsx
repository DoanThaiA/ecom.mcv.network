import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Theme } from '@radix-ui/themes';
import { ConfirmOrderContent } from '@/components/cart/ConfirmOrderContent';
import { useConfirmOrder } from '@/components/cart/hooks/useConfirmOrder';
import type { CheckoutSession } from '@/types/gen/shop/shared/checkout-sessions/checkout-session';

// Mock useConfirmOrder hook
vi.mock('@/components/cart/hooks/useConfirmOrder', () => ({
  useConfirmOrder: vi.fn(),
}));

// Mock child components
vi.mock('@/components/cart/ConfirmOrderShippingAuth', () => ({
  ConfirmOrderShippingAuth: () => <div data-testid="shipping-auth">ShippingAuth</div>,
}));

vi.mock('@/components/cart/ConfirmOrderShippingGuest', () => ({
  ConfirmOrderShippingGuest: () => <div data-testid="shipping-guest">ShippingGuest</div>,
}));

vi.mock('@/components/cart/PaymentDetails', () => ({
  PaymentDetails: () => <div data-testid="payment-details">PaymentDetails</div>,
}));

vi.mock('@/components/cart/VoucherSection', () => ({
  VoucherSection: () => <div data-testid="voucher-section">VoucherSection</div>,
}));

vi.mock('@/components/cart/CartPaymentMethod', () => ({
  CartPaymentMethod: () => <div data-testid="cart-payment-method">CartPaymentMethod</div>,
}));

vi.mock('@/components/cart/ConfirmOrderItems', () => ({
  ConfirmOrderItems: () => <div data-testid="confirm-order-items">ConfirmOrderItems</div>,
}));

vi.mock('@/components/cart/ConfirmOrderPaymentStatus', () => ({
  ConfirmOrderPaymentStatus: () => <div data-testid="payment-status">PaymentStatus</div>,
}));

vi.mock('@/components/cart/ConfirmOrderPlaceButton', () => ({
  ConfirmOrderPlaceButton: () => <div data-testid="place-button">PlaceButton</div>,
}));

vi.mock('@/components/payment/QRCodeDialog', () => ({
  QRCodeDialog: () => <div data-testid="qr-dialog">QRCodeDialog</div>,
}));

vi.mock('@/components/cart/AddressManagementDialog', () => ({
  AddressManagementDialog: () => <div data-testid="address-dialog">AddressDialog</div>,
}));

const mockUseConfirmOrder = vi.mocked(useConfirmOrder);

const createCheckoutSession = (overrides?: Partial<CheckoutSession>): CheckoutSession =>
  ({
    id: 'cs-123',
    items: [{ productId: 'prod-1', variantId: 'v1' }],
    total: 897000,
    canPlaceOrder: true,
    hasUnavailableItems: false,
    ...overrides,
  }) as unknown as CheckoutSession;

const createMockReturn = (overrides?: any) => ({
  isAuthenticated: false,
  isDesktop: false,
  checkoutSession: createCheckoutSession(),
  isLoading: false,
  isPlacingOrder: false,
  isCalculatingCheckout: false,
  isPaymentProcessing: false,
  isUpdatingQuantity: false,
  paymentMethod: 'COD',
  shippingFormData: {},
  cities: [],
  availableDistricts: [],
  availableWards: [],
  shippingAddresses: [],
  selectedAddressId: '',
  setPaymentMethod: vi.fn(),
  setShippingFormData: vi.fn(),
  handlePlaceOrder: vi.fn(),
  handleBackToCart: vi.fn(),
  handleItemQuantityChange: vi.fn(),
  handleNotesChange: vi.fn(),
  handleRetryPayment: vi.fn(),
  handleQRDialogClose: vi.fn(),
  isQRDialogOpen: false,
  qrDialogData: { qrUrl: '', qrData: '' },
  handleNavigateToAddressBook: vi.fn(),
  isAddressManagementDialogOpen: false,
  handleCloseAddressManagementDialog: vi.fn(),
  handleSelectAddress: vi.fn(),
  handleVoucherApplied: vi.fn(),
  fieldErrors: {},
  clearFieldError: vi.fn(),
  ...overrides,
});

const renderWithTheme = (ui: React.ReactElement) => render(<Theme>{ui}</Theme>);

describe('ConfirmOrderContent', () => {
  const defaultProps = {
    locale: 'vi' as const,
    checkoutSessionId: 'cs-123',
  };

  beforeEach(() => {
    mockUseConfirmOrder.mockReturnValue(createMockReturn() as any);
  });

  describe('Loading state', () => {
    it('shows spinner when loading', () => {
      mockUseConfirmOrder.mockReturnValue(createMockReturn({ isLoading: true }) as any);
      const { container } = renderWithTheme(<ConfirmOrderContent {...defaultProps} />);
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('No session', () => {
    it('shows orderNotFound when checkoutSession is null', () => {
      mockUseConfirmOrder.mockReturnValue(
        createMockReturn({ checkoutSession: null }) as any
      );
      renderWithTheme(<ConfirmOrderContent {...defaultProps} />);
      expect(screen.getByText('orderNotFound')).toBeInTheDocument();
    });
  });

  describe('Header', () => {
    it('renders confirmOrder title', () => {
      renderWithTheme(<ConfirmOrderContent {...defaultProps} />);
      expect(screen.getByText('confirmOrder')).toBeInTheDocument();
    });

    it('renders back button', () => {
      renderWithTheme(<ConfirmOrderContent {...defaultProps} />);
      // Back button has ArrowLeftIcon
      const backButton = screen.getByRole('button');
      expect(backButton).toBeInTheDocument();
    });

    it('calls handleBackToCart when back button clicked', async () => {
      const handleBackToCart = vi.fn();
      mockUseConfirmOrder.mockReturnValue(
        createMockReturn({ handleBackToCart }) as any
      );
      const user = userEvent.setup();
      renderWithTheme(<ConfirmOrderContent {...defaultProps} />);

      // Find the button that contains the back icon (first button in header)
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);
      expect(handleBackToCart).toHaveBeenCalled();
    });

    it('disables back button during payment processing', () => {
      mockUseConfirmOrder.mockReturnValue(
        createMockReturn({ isPaymentProcessing: true }) as any
      );
      renderWithTheme(<ConfirmOrderContent {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toBeDisabled();
    });
  });

  describe('Shipping section', () => {
    it('renders ConfirmOrderShippingAuth for authenticated users', () => {
      mockUseConfirmOrder.mockReturnValue(
        createMockReturn({ isAuthenticated: true }) as any
      );
      renderWithTheme(<ConfirmOrderContent {...defaultProps} />);
      expect(screen.getByTestId('shipping-auth')).toBeInTheDocument();
      expect(screen.queryByTestId('shipping-guest')).not.toBeInTheDocument();
    });

    it('renders ConfirmOrderShippingGuest for guest users', () => {
      mockUseConfirmOrder.mockReturnValue(
        createMockReturn({ isAuthenticated: false }) as any
      );
      renderWithTheme(<ConfirmOrderContent {...defaultProps} />);
      expect(screen.getByTestId('shipping-guest')).toBeInTheDocument();
      expect(screen.queryByTestId('shipping-auth')).not.toBeInTheDocument();
    });
  });

  describe('Order summary components', () => {
    it('renders PaymentDetails', () => {
      renderWithTheme(<ConfirmOrderContent {...defaultProps} />);
      expect(screen.getByTestId('payment-details')).toBeInTheDocument();
    });

    it('renders VoucherSection', () => {
      renderWithTheme(<ConfirmOrderContent {...defaultProps} />);
      expect(screen.getByTestId('voucher-section')).toBeInTheDocument();
    });

    it('renders CartPaymentMethod', () => {
      renderWithTheme(<ConfirmOrderContent {...defaultProps} />);
      expect(screen.getByTestId('cart-payment-method')).toBeInTheDocument();
    });

    it('renders ConfirmOrderItems', () => {
      renderWithTheme(<ConfirmOrderContent {...defaultProps} />);
      expect(screen.getByTestId('confirm-order-items')).toBeInTheDocument();
    });

    it('renders ConfirmOrderPaymentStatus', () => {
      renderWithTheme(<ConfirmOrderContent {...defaultProps} />);
      expect(screen.getByTestId('payment-status')).toBeInTheDocument();
    });

    it('renders ConfirmOrderPlaceButton', () => {
      renderWithTheme(<ConfirmOrderContent {...defaultProps} />);
      expect(screen.getByTestId('place-button')).toBeInTheDocument();
    });
  });

  describe('Dialogs', () => {
    it('renders QRCodeDialog', () => {
      renderWithTheme(<ConfirmOrderContent {...defaultProps} />);
      expect(screen.getByTestId('qr-dialog')).toBeInTheDocument();
    });

    it('renders AddressManagementDialog for auth desktop users', () => {
      mockUseConfirmOrder.mockReturnValue(
        createMockReturn({ isAuthenticated: true, isDesktop: true }) as any
      );
      renderWithTheme(<ConfirmOrderContent {...defaultProps} />);
      expect(screen.getByTestId('address-dialog')).toBeInTheDocument();
    });

    it('hides AddressManagementDialog for guest users', () => {
      mockUseConfirmOrder.mockReturnValue(
        createMockReturn({ isAuthenticated: false, isDesktop: true }) as any
      );
      renderWithTheme(<ConfirmOrderContent {...defaultProps} />);
      expect(screen.queryByTestId('address-dialog')).not.toBeInTheDocument();
    });

    it('hides AddressManagementDialog on mobile', () => {
      mockUseConfirmOrder.mockReturnValue(
        createMockReturn({ isAuthenticated: true, isDesktop: false }) as any
      );
      renderWithTheme(<ConfirmOrderContent {...defaultProps} />);
      expect(screen.queryByTestId('address-dialog')).not.toBeInTheDocument();
    });
  });
});
