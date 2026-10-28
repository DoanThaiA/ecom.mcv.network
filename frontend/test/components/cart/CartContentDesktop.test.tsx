import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Theme } from '@radix-ui/themes';
import { CartContentDesktop } from '@/components/cart/CartContentDesktop';
import { useCartContent } from '@/components/cart/hooks/useCartContent';
import type { CheckoutSession } from '@/types/gen/shop/shared/checkout-sessions/checkout-session';

// Mock hooks
vi.mock('@/components/cart/hooks/useCartContent', () => ({
  useCartContent: vi.fn(),
}));

// Mock selectIsAuthenticated
vi.mock('@/lib/store/slices/authSlice', () => ({
  selectIsAuthenticated: (state: any) => state?.auth?.isAuthenticated ?? false,
}));

vi.mock('@/lib/store/hooks', () => ({
  useAppSelector: vi.fn((selector: any) => selector({ auth: { isAuthenticated: false } })),
}));

import { useAppSelector } from '@/lib/store/hooks';
const mockUseAppSelector = vi.mocked(useAppSelector);

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

vi.mock('@/components/cart/CartDesktopCheckout', () => ({
  CartDesktopCheckout: (props: any) => (
    <div data-testid="desktop-checkout" data-session-id={props.checkoutSessionId}>
      CartDesktopCheckout
    </div>
  ),
}));

vi.mock('@/components/cart/VoucherSection', () => ({
  VoucherSection: () => <div data-testid="voucher-section">VoucherSection</div>,
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

const mockUseCartContent = vi.mocked(useCartContent);

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
    canPlaceOrder: true,
    hasUnavailableItems: false,
    ...overrides,
  }) as unknown as CheckoutSession;

const renderWithTheme = (ui: React.ReactElement) => render(<Theme>{ui}</Theme>);

describe('CartContentDesktop', () => {
  const defaultProps = {
    locale: 'vi' as const,
    checkoutSession: createCheckoutSession(),
    onCheckoutSessionUpdate: vi.fn(),
    isActive: true,
  };

  beforeEach(() => {
    mockUseCartContent.mockReturnValue(createMockCartReturn() as any);
    mockUseAppSelector.mockImplementation((selector: any) =>
      selector({ auth: { isAuthenticated: false } })
    );
  });

  describe('Loading state', () => {
    it('shows loading text when isLoading', () => {
      mockUseCartContent.mockReturnValue(
        createMockCartReturn({ isLoading: true }) as any
      );
      renderWithTheme(<CartContentDesktop {...defaultProps} />);
      expect(screen.getByText('loading')).toBeInTheDocument();
    });
  });

  describe('Empty cart', () => {
    it('renders EmptyCart when cart is empty', () => {
      mockUseCartContent.mockReturnValue(
        createMockCartReturn({ cart: { items: [] } }) as any
      );
      renderWithTheme(<CartContentDesktop {...defaultProps} />);
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
      renderWithTheme(<CartContentDesktop {...defaultProps} />);
      expect(screen.getByTestId('cart-item-prod-1')).toBeInTheDocument();
      expect(screen.getByTestId('cart-item-prod-2')).toBeInTheDocument();
    });

    it('renders page title', () => {
      renderWithTheme(<CartContentDesktop {...defaultProps} />);
      expect(screen.getByText('pageTitle')).toBeInTheDocument();
    });

    it('renders selectAll text', () => {
      renderWithTheme(<CartContentDesktop {...defaultProps} />);
      expect(screen.getByText('selectAll')).toBeInTheDocument();
    });

    it('renders clearAll text', () => {
      renderWithTheme(<CartContentDesktop {...defaultProps} />);
      expect(screen.getByText('clearAll')).toBeInTheDocument();
    });

    it('renders CartDesktopCheckout', () => {
      renderWithTheme(<CartContentDesktop {...defaultProps} />);
      expect(screen.getByTestId('desktop-checkout')).toBeInTheDocument();
    });

    it('passes checkoutSessionId to CartDesktopCheckout', () => {
      renderWithTheme(<CartContentDesktop {...defaultProps} />);
      expect(screen.getByTestId('desktop-checkout')).toHaveAttribute(
        'data-session-id',
        'cs-123'
      );
    });

    it('renders VoucherSection', () => {
      renderWithTheme(<CartContentDesktop {...defaultProps} />);
      expect(screen.getByTestId('voucher-section')).toBeInTheDocument();
    });

    it('renders PaymentDetails', () => {
      renderWithTheme(<CartContentDesktop {...defaultProps} />);
      expect(screen.getByTestId('payment-details')).toBeInTheDocument();
    });
  });

  describe('Select All interaction', () => {
    it('calls handleSelectAll when clicked', async () => {
      const handleSelectAll = vi.fn();
      const cartItems = [{ productId: 'prod-1', variantId: 'v1', isGift: false }];
      mockUseCartContent.mockReturnValue(
        createMockCartReturn({ cart: { items: cartItems }, handleSelectAll }) as any
      );

      const user = userEvent.setup();
      renderWithTheme(<CartContentDesktop {...defaultProps} />);
      await user.click(screen.getByText('selectAll'));
      expect(handleSelectAll).toHaveBeenCalled();
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
      mockUseAppSelector.mockImplementation((selector: any) =>
        selector({ auth: { isAuthenticated: true } })
      );
      renderWithTheme(<CartContentDesktop {...defaultProps} />);
      expect(screen.getByTestId('gift-offer-section')).toBeInTheDocument();
    });

    it('shows GiftOfferSection to guests when eligible gifts exist', () => {
      mockUseCartContent.mockReturnValue(
        createMockCartReturn({
          cart: { items: cartItems },
          giftEligibility: [{ promotionId: 'promo-1' }],
        }) as any
      );
      mockUseAppSelector.mockImplementation((selector: any) =>
        selector({ auth: { isAuthenticated: false } })
      );
      renderWithTheme(<CartContentDesktop {...defaultProps} />);
      expect(screen.getByTestId('gift-offer-section')).toBeInTheDocument();
    });

    it('hides GiftOfferSection when no eligibility', () => {
      mockUseCartContent.mockReturnValue(
        createMockCartReturn({
          cart: { items: cartItems },
          giftEligibility: null,
        }) as any
      );
      mockUseAppSelector.mockImplementation((selector: any) =>
        selector({ auth: { isAuthenticated: true } })
      );
      renderWithTheme(<CartContentDesktop {...defaultProps} />);
      expect(screen.queryByTestId('gift-offer-section')).not.toBeInTheDocument();
    });
  });
});
