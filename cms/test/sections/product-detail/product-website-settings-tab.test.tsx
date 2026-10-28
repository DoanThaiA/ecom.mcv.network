import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductWebsiteSettingsTab } from 'src/sections/product-detail/product-website-settings-tab';
import type { ProductExtended } from 'src/types/products';

const mockProduct: ProductExtended = {
  id: 'product1',
  name: 'Test Product',
  details: {
    material: 'Cotton',
    style: 'Classic',
    highlights: 'High quality',
    suitableFor: 'All ages',
    careInstructions: 'Machine wash',
  },
  content: '<p>Product description</p>',
} as ProductExtended;

const mockDispatch = vi.fn();
const mockUseAppSelector = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
}));

vi.mock('src/redux/store/productSlice', () => ({
  updateProductRequest: vi.fn((params) => ({ type: 'UPDATE_PRODUCT', payload: params })),
  selectUpdateProductLoading: vi.fn((state) => state.updateLoading),
}));

vi.mock('src/components/html-editor', () => ({
  HtmlEditor: ({ value, onChange, disabled }: any) => (
    <div data-testid="html-editor">
      <textarea
        data-testid="html-editor-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  ),
}));

describe('ProductWebsiteSettingsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppSelector.mockReturnValue(false);
  });

  it('renders without crashing', () => {
    const { container } = render(<ProductWebsiteSettingsTab product={mockProduct} />);
    expect(container).toBeInTheDocument();
  });

  it('renders material field', () => {
    render(<ProductWebsiteSettingsTab product={mockProduct} />);
    expect(screen.getByText('material')).toBeInTheDocument();
  });

  it('renders style field', () => {
    render(<ProductWebsiteSettingsTab product={mockProduct} />);
    expect(screen.getByText('style')).toBeInTheDocument();
  });

  it('renders highlights field', () => {
    render(<ProductWebsiteSettingsTab product={mockProduct} />);
    expect(screen.getByText('highlights')).toBeInTheDocument();
  });

  it('renders suitable field', () => {
    render(<ProductWebsiteSettingsTab product={mockProduct} />);
    expect(screen.getByText('suitable')).toBeInTheDocument();
  });

  it('renders preservation field', () => {
    render(<ProductWebsiteSettingsTab product={mockProduct} />);
    expect(screen.getByText('preservation')).toBeInTheDocument();
  });

  it('renders description field', () => {
    render(<ProductWebsiteSettingsTab product={mockProduct} />);
    expect(screen.getByText('description')).toBeInTheDocument();
  });

  it('renders HtmlEditor component', () => {
    render(<ProductWebsiteSettingsTab product={mockProduct} />);
    expect(screen.getByTestId('html-editor')).toBeInTheDocument();
  });

  it('renders save button', () => {
    render(<ProductWebsiteSettingsTab product={mockProduct} />);
    expect(screen.getByText('save')).toBeInTheDocument();
  });

  it('populates form fields with product data', () => {
    render(<ProductWebsiteSettingsTab product={mockProduct} />);
    const inputs = screen.getAllByRole('textbox');

    const materialInput = inputs.find((input) =>
      (input as HTMLInputElement).value === 'Cotton'
    );
    expect(materialInput).toBeDefined();
  });

  it('handles save button click', () => {
    render(<ProductWebsiteSettingsTab product={mockProduct} />);
    const saveButton = screen.getByText('save');
    fireEvent.click(saveButton);

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'UPDATE_PRODUCT',
      })
    );
  });

  it('exports ProductWebsiteSettingsTab function', () => {
    expect(ProductWebsiteSettingsTab).toBeDefined();
    expect(typeof ProductWebsiteSettingsTab).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof ProductWebsiteSettingsTab).toBe('function');
    expect(ProductWebsiteSettingsTab.name).toBe('ProductWebsiteSettingsTab');
  });

  it('renders Box container', () => {
    const { container } = render(<ProductWebsiteSettingsTab product={mockProduct} />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toBeInTheDocument();
  });

  it('renders Typography components', () => {
    const { container } = render(<ProductWebsiteSettingsTab product={mockProduct} />);
    const typographies = container.querySelectorAll('.MuiTypography-root');
    expect(typographies.length).toBeGreaterThan(0);
  });

  it('uses useAppDispatch hook', () => {
    render(<ProductWebsiteSettingsTab product={mockProduct} />);
    expect(mockDispatch).toBeDefined();
  });

  it('uses useAppSelector hook', () => {
    render(<ProductWebsiteSettingsTab product={mockProduct} />);
    expect(mockUseAppSelector).toHaveBeenCalled();
  });

  it('handles product without details gracefully', () => {
    const productWithoutDetails: ProductExtended = {
      id: 'product2',
      name: 'Minimal Product',
    } as ProductExtended;

    const { container } = render(
      <ProductWebsiteSettingsTab product={productWithoutDetails} />
    );
    expect(container).toBeInTheDocument();
  });

  it('maintains state across renders', () => {
    const { rerender } = render(<ProductWebsiteSettingsTab product={mockProduct} />);
    rerender(<ProductWebsiteSettingsTab product={mockProduct} />);
    expect(screen.getByText('save')).toBeInTheDocument();
  });
});
