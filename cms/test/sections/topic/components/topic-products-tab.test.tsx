import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopicProductsTab, type TopicProductItem } from 'src/sections/topic/components/topic-products-tab';

const mockProducts: TopicProductItem[] = [
  {
    productId: 'prod1',
    order: 1,
    productCode: 'P001',
    productName: 'Product 1',
    productImage: 'img1.jpg',
    productPrice: 100000,
    barcode: 'BAR001',
    costPrice: 80000,
    sellingPrice: 100000,
    stock: 50,
    warehouseStock: 100,
    sellingStatus: 'selling',
  },
];

const mockOnAddProducts = vi.fn();
const mockOnRemoveProduct = vi.fn();
const mockOnReorderProducts = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => <div>{children}</div>,
  closestCenter: vi.fn(),
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => <div>{children}</div>,
  verticalListSortingStrategy: vi.fn(),
  sortableKeyboardCoordinates: vi.fn(),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  arrayMove: (array: any[], from: number, to: number) => {
    const newArray = [...array];
    const [removed] = newArray.splice(from, 1);
    newArray.splice(to, 0, removed);
    return newArray;
  },
}));

vi.mock('@dnd-kit/modifiers', () => ({
  restrictToVerticalAxis: vi.fn(),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}));

vi.mock('@tanstack/react-table', () => ({
  useReactTable: () => ({
    getHeaderGroups: () => [],
    getRowModel: () => ({ rows: [] }),
    getAllColumns: () => [],
  }),
  getCoreRowModel: vi.fn(),
  flexRender: (component: any) => component,
}));

vi.mock('src/components/table', () => ({
  SearchBar: ({ value, onChange, renderFarRightActions }: any) => (
    <div data-testid="search-bar">
      <input value={value} onChange={(e) => onChange(e.target.value)} />
      {renderFarRightActions && renderFarRightActions()}
    </div>
  ),
  TablePagination: ({ totalItems }: any) => <div>Total: {totalItems}</div>,
}));

vi.mock('src/components/dialog', () => ({
  ProductSelectionDialog: ({ open, onClose }: any) =>
    open ? <div data-testid="product-dialog">Dialog</div> : null,
}));

vi.mock('src/utils/format', () => ({
  formatNumber: (num: number) => num.toLocaleString(),
}));

vi.mock('src/utils/enum-converter', () => ({
  PRODUCT_STATUS_UI: { 1: 'selling', 2: 'stopped' },
}));

describe('TopicProductsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <TopicProductsTab
        products={[]}
        onAddProducts={mockOnAddProducts}
        onRemoveProduct={mockOnRemoveProduct}
        onReorderProducts={mockOnReorderProducts}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders search bar', () => {
    render(
      <TopicProductsTab
        products={[]}
        onAddProducts={mockOnAddProducts}
        onRemoveProduct={mockOnRemoveProduct}
        onReorderProducts={mockOnReorderProducts}
      />
    );
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('renders add product button', () => {
    render(
      <TopicProductsTab
        products={[]}
        onAddProducts={mockOnAddProducts}
        onRemoveProduct={mockOnRemoveProduct}
        onReorderProducts={mockOnReorderProducts}
      />
    );
    expect(screen.getByText('addProduct')).toBeInTheDocument();
  });

  it('exports TopicProductsTab function', () => {
    expect(TopicProductsTab).toBeDefined();
    expect(typeof TopicProductsTab).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof TopicProductsTab).toBe('function');
    expect(TopicProductsTab.name).toBe('TopicProductsTab');
  });

  it('renders Card component', () => {
    const { container } = render(
      <TopicProductsTab
        products={[]}
        onAddProducts={mockOnAddProducts}
        onRemoveProduct={mockOnRemoveProduct}
        onReorderProducts={mockOnReorderProducts}
      />
    );
    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });

  it('exports TopicProductItem type', () => {
    const item: TopicProductItem = {
      productId: 'test',
      order: 1,
    };
    expect(item.productId).toBe('test');
  });
});
