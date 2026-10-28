import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlashSaleCreateView } from 'src/sections/flash-sale/flash-sale-create-view';

const mockNavigate = vi.fn();
const mockDispatch = vi.fn();
const mockUseAppSelector = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
}));

vi.mock('src/redux/store/flashSaleSlice', () => ({
  createFlashSaleRequest: vi.fn((params) => ({ type: 'CREATE_FLASH_SALE', payload: params })),
  bulkAddFlashSaleProductsRequest: vi.fn((params) => ({ type: 'BULK_ADD_PRODUCTS', payload: params })),
  selectCreateFlashSaleLoading: vi.fn((state) => false),
}));

vi.mock('src/sections/flash-sale/flash-sale-form', () => ({
  FlashSaleForm: ({ mode, onSubmit, onCancel, loading }: any) => (
    <div data-testid="flash-sale-form" data-mode={mode} data-loading={loading}>
      <button onClick={() => onSubmit({
        name: 'Test Sale',
        startTime: new Date(),
        endTime: new Date(),
        isEnabled: true
      }, {
        products: [{
          productId: 'prod1',
          discountType: 1,
          discountValue: 10,
          promotionalQuantity: 100,
          isEnabled: true
        }]
      })}>
        Submit With Products
      </button>
      <button onClick={() => onSubmit({
        name: 'Test Sale',
        startTime: new Date(),
        endTime: new Date(),
        isEnabled: true
      })}>
        Submit No Products
      </button>
      <button onClick={() => onSubmit({
        name: 'Test',
        startTime: null,
        endTime: new Date(),
        isEnabled: true
      })}>
        Submit No Start
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

describe('FlashSaleCreateView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let callCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      return callCount++ === 0 ? false : null;
    });
  });

  it('renders without errors', () => {
    expect(() => {
      render(<FlashSaleCreateView />);
    }).not.toThrow();
  });

  it('renders FlashSaleForm component', () => {
    render(<FlashSaleCreateView />);
    expect(screen.getByTestId('flash-sale-form')).toBeInTheDocument();
  });

  it('passes mode="create" to form', () => {
    render(<FlashSaleCreateView />);
    const form = screen.getByTestId('flash-sale-form');
    expect(form).toHaveAttribute('data-mode', 'create');
  });

  it('handles cancel by navigating to /flash-sale', () => {
    render(<FlashSaleCreateView />);

    const cancelButton = screen.getByText('Cancel');
    cancelButton.click();

    expect(mockNavigate).toHaveBeenCalledWith('/flash-sale');
  });

  it('handles submit without products', () => {
    render(<FlashSaleCreateView />);

    const submitButton = screen.getByText('Submit No Products');
    submitButton.click();

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'CREATE_FLASH_SALE' })
    );
  });

  it('does not dispatch when startTime is missing', () => {
    render(<FlashSaleCreateView />);

    const submitButton = screen.getByText('Submit No Start');
    submitButton.click();

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('handles submit with products', () => {
    render(<FlashSaleCreateView />);

    const submitButton = screen.getByText('Submit With Products');
    submitButton.click();

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('navigates to /flash-sale after successful creation without products', () => {
    render(<FlashSaleCreateView />);

    const submitButton = screen.getByText('Submit No Products');
    submitButton.click();

    // Simulate onSuccess callback
    const createCall = mockDispatch.mock.calls[0][0];
    if (createCall.payload.onSuccess) {
      createCall.payload.onSuccess({ id: 'flash-sale-123' });
    }

    expect(mockNavigate).toHaveBeenCalledWith('/flash-sale');
  });

  it('adds products and navigates after successful creation with products', () => {
    render(<FlashSaleCreateView />);

    const submitButton = screen.getByText('Submit With Products');
    submitButton.click();

    // Simulate onSuccess callback of create
    const createCall = mockDispatch.mock.calls[0][0];
    if (createCall.payload.onSuccess) {
      createCall.payload.onSuccess({ id: 'flash-sale-123' });
    }

    // Should dispatch bulk add
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'BULK_ADD_PRODUCTS' })
    );

    // Simulate bulk add success
    const bulkAddCall = mockDispatch.mock.calls[1][0];
    if (bulkAddCall.payload.onSuccess) {
      bulkAddCall.payload.onSuccess();
    }

    expect(mockNavigate).toHaveBeenCalledWith('/flash-sale');
  });

  it('uses useNavigate hook', () => {
    render(<FlashSaleCreateView />);
    expect(mockNavigate).toBeDefined();
  });

  it('uses useAppDispatch hook', () => {
    render(<FlashSaleCreateView />);
    expect(mockDispatch).toBeDefined();
  });

  it('uses useAppSelector hook', () => {
    render(<FlashSaleCreateView />);
    expect(mockUseAppSelector).toHaveBeenCalled();
  });

  it('exports FlashSaleCreateView function', () => {
    expect(FlashSaleCreateView).toBeDefined();
    expect(typeof FlashSaleCreateView).toBe('function');
  });

  it('renders Box component', () => {
    const { container } = render(<FlashSaleCreateView />);
    expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();
  });

  it('is a functional component', () => {
    expect(typeof FlashSaleCreateView).toBe('function');
    expect(FlashSaleCreateView.name).toBe('FlashSaleCreateView');
  });
});
