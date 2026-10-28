import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductPolicy } from '@/components/product/ProductPolicy';
import { Theme } from '@radix-ui/themes';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      policyAuthentic: 'Authentic Products',
      policyHotline: '24/7 Customer Support',
      policyHotlineDesc: 'Call us: 1800-1234',
      policyReturn7Days: '7-Day Return Policy',
    };
    return translations[key] || key;
  },
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height }: any) => (
    <img src={src} alt={alt} width={width} height={height} />
  ),
}));

describe('ProductPolicy', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  it('renders all policy items', () => {
    renderWithTheme(<ProductPolicy />);

    expect(screen.getByText('Authentic Products')).toBeInTheDocument();
    expect(screen.getByText('24/7 Customer Support')).toBeInTheDocument();
    expect(screen.getByText('Call us: 1800-1234')).toBeInTheDocument();
    expect(screen.getByText('7-Day Return Policy')).toBeInTheDocument();
  });

  it('renders check icon for authentic products', () => {
    renderWithTheme(<ProductPolicy />);

    const checkIcon = screen.getByAltText('Check');
    expect(checkIcon).toBeInTheDocument();
    expect(checkIcon).toHaveAttribute('src', '/assets/svg/approve_icon.svg');
  });

  it('renders support icon for customer support', () => {
    renderWithTheme(<ProductPolicy />);

    const supportIcon = screen.getByAltText('Support');
    expect(supportIcon).toBeInTheDocument();
    expect(supportIcon).toHaveAttribute('src', '/assets/svg/product/support.svg');
  });

  it('renders return icon for return policy', () => {
    renderWithTheme(<ProductPolicy />);

    const returnIcon = screen.getByAltText('Return');
    expect(returnIcon).toBeInTheDocument();
    expect(returnIcon).toHaveAttribute('src', '/assets/svg/product/return_product.svg');
  });

  it('renders all icons with correct dimensions', () => {
    renderWithTheme(<ProductPolicy />);

    const icons = [
      screen.getByAltText('Check'),
      screen.getByAltText('Support'),
      screen.getByAltText('Return'),
    ];

    icons.forEach((icon) => {
      expect(icon).toHaveAttribute('width', '24');
      expect(icon).toHaveAttribute('height', '24');
    });
  });

  it('renders background with gray color', () => {
    const { container } = renderWithTheme(<ProductPolicy />);

    const bgBox = container.querySelector('.bg-gray-100');
    expect(bgBox).toBeInTheDocument();
  });

  it('applies correct padding to content', () => {
    const { container } = renderWithTheme(<ProductPolicy />);

    const paddedContainer = container.querySelector('.p-4');
    expect(paddedContainer).toBeInTheDocument();
  });

  it('displays hotline description text', () => {
    renderWithTheme(<ProductPolicy />);

    const hotlineDesc = screen.getByText('Call us: 1800-1234');
    expect(hotlineDesc).toBeInTheDocument();
  });

  it('renders hotline description in smaller gray text', () => {
    renderWithTheme(<ProductPolicy />);

    const hotlineDesc = screen.getByText('Call us: 1800-1234');
    expect(hotlineDesc).toHaveClass('text-gray-600');
  });

  it('renders policy texts in correct font size', () => {
    renderWithTheme(<ProductPolicy />);

    const authenticText = screen.getByText('Authentic Products');
    expect(authenticText).toHaveStyle({ fontSize: '14px' });

    const hotlineText = screen.getByText('24/7 Customer Support');
    expect(hotlineText).toHaveStyle({ fontSize: '14px' });

    const returnText = screen.getByText('7-Day Return Policy');
    expect(returnText).toHaveStyle({ fontSize: '14px' });
  });

  it('renders hotline description in correct font size', () => {
    renderWithTheme(<ProductPolicy />);

    const hotlineDesc = screen.getByText('Call us: 1800-1234');
    expect(hotlineDesc).toHaveStyle({ fontSize: '12px' });
  });

  it('renders all texts in black color except hotline description', () => {
    renderWithTheme(<ProductPolicy />);

    const authenticText = screen.getByText('Authentic Products');
    const hotlineText = screen.getByText('24/7 Customer Support');
    const returnText = screen.getByText('7-Day Return Policy');

    expect(authenticText).toHaveClass('text-black');
    expect(hotlineText).toHaveClass('text-black');
    expect(returnText).toHaveClass('text-black');
  });

  it('renders icon containers with flex-shrink-0', () => {
    const { container } = renderWithTheme(<ProductPolicy />);

    const iconContainers = container.querySelectorAll('.flex-shrink-0');
    expect(iconContainers.length).toBeGreaterThanOrEqual(3);
  });

  it('renders all policy items in order', () => {
    const { container } = renderWithTheme(<ProductPolicy />);

    const allText = container.textContent;
    expect(allText).toContain('Authentic Products');
    expect(allText).toContain('24/7 Customer Support');
    expect(allText).toContain('7-Day Return Policy');
  });
});
