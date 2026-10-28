import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  SkuListSection,
  type ComboItemWithDetails,
} from 'src/sections/product-combo/components/sku-list-section';
import type { Product } from 'src/types/gen/shared/shared/products/product';

const mockProducts: ComboItemWithDetails[] = [
  {
    productId: 'prod1',
    quantity: 1,
    code: 'P001',
    name: 'Product 1',
    image: 'https://example.com/prod1.jpg',
  },
  {
    productId: 'prod2',
    quantity: 2,
    code: 'P002',
    name: 'Product 2',
    image: 'https://example.com/prod2.jpg',
  },
];

const mockSearchResults: Product[] = [
  {
    id: 'search1',
    code: 'S001',
    name: 'Search Result 1',
    images: { avatar: 'https://example.com/search1.jpg' },
  } as Product,
  {
    id: 'search2',
    code: 'S002',
    name: 'Search Result 2',
    images: { avatar: 'https://example.com/search2.jpg' },
  } as Product,
];

const mockOnAddProduct = vi.fn();
const mockOnRemoveProduct = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockGetProducts = vi.fn();

vi.mock('src/repositories/product.repository', () => ({
  productRepository: {
    getProducts: (...args: any[]) => mockGetProducts(...args),
  },
}));

describe('SkuListSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProducts.mockResolvedValue({ data: mockSearchResults });
  });

  it('renders without crashing', () => {
    const { container } = render(
      <SkuListSection
        products={[]}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders section title', () => {
    render(
      <SkuListSection
        products={[]}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
      />
    );
    expect(screen.getByText('skuInCombo')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(
      <SkuListSection
        products={[]}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
      />
    );
    expect(screen.getByPlaceholderText('searchProduct')).toBeInTheDocument();
  });

  it('renders add product button', () => {
    render(
      <SkuListSection
        products={[]}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
      />
    );
    expect(screen.getByText('addProduct')).toBeInTheDocument();
  });

  it('displays empty state when no products', () => {
    render(
      <SkuListSection
        products={[]}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
      />
    );
    expect(screen.getByText('noProductsYet')).toBeInTheDocument();
  });

  it('displays product list when products provided', () => {
    render(
      <SkuListSection
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
      />
    );
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('displays product codes', () => {
    render(
      <SkuListSection
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
      />
    );
    expect(screen.getByText('P001')).toBeInTheDocument();
    expect(screen.getByText('P002')).toBeInTheDocument();
  });

  it('displays product images', () => {
    render(
      <SkuListSection
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
      />
    );
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThanOrEqual(2);
  });

  it('renders delete buttons for each product', () => {
    const { container } = render(
      <SkuListSection
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
      />
    );
    const deleteButtons = container.querySelectorAll('[data-testid="DeleteIcon"]');
    expect(deleteButtons.length).toBe(2);
  });

  it('calls onRemoveProduct when delete button clicked', () => {
    const { container } = render(
      <SkuListSection
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
      />
    );
    const deleteButtons = container.querySelectorAll('[data-testid="DeleteIcon"]');
    fireEvent.click(deleteButtons[0].parentElement!);
    expect(mockOnRemoveProduct).toHaveBeenCalledWith('prod1');
  });

  it('disables add button when no product selected', () => {
    render(
      <SkuListSection
        products={[]}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
      />
    );
    const addButton = screen.getByText('addProduct');
    expect(addButton).toBeDisabled();
  });

  it('disables controls when loading', () => {
    render(
      <SkuListSection
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
        loading
      />
    );
    const searchInput = screen.getByPlaceholderText('searchProduct');
    expect(searchInput).toBeDisabled();
  });

  it('displays total products count', () => {
    render(
      <SkuListSection
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
      />
    );
    expect(screen.getByText('totalProducts: 2', { exact: false })).toBeInTheDocument();
  });

  it('exports SkuListSection function', () => {
    expect(SkuListSection).toBeDefined();
    expect(typeof SkuListSection).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof SkuListSection).toBe('function');
    expect(SkuListSection.name).toBe('SkuListSection');
  });

  it('exports ComboItemWithDetails type', () => {
    const item: ComboItemWithDetails = {
      productId: 'test',
      quantity: 1,
    };
    expect(item.productId).toBe('test');
  });

  it('renders Card component', () => {
    const { container } = render(
      <SkuListSection
        products={[]}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
      />
    );
    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });

  it('renders Typography for section title', () => {
    const { container } = render(
      <SkuListSection
        products={[]}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
      />
    );
    const typography = container.querySelector('.MuiTypography-h6');
    expect(typography).toBeInTheDocument();
  });

  it('renders Autocomplete component', () => {
    const { container } = render(
      <SkuListSection
        products={[]}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
      />
    );
    const autocomplete = container.querySelector('.MuiAutocomplete-root');
    expect(autocomplete).toBeInTheDocument();
  });

  it('renders Button component for add action', () => {
    render(
      <SkuListSection
        products={[]}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
      />
    );
    const button = screen.getByRole('button', { name: /addProduct/i });
    expect(button).toBeInTheDocument();
  });

  it('renders AddIcon in add button', () => {
    const { container } = render(
      <SkuListSection
        products={[]}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
      />
    );
    const addIcon = container.querySelector('[data-testid="AddIcon"]');
    expect(addIcon).toBeInTheDocument();
  });

  it('renders child product label', () => {
    render(
      <SkuListSection
        products={[]}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
      />
    );
    expect(screen.getByText('childProduct')).toBeInTheDocument();
  });

  it('renders Avatar components for products', () => {
    const { container } = render(
      <SkuListSection
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
      />
    );
    const avatars = container.querySelectorAll('.MuiAvatar-root');
    expect(avatars.length).toBeGreaterThanOrEqual(2);
  });

  it('renders IconButton for delete actions', () => {
    render(
      <SkuListSection
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
      />
    );
    const iconButtons = screen.getAllByRole('button').filter((btn) => {
      const icon = btn.querySelector('[data-testid="DeleteIcon"]');
      return icon !== null;
    });
    expect(iconButtons.length).toBe(2);
  });

  it('handles search input change', () => {
    render(
      <SkuListSection
        products={[]}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
      />
    );
    const searchInput = screen.getByPlaceholderText('searchProduct');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(searchInput).toBeInTheDocument();
  });

  it('displays products with fallback name', () => {
    const productsNoName: ComboItemWithDetails[] = [
      { productId: 'prod1', quantity: 1 },
    ];
    render(
      <SkuListSection
        products={productsNoName}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
      />
    );
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('handles products without images', () => {
    const productsNoImage: ComboItemWithDetails[] = [
      { productId: 'prod1', quantity: 1, name: 'Test Product' },
    ];
    render(
      <SkuListSection
        products={productsNoImage}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
      />
    );
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('handles products without codes', () => {
    const productsNoCode: ComboItemWithDetails[] = [
      { productId: 'prod1', quantity: 1, name: 'Test Product' },
    ];
    render(
      <SkuListSection
        products={productsNoCode}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
      />
    );
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });
});
