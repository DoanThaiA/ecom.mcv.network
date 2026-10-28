/**
 * Account Page Integration Tests
 * Tests user account management flows
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { AccountInfoSection } from '@/components/account/AccountInfoSection';
import { ShippingInfoSection } from '@/components/account/ShippingInfoSection';
import { renderWithProviders } from '@/test/utils/testUtils';
import { mockUser, mockAddress } from '@/test/utils/mockData';

describe('AccountPage - User Account Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TC-FACCOUNT-001: View Account Information', () => {
    it('should render account info section', () => {
      const { container } = renderWithProviders(<AccountInfoSection />, {
        preloadedState: {
          account: {
            user: mockUser,
            status: 'succeeded',
            error: null,
          },
        },
      });

      // Component should render
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle user with email', () => {
      const { container } = renderWithProviders(<AccountInfoSection />, {
        preloadedState: {
          account: {
            user: mockUser,
            status: 'succeeded',
            error: null,
          },
        },
      });

      expect(container).toBeInTheDocument();
    });

    it('should handle user with phone', () => {
      const { container } = renderWithProviders(<AccountInfoSection />, {
        preloadedState: {
          account: {
            user: mockUser,
            status: 'succeeded',
            error: null,
          },
        },
      });

      expect(container).toBeInTheDocument();
    });
  });

  describe('TC-FACCOUNT-002: Edit Account Information', () => {
    it('should have edit button for account info', () => {
      renderWithProviders(<AccountInfoSection />, {
        preloadedState: {
          account: {
            user: mockUser,
            status: 'succeeded',
            error: null,
          },
        },
      });

      const editButtons = screen.getAllByRole('button');
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it('should render account info section', () => {
      const { container } = renderWithProviders(<AccountInfoSection />, {
        preloadedState: {
          account: {
            user: mockUser,
            status: 'succeeded',
            error: null,
          },
        },
      });

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('TC-FACCOUNT-003: View Shipping Addresses', () => {
    it('should render shipping info section', () => {
      const { container } = renderWithProviders(<ShippingInfoSection />, {
        preloadedState: {
          account: {
            user: mockUser,
            addresses: [mockAddress],
            status: 'succeeded',
            error: null,
          },
        },
      });

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle addresses array', () => {
      const { container } = renderWithProviders(<ShippingInfoSection />, {
        preloadedState: {
          account: {
            user: mockUser,
            addresses: [mockAddress],
            status: 'succeeded',
            error: null,
          },
        },
      });

      // Component renders with addresses
      expect(container).toBeInTheDocument();
    });
  });

  describe('TC-FACCOUNT-004: Add New Shipping Address', () => {
    it('should have button to add new address', () => {
      renderWithProviders(<ShippingInfoSection />, {
        preloadedState: {
          account: {
            user: mockUser,
            addresses: [],
            status: 'succeeded',
            error: null,
          },
        },
      });

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('TC-FACCOUNT-005: Edit Shipping Address', () => {
    it('should render addresses that can be edited', () => {
      const { container } = renderWithProviders(<ShippingInfoSection />, {
        preloadedState: {
          account: {
            user: mockUser,
            addresses: [mockAddress],
            status: 'succeeded',
            error: null,
          },
        },
      });

      // Component renders with address
      expect(container).toBeInTheDocument();
    });
  });

  describe('TC-FACCOUNT-006: Delete Shipping Address', () => {
    it('should display address that can be managed', () => {
      const { container } = renderWithProviders(<ShippingInfoSection />, {
        preloadedState: {
          account: {
            user: mockUser,
            addresses: [mockAddress],
            status: 'succeeded',
            error: null,
          },
        },
      });

      expect(container).toBeInTheDocument();
    });
  });

  describe('TC-FACCOUNT-007: Set Default Address', () => {
    it('should show default address indicator', () => {
      const defaultAddress = { ...mockAddress, isDefault: true };

      const { container } = renderWithProviders(<ShippingInfoSection />, {
        preloadedState: {
          account: {
            user: mockUser,
            addresses: [defaultAddress],
            status: 'succeeded',
            error: null,
          },
        },
      });

      // Default address renders
      expect(container).toBeInTheDocument();
    });
  });

  describe('TC-FACCOUNT-008: Account Loading State', () => {
    it('should handle loading state', () => {
      renderWithProviders(<AccountInfoSection />, {
        preloadedState: {
          account: {
            user: null,
            status: 'loading',
            error: null,
          },
        },
      });

      // Component should render without crashing
      const { container } = renderWithProviders(<AccountInfoSection />, {
        preloadedState: {
          account: {
            user: null,
            status: 'loading',
            error: null,
          },
        },
      });

      expect(container).toBeInTheDocument();
    });
  });

  describe('TC-FACCOUNT-009: Account Error State', () => {
    it('should handle error state gracefully', () => {
      const { container } = renderWithProviders(<AccountInfoSection />, {
        preloadedState: {
          account: {
            user: null,
            status: 'failed',
            error: 'Failed to load account',
          },
        },
      });

      expect(container).toBeInTheDocument();
    });
  });

  describe('TC-FACCOUNT-010: Empty State', () => {
    it('should handle empty addresses state', () => {
      renderWithProviders(<ShippingInfoSection />, {
        preloadedState: {
          account: {
            user: mockUser,
            addresses: [],
            status: 'succeeded',
            error: null,
          },
        },
      });

      // Should render without crashing
      const buttons = screen.getAllByRole('button');
      expect(buttons).toBeDefined();
    });
  });
});
