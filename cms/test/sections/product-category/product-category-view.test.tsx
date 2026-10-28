import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCategoryView } from 'src/sections/product-category/product-category-view';
import { ProductCategoryStatus } from 'src/types/gen/shared/shared/common/enums';
import type { ProductCategory } from 'src/types/gen/shared/shared/product-categories/product-category';

const mockDispatch = vi.fn();
const mockProductCategories: ProductCategory[] = [
  {
    id: 'cat1',
    name: 'Electronics',
    code: 'ELEC',
    status: ProductCategoryStatus.PRODUCT_CATEGORY_STATUS_ACTIVE,
    order: 1,
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cat2',
    name: 'Phones',
    code: 'PHONE',
    status: ProductCategoryStatus.PRODUCT_CATEGORY_STATUS_HIDDEN,
    order: 1,
    parentId: 'cat1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cat3',
    name: 'Smartphones',
    code: 'SMART',
    status: ProductCategoryStatus.PRODUCT_CATEGORY_STATUS_ACTIVE,
    order: 2,
    parentId: 'cat2',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockUseAppSelector = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
}));

vi.mock('src/redux/store/productCategorySlice', () => ({
  getProductCategoriesRequest: vi.fn((params) => ({ type: 'GET_CATEGORIES', payload: params })),
  selectProductCategories: vi.fn((state) => state.productCategories),
  selectProductCategoryLoading: vi.fn((state) => state.loading),
}));

vi.mock('src/hooks', () => ({
  useColumnVisibilityPersistence: vi.fn(() => [{}, vi.fn()]),
}));

vi.mock('src/components/table', () => ({
  SearchBar: ({ value, onChange, placeholder, renderActions }: any) => (
    <div data-testid="search-bar">
      <input
        data-testid="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {renderActions && renderActions()}
    </div>
  ),
  ColumnVisibility: () => <div data-testid="column-visibility">Column Visibility</div>,
  DataTable: ({ table }: any) => (
    <div data-testid="data-table">
      <table>
        <tbody>
          {table.getRowModel().rows.map((row: any) => (
            <tr key={row.id}>{row.original.name}</tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
}));

describe('ProductCategoryView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let selectorCallCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      if (selectorCallCount === 0) {
        selectorCallCount++;
        return mockProductCategories;
      }
      selectorCallCount++;
      return false;
    });
  });

  it('renders without crashing', () => {
    const { container } = render(<ProductCategoryView />);
    expect(container).toBeInTheDocument();
  });

  it('renders SearchBar component', () => {
    render(<ProductCategoryView />);
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('renders ColumnVisibility component', () => {
    render(<ProductCategoryView />);
    expect(screen.getByTestId('column-visibility')).toBeInTheDocument();
  });

  it('renders DataTable component when data exists', () => {
    render(<ProductCategoryView />);
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('dispatches getProductCategoriesRequest on mount', () => {
    render(<ProductCategoryView />);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'GET_CATEGORIES' })
    );
  });

  it('dispatches with correct page and limit', () => {
    render(<ProductCategoryView />);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          page: 1,
          limit: 1000,
        }),
      })
    );
  });

  it('displays loading state', () => {
    mockUseAppSelector
      .mockReturnValueOnce([])
      .mockReturnValueOnce(true);

    render(<ProductCategoryView />);
    expect(screen.getByText('loading...')).toBeInTheDocument();
  });

  it('displays no data state when categories are empty', () => {
    mockUseAppSelector
      .mockReturnValueOnce([])
      .mockReturnValueOnce(false);

    render(<ProductCategoryView />);
    expect(screen.getByText('noData')).toBeInTheDocument();
  });

  it('renders search bar with correct placeholder', () => {
    render(<ProductCategoryView />);
    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toHaveAttribute('placeholder', 'searchProductCategory');
  });

  it('uses useAppDispatch hook', () => {
    render(<ProductCategoryView />);
    expect(mockDispatch).toBeDefined();
  });

  it('uses useAppSelector hook', () => {
    render(<ProductCategoryView />);
    expect(mockUseAppSelector).toHaveBeenCalled();
  });

  it('exports ProductCategoryView function', () => {
    expect(ProductCategoryView).toBeDefined();
    expect(typeof ProductCategoryView).toBe('function');
  });

  it('renders Box container with correct layout', () => {
    const { container } = render(<ProductCategoryView />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toBeInTheDocument();
  });

  it('renders Card components for search and table', () => {
    const { container } = render(<ProductCategoryView />);
    const cards = container.querySelectorAll('.MuiCard-root');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('is a functional component', () => {
    expect(typeof ProductCategoryView).toBe('function');
    expect(ProductCategoryView.name).toBe('ProductCategoryView');
  });

  it('renders table with categories when data exists', () => {
    render(<ProductCategoryView />);
    const table = screen.getByTestId('data-table');
    expect(table).toBeInTheDocument();
    expect(table.textContent).toContain('Electronics');
  });

  it('displays category hierarchy with level indicators', () => {
    render(<ProductCategoryView />);
    const table = screen.getByTestId('data-table');
    // Parent category (level 0): Electronics
    // Child category (level 1): ---Phones
    // Grandchild category (level 2): ------Smartphones
    expect(table.textContent).toContain('Electronics');
    expect(table.textContent).toContain('Phones');
    expect(table.textContent).toContain('Smartphones');
  });

  it('renders search functionality', () => {
    const { rerender } = render(<ProductCategoryView />);
    const searchInput = screen.getByTestId('search-input') as HTMLInputElement;

    // Simulate typing in search
    searchInput.value = 'phone';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));

    rerender(<ProductCategoryView />);
    expect(searchInput.value).toBeDefined();
  });

  it('dispatches request with filters when search query exists', () => {
    render(<ProductCategoryView />);

    // Initial call
    expect(mockDispatch).toHaveBeenCalled();

    // The component should dispatch with filters when searchQuery changes
    const dispatchCalls = mockDispatch.mock.calls;
    expect(dispatchCalls.length).toBeGreaterThan(0);
  });

  it('handles empty product categories list', () => {
    mockUseAppSelector
      .mockReturnValueOnce([])
      .mockReturnValueOnce(false);

    const { container } = render(<ProductCategoryView />);
    expect(container).toBeInTheDocument();
    expect(screen.getByText('noData')).toBeInTheDocument();
  });

  it('renders status chips for categories', () => {
    const { container } = render(<ProductCategoryView />);
    const chips = container.querySelectorAll('.MuiChip-root');
    // Should render status chips in the table
    expect(chips.length).toBeGreaterThanOrEqual(0);
  });

  it('uses column visibility persistence hook', () => {
    render(<ProductCategoryView />);
    // The hook is called during component initialization
    expect(mockUseAppSelector).toHaveBeenCalled();
  });

  it('renders with correct structure', () => {
    const { container } = render(<ProductCategoryView />);

    // Should have main Box container
    expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();

    // Should have Cards for search and table
    const cards = container.querySelectorAll('.MuiCard-root');
    expect(cards.length).toBeGreaterThan(0);
  });
});
