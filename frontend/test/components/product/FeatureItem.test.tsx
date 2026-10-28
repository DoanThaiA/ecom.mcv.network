import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureItem } from '@/components/product/FeatureItem';
import { Theme } from '@radix-ui/themes';

describe('FeatureItem', () => {
  const defaultProps = {
    iconSrc: '/assets/icons/delivery.svg',
    iconAlt: 'Delivery Icon',
    title: 'Free Delivery',
    description: 'Free shipping on orders over $50',
  };

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  it('renders the feature icon', () => {
    renderWithTheme(<FeatureItem {...defaultProps} />);

    const icon = screen.getByAltText('Delivery Icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('src', '/assets/icons/delivery.svg');
  });

  it('renders the feature title', () => {
    renderWithTheme(<FeatureItem {...defaultProps} />);

    expect(screen.getByText('Free Delivery')).toBeInTheDocument();
  });

  it('renders the feature description', () => {
    renderWithTheme(<FeatureItem {...defaultProps} />);

    expect(
      screen.getByText('Free shipping on orders over $50')
    ).toBeInTheDocument();
  });

  it('applies correct icon size classes', () => {
    renderWithTheme(<FeatureItem {...defaultProps} />);

    const icon = screen.getByAltText('Delivery Icon');
    expect(icon).toHaveClass('w-5');
    expect(icon).toHaveClass('h-5');
    expect(icon).toHaveClass('lg:w-7');
    expect(icon).toHaveClass('lg:h-7');
  });

  it('applies flex-shrink-0 to icon', () => {
    renderWithTheme(<FeatureItem {...defaultProps} />);

    const icon = screen.getByAltText('Delivery Icon');
    expect(icon).toHaveClass('flex-shrink-0');
  });

  it('applies correct title text styles', () => {
    renderWithTheme(<FeatureItem {...defaultProps} />);

    const title = screen.getByText('Free Delivery');
    expect(title).toHaveClass('text-black');
    expect(title).toHaveClass('text-sm');
    expect(title).toHaveClass('lg:text-base');
  });

  it('applies correct description text styles', () => {
    renderWithTheme(<FeatureItem {...defaultProps} />);

    const description = screen.getByText('Free shipping on orders over $50');
    expect(description).toHaveClass('text-black');
    expect(description).toHaveClass('text-xs');
    expect(description).toHaveClass('lg:text-sm');
  });

  it('renders with different icon source', () => {
    const customProps = {
      ...defaultProps,
      iconSrc: '/assets/icons/warranty.svg',
      iconAlt: 'Warranty Icon',
    };
    renderWithTheme(<FeatureItem {...customProps} />);

    const icon = screen.getByAltText('Warranty Icon');
    expect(icon).toHaveAttribute('src', '/assets/icons/warranty.svg');
  });

  it('renders with different title and description', () => {
    const customProps = {
      ...defaultProps,
      title: '1 Year Warranty',
      description: 'All products come with 1 year warranty',
    };
    renderWithTheme(<FeatureItem {...customProps} />);

    expect(screen.getByText('1 Year Warranty')).toBeInTheDocument();
    expect(
      screen.getByText('All products come with 1 year warranty')
    ).toBeInTheDocument();
  });

  it('handles long title text', () => {
    const longTitle = 'This is a very long feature title that should still display correctly';
    renderWithTheme(<FeatureItem {...defaultProps} title={longTitle} />);

    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });

  it('handles long description text', () => {
    const longDescription =
      'This is a very long feature description that provides detailed information about this particular feature and should wrap correctly';
    renderWithTheme(
      <FeatureItem {...defaultProps} description={longDescription} />
    );

    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  it('handles special characters in title', () => {
    const specialTitle = 'Free Delivery & Returns!';
    renderWithTheme(<FeatureItem {...defaultProps} title={specialTitle} />);

    expect(screen.getByText('Free Delivery & Returns!')).toBeInTheDocument();
  });

  it('handles special characters in description', () => {
    const specialDescription = "Free shipping on orders over $50 (T&C's apply)";
    renderWithTheme(
      <FeatureItem {...defaultProps} description={specialDescription} />
    );

    expect(screen.getByText("Free shipping on orders over $50 (T&C's apply)")).toBeInTheDocument();
  });

  it('renders with empty alt text', () => {
    const { container } = renderWithTheme(<FeatureItem {...defaultProps} iconAlt="" />);

    const icon = container.querySelector('img');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('alt', '');
  });

  it('maintains responsive layout classes', () => {
    const { container } = renderWithTheme(<FeatureItem {...defaultProps} />);

    const flexContainer = container.querySelector('.flex-1');
    expect(flexContainer).toBeInTheDocument();
    expect(flexContainer).toHaveClass('min-w-[140px]');
    expect(flexContainer).toHaveClass('lg:min-w-[200px]');
  });
});
