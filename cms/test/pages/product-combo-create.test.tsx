import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import ProductComboCreatePage from 'src/pages/product-combo-create';

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

vi.mock('src/sections/product-combo', () => ({
  ProductComboCreateView: () => <div data-testid="product-combo-create-view">Product Combo Create View</div>,
}));

describe('ProductComboCreatePage', () => {
  const renderComponent = () => render(<HelmetProvider><ProductComboCreatePage /></HelmetProvider>);

  it('renders without crashing', () => {
    const { container } = renderComponent();
    expect(container).toBeInTheDocument();
  });

  it('renders ProductComboCreateView component', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('product-combo-create-view')).toBeInTheDocument();
  });

  it('calls setTitle with translated createComboProduct', () => {
    renderComponent();
    expect(mockSetTitle).toHaveBeenCalledWith('createComboProduct');
  });

  it('renders Fragment wrapper', () => {
    const { container } = renderComponent();
    expect(container.firstChild).toBeInTheDocument();
  });

  it('contains view component', () => {
    const { container } = renderComponent();
    expect(container.querySelector('[data-testid="product-combo-create-view"]')).toBeInTheDocument();
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
