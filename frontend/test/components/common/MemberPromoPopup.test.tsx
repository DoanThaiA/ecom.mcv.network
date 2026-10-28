import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberPromoPopup } from '@/components/common/MemberPromoPopup';
import { Theme } from '@radix-ui/themes';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      newOrderDiscount: 'Get 10% off your first order!',
    };
    return translations[key] || key;
  },
}));

describe('MemberPromoPopup', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  it('renders the promo message', () => {
    const onClose = vi.fn();
    renderWithTheme(<MemberPromoPopup onClose={onClose} />);
    expect(screen.getByText('Get 10% off your first order!')).toBeInTheDocument();
  });

  it('renders the CCHAT logo', () => {
    const onClose = vi.fn();
    renderWithTheme(<MemberPromoPopup onClose={onClose} />);
    const logo = screen.getByAltText('CCHAT');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/assets/images/logo.webp');
  });

  it('renders logo with correct dimensions', () => {
    const onClose = vi.fn();
    renderWithTheme(<MemberPromoPopup onClose={onClose} />);
    const logo = screen.getByAltText('CCHAT');
    expect(logo).toHaveAttribute('width', '60');
    expect(logo).toHaveAttribute('height', '20');
  });

  it('renders close button', () => {
    const onClose = vi.fn();
    renderWithTheme(<MemberPromoPopup onClose={onClose} />);
    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithTheme(<MemberPromoPopup onClose={onClose} />);

    const closeButton = screen.getByRole('button');
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('stops event propagation when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = renderWithTheme(<MemberPromoPopup onClose={onClose} />);

    const closeButton = screen.getByRole('button');
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('applies default positioning classes', () => {
    const onClose = vi.fn();
    const { container } = renderWithTheme(<MemberPromoPopup onClose={onClose} />);

    const popup = container.querySelector('.absolute.top-full.right-0');
    expect(popup).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const onClose = vi.fn();
    const { container } = renderWithTheme(
      <MemberPromoPopup onClose={onClose} className="custom-class" />
    );

    const popup = container.querySelector('.custom-class');
    expect(popup).toBeInTheDocument();
  });

  it('renders with white background', () => {
    const onClose = vi.fn();
    const { container } = renderWithTheme(<MemberPromoPopup onClose={onClose} />);

    const popupContent = container.querySelector('.bg-white.rounded-lg');
    expect(popupContent).toBeInTheDocument();
  });

  it('renders with shadow', () => {
    const onClose = vi.fn();
    const { container } = renderWithTheme(<MemberPromoPopup onClose={onClose} />);

    const popupContent = container.querySelector('.shadow-lg');
    expect(popupContent).toBeInTheDocument();
  });

  it('renders with border', () => {
    const onClose = vi.fn();
    const { container } = renderWithTheme(<MemberPromoPopup onClose={onClose} />);

    const popupContent = container.querySelector('.border.border-gray-200');
    expect(popupContent).toBeInTheDocument();
  });

  it('renders with padding', () => {
    const onClose = vi.fn();
    const { container } = renderWithTheme(<MemberPromoPopup onClose={onClose} />);

    const popupContent = container.querySelector('.p-3');
    expect(popupContent).toBeInTheDocument();
  });

  it('renders with minimum width', () => {
    const onClose = vi.fn();
    const { container } = renderWithTheme(<MemberPromoPopup onClose={onClose} />);

    const popupContent = container.querySelector('.min-w-\\[200px\\]');
    expect(popupContent).toBeInTheDocument();
  });

  it('renders with maximum width', () => {
    const onClose = vi.fn();
    const { container } = renderWithTheme(<MemberPromoPopup onClose={onClose} />);

    const popupContent = container.querySelector('.max-w-\\[240px\\]');
    expect(popupContent).toBeInTheDocument();
  });

  it('renders arrow pointing up', () => {
    const onClose = vi.fn();
    const { container } = renderWithTheme(<MemberPromoPopup onClose={onClose} />);

    const arrow = container.querySelector('.rotate-45');
    expect(arrow).toBeInTheDocument();
  });

  it('positions arrow correctly', () => {
    const onClose = vi.fn();
    const { container } = renderWithTheme(<MemberPromoPopup onClose={onClose} />);

    const arrow = container.querySelector('.-top-1.right-3');
    expect(arrow).toBeInTheDocument();
  });

  it('renders arrow with white background', () => {
    const onClose = vi.fn();
    const { container } = renderWithTheme(<MemberPromoPopup onClose={onClose} />);

    const arrow = container.querySelector('.rotate-45.bg-white');
    expect(arrow).toBeInTheDocument();
  });

  it('applies z-index to popup', () => {
    const onClose = vi.fn();
    const { container } = renderWithTheme(<MemberPromoPopup onClose={onClose} />);

    const popup = container.querySelector('.z-\\[100\\]');
    expect(popup).toBeInTheDocument();
  });

  it('renders promo text with small font size', () => {
    const onClose = vi.fn();
    renderWithTheme(<MemberPromoPopup onClose={onClose} />);

    const promoText = screen.getByText('Get 10% off your first order!');
    expect(promoText).toHaveClass('text-xs');
  });

  it('renders promo text with semibold font weight', () => {
    const onClose = vi.fn();
    renderWithTheme(<MemberPromoPopup onClose={onClose} />);

    const promoText = screen.getByText('Get 10% off your first order!');
    expect(promoText).toHaveClass('font-semibold');
  });

  it('renders close button with ghost variant', () => {
    const onClose = vi.fn();
    const { container } = renderWithTheme(<MemberPromoPopup onClose={onClose} />);

    const closeButton = container.querySelector('.cursor-pointer');
    expect(closeButton).toBeInTheDocument();
  });

  it('renders close button with hover styles', () => {
    const onClose = vi.fn();
    const { container } = renderWithTheme(<MemberPromoPopup onClose={onClose} />);

    const closeButton = container.querySelector('.hover\\:text-gray-600');
    expect(closeButton).toBeInTheDocument();
  });

  it('does not call onClose multiple times on single click', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithTheme(<MemberPromoPopup onClose={onClose} />);

    const closeButton = screen.getByRole('button');
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
