import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import PromotionPage from 'src/pages/promotion';

// Mock the PromotionView component
vi.mock('src/sections/promotion', () => ({
  PromotionView: () => <div data-testid="promotion-view">Promotion View</div>,
}));

describe('PromotionPage', () => {
  const renderComponent = () => {
    return render(
      <HelmetProvider>
        <PromotionPage />
      </HelmetProvider>
    );
  };

  it('renders without crashing', () => {
    const { container } = renderComponent();
    expect(container).toBeInTheDocument();
  });

  it('renders PromotionView component', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('promotion-view')).toBeInTheDocument();
  });

  it('renders Fragment wrapper', () => {
    const { container } = renderComponent();
    expect(container.firstChild).toBeInTheDocument();
  });

  it('contains view component', () => {
    const { container } = renderComponent();
    expect(container.querySelector('[data-testid="promotion-view"]')).toBeInTheDocument();
  });

  it('renders with HelmetProvider', () => {
    const { container } = renderComponent();
    expect(container).toBeTruthy();
  });
});
