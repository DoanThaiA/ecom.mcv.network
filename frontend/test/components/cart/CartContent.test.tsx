import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Theme } from '@radix-ui/themes';
import { CartContent } from '@/components/cart/CartContent';
import { useCartContent } from '@/components/cart/hooks/useCartContent';
import { useConfirmOrder } from '@/components/cart/hooks/useConfirmOrder';
import { showErrorToast } from '@/lib/helpers/toastHelper';
import type { CheckoutSession } from '@/types/gen/shop/shared/checkout-sessions/checkout-session';

// Mock hooks
vi.mock('@/components/cart/hooks/useCartContent', () => ({
  useCartContent: vi.fn(),
}));

vi.mock('@/components/cart/hooks/useConfirmOrder', () => ({
  useConfirmOrder: vi.fn(),
}));

vi.mock('@/lib/helpers/toastHelper', () => ({
  showErrorToast: vi.fn(),
}));

// Mock formatPrice
vi.mock('@/lib/utils/format', () => ({
  formatPrice: (price: number) => `${price.toLocaleString('de-DE')}₫`,
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock child components
vi.mock('@/components/cart/CartItem', () => ({
  CartItem: ({ item }: any) => <div data-testid={`cart-item-${item.productId}`}>{item.productId}</div>,
}));

vi.mock('@/components/cart/EmptyCart', () => ({
  EmptyCart: () => <div data-testid="empty-cart">EmptyCart</div>,
}));

vi.mock('@/components/cart/PaymentDetails', () => ({
  PaymentDetails: () => <div data-testid="payment-details">PaymentDetails</div>,
}));

vi.mock('@/components/cart/GiftOfferSection', () => ({
  GiftOfferSection: () => <div data-testid="gift-offer-section">GiftOfferSection</div>,
}));

vi.mock('@/components/cart/VoucherSection', () => ({
  VoucherSection: () => <div data-testid="voucher-section">VoucherSection</div>,
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

const mockUseCartContent = vi.mocked(useCartContent);
const mockUseConfirmOrder = vi.mocked(useConfirmOrder);

const createMockCartReturn = (overrides?: any) => ({
  cart: { items: [] },
  isLoading: false,
  isInitialized: true,
  isCalculatingCheckout: false,
  giftEligibility: null,
  isLoadingGiftEligibility: false,
  isClearDialogOpen: false,
  setIsClearDialogOpen: vi.fn(),
  isClearingCart: false,
  isUpdatingQuantity: false,
  isAllSelected: false,
  selectedGiftProductIds: [],
  handleItemSelect: vi.fn(),
  handleSelectAll: vi.fn(),
  handleClearCart: vi.fn(),
  handleSelectGift: vi.fn(),
  handleSetBuyXGetYGifts: vi.fn(),
  handleRemoveGift: vi.fn(),
  handleQuantityChange: vi.fn(),
  handleRemoveItem: vi.fn(),
  fetchGiftEligibility: vi.fn(),
  handleVoucherApplied: vi.fn(),
  getItemKey: vi.fn((item: any, index: number) => `${item.productId}-${index}`),
  getSelectionKey: vi.fn((item: any) => item.productId),
  getComboInstance: vi.fn(() => null),
  isItemSelected: vi.fn(() => false),
  ...overrides,
});

const createCheckoutSession = (overrides?: Partial<CheckoutSession>): CheckoutSession =>
  ({
    id: 'cs-123',
    items: [],
    total: 897000,
    discount: 50000,
    hasUnavailableItems: false,
    canPlaceOrder: true,
    ...overrides,
  }) as unknown as CheckoutSession;

const renderWithTheme = (ui: React.ReactElement) => render(<Theme>{ui}</Theme>);

describe('CartContent', () => {
  const defaultProps = {
    locale: 'vi' as const,
    checkoutSession: createCheckoutSession(),
    onCheckoutSessionUpdate: vi.fn(),
    isActive: true,
  };

  beforeEach(() => {
    mockUseCartContent.mockReturnValue(createMockCartReturn() as any);
    mockUseConfirmOrder.mockReturnValue({ isAuthenticated: false } as any);
    mockPush.mockClear();
  });

  describe('Loading state', () => {
    it('shows spinner when not initialized', () => {
      mockUseCartContent.mockReturnValue(
        createMockCartReturn({ isInitialized: false }) as any
      );
      const { container } = renderWithTheme(<CartContent {...defaultProps} />);
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('shows spinner when loading', () => {
      mockUseCartContent.mockReturnValue(
        createMockCartReturn({ isLoading: true }) as any
      );
      const { container } = renderWithTheme(<CartContent {...defaultProps} />);
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Empty cart', () => {
    it('renders EmptyCart when cart items is empty', () => {
      mockUseCartContent.mockReturnValue(
        createMockCartReturn({ cart: { items: [] } }) as any
      );
      renderWithTheme(<CartContent {...defaultProps} />);
      expect(screen.getByTestId('empty-cart')).toBeInTheDocument();
    });
  });

  describe('Cart with items', () => {
    const cartItems = [
      { productId: 'prod-1', variantId: 'v1', isGift: false },
      { productId: 'prod-2', variantId: 'v3', isGift: false },
    ];

    beforeEach(() => {
      mockUseCartContent.mockReturnValue(
        createMockCartReturn({ cart: { items: cartItems } }) as any
      );
    });

    it('renders cart items', () => {
      renderWithTheme(<CartContent {...defaultProps} />);
      expect(screen.getByTestId('cart-item-prod-1')).toBeInTheDocument();
      expect(screen.getByTestId('cart-item-prod-2')).toBeInTheDocument();
    });

    it('renders page title', () => {
      renderWithTheme(<CartContent {...defaultProps} />);
      expect(screen.getByText('pageTitle')).toBeInTheDocument();
    });

    it('renders selectAll text', () => {
      renderWithTheme(<CartContent {...defaultProps} />);
      expect(screen.getByText('selectAll')).toBeInTheDocument();
    });

    it('renders clearAll text', () => {
      renderWithTheme(<CartContent {...defaultProps} />);
      expect(screen.getByText('clearAll')).toBeInTheDocument();
    });

    it('renders VoucherSection', () => {
      renderWithTheme(<CartContent {...defaultProps} />);
      expect(screen.getByTestId('voucher-section')).toBeInTheDocument();
    });

    it('renders PaymentDetails', () => {
      renderWithTheme(<CartContent {...defaultProps} />);
      expect(screen.getByTestId('payment-details')).toBeInTheDocument();
    });
  });

  describe('Select all', () => {
    it('calls handleSelectAll when select all is clicked', async () => {
      const handleSelectAll = vi.fn();
      const cartItems = [{ productId: 'prod-1', variantId: 'v1', isGift: false }];
      mockUseCartContent.mockReturnValue(
        createMockCartReturn({
          cart: { items: cartItems },
          handleSelectAll,
        }) as any
      );

      const user = userEvent.setup();
      renderWithTheme(<CartContent {...defaultProps} />);
      await user.click(screen.getByText('selectAll'));
      expect(handleSelectAll).toHaveBeenCalled();
    });
  });

  describe('Place order', () => {
    const cartItems = [{ productId: 'prod-1', variantId: 'v1', isGift: false }];

    beforeEach(() => {
      mockUseCartContent.mockReturnValue(
        createMockCartReturn({ cart: { items: cartItems } }) as any
      );
    });

    it('renders place order button', () => {
      renderWithTheme(<CartContent {...defaultProps} />);
      expect(screen.getByText('placeOrder')).toBeInTheDocument();
    });

    it('navigates to confirm page when place order clicked with valid session', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CartContent {...defaultProps} />);
      await user.click(screen.getByText('placeOrder'));
      expect(mockPush).toHaveBeenCalledWith('/vi/cart/confirm?checkoutSessionId=cs-123&source=cart');
    });

    it('shows error toast when no checkout session id', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <CartContent
          {...defaultProps}
          checkoutSession={createCheckoutSession({ id: '' })}
        />
      );
      await user.click(screen.getByText('placeOrder'));
      expect(showErrorToast).toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('is disabled when cart is empty', () => {
      mockUseCartContent.mockReturnValue(
        createMockCartReturn({ cart: { items: [] } }) as any
      );
      // Empty cart shows EmptyCart component, not the button
      renderWithTheme(<CartContent {...defaultProps} />);
      expect(screen.queryByText('placeOrder')).not.toBeInTheDocument();
    });
  });

  describe('Total and saved amount', () => {
    it('displays total price', () => {
      const cartItems = [{ productId: 'prod-1', variantId: 'v1', isGift: false }];
      mockUseCartContent.mockReturnValue(
        createMockCartReturn({ cart: { items: cartItems } }) as any
      );
      renderWithTheme(<CartContent {...defaultProps} />);
      expect(screen.getByText('897.000₫')).toBeInTheDocument();
    });

    it('displays saved amount', () => {
      const cartItems = [{ productId: 'prod-1', variantId: 'v1', isGift: false }];
      mockUseCartContent.mockReturnValue(
        createMockCartReturn({ cart: { items: cartItems } }) as any
      );
      renderWithTheme(<CartContent {...defaultProps} />);
      expect(screen.getByText(/50\.000₫/)).toBeInTheDocument();
    });
  });

  describe('Gift section', () => {
    const cartItems = [{ productId: 'prod-1', variantId: 'v1', isGift: false }];

    it('shows GiftOfferSection when authenticated with eligible gifts', () => {
      mockUseCartContent.mockReturnValue(
        createMockCartReturn({
          cart: { items: cartItems },
          giftEligibility: [{ promotionId: 'promo-1' }],
        }) as any
      );
      mockUseConfirmOrder.mockReturnValue({ isAuthenticated: true } as any);
      renderWithTheme(<CartContent {...defaultProps} />);
      expect(screen.getByTestId('gift-offer-section')).toBeInTheDocument();
    });

    it('shows GiftOfferSection to guests when eligible gifts exist', () => {
      mockUseCartContent.mockReturnValue(
        createMockCartReturn({
          cart: { items: cartItems },
          giftEligibility: [{ promotionId: 'promo-1' }],
        }) as any
      );
      mockUseConfirmOrder.mockReturnValue({ isAuthenticated: false } as any);
      renderWithTheme(<CartContent {...defaultProps} />);
      expect(screen.getByTestId('gift-offer-section')).toBeInTheDocument();
    });

    it('hides GiftOfferSection when no eligibility data', () => {
      mockUseCartContent.mockReturnValue(
        createMockCartReturn({
          cart: { items: cartItems },
          giftEligibility: null,
        }) as any
      );
      mockUseConfirmOrder.mockReturnValue({ isAuthenticated: true } as any);
      renderWithTheme(<CartContent {...defaultProps} />);
      expect(screen.queryByTestId('gift-offer-section')).not.toBeInTheDocument();
    });

    it('hides GiftOfferSection when eligibility is empty array', () => {
      mockUseCartContent.mockReturnValue(
        createMockCartReturn({
          cart: { items: cartItems },
          giftEligibility: [],
        }) as any
      );
      mockUseConfirmOrder.mockReturnValue({ isAuthenticated: true } as any);
      renderWithTheme(<CartContent {...defaultProps} />);
      expect(screen.queryByTestId('gift-offer-section')).not.toBeInTheDocument();
    });
  });
});
