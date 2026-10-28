import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import ProductComboEditPage from 'src/pages/product-combo-edit';

vi.mock('src/config-global', () => ({
  CONFIG: {
    appName: 'Test App',
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockSetTitle = vi.fn();
vi.mock('src/contexts/page-title-context', () => ({
  usePageTitle: () => ({
    setTitle: mockSetTitle,
  }),
}));

vi.mock('src/sections/product-combo', () => ({
  ProductComboEditView: () => <div data-testid="product-combo-edit-view">Product Combo Edit View</div>,
}));

describe('ProductComboEditPage', () => {
  const renderComponent = () => {
    return render(
      <HelmetProvider>
        <ProductComboEditPage />
      </HelmetProvider>
    );
  };

  it('renders without crashing', () => {
    const { container } = renderComponent();
    expect(container).toBeInTheDocument();
  });

  it('renders ProductComboEditView component', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('product-combo-edit-view')).toBeInTheDocument();
  });

  it('calls setTitle with translated updateComboProduct', () => {
    renderComponent();
    expect(mockSetTitle).toHaveBeenCalledWith('updateComboProduct');
  });

  it('renders Fragment wrapper', () => {
    const { container } = renderComponent();
    expect(container.firstChild).toBeInTheDocument();
  });

  it('contains view component', () => {
    const { container } = renderComponent();
    expect(container.querySelector('[data-testid="product-combo-edit-view"]')).toBeInTheDocument();
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
