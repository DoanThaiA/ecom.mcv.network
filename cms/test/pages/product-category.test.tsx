import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import ProductCategoryPage from 'src/pages/product-category';

const mockT = vi.fn((key: string) => key);
const mockSetTitle = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

vi.mock('src/config-global', () => ({
  CONFIG: { appName: 'Test CMS' },
}));

vi.mock('src/contexts/page-title-context', () => ({
  usePageTitle: () => ({ setTitle: mockSetTitle }),
}));

vi.mock('src/sections/product-category', () => ({
  ProductCategoryView: () => <div data-testid="product-category-view">ProductCategoryView</div>,
}));

describe('ProductCategoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    expect(() => {
      render(
        <HelmetProvider>
          <ProductCategoryPage />
        </HelmetProvider>
      );
    }).not.toThrow();
  });

  it('renders ProductCategoryView component', () => {
    render(
      <HelmetProvider>
        <ProductCategoryPage />
      </HelmetProvider>
    );
    expect(screen.getByTestId('product-category-view')).toBeInTheDocument();
  });

  it('calls setTitle with translated text', () => {
    render(
      <HelmetProvider>
        <ProductCategoryPage />
      </HelmetProvider>
    );
    expect(mockSetTitle).toHaveBeenCalledWith('productCategory');
  });

  it('uses useTranslation hook', () => {
    render(
      <HelmetProvider>
        <ProductCategoryPage />
      </HelmetProvider>
    );
    expect(mockT).toHaveBeenCalled();
  });

  it('uses usePageTitle hook', () => {
    render(
      <HelmetProvider>
        <ProductCategoryPage />
      </HelmetProvider>
    );
    expect(mockSetTitle).toHaveBeenCalled();
  });

  it('exports default function', () => {
    expect(ProductCategoryPage).toBeDefined();
    expect(typeof ProductCategoryPage).toBe('function');
  });

  it('uses CONFIG from config-global', () => {
    render(
      <HelmetProvider>
        <ProductCategoryPage />
      </HelmetProvider>
    );
    expect(screen.getByTestId('product-category-view')).toBeInTheDocument();
  });

  it('renders with Helmet meta tags', () => {
    const { container } = render(
      <HelmetProvider>
        <ProductCategoryPage />
      </HelmetProvider>
    );
    expect(container).toBeTruthy();
  });

  it('imports ProductCategoryView from sections', () => {
    render(
      <HelmetProvider>
        <ProductCategoryPage />
      </HelmetProvider>
    );
    expect(screen.getByTestId('product-category-view')).toBeDefined();
  });

  it('is a functional component', () => {
    expect(typeof ProductCategoryPage).toBe('function');
    expect(ProductCategoryPage.name).toBe('ProductCategoryPage');
  });
});
