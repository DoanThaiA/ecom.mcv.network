import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Theme } from '@radix-ui/themes';
import { CartDesktopCheckout } from '@/components/cart/CartDesktopCheckout';
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

vi.mock('@/components/cart/CartPaymentMethod', () => ({
  CartPaymentMethod: () => <div data-testid="cart-payment-method">CartPaymentMethod</div>,
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
    items: [{ productId: 'prod-1' }],
    total: 897000,
    canPlaceOrder: true,
    hasUnavailableItems: false,
    ...overrides,
  }) as unknown as CheckoutSession;

const createMockReturn = (overrides?: any) => ({
  isAuthenticated: false,
  checkoutSession: createCheckoutSession(),
  isLoading: false,
  isPlacingOrder: false,
  isPaymentProcessing: false,
  paymentMethod: 'COD',
  shippingFormData: {},
  cities: [],
  availableDistricts: [],
  availableWards: [],
  shippingAddresses: [],
  selectedAddressId: '',
  isAddressLoaded: false,
  isQRDialogOpen: false,
  qrDialogData: { qrUrl: '', qrData: '' },
  isAddressManagementDialogOpen: false,
  setPaymentMethod: vi.fn(),
  setShippingFormData: vi.fn(),
  handlePlaceOrder: vi.fn(),
  handleNotesChange: vi.fn(),
  handleRetryPayment: vi.fn(),
  handleQRDialogClose: vi.fn(),
  handleNavigateToAddressBook: vi.fn(),
  handleCloseAddressManagementDialog: vi.fn(),
  handleSelectAddress: vi.fn(),
  fieldErrors: {},
  clearFieldError: vi.fn(),
  ...overrides,
});

const renderWithTheme = (ui: React.ReactElement) => render(<Theme>{ui}</Theme>);

describe('CartDesktopCheckout', () => {
  const defaultProps = {
    checkoutSessionId: 'cs-123',
    checkoutSession: createCheckoutSession(),
    locale: 'vi' as const,
    onPaymentProcessingChange: vi.fn(),
    onAddressLoadedChange: vi.fn(),
    onCheckoutSessionUpdate: vi.fn(),
  };

  beforeEach(() => {
    mockUseConfirmOrder.mockReturnValue(createMockReturn() as any);
  });

  describe('Loading states', () => {
    it('shows loading text when isLoading', () => {
      mockUseConfirmOrder.mockReturnValue(
        createMockReturn({ isLoading: true }) as any
      );
      renderWithTheme(<CartDesktopCheckout {...defaultProps} />);
      expect(screen.getByText('loading')).toBeInTheDocument();
    });

    it('shows loading text when no checkoutSession', () => {
      mockUseConfirmOrder.mockReturnValue(
        createMockReturn({ checkoutSession: null }) as any
      );
      renderWithTheme(<CartDesktopCheckout {...defaultProps} />);
      expect(screen.getByText('loading')).toBeInTheDocument();
    });

    it('shows loading text when checkoutSession has empty id', () => {
      mockUseConfirmOrder.mockReturnValue(
        createMockReturn({
          checkoutSession: createCheckoutSession({ id: '' }),
        }) as any
      );
      renderWithTheme(<CartDesktopCheckout {...defaultProps} />);
      expect(screen.getByText('loading')).toBeInTheDocument();
    });
  });

  describe('Shipping section', () => {
    it('renders ConfirmOrderShippingAuth for authenticated users', () => {
      mockUseConfirmOrder.mockReturnValue(
        createMockReturn({ isAuthenticated: true }) as any
      );
      renderWithTheme(<CartDesktopCheckout {...defaultProps} />);
      expect(screen.getByTestId('shipping-auth')).toBeInTheDocument();
      expect(screen.queryByTestId('shipping-guest')).not.toBeInTheDocument();
    });

    it('renders ConfirmOrderShippingGuest for guest users', () => {
      mockUseConfirmOrder.mockReturnValue(
        createMockReturn({ isAuthenticated: false }) as any
      );
      renderWithTheme(<CartDesktopCheckout {...defaultProps} />);
      expect(screen.getByTestId('shipping-guest')).toBeInTheDocument();
      expect(screen.queryByTestId('shipping-auth')).not.toBeInTheDocument();
    });
  });

  describe('Order components', () => {
    it('renders CartPaymentMethod', () => {
      renderWithTheme(<CartDesktopCheckout {...defaultProps} />);
      expect(screen.getByTestId('cart-payment-method')).toBeInTheDocument();
    });

    it('renders ConfirmOrderPlaceButton', () => {
      renderWithTheme(<CartDesktopCheckout {...defaultProps} />);
      expect(screen.getByTestId('place-button')).toBeInTheDocument();
    });

    it('renders QRCodeDialog', () => {
      renderWithTheme(<CartDesktopCheckout {...defaultProps} />);
      expect(screen.getByTestId('qr-dialog')).toBeInTheDocument();
    });
  });

  describe('Payment status', () => {
    it('renders ConfirmOrderPaymentStatus when isPaymentProcessing', () => {
      mockUseConfirmOrder.mockReturnValue(
        createMockReturn({ isPaymentProcessing: true }) as any
      );
      renderWithTheme(<CartDesktopCheckout {...defaultProps} />);
      expect(screen.getByTestId('payment-status')).toBeInTheDocument();
    });

    it('hides ConfirmOrderPaymentStatus when not processing', () => {
      mockUseConfirmOrder.mockReturnValue(
        createMockReturn({ isPaymentProcessing: false }) as any
      );
      renderWithTheme(<CartDesktopCheckout {...defaultProps} />);
      expect(screen.queryByTestId('payment-status')).not.toBeInTheDocument();
    });
  });

  describe('Address dialog', () => {
    it('renders AddressManagementDialog for authenticated users', () => {
      mockUseConfirmOrder.mockReturnValue(
        createMockReturn({ isAuthenticated: true }) as any
      );
      renderWithTheme(<CartDesktopCheckout {...defaultProps} />);
      expect(screen.getByTestId('address-dialog')).toBeInTheDocument();
    });

    it('hides AddressManagementDialog for guest users', () => {
      mockUseConfirmOrder.mockReturnValue(
        createMockReturn({ isAuthenticated: false }) as any
      );
      renderWithTheme(<CartDesktopCheckout {...defaultProps} />);
      expect(screen.queryByTestId('address-dialog')).not.toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('notifies parent of payment processing state', () => {
      const onPaymentProcessingChange = vi.fn();
      mockUseConfirmOrder.mockReturnValue(
        createMockReturn({ isPaymentProcessing: true }) as any
      );
      renderWithTheme(
        <CartDesktopCheckout
          {...defaultProps}
          onPaymentProcessingChange={onPaymentProcessingChange}
        />
      );
      expect(onPaymentProcessingChange).toHaveBeenCalledWith(true);
    });

    it('notifies parent of address loaded state', () => {
      const onAddressLoadedChange = vi.fn();
      mockUseConfirmOrder.mockReturnValue(
        createMockReturn({ isAddressLoaded: true }) as any
      );
      renderWithTheme(
        <CartDesktopCheckout
          {...defaultProps}
          onAddressLoadedChange={onAddressLoadedChange}
        />
      );
      expect(onAddressLoadedChange).toHaveBeenCalledWith(true);
    });
  });
});
