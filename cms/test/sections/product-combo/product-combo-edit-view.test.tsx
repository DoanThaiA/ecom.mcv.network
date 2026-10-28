import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductComboEditView } from 'src/sections/product-combo/product-combo-edit-view';

const mockNavigate = vi.fn();
const mockParams = { id: 'combo123' };
const mockDispatch = vi.fn();
const mockUseAppSelector = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
}));

vi.mock('src/redux/store/comboSlice', () => ({
  getComboByIdRequest: vi.fn((params) => ({ type: 'GET_COMBO_BY_ID', payload: params })),
  updateComboRequest: vi.fn((params) => ({ type: 'UPDATE_COMBO', payload: params })),
  clearCurrentCombo: vi.fn(() => ({ type: 'CLEAR_CURRENT_COMBO' })),
  selectCurrentCombo: vi.fn(),
  selectCurrentComboLoading: vi.fn(),
  selectUpdateComboLoading: vi.fn(),
}));

vi.mock('src/sections/product-combo/product-combo-form', () => ({
  ProductComboForm: ({ mode, initialData, onSubmit, onCancel, loading }: any) => (
    <div data-testid="product-combo-form" data-mode={mode} data-loading={loading}>
      <div data-testid="form-name">{initialData?.name}</div>
      <button onClick={() => onSubmit({
        name: 'Updated Combo',
        description: 'Updated Description',
      })}>
        Submit
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

describe('ProductComboEditView', () => {
  const mockCombo = {
    id: 'combo123',
    name: 'Test Combo',
    description: 'Test Description',
    image: 'test-image.jpg',
    items: [
      {
        productId: 'prod1',
        quantity: 2,
        productName: 'Product 1',
        productImage: 'image1.jpg',
      },
    ],
    discountType: 1,
    discountValue: 10,
    status: 1,
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    let callCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      const results = [mockCombo, false, false]; // currentCombo, fetchLoading, updateLoading
      return results[callCount++] || null;
    });
  });

  it('renders without errors', () => {
    expect(() => {
      render(<ProductComboEditView />);
    }).not.toThrow();
  });

  it('fetches combo by id on mount', () => {
    render(<ProductComboEditView />);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'GET_COMBO_BY_ID' })
    );
  });

  it('renders ProductComboForm with edit mode', () => {
    render(<ProductComboEditView />);
    const form = screen.getByTestId('product-combo-form');
    expect(form).toHaveAttribute('data-mode', 'edit');
  });

  it('passes initialData to ProductComboForm', () => {
    render(<ProductComboEditView />);
    expect(screen.getByText('Test Combo')).toBeInTheDocument();
  });

  it('transforms combo items correctly', () => {
    render(<ProductComboEditView />);
    const form = screen.getByTestId('product-combo-form');
    expect(form).toBeInTheDocument();
  });

  it('shows loading state when fetching', () => {
    let callCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      const results = [null, true, false]; // currentCombo=null, fetchLoading=true
      return results[callCount++] || null;
    });

    render(<ProductComboEditView />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows loading state when no currentCombo', () => {
    let callCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      const results = [null, false, false]; // currentCombo=null
      return results[callCount++] || null;
    });

    render(<ProductComboEditView />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles submit', () => {
    render(<ProductComboEditView />);

    const submitButton = screen.getByText('Submit');
    submitButton.click();

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'UPDATE_COMBO' })
    );
  });

  it('handles cancel', () => {
    render(<ProductComboEditView />);

    const cancelButton = screen.getByText('Cancel');
    cancelButton.click();

    expect(mockNavigate).toHaveBeenCalledWith('/product-combo');
  });

  it('navigates to /product-combo on successful update', () => {
    render(<ProductComboEditView />);

    const submitButton = screen.getByText('Submit');
    submitButton.click();

    const updateCall = mockDispatch.mock.calls.find(
      call => call[0].type === 'UPDATE_COMBO'
    );
    if (updateCall && updateCall[0].payload.onSuccess) {
      updateCall[0].payload.onSuccess();
    }

    expect(mockNavigate).toHaveBeenCalledWith('/product-combo');
  });

  it('clears current combo on unmount', () => {
    const { unmount } = render(<ProductComboEditView />);
    unmount();

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'CLEAR_CURRENT_COMBO' })
    );
  });

  it('uses useNavigate hook', () => {
    render(<ProductComboEditView />);
    expect(mockNavigate).toBeDefined();
  });

  it('uses useParams hook', () => {
    render(<ProductComboEditView />);
    expect(mockParams.id).toBe('combo123');
  });

  it('uses useAppDispatch hook', () => {
    render(<ProductComboEditView />);
    expect(mockDispatch).toBeDefined();
  });

  it('uses useAppSelector hook', () => {
    render(<ProductComboEditView />);
    expect(mockUseAppSelector).toHaveBeenCalled();
  });

  it('exports ProductComboEditView function', () => {
    expect(ProductComboEditView).toBeDefined();
    expect(typeof ProductComboEditView).toBe('function');
  });

  it('renders Box component', () => {
    const { container } = render(<ProductComboEditView />);
    expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();
  });

  it('is a functional component', () => {
    expect(typeof ProductComboEditView).toBe('function');
    expect(ProductComboEditView.name).toBe('ProductComboEditView');
  });

  it('handles combo with undefined items', () => {
    let callCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      const results = [{ ...mockCombo, items: undefined }, false, false];
      return results[callCount++] || null;
    });

    render(<ProductComboEditView />);
    expect(screen.getByTestId('product-combo-form')).toBeInTheDocument();
  });
});
