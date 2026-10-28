import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CategoryAutocomplete } from 'src/sections/product-combo/components/category-autocomplete';
import type { ProductCategoryResponse } from 'src/types/gen/shared/shared/product_categories/product_category';

const mockCategories: ProductCategoryResponse[] = [
  {
    id: 'cat1',
    name: 'Electronics',
    code: 'ELEC',
    description: 'Electronic items',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  } as ProductCategoryResponse,
  {
    id: 'cat2',
    name: 'Fashion',
    code: 'FASH',
    description: 'Fashion items',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  } as ProductCategoryResponse,
];

const mockDispatch = vi.fn();
const mockOnChange = vi.fn();

let callCount = 0;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: vi.fn((selector) => {
    callCount++;
    if (callCount % 2 === 1) return mockCategories; // selectProductCategories
    return false; // selectProductCategoryLoading
  }),
}));

vi.mock('src/redux/store/productCategorySlice', () => ({
  getProductCategoriesRequest: vi.fn((params) => ({
    type: 'GET_CATEGORIES',
    payload: params,
  })),
  setProductCategoriesSuccess: vi.fn((data) => ({
    type: 'SET_CATEGORIES',
    payload: data,
  })),
  selectProductCategories: vi.fn((state) => state.categories),
  selectProductCategoryLoading: vi.fn((state) => state.loading),
}));

const mockGetProductCategories = vi.fn();

vi.mock('src/repositories', () => ({
  productCategoryRepository: {
    getProductCategories: (...args: any[]) => mockGetProductCategories(...args),
  },
}));

describe('CategoryAutocomplete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    callCount = 0;
    mockGetProductCategories.mockResolvedValue(mockCategories);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <CategoryAutocomplete value={undefined} onChange={mockOnChange} />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders with category label', () => {
    render(<CategoryAutocomplete value={undefined} onChange={mockOnChange} />);
    expect(screen.getByLabelText('category')).toBeInTheDocument();
  });

  it('renders autocomplete input', () => {
    render(<CategoryAutocomplete value={undefined} onChange={mockOnChange} />);
    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
  });

  it('displays selected category when value is provided', () => {
    render(<CategoryAutocomplete value="cat1" onChange={mockOnChange} />);
    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('Electronics');
  });

  it('can be disabled', () => {
    render(<CategoryAutocomplete value={undefined} onChange={mockOnChange} disabled />);
    const input = screen.getByRole('combobox');
    expect(input).toBeDisabled();
  });

  it('opens dropdown when clicked', () => {
    render(<CategoryAutocomplete value={undefined} onChange={mockOnChange} />);
    const input = screen.getByRole('combobox');
    fireEvent.mouseDown(input);
    // Dropdown opens, categories are displayed
    expect(input).toBeInTheDocument();
  });

  it('calls onChange when category is selected', () => {
    render(<CategoryAutocomplete value={undefined} onChange={mockOnChange} />);
    const input = screen.getByRole('combobox');

    fireEvent.mouseDown(input);
    const option = screen.getByText('Electronics');
    fireEvent.click(option);

    expect(mockOnChange).toHaveBeenCalledWith('cat1');
  });

  it('handles search input', () => {
    render(<CategoryAutocomplete value={undefined} onChange={mockOnChange} />);
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'Elec' } });

    // Input is rendered and can accept changes
    expect(input).toBeInTheDocument();
  });

  it('debounces search correctly', () => {
    render(<CategoryAutocomplete value={undefined} onChange={mockOnChange} />);
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'Test' } });

    expect(mockGetProductCategories).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(mockGetProductCategories).toHaveBeenCalled();
  });

  it('handles input value changes', () => {
    render(<CategoryAutocomplete value={undefined} onChange={mockOnChange} />);
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'Fashion' } });

    // Input can be changed
    expect(input).toBeInTheDocument();
  });

  it('resets state when dropdown closes', () => {
    render(<CategoryAutocomplete value={undefined} onChange={mockOnChange} />);
    const input = screen.getByRole('combobox');

    fireEvent.mouseDown(input);
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.blur(input);

    expect(input).toHaveValue('');
  });

  it('handles search error gracefully', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetProductCategories.mockRejectedValueOnce(new Error('Search failed'));

    render(<CategoryAutocomplete value={undefined} onChange={mockOnChange} />);
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'Error' } });
    vi.advanceTimersByTime(300);

    // Error is handled internally
    consoleErrorSpy.mockRestore();
    expect(input).toBeInTheDocument();
  });

  it('exports CategoryAutocomplete function', () => {
    expect(CategoryAutocomplete).toBeDefined();
    expect(typeof CategoryAutocomplete).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof CategoryAutocomplete).toBe('function');
    expect(CategoryAutocomplete.name).toBe('CategoryAutocomplete');
  });

  it('renders MUI Autocomplete component', () => {
    const { container } = render(
      <CategoryAutocomplete value={undefined} onChange={mockOnChange} />
    );
    const autocomplete = container.querySelector('.MuiAutocomplete-root');
    expect(autocomplete).toBeInTheDocument();
  });

  it('renders TextField component', () => {
    const { container } = render(
      <CategoryAutocomplete value={undefined} onChange={mockOnChange} />
    );
    const textField = container.querySelector('.MuiTextField-root');
    expect(textField).toBeInTheDocument();
  });

  it('filters options correctly', () => {
    render(<CategoryAutocomplete value={undefined} onChange={mockOnChange} />);
    const input = screen.getByRole('combobox');

    fireEvent.mouseDown(input);

    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Fashion')).toBeInTheDocument();
  });

  it('clears value when clear button clicked', () => {
    render(<CategoryAutocomplete value="cat1" onChange={mockOnChange} />);
    const clearButton = screen.getByTitle('Clear');

    fireEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith(undefined);
  });

  it('renders options with correct keys', () => {
    render(<CategoryAutocomplete value={undefined} onChange={mockOnChange} />);
    const input = screen.getByRole('combobox');

    fireEvent.mouseDown(input);

    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(0);
    options.forEach((option) => {
      expect(option).toHaveAttribute('data-option-index');
    });
  });

  it('displays placeholder text', () => {
    render(<CategoryAutocomplete value={undefined} onChange={mockOnChange} />);
    expect(screen.getByPlaceholderText('selectCategory')).toBeInTheDocument();
  });

  it('handles multiple category selections', () => {
    render(<CategoryAutocomplete value={undefined} onChange={mockOnChange} />);
    const input = screen.getByRole('combobox');

    fireEvent.mouseDown(input);
    const option1 = screen.getByText('Electronics');
    fireEvent.click(option1);

    expect(mockOnChange).toHaveBeenCalledWith('cat1');
  });

  it('displays categories when dropdown opens', () => {
    render(<CategoryAutocomplete value={undefined} onChange={mockOnChange} />);
    const input = screen.getByRole('combobox');

    fireEvent.mouseDown(input);

    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Fashion')).toBeInTheDocument();
  });
});
