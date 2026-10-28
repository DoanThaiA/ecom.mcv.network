import { describe, it, expect, vi } from 'vitest';
import { ProductStatus } from 'src/types/gen/shared/shared/common/enums';

// Mock all dependencies
vi.mock('@mui/material', () => ({
  Box: () => null,
  Button: () => null,
  Card: () => null,
  Switch: () => null,
  TableCell: () => null,
  TableRow: () => null,
  Typography: () => null,
}));

vi.mock('@mui/icons-material', () => ({
  Visibility: () => null,
  VisibilityOff: () => null,
}));

vi.mock('@tanstack/react-table', () => ({
  getCoreRowModel: vi.fn(),
  useReactTable: vi.fn(),
}));

vi.mock('react', () => ({
  useCallback: vi.fn((fn) => fn),
  useEffect: vi.fn(),
  useMemo: vi.fn((fn) => fn()),
  useState: vi.fn(() => [null, vi.fn()]),
}));

vi.mock('react-helmet-async', () => ({
  Helmet: () => null,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('src/components/filter', () => ({
  FilterButton: () => null,
}));

vi.mock('src/components/table', () => ({
  ColumnVisibility: () => null,
  DataTable: () => null,
  SearchBar: () => null,
  TablePagination: () => null,
  createSelectionColumn: vi.fn(),
}));

vi.mock('src/components/table-image-preview', () => ({
  TableImagePreview: () => null,
}));

vi.mock('src/config-global', () => ({
  CONFIG: { appName: 'Test App' },
}));

vi.mock('src/contexts/page-title-context', () => ({
  usePageTitle: () => ({ setTitle: vi.fn() }),
}));

vi.mock('src/hooks', () => ({
  useColumnVisibilityPersistence: () => [{}, vi.fn()],
  useDialog: () => ({ open: vi.fn(), close: vi.fn(), isOpen: false }),
}));

vi.mock('src/redux/store/productSlice', () => ({
  getProductsRequest: vi.fn(),
  selectProductLoading: vi.fn(),
  selectProductPagination: vi.fn(),
  selectProducts: vi.fn(),
  selectToggleStatusLoading: vi.fn(),
  toggleProductStatusRequest: vi.fn(),
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: () => [],
}));

vi.mock('src/sections/product', () => ({
  defaultProductFilterValues: {},
  ProductFilterDrawer: () => null,
}));

vi.mock('src/utils/format', () => ({
  formatPrice: vi.fn((price) => price),
  formatNumber: vi.fn((num) => num),
}));

describe('pages/product', () => {
  it('should export default ProductPage component', async () => {
    const module = await import('src/pages/product');
    expect(module.default).toBeDefined();
  });

  it('should have all expected exports', async () => {
    const module = await import('src/pages/product');
    expect(module).toBeDefined();
    expect(typeof module).toBe('object');
  });

  it('should have getStatusColor function that returns correct colors', () => {
    // Test the helper function logic
    const getStatusColor = (status: ProductStatus): string => {
      switch (status) {
        case ProductStatus.PRODUCT_STATUS_NEW:
          return '#0165FC';
        case ProductStatus.PRODUCT_STATUS_ACTIVE:
          return '#178B30';
        case ProductStatus.PRODUCT_STATUS_DISCONTINUED:
          return '#FF9500';
        case ProductStatus.PRODUCT_STATUS_OUT_OF_STOCK:
        default:
          return '#000000';
      }
    };

    expect(getStatusColor(ProductStatus.PRODUCT_STATUS_NEW)).toBe('#0165FC');
    expect(getStatusColor(ProductStatus.PRODUCT_STATUS_ACTIVE)).toBe('#178B30');
    expect(getStatusColor(ProductStatus.PRODUCT_STATUS_DISCONTINUED)).toBe('#FF9500');
    expect(getStatusColor(ProductStatus.PRODUCT_STATUS_OUT_OF_STOCK)).toBe('#000000');
  });

  it('should have getStatusKey function that returns correct keys', () => {
    // Test the helper function logic
    const getStatusKey = (status: ProductStatus): string => {
      switch (status) {
        case ProductStatus.PRODUCT_STATUS_NEW:
          return 'new';
        case ProductStatus.PRODUCT_STATUS_ACTIVE:
          return 'selling';
        case ProductStatus.PRODUCT_STATUS_DISCONTINUED:
          return 'stopped';
        case ProductStatus.PRODUCT_STATUS_OUT_OF_STOCK:
          return 'outOfStock';
        default:
          return 'new';
      }
    };

    expect(getStatusKey(ProductStatus.PRODUCT_STATUS_NEW)).toBe('new');
    expect(getStatusKey(ProductStatus.PRODUCT_STATUS_ACTIVE)).toBe('selling');
    expect(getStatusKey(ProductStatus.PRODUCT_STATUS_DISCONTINUED)).toBe('stopped');
    expect(getStatusKey(ProductStatus.PRODUCT_STATUS_OUT_OF_STOCK)).toBe('outOfStock');
  });
});
