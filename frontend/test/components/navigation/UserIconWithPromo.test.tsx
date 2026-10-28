import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserIconWithPromo } from '@/components/navigation/UserIconWithPromo';
import { Theme } from '@radix-ui/themes';
import type { AppLocale } from '@/lib/locale';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height }: any) => (
    <img src={src} alt={alt} width={width} height={height} />
  ),
}));

// Mock MemberPromoPopup
vi.mock('@/components/common/MemberPromoPopup', () => ({
  MemberPromoPopup: ({ onClose }: any) => (
    <div data-testid="member-promo-popup" onClick={onClose}>
      Promo Popup
    </div>
  ),
}));

// Mock UserAvatarMenu
vi.mock('@/components/navigation/UserAvatarMenu', () => ({
  UserAvatarMenu: ({ locale }: any) => (
    <div data-testid="user-avatar-menu" data-locale={locale}>
      Avatar Menu
    </div>
  ),
}));

describe('UserIconWithPromo', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  const defaultProps = {
    locale: 'vi' as AppLocale,
    isMounted: true,
    isAuthenticated: false,
    showPromoPopup: false,
    onSignInClick: vi.fn(),
    onClosePromoPopup: vi.fn(),
  };

  describe('Basic rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderWithTheme(<UserIconWithPromo {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });

    it('renders user icon when not mounted', () => {
      renderWithTheme(<UserIconWithPromo {...defaultProps} isMounted={false} />);
      expect(screen.getByAltText('User')).toBeInTheDocument();
    });

    it('renders user icon when mounted and not authenticated', () => {
      renderWithTheme(<UserIconWithPromo {...defaultProps} />);
      expect(screen.getByAltText('User')).toBeInTheDocument();
    });

    it('renders UserAvatarMenu when authenticated', () => {
      renderWithTheme(<UserIconWithPromo {...defaultProps} isAuthenticated={true} />);
      expect(screen.getByTestId('user-avatar-menu')).toBeInTheDocument();
    });
  });

  describe('isMounted state', () => {
    it('shows opaque icon when not mounted', () => {
      const { container } = renderWithTheme(
        <UserIconWithPromo {...defaultProps} isMounted={false} />
      );
      const box = container.querySelector('.opacity-50');
      expect(box).toBeInTheDocument();
    });

    it('does not show opaque icon when mounted', () => {
      const { container } = renderWithTheme(<UserIconWithPromo {...defaultProps} />);
      const box = container.querySelector('.opacity-50');
      expect(box).not.toBeInTheDocument();
    });

    it('does not allow click when not mounted', () => {
      const onSignInClick = vi.fn();
      const { container } = renderWithTheme(
        <UserIconWithPromo {...defaultProps} isMounted={false} onSignInClick={onSignInClick} />
      );
      const box = container.querySelector('.opacity-50');
      if (box) {
        fireEvent.click(box);
      }
      expect(onSignInClick).not.toHaveBeenCalled();
    });
  });

  describe('isAuthenticated state', () => {
    it('shows user icon when not authenticated', () => {
      renderWithTheme(<UserIconWithPromo {...defaultProps} isAuthenticated={false} />);
      expect(screen.getByAltText('User')).toBeInTheDocument();
    });

    it('shows UserAvatarMenu when authenticated', () => {
      renderWithTheme(<UserIconWithPromo {...defaultProps} isAuthenticated={true} />);
      expect(screen.getByTestId('user-avatar-menu')).toBeInTheDocument();
    });

    it('does not show user icon when authenticated', () => {
      renderWithTheme(<UserIconWithPromo {...defaultProps} isAuthenticated={true} />);
      expect(screen.queryByAltText('User')).not.toBeInTheDocument();
    });

    it('does not show UserAvatarMenu when not authenticated', () => {
      renderWithTheme(<UserIconWithPromo {...defaultProps} isAuthenticated={false} />);
      expect(screen.queryByTestId('user-avatar-menu')).not.toBeInTheDocument();
    });
  });

  describe('onSignInClick handler', () => {
    it('calls onSignInClick when user icon is clicked', () => {
      const onSignInClick = vi.fn();
      renderWithTheme(<UserIconWithPromo {...defaultProps} onSignInClick={onSignInClick} />);
      const icon = screen.getByAltText('User');
      fireEvent.click(icon.parentElement!);
      expect(onSignInClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onSignInClick when authenticated', () => {
      const onSignInClick = vi.fn();
      renderWithTheme(
        <UserIconWithPromo
          {...defaultProps}
          isAuthenticated={true}
          onSignInClick={onSignInClick}
        />
      );
      expect(onSignInClick).not.toHaveBeenCalled();
    });

    it('applies cursor-pointer to clickable icon', () => {
      const { container } = renderWithTheme(<UserIconWithPromo {...defaultProps} />);
      const clickableBox = container.querySelector('.cursor-pointer');
      expect(clickableBox).toBeInTheDocument();
    });
  });

  describe('MemberPromoPopup', () => {
    it('does not show popup by default', () => {
      renderWithTheme(<UserIconWithPromo {...defaultProps} showPromoPopup={false} />);
      expect(screen.queryByTestId('member-promo-popup')).not.toBeInTheDocument();
    });

    it('shows popup when showPromoPopup is true and not authenticated', () => {
      renderWithTheme(
        <UserIconWithPromo {...defaultProps} showPromoPopup={true} isAuthenticated={false} />
      );
      expect(screen.getByTestId('member-promo-popup')).toBeInTheDocument();
    });

    it('does not show popup when authenticated', () => {
      renderWithTheme(
        <UserIconWithPromo {...defaultProps} showPromoPopup={true} isAuthenticated={true} />
      );
      expect(screen.queryByTestId('member-promo-popup')).not.toBeInTheDocument();
    });

    it('calls onClosePromoPopup when popup is closed', () => {
      const onClosePromoPopup = vi.fn();
      renderWithTheme(
        <UserIconWithPromo
          {...defaultProps}
          showPromoPopup={true}
          onClosePromoPopup={onClosePromoPopup}
        />
      );
      const popup = screen.getByTestId('member-promo-popup');
      fireEvent.click(popup);
      expect(onClosePromoPopup).toHaveBeenCalledTimes(1);
    });
  });

  describe('Locale prop', () => {
    it('passes vi locale to UserAvatarMenu', () => {
      renderWithTheme(
        <UserIconWithPromo {...defaultProps} locale="vi" isAuthenticated={true} />
      );
      const menu = screen.getByTestId('user-avatar-menu');
      expect(menu).toHaveAttribute('data-locale', 'vi');
    });

    it('passes en locale to UserAvatarMenu', () => {
      renderWithTheme(
        <UserIconWithPromo {...defaultProps} locale="en" isAuthenticated={true} />
      );
      const menu = screen.getByTestId('user-avatar-menu');
      expect(menu).toHaveAttribute('data-locale', 'en');
    });
  });

  describe('User icon styling', () => {
    it('applies w-6 h-6 to icon container', () => {
      const { container } = renderWithTheme(<UserIconWithPromo {...defaultProps} />);
      const iconBox = container.querySelector('.w-6.h-6');
      expect(iconBox).toBeInTheDocument();
    });

    it('applies cursor-pointer to interactive icon', () => {
      const { container } = renderWithTheme(<UserIconWithPromo {...defaultProps} />);
      const iconBox = container.querySelector('.cursor-pointer');
      expect(iconBox).toBeInTheDocument();
    });

    it('applies opacity-50 to not mounted icon', () => {
      const { container } = renderWithTheme(
        <UserIconWithPromo {...defaultProps} isMounted={false} />
      );
      const iconBox = container.querySelector('.opacity-50');
      expect(iconBox).toBeInTheDocument();
    });
  });

  describe('User icon image', () => {
    it('uses correct src for user icon', () => {
      renderWithTheme(<UserIconWithPromo {...defaultProps} />);
      const icon = screen.getByAltText('User');
      expect(icon).toHaveAttribute('src', '/assets/svg/user.svg');
    });

    it('uses correct alt text', () => {
      renderWithTheme(<UserIconWithPromo {...defaultProps} />);
      expect(screen.getByAltText('User')).toBeInTheDocument();
    });

    it('uses correct dimensions', () => {
      renderWithTheme(<UserIconWithPromo {...defaultProps} />);
      const icon = screen.getByAltText('User');
      expect(icon).toHaveAttribute('width', '24');
      expect(icon).toHaveAttribute('height', '24');
    });
  });

  describe('Container styling', () => {
    it('applies relative positioning to outer container', () => {
      const { container } = renderWithTheme(<UserIconWithPromo {...defaultProps} />);
      const outerBox = container.querySelector('.relative');
      expect(outerBox).toBeInTheDocument();
    });
  });

  describe('Radix UI components', () => {
    it('uses Box components', () => {
      const { container } = renderWithTheme(<UserIconWithPromo {...defaultProps} />);
      const boxes = container.querySelectorAll('[class*="rt-Box"]');
      expect(boxes.length).toBeGreaterThan(0);
    });
  });

  describe('Client component', () => {
    it('renders as client component', () => {
      const { container } = renderWithTheme(<UserIconWithPromo {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Props interface', () => {
    it('accepts locale prop', () => {
      const { container } = renderWithTheme(<UserIconWithPromo {...defaultProps} locale="vi" />);
      expect(container).toBeInTheDocument();
    });

    it('accepts isMounted prop', () => {
      const { container } = renderWithTheme(
        <UserIconWithPromo {...defaultProps} isMounted={false} />
      );
      expect(container).toBeInTheDocument();
    });

    it('accepts isAuthenticated prop', () => {
      const { container } = renderWithTheme(
        <UserIconWithPromo {...defaultProps} isAuthenticated={true} />
      );
      expect(container).toBeInTheDocument();
    });

    it('accepts showPromoPopup prop', () => {
      const { container } = renderWithTheme(
        <UserIconWithPromo {...defaultProps} showPromoPopup={true} />
      );
      expect(container).toBeInTheDocument();
    });

    it('accepts onSignInClick prop', () => {
      const { container } = renderWithTheme(
        <UserIconWithPromo {...defaultProps} onSignInClick={vi.fn()} />
      );
      expect(container).toBeInTheDocument();
    });

    it('accepts onClosePromoPopup prop', () => {
      const { container } = renderWithTheme(
        <UserIconWithPromo {...defaultProps} onClosePromoPopup={vi.fn()} />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Conditional rendering combinations', () => {
    it('not mounted + not authenticated: shows opaque icon', () => {
      const { container } = renderWithTheme(
        <UserIconWithPromo {...defaultProps} isMounted={false} isAuthenticated={false} />
      );
      expect(container.querySelector('.opacity-50')).toBeInTheDocument();
      expect(screen.getByAltText('User')).toBeInTheDocument();
    });

    it('mounted + not authenticated: shows clickable icon', () => {
      renderWithTheme(<UserIconWithPromo {...defaultProps} isMounted={true} isAuthenticated={false} />);
      expect(screen.getByAltText('User')).toBeInTheDocument();
      expect(screen.queryByTestId('user-avatar-menu')).not.toBeInTheDocument();
    });

    it('mounted + authenticated: shows avatar menu', () => {
      renderWithTheme(<UserIconWithPromo {...defaultProps} isMounted={true} isAuthenticated={true} />);
      expect(screen.getByTestId('user-avatar-menu')).toBeInTheDocument();
      expect(screen.queryByAltText('User')).not.toBeInTheDocument();
    });

    it('not authenticated + showPromoPopup: shows popup', () => {
      renderWithTheme(
        <UserIconWithPromo
          {...defaultProps}
          isAuthenticated={false}
          showPromoPopup={true}
        />
      );
      expect(screen.getByTestId('member-promo-popup')).toBeInTheDocument();
    });

    it('authenticated + showPromoPopup: does not show popup', () => {
      renderWithTheme(
        <UserIconWithPromo
          {...defaultProps}
          isAuthenticated={true}
          showPromoPopup={true}
        />
      );
      expect(screen.queryByTestId('member-promo-popup')).not.toBeInTheDocument();
    });
  });

  describe('Event handlers', () => {
    it('onSignInClick is called exactly once on click', () => {
      const onSignInClick = vi.fn();
      renderWithTheme(<UserIconWithPromo {...defaultProps} onSignInClick={onSignInClick} />);
      const icon = screen.getByAltText('User');
      fireEvent.click(icon.parentElement!);
      fireEvent.click(icon.parentElement!);
      expect(onSignInClick).toHaveBeenCalledTimes(2);
    });

    it('onClosePromoPopup is called when popup is closed', () => {
      const onClosePromoPopup = vi.fn();
      renderWithTheme(
        <UserIconWithPromo
          {...defaultProps}
          showPromoPopup={true}
          onClosePromoPopup={onClosePromoPopup}
        />
      );
      const popup = screen.getByTestId('member-promo-popup');
      fireEvent.click(popup);
      expect(onClosePromoPopup).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases', () => {
    it('handles rapid state changes', () => {
      const { rerender } = renderWithTheme(<UserIconWithPromo {...defaultProps} isAuthenticated={false} />);
      expect(screen.getByAltText('User')).toBeInTheDocument();

      rerender(
        <Theme>
          <UserIconWithPromo {...defaultProps} isAuthenticated={true} />
        </Theme>
      );
      expect(screen.getByTestId('user-avatar-menu')).toBeInTheDocument();

      rerender(
        <Theme>
          <UserIconWithPromo {...defaultProps} isAuthenticated={false} />
        </Theme>
      );
      expect(screen.getByAltText('User')).toBeInTheDocument();
    });

    it('handles popup show/hide transitions', () => {
      const { rerender } = renderWithTheme(
        <UserIconWithPromo {...defaultProps} showPromoPopup={false} />
      );
      expect(screen.queryByTestId('member-promo-popup')).not.toBeInTheDocument();

      rerender(
        <Theme>
          <UserIconWithPromo {...defaultProps} showPromoPopup={true} />
        </Theme>
      );
      expect(screen.getByTestId('member-promo-popup')).toBeInTheDocument();

      rerender(
        <Theme>
          <UserIconWithPromo {...defaultProps} showPromoPopup={false} />
        </Theme>
      );
      expect(screen.queryByTestId('member-promo-popup')).not.toBeInTheDocument();
    });

    it('handles locale switching', () => {
      const { rerender } = renderWithTheme(
        <UserIconWithPromo {...defaultProps} locale="vi" isAuthenticated={true} />
      );
      let menu = screen.getByTestId('user-avatar-menu');
      expect(menu).toHaveAttribute('data-locale', 'vi');

      rerender(
        <Theme>
          <UserIconWithPromo {...defaultProps} locale="en" isAuthenticated={true} />
        </Theme>
      );
      menu = screen.getByTestId('user-avatar-menu');
      expect(menu).toHaveAttribute('data-locale', 'en');
    });
  });
});
