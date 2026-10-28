/**
 * Cart Test Helpers
 * Shared utilities for cart component tests
 */

import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { Theme } from '@radix-ui/themes';
import { Provider } from 'react-redux';
import { setupStore } from './testUtils';
import { RootState } from '@/lib/store';
import type { CheckoutSession } from '@/types/gen/shop/shared/checkout-sessions/checkout-session';
import checkoutSessionFixtures from '../fixtures/checkoutSession.json';

// ============= RENDER HELPERS =============

/**
 * Render with Radix Theme wrapper (pattern from CartBottomBar.test.tsx)
 */
export function renderWithTheme(ui: ReactElement) {
  return render(<Theme>{ui}</Theme>);
}

/**
 * Render with Redux Provider + Radix Theme
 */
export function renderCartWithProviders(
  ui: ReactElement,
  options?: {
    preloadedState?: Partial<RootState>;
  }
) {
  const store = setupStore(options?.preloadedState);
  return {
    store,
    ...render(
      <Provider store={store}>
        <Theme>{ui}</Theme>
      </Provider>
    ),
  };
}

// ============= MEDIA QUERY HELPERS =============

/**
 * Mock window.matchMedia to simulate desktop or mobile viewport
 */
export function mockMatchMedia(isDesktop: boolean) {
  const listeners: Array<(_e: MediaQueryListEvent) => void> = [];
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: isDesktop,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((_event: string, handler: (_e: MediaQueryListEvent) => void) => {
        listeners.push(handler);
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  return { listeners };
}

// ============= FIXTURE LOADERS =============

export const loadCheckoutSessionWithItems = () =>
  checkoutSessionFixtures.checkoutSessionWithItems as unknown as CheckoutSession;

export const loadCheckoutSessionEmpty = () =>
  checkoutSessionFixtures.checkoutSessionEmpty as unknown as CheckoutSession;

export const loadCheckoutSessionUnavailable = () =>
  checkoutSessionFixtures.checkoutSessionUnavailable as unknown as CheckoutSession;

// ============= HOOK MOCK FACTORIES =============

/**
 * Create mock return value for useCartContent hook
 */
export function createMockUseCartContentReturn(overrides?: Record<string, unknown>) {
  return {
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
  };
}

/**
 * Create mock return value for useConfirmOrder hook
 */
export function createMockUseConfirmOrderReturn(overrides?: Record<string, unknown>) {
  return {
    isAuthenticated: false,
    isDesktop: false,
    checkoutSession: loadCheckoutSessionWithItems(),
    isLoading: false,
    isPlacingOrder: false,
    isCalculatingCheckout: false,
    isPaymentProcessing: false,
    isUpdatingQuantity: false,
    paymentMethod: 'COD',
    shippingFormData: {
      fullName: '',
      phone: '',
      email: '',
      address: '',
      wardId: '',
      districtId: '',
      cityId: '',
      ward: '',
      district: '',
      city: '',
      notes: '',
    },
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
    handleBackToCart: vi.fn(),
    handleItemQuantityChange: vi.fn(),
    handleNotesChange: vi.fn(),
    handleRetryPayment: vi.fn(),
    handleQRDialogClose: vi.fn(),
    handleNavigateToAddressBook: vi.fn(),
    handleCloseAddressManagementDialog: vi.fn(),
    handleSelectAddress: vi.fn(),
    handleVoucherApplied: vi.fn(),
    fieldErrors: {},
    clearFieldError: vi.fn(),
    ...overrides,
  };
}
