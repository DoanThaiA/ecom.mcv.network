import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Theme } from '@radix-ui/themes';
import { ConfirmOrderPlaceButton } from '@/components/cart/ConfirmOrderPlaceButton';
import type { CheckoutSession } from '@/types/gen/shop/shared/checkout-sessions/checkout-session';

// Mock formatPrice
vi.mock('@/lib/utils/format', () => ({
  formatPrice: (price: number) => `${price.toLocaleString('de-DE')}₫`,
}));

const renderWithTheme = (ui: React.ReactElement) => render(<Theme>{ui}</Theme>);

const createCheckoutSession = (overrides?: Partial<CheckoutSession>): CheckoutSession =>
  ({
    id: 'cs-123',
    sessionNumber: 'CS001',
    sessionId: 'sess-123',
    clearCartAfterOrder: true,
    items: [],
    comboInstances: [],
    subtotal: 897000,
    shippingFee: 0,
    discount: 50000,
    discountDetails: [],
    totalDiscount: 50000,
    shippingDiscount: 0,
    total: 897000,
    status: 'ACTIVE',
    hasUnavailableItems: false,
    canPlaceOrder: true,
    missingFields: [],
    appliedVouchers: [],
    ...overrides,
  }) as unknown as CheckoutSession;

describe('ConfirmOrderPlaceButton', () => {
  const defaultProps = {
    checkoutSession: createCheckoutSession(),
    isPlacingOrder: false,
    isPaymentProcessing: false,
    onPlaceOrder: vi.fn(),
  };

  describe('Display', () => {
    it('renders total payment label', () => {
      renderWithTheme(<ConfirmOrderPlaceButton {...defaultProps} />);
      expect(screen.getByText('totalPayment')).toBeInTheDocument();
    });

    it('renders formatted total price', () => {
      renderWithTheme(<ConfirmOrderPlaceButton {...defaultProps} />);
      expect(screen.getByText('897.000₫')).toBeInTheDocument();
    });

    it('renders place order button', () => {
      renderWithTheme(<ConfirmOrderPlaceButton {...defaultProps} />);
      expect(screen.getByText('placeOrder')).toBeInTheDocument();
    });

    it('renders zero total when total is 0', () => {
      renderWithTheme(
        <ConfirmOrderPlaceButton
          {...defaultProps}
          checkoutSession={createCheckoutSession({ total: 0 })}
        />
      );
      expect(screen.getByText('0₫')).toBeInTheDocument();
    });
  });

  describe('Button enabled state', () => {
    it('is enabled when canPlaceOrder and not placing/processing', () => {
      renderWithTheme(<ConfirmOrderPlaceButton {...defaultProps} />);
      const button = screen.getByText('placeOrder').closest('button');
      expect(button).not.toBeDisabled();
    });

    it('calls onPlaceOrder when clicked', async () => {
      const user = userEvent.setup();
      const onPlaceOrder = vi.fn();
      renderWithTheme(
        <ConfirmOrderPlaceButton {...defaultProps} onPlaceOrder={onPlaceOrder} />
      );
      await user.click(screen.getByText('placeOrder'));
      expect(onPlaceOrder).toHaveBeenCalledTimes(1);
    });
  });

  describe('Button disabled state', () => {
    it('is disabled when canPlaceOrder is false', () => {
      renderWithTheme(
        <ConfirmOrderPlaceButton
          {...defaultProps}
          checkoutSession={createCheckoutSession({ canPlaceOrder: false })}
        />
      );
      const button = screen.getByText('placeOrder').closest('button');
      expect(button).toBeDisabled();
    });

    it('is disabled when isPlacingOrder is true', () => {
      renderWithTheme(
        <ConfirmOrderPlaceButton {...defaultProps} isPlacingOrder={true} />
      );
      const button = screen.getByText('placeOrder').closest('button');
      expect(button).toBeDisabled();
    });

    it('is disabled when isPaymentProcessing is true', () => {
      renderWithTheme(
        <ConfirmOrderPlaceButton {...defaultProps} isPaymentProcessing={true} />
      );
      const button = screen.getByText('placeOrder').closest('button');
      expect(button).toBeDisabled();
    });

    it('is disabled when fieldErrors has entries', () => {
      renderWithTheme(
        <ConfirmOrderPlaceButton
          {...defaultProps}
          fieldErrors={{ phone: 'Required' }}
        />
      );
      const button = screen.getByText('placeOrder').closest('button');
      expect(button).toBeDisabled();
    });

    it('does not call onPlaceOrder when disabled', async () => {
      const user = userEvent.setup();
      const onPlaceOrder = vi.fn();
      renderWithTheme(
        <ConfirmOrderPlaceButton
          {...defaultProps}
          onPlaceOrder={onPlaceOrder}
          isPlacingOrder={true}
        />
      );
      await user.click(screen.getByText('placeOrder'));
      expect(onPlaceOrder).not.toHaveBeenCalled();
    });
  });

  describe('Unavailable items warning', () => {
    it('shows warning when hasUnavailableItems is true', () => {
      renderWithTheme(
        <ConfirmOrderPlaceButton
          {...defaultProps}
          checkoutSession={createCheckoutSession({ hasUnavailableItems: true })}
        />
      );
      expect(screen.getByText('unavailableItemsWarning')).toBeInTheDocument();
    });

    it('hides warning when hasUnavailableItems is false', () => {
      renderWithTheme(<ConfirmOrderPlaceButton {...defaultProps} />);
      expect(screen.queryByText('unavailableItemsWarning')).not.toBeInTheDocument();
    });
  });
});
