import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserAvatarMenu } from '@/components/navigation/UserAvatarMenu';
import { Theme } from '@radix-ui/themes';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Mock UserMenuPopover
vi.mock('@/components/popover/UserMenuPopover', () => ({
  UserMenuPopover: ({ locale, onClose }: { locale: string; onClose: () => void }) => (
    <div data-testid="user-menu-popover" data-locale={locale}>
      User Menu Popover
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

// Mock getUserFullName helper
vi.mock('@/lib/helpers/userHelper', () => ({
  getUserFullName: (user: any) => {
    if (!user) return '';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  },
}));

describe('UserAvatarMenu', () => {
  const createMockStore = (user: any = null) => {
    return configureStore({
      reducer: {
        account: (state = { user }) => state,
      },
    });
  };

  const renderWithProviders = (ui: React.ReactElement, store: any) => {
    return render(
      <Provider store={store}>
        <Theme>{ui}</Theme>
      </Provider>
    );
  };

  describe('Basic rendering', () => {
    it('renders without crashing', () => {
      const store = createMockStore();
      const { container } = renderWithProviders(<UserAvatarMenu locale="vi" />, store);
      expect(container).toBeInTheDocument();
    });

    it('renders avatar component', () => {
      const store = createMockStore();
      renderWithProviders(<UserAvatarMenu locale="vi" />, store);
      const avatar = document.querySelector('[class*="rt-Avatar"]');
      expect(avatar).toBeInTheDocument();
    });

    it('renders with en locale', () => {
      const store = createMockStore();
      renderWithProviders(<UserAvatarMenu locale="en" />, store);
      const avatar = document.querySelector('[class*="rt-Avatar"]');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Avatar fallback', () => {
    it('renders with user having first and last name', () => {
      const user = { firstName: 'John', lastName: 'Doe' };
      const store = createMockStore(user);
      const { container } = renderWithProviders(<UserAvatarMenu locale="vi" />, store);
      const avatar = container.querySelector('[class*="rt-Avatar"]');
      expect(avatar).toBeInTheDocument();
    });

    it('renders with user having only first name', () => {
      const user = { firstName: 'John', lastName: '' };
      const store = createMockStore(user);
      const { container } = renderWithProviders(<UserAvatarMenu locale="vi" />, store);
      const avatar = container.querySelector('[class*="rt-Avatar"]');
      expect(avatar).toBeInTheDocument();
    });

    it('renders when user is null', () => {
      const store = createMockStore(null);
      const { container } = renderWithProviders(<UserAvatarMenu locale="vi" />, store);
      const avatar = container.querySelector('[class*="rt-Avatar"]');
      expect(avatar).toBeInTheDocument();
    });

    it('renders when user has no name', () => {
      const user = { firstName: '', lastName: '' };
      const store = createMockStore(user);
      const { container } = renderWithProviders(<UserAvatarMenu locale="vi" />, store);
      const avatar = container.querySelector('[class*="rt-Avatar"]');
      expect(avatar).toBeInTheDocument();
    });

    it('renders with user having lowercase name', () => {
      const user = { firstName: 'john', lastName: 'doe' };
      const store = createMockStore(user);
      const { container } = renderWithProviders(<UserAvatarMenu locale="vi" />, store);
      const avatar = container.querySelector('[class*="rt-Avatar"]');
      expect(avatar).toBeInTheDocument();
    });

    it('renders with user having multiple last names', () => {
      const user = { firstName: 'John', lastName: 'Doe Smith' };
      const store = createMockStore(user);
      const { container } = renderWithProviders(<UserAvatarMenu locale="vi" />, store);
      const avatar = container.querySelector('[class*="rt-Avatar"]');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Avatar photo', () => {
    it('renders with user having photo path', () => {
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        photo: { path: '/path/to/photo.jpg' },
      };
      const store = createMockStore(user);
      const { container } = renderWithProviders(<UserAvatarMenu locale="vi" />, store);
      const avatar = container.querySelector('[class*="rt-Avatar"]');
      expect(avatar).toBeInTheDocument();
    });

    it('renders when photo path is missing', () => {
      const user = { firstName: 'John', lastName: 'Doe' };
      const store = createMockStore(user);
      const { container } = renderWithProviders(<UserAvatarMenu locale="vi" />, store);
      const avatar = container.querySelector('[class*="rt-Avatar"]');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Avatar styling', () => {
    it('applies cursor-pointer class', () => {
      const store = createMockStore();
      const { container } = renderWithProviders(<UserAvatarMenu locale="vi" />, store);
      const box = container.querySelector('.cursor-pointer');
      expect(box).toBeInTheDocument();
    });

    it('applies ring-2 class', () => {
      const store = createMockStore();
      const { container } = renderWithProviders(<UserAvatarMenu locale="vi" />, store);
      const avatar = container.querySelector('.ring-2');
      expect(avatar).toBeInTheDocument();
    });

    it('applies ring-blue-500 class', () => {
      const store = createMockStore();
      const { container } = renderWithProviders(<UserAvatarMenu locale="vi" />, store);
      const avatar = container.querySelector('.ring-blue-500');
      expect(avatar).toBeInTheDocument();
    });

    it('applies ring-offset-2 class', () => {
      const store = createMockStore();
      const { container } = renderWithProviders(<UserAvatarMenu locale="vi" />, store);
      const avatar = container.querySelector('.ring-offset-2');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Popover interaction', () => {
    it('popover is closed by default', () => {
      const store = createMockStore();
      renderWithProviders(<UserAvatarMenu locale="vi" />, store);
      expect(screen.queryByTestId('user-menu-popover')).not.toBeInTheDocument();
    });

    it('opens popover when avatar clicked', async () => {
      const user = userEvent.setup();
      const store = createMockStore();
      const { container } = renderWithProviders(<UserAvatarMenu locale="vi" />, store);

      const avatar = container.querySelector('.cursor-pointer');
      if (avatar) {
        await user.click(avatar);
      }

      expect(screen.getByTestId('user-menu-popover')).toBeInTheDocument();
    });

    it('passes correct locale to UserMenuPopover', async () => {
      const user = userEvent.setup();
      const store = createMockStore();
      const { container } = renderWithProviders(<UserAvatarMenu locale="en" />, store);

      const avatar = container.querySelector('.cursor-pointer');
      if (avatar) {
        await user.click(avatar);
      }

      const popover = screen.getByTestId('user-menu-popover');
      expect(popover).toHaveAttribute('data-locale', 'en');
    });

    it('closes popover when onClose called', async () => {
      const user = userEvent.setup();
      const store = createMockStore();
      const { container } = renderWithProviders(<UserAvatarMenu locale="vi" />, store);

      const avatar = container.querySelector('.cursor-pointer');
      if (avatar) {
        await user.click(avatar);
      }

      const closeButton = screen.getByText('Close');
      await user.click(closeButton);

      expect(screen.queryByTestId('user-menu-popover')).not.toBeInTheDocument();
    });
  });

  describe('Redux integration', () => {
    it('reads user from Redux store', () => {
      const user = { firstName: 'Jane', lastName: 'Smith' };
      const store = createMockStore(user);
      const { container } = renderWithProviders(<UserAvatarMenu locale="vi" />, store);
      const avatar = container.querySelector('[class*="rt-Avatar"]');
      expect(avatar).toBeInTheDocument();
    });

    it('handles null user from Redux store', () => {
      const store = createMockStore(null);
      const { container } = renderWithProviders(<UserAvatarMenu locale="vi" />, store);
      const avatar = container.querySelector('[class*="rt-Avatar"]');
      expect(avatar).toBeInTheDocument();
    });

    it('handles undefined user from Redux store', () => {
      const store = createMockStore(undefined);
      const { container } = renderWithProviders(<UserAvatarMenu locale="vi" />, store);
      const avatar = container.querySelector('[class*="rt-Avatar"]');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('State management', () => {
    it('maintains popover state', async () => {
      const user = userEvent.setup();
      const store = createMockStore();
      const { container } = renderWithProviders(<UserAvatarMenu locale="vi" />, store);

      const avatar = container.querySelector('.cursor-pointer');

      // Open
      if (avatar) {
        await user.click(avatar);
      }
      expect(screen.getByTestId('user-menu-popover')).toBeInTheDocument();

      // Close
      const closeButton = screen.getByText('Close');
      await user.click(closeButton);
      expect(screen.queryByTestId('user-menu-popover')).not.toBeInTheDocument();
    });
  });
});
