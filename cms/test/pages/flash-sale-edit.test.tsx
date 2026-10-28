import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import FlashSaleEditPage from 'src/pages/flash-sale-edit';

vi.mock('src/config-global', () => ({
  CONFIG: { appName: 'Test App' },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockSetTitle = vi.fn();
vi.mock('src/contexts/page-title-context', () => ({
  usePageTitle: () => ({ setTitle: mockSetTitle }),
}));

vi.mock('src/sections/flash-sale', () => ({
  FlashSaleEditView: () => <div data-testid="flash-sale-edit-view">Flash Sale Edit View</div>,
}));

describe('FlashSaleEditPage', () => {
  const renderComponent = () => render(<HelmetProvider><FlashSaleEditPage /></HelmetProvider>);

  it('renders without crashing', () => {
    const { container } = renderComponent();
    expect(container).toBeInTheDocument();
  });

  it('renders FlashSaleEditView component', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('flash-sale-edit-view')).toBeInTheDocument();
  });

  it('calls setTitle with translated updateFlashSale', () => {
    renderComponent();
    expect(mockSetTitle).toHaveBeenCalledWith('updateFlashSale');
  });

  it('renders Fragment wrapper', () => {
    const { container } = renderComponent();
    expect(container.firstChild).toBeInTheDocument();
  });

  it('contains view component', () => {
    const { container } = renderComponent();
    expect(container.querySelector('[data-testid="flash-sale-edit-view"]')).toBeInTheDocument();
  });

  it('renders with HelmetProvider', () => {
    const { container } = renderComponent();
    expect(container).toBeTruthy();
  });

  it('uses useTranslation hook', () => {
    renderComponent();
    expect(mockSetTitle).toHaveBeenCalled();
  });
});
