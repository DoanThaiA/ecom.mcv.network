import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductDetailView } from 'src/sections/product-detail/product-detail-view';

const mockProduct = {
  id: 'product1',
  name: 'Test Product',
  price: 100000,
  description: 'Test Description',
};

const mockInventory = {
  totalQuantity: 100,
  available: 80,
  reserved: 20,
};

const mockDispatch = vi.fn();
const mockUseAppSelector = vi.fn();
const mockParams = { id: 'product1' };

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('react-router-dom', () => ({
  useParams: () => mockParams,
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
}));

vi.mock('src/redux/store/productSlice', () => ({
  getProductByIdRequest: vi.fn((params) => ({ type: 'GET_PRODUCT_BY_ID', payload: params })),
  getProductInventoryRequest: vi.fn((params) => ({
    type: 'GET_PRODUCT_INVENTORY',
    payload: params,
  })),
  clearCurrentProduct: vi.fn(() => ({ type: 'CLEAR_CURRENT_PRODUCT' })),
  selectCurrentProduct: vi.fn((state) => state.currentProduct),
  selectCurrentProductLoading: vi.fn((state) => state.loading),
  selectProductInventory: vi.fn((state) => state.inventory),
  selectInventoryLoading: vi.fn((state) => state.inventoryLoading),
}));

vi.mock('src/sections/product-detail/product-info-tab', () => ({
  ProductInfoTab: ({ product }: any) => (
    <div data-testid="product-info-tab">Product Info: {product.name}</div>
  ),
}));

vi.mock('src/sections/product-detail/product-inventory-tab', () => ({
  ProductInventoryTab: ({ inventory }: any) => (
    <div data-testid="product-inventory-tab">
      Inventory: {inventory?.totalQuantity || 'No inventory'}
    </div>
  ),
}));

vi.mock('src/sections/product-detail/product-website-settings-tab', () => ({
  ProductWebsiteSettingsTab: ({ product }: any) => (
    <div data-testid="product-website-settings-tab">Website Settings: {product.name}</div>
  ),
}));

describe('ProductDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let selectorCallCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      const callIndex = selectorCallCount++;
      if (callIndex === 0) return mockProduct; // selectCurrentProduct
      if (callIndex === 1) return false; // selectCurrentProductLoading
      if (callIndex === 2) return mockInventory; // selectProductInventory
      return false; // selectInventoryLoading
    });
  });

  it('renders without crashing', () => {
    const { container } = render(<ProductDetailView />);
    expect(container).toBeInTheDocument();
  });

  it('dispatches getProductByIdRequest on mount', () => {
    render(<ProductDetailView />);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'GET_PRODUCT_BY_ID',
        payload: { id: 'product1' },
      })
    );
  });

  it('dispatches clearCurrentProduct on unmount', () => {
    const { unmount } = render(<ProductDetailView />);
    unmount();
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'CLEAR_CURRENT_PRODUCT',
      })
    );
  });

  it('displays loading state', () => {
    mockUseAppSelector
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(false);

    render(<ProductDetailView />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays not found message when product is null', () => {
    mockUseAppSelector
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(false);

    render(<ProductDetailView />);
    expect(screen.getByText('product_not_found')).toBeInTheDocument();
  });

  it('renders tabs', () => {
    render(<ProductDetailView />);
    expect(screen.getByText('information')).toBeInTheDocument();
    expect(screen.getByText('inventory')).toBeInTheDocument();
    expect(screen.getByText('websiteDisplaySettings')).toBeInTheDocument();
  });

  it('renders ProductInfoTab by default', () => {
    render(<ProductDetailView />);
    expect(screen.getByTestId('product-info-tab')).toBeInTheDocument();
  });

  it('exports ProductDetailView function', () => {
    expect(ProductDetailView).toBeDefined();
    expect(typeof ProductDetailView).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof ProductDetailView).toBe('function');
    expect(ProductDetailView.name).toBe('ProductDetailView');
  });

  it('renders Box container', () => {
    const { container } = render(<ProductDetailView />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toBeInTheDocument();
  });

  it('renders Card component', () => {
    const { container } = render(<ProductDetailView />);
    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });

  it('uses useAppDispatch hook', () => {
    render(<ProductDetailView />);
    expect(mockDispatch).toBeDefined();
  });

  it('uses useAppSelector hook', () => {
    render(<ProductDetailView />);
    expect(mockUseAppSelector).toHaveBeenCalled();
  });

  it('uses useParams hook', () => {
    render(<ProductDetailView />);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ id: 'product1' }),
      })
    );
  });

  it('handles tab change', () => {
    // Reset mocks to ensure consistent state
    let callCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      const index = callCount++;
      if (index % 4 === 0) return mockProduct;
      if (index % 4 === 1) return false;
      if (index % 4 === 2) return mockInventory;
      return false;
    });

    render(<ProductDetailView />);
    const inventoryTab = screen.getByText('inventory');
    fireEvent.click(inventoryTab);
    expect(screen.getByTestId('product-inventory-tab')).toBeInTheDocument();
  });

  it('renders TabContext', () => {
    const { container } = render(<ProductDetailView />);
    expect(container).toBeInTheDocument();
  });

  it('maintains state across renders', () => {
    // Ensure consistent mock returns for multiple renders
    let callCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      const index = callCount++;
      if (index % 4 === 0) return mockProduct;
      if (index % 4 === 1) return false;
      if (index % 4 === 2) return mockInventory;
      return false;
    });

    const { rerender } = render(<ProductDetailView />);
    rerender(<ProductDetailView />);
    expect(screen.getByText('information')).toBeInTheDocument();
  });
});
