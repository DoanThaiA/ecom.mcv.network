import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductFilterDrawer, defaultProductFilterValues } from 'src/sections/product/components/ProductFilterDrawer';

const mockOnClose = vi.fn();
const mockOnFiltersChange = vi.fn();
const mockOnApply = vi.fn();
const mockOnClear = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('src/components/filter', () => ({
  FilterDrawer: ({ children, open, onClose, onApply, onClear }: any) =>
    open ? (
      <div data-testid="filter-drawer">
        {children}
        <button data-testid="close-btn" onClick={onClose}>Close</button>
        <button data-testid="apply-btn" onClick={onApply}>Apply</button>
        <button data-testid="clear-btn" onClick={onClear}>Clear</button>
      </div>
    ) : null,
  FilterSelect: ({ value, onChange, placeholder }: any) => (
    <select
      data-testid={`filter-select-${placeholder}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
    </select>
  ),
  FilterRangeInput: ({ placeholderFrom }: any) => (
    <div data-testid={`filter-range-${placeholderFrom}`}>Range Input</div>
  ),
  FilterCheckbox: ({ label, checked, onChange }: any) => (
    <label data-testid={`filter-checkbox-${label}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  ),
}));

describe('ProductFilterDrawer', () => {
  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    filters: defaultProductFilterValues,
    onFiltersChange: mockOnFiltersChange,
    onApply: mockOnApply,
    onClear: mockOnClear,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing when open', () => {
    const { container } = render(<ProductFilterDrawer {...defaultProps} />);
    expect(container).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ProductFilterDrawer {...defaultProps} open={false} />);
    expect(screen.queryByTestId('filter-drawer')).not.toBeInTheDocument();
  });

  it('renders FilterDrawer component', () => {
    render(<ProductFilterDrawer {...defaultProps} />);
    expect(screen.getByTestId('filter-drawer')).toBeInTheDocument();
  });

  it('renders price section', () => {
    render(<ProductFilterDrawer {...defaultProps} />);
    expect(screen.getByText('price')).toBeInTheDocument();
  });

  it('renders stock section', () => {
    render(<ProductFilterDrawer {...defaultProps} />);
    expect(screen.getByText('stock')).toBeInTheDocument();
  });

  it('renders status section', () => {
    render(<ProductFilterDrawer {...defaultProps} />);
    expect(screen.getByText('status')).toBeInTheDocument();
  });

  it('renders price type filter', () => {
    render(<ProductFilterDrawer {...defaultProps} />);
    const selects = screen.getAllByTestId('filter-select-pleaseSelect');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('renders price range filter', () => {
    render(<ProductFilterDrawer {...defaultProps} />);
    expect(screen.getByTestId('filter-range-priceFrom')).toBeInTheDocument();
  });

  it('renders stock by parent checkbox', () => {
    render(<ProductFilterDrawer {...defaultProps} />);
    expect(screen.getByTestId('filter-checkbox-stockByParent')).toBeInTheDocument();
  });

  it('renders stock range filter', () => {
    render(<ProductFilterDrawer {...defaultProps} />);
    expect(screen.getByTestId('filter-range-stockFrom')).toBeInTheDocument();
  });

  it('handles close button click', () => {
    render(<ProductFilterDrawer {...defaultProps} />);
    fireEvent.click(screen.getByTestId('close-btn'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles apply button click', () => {
    render(<ProductFilterDrawer {...defaultProps} />);
    fireEvent.click(screen.getByTestId('apply-btn'));
    expect(mockOnApply).toHaveBeenCalledTimes(1);
  });

  it('handles clear button click', () => {
    render(<ProductFilterDrawer {...defaultProps} />);
    fireEvent.click(screen.getByTestId('clear-btn'));
    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });

  it('handles price type change', () => {
    render(<ProductFilterDrawer {...defaultProps} />);
    const selects = screen.getAllByTestId('filter-select-pleaseSelect');
    fireEvent.change(selects[0], { target: { value: 'retail' } });
    expect(mockOnFiltersChange).toHaveBeenCalled();
  });

  it('handles stock by parent checkbox change', () => {
    render(<ProductFilterDrawer {...defaultProps} />);
    const checkbox = screen.getByTestId('filter-checkbox-stockByParent').querySelector('input');
    if (checkbox) {
      fireEvent.click(checkbox);
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultProductFilterValues,
        stockByParent: true,
      });
    }
  });

  it('exports ProductFilterDrawer function', () => {
    expect(ProductFilterDrawer).toBeDefined();
    expect(typeof ProductFilterDrawer).toBe('function');
  });

  it('exports defaultProductFilterValues', () => {
    expect(defaultProductFilterValues).toBeDefined();
    expect(typeof defaultProductFilterValues).toBe('object');
  });

  it('defaultProductFilterValues has correct structure', () => {
    expect(defaultProductFilterValues).toHaveProperty('priceType');
    expect(defaultProductFilterValues).toHaveProperty('priceRange');
    expect(defaultProductFilterValues).toHaveProperty('stockType');
    expect(defaultProductFilterValues).toHaveProperty('stockByParent');
    expect(defaultProductFilterValues).toHaveProperty('stockRange');
    expect(defaultProductFilterValues).toHaveProperty('inventoryStatus');
    expect(defaultProductFilterValues).toHaveProperty('sellingStatus');
  });

  it('is a functional component', () => {
    expect(typeof ProductFilterDrawer).toBe('function');
    expect(ProductFilterDrawer.name).toBe('ProductFilterDrawer');
  });

  it('renders Box containers', () => {
    const { container } = render(<ProductFilterDrawer {...defaultProps} />);
    const boxes = container.querySelectorAll('.MuiBox-root');
    expect(boxes.length).toBeGreaterThan(0);
  });

  it('renders Typography components', () => {
    const { container } = render(<ProductFilterDrawer {...defaultProps} />);
    const typographies = container.querySelectorAll('.MuiTypography-root');
    expect(typographies.length).toBeGreaterThan(0);
  });
});
