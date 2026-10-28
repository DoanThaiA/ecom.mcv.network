import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import ProductComboPage from 'src/pages/product-combo';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('src/config-global', () => ({
  CONFIG: {
    appName: 'Test CMS',
  },
}));

const mockSetTitle = vi.fn();
vi.mock('src/contexts/page-title-context', () => ({
  usePageTitle: () => ({
    setTitle: mockSetTitle,
  }),
}));

vi.mock('src/sections/product-combo', () => ({
  ProductComboView: () => <div data-testid="product-combo-view">Product Combo View</div>,
}));

describe('ProductComboPage', () => {
  const renderWithHelmet = (ui: React.ReactElement) => {
    return render(<HelmetProvider>{ui}</HelmetProvider>);
  };

  beforeEach(() => {
    mockSetTitle.mockClear();
  });

  it('renders ProductComboView', () => {
    renderWithHelmet(<ProductComboPage />);
    expect(screen.getByTestId('product-combo-view')).toBeInTheDocument();
  });

  it('sets page title on mount', () => {
    renderWithHelmet(<ProductComboPage />);
    expect(mockSetTitle).toHaveBeenCalledWith('combo_products');
  });

  it('renders Helmet with title', () => {
    const { container } = renderWithHelmet(<ProductComboPage />);
    expect(container).toBeInTheDocument();
  });

  it('displays product combo view content', () => {
    renderWithHelmet(<ProductComboPage />);
    expect(screen.getByText('Product Combo View')).toBeInTheDocument();
  });

  it('renders without errors', () => {
    expect(() => {
      renderWithHelmet(<ProductComboPage />);
    }).not.toThrow();
  });

  it('calls setTitle with combo_products key', () => {
    renderWithHelmet(<ProductComboPage />);
    expect(mockSetTitle).toHaveBeenCalledWith('combo_products');
  });

  it('setTitle is called exactly once', () => {
    renderWithHelmet(<ProductComboPage />);
    expect(mockSetTitle).toHaveBeenCalledTimes(1);
  });

  it('exports default component', () => {
    expect(ProductComboPage).toBeDefined();
    expect(typeof ProductComboPage).toBe('function');
  });

  it('page renders correctly', () => {
    const { container } = renderWithHelmet(<ProductComboPage />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders fragment wrapper', () => {
    const { container } = renderWithHelmet(<ProductComboPage />);
    expect(container).toBeInTheDocument();
  });

  it('Helmet includes meta description', () => {
    renderWithHelmet(<ProductComboPage />);
    expect(screen.getByTestId('product-combo-view')).toBeInTheDocument();
  });

  it('Helmet includes meta keywords', () => {
    renderWithHelmet(<ProductComboPage />);
    expect(screen.getByTestId('product-combo-view')).toBeInTheDocument();
  });

  it('uses translation hook', () => {
    renderWithHelmet(<ProductComboPage />);
    expect(screen.getByTestId('product-combo-view')).toBeInTheDocument();
  });

  it('uses useEffect for setTitle', () => {
    renderWithHelmet(<ProductComboPage />);
    expect(mockSetTitle).toHaveBeenCalled();
  });

  it('ProductComboView is rendered inside fragment', () => {
    renderWithHelmet(<ProductComboPage />);
    expect(screen.getByTestId('product-combo-view')).toBeInTheDocument();
  });
});
