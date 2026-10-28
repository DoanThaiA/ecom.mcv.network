import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlashSaleEditView } from 'src/sections/flash-sale/flash-sale-edit-view';
import type { FlashSaleResponse } from 'src/types/gen/shared/shared/flash-sales/flash-sale';
import { DiscountType } from 'src/types/gen/shared/shared/common/enums';

const mockFlashSale: FlashSaleResponse = {
  id: 'flash-sale-123',
  name: 'Test Flash Sale',
  startTime: new Date('2024-01-01T00:00:00'),
  endTime: new Date('2024-01-31T23:59:59'),
  isEnabled: true,
  status: 1,
  productCount: 2,
  products: [
    {
      productId: 'prod1',
      productName: 'Product 1',
      discountType: DiscountType.DISCOUNT_TYPE_PERCENTAGE,
      discountValue: 10,
      promotionalQuantity: 100,
      soldCount: 0,
      isEnabled: true,
    },
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockDispatch = vi.fn();
const mockNavigate = vi.fn();

let callCount = 0;

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'flash-sale-123' }),
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: vi.fn((selector) => {
    callCount++;
    // Cycle through: currentFlashSale, fetchLoading, updateLoading, addProductLoading, updateProductLoading, removeProductLoading, toggleProductLoading
    if (callCount % 7 === 1) return mockFlashSale; // selectCurrentFlashSale
    if (callCount % 7 === 2) return false; // selectCurrentFlashSaleLoading
    if (callCount % 7 === 3) return false; // selectUpdateFlashSaleLoading
    if (callCount % 7 === 4) return false; // selectAddProductLoading
    if (callCount % 7 === 5) return false; // selectUpdateProductLoading
    if (callCount % 7 === 6) return false; // selectRemoveProductLoading
    return false; // selectToggleProductLoading
  }),
}));

vi.mock('src/redux/store/flashSaleSlice', () => ({
  getFlashSaleByIdRequest: vi.fn((params) => ({ type: 'GET_FLASH_SALE_BY_ID', payload: params })),
  updateFlashSaleRequest: vi.fn((params) => ({ type: 'UPDATE_FLASH_SALE', payload: params })),
  bulkAddFlashSaleProductsRequest: vi.fn((params) => ({ type: 'BULK_ADD_PRODUCTS', payload: params })),
  bulkUpdateFlashSaleProductsRequest: vi.fn((params) => ({ type: 'BULK_UPDATE_PRODUCTS', payload: params })),
  removeFlashSaleProductRequest: vi.fn((params) => ({ type: 'REMOVE_PRODUCT', payload: params })),
  clearCurrentFlashSale: vi.fn(() => ({ type: 'CLEAR_CURRENT_FLASH_SALE' })),
  selectCurrentFlashSale: vi.fn((state) => state.currentFlashSale),
  selectCurrentFlashSaleLoading: vi.fn((state) => state.currentFlashSaleLoading),
  selectUpdateFlashSaleLoading: vi.fn((state) => state.updateLoading),
  selectAddProductLoading: vi.fn((state) => state.addProductLoading),
  selectUpdateProductLoading: vi.fn((state) => state.updateProductLoading),
  selectRemoveProductLoading: vi.fn((state) => state.removeProductLoading),
  selectToggleProductLoading: vi.fn((state) => state.toggleProductLoading),
}));

vi.mock('src/sections/flash-sale/flash-sale-form', () => ({
  FlashSaleForm: ({ mode, initialData, initialProducts, flashSaleId, onSubmit, onCancel, loading }: any) => (
    <div data-testid="flash-sale-form">
      <div>Mode: {mode}</div>
      <div>Flash Sale ID: {flashSaleId}</div>
      <div>Name: {initialData?.name}</div>
      <div>Loading: {loading.toString()}</div>
      <div>Products: {initialProducts?.length || 0}</div>
      <button
        onClick={() =>
          onSubmit(
            {
              name: 'Updated Flash Sale',
              startTime: new Date('2024-02-01'),
              endTime: new Date('2024-02-28'),
              isEnabled: true,
            },
            {
              products: [
                {
                  productId: 'prod1',
                  discountType: 1,
                  discountValue: 15,
                  promotionalQuantity: 150,
                  isEnabled: true,
                },
                {
                  productId: 'prod2',
                  discountType: 2,
                  discountValue: 20,
                  promotionalQuantity: 200,
                  isEnabled: true,
                },
              ],
            }
          )
        }
      >
        Submit
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

vi.mock('src/utils/enum-converter', () => ({
  parseDiscountType: (type: any) => type,
}));

describe('FlashSaleEditView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    callCount = 0;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders without crashing', () => {
    const { container } = render(<FlashSaleEditView />);
    expect(container).toBeInTheDocument();
  });

  it('dispatches getFlashSaleByIdRequest on mount', () => {
    render(<FlashSaleEditView />);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'GET_FLASH_SALE_BY_ID' })
    );
  });

  it('dispatches clearCurrentFlashSale on unmount', () => {
    const { unmount } = render(<FlashSaleEditView />);
    unmount();
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'CLEAR_CURRENT_FLASH_SALE' })
    );
  });


  it('renders FlashSaleForm when data is loaded', () => {
    render(<FlashSaleEditView />);
    expect(screen.getByTestId('flash-sale-form')).toBeInTheDocument();
  });

  it('renders form in edit mode', () => {
    render(<FlashSaleEditView />);
    expect(screen.getByText('Mode: edit')).toBeInTheDocument();
  });

  it('passes flash sale ID to form', () => {
    render(<FlashSaleEditView />);
    expect(screen.getByText('Flash Sale ID: flash-sale-123')).toBeInTheDocument();
  });

  it('passes initial data to form', () => {
    render(<FlashSaleEditView />);
    expect(screen.getByText('Name: Test Flash Sale')).toBeInTheDocument();
  });

  it('passes initial products to form', () => {
    render(<FlashSaleEditView />);
    expect(screen.getByText('Products: 1')).toBeInTheDocument();
  });

  it('navigates to flash-sale page on cancel', () => {
    render(<FlashSaleEditView />);
    const cancelButton = screen.getByText('Cancel');
    cancelButton.click();
    expect(mockNavigate).toHaveBeenCalledWith('/flash-sale');
  });

  it('dispatches updateFlashSaleRequest on submit', () => {
    render(<FlashSaleEditView />);
    const submitButton = screen.getByText('Submit');
    submitButton.click();
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'UPDATE_FLASH_SALE' })
    );
  });

  it('navigates after successful update', () => {
    render(<FlashSaleEditView />);
    const submitButton = screen.getByText('Submit');
    submitButton.click();

    // Simulate onSuccess callback
    const updateCall = mockDispatch.mock.calls.find(
      (call) => call[0].type === 'UPDATE_FLASH_SALE'
    );
    if (updateCall && updateCall[0].payload.onSuccess) {
      updateCall[0].payload.onSuccess();
    }

    // Fast-forward timers
    vi.advanceTimersByTime(500);

    expect(mockNavigate).toHaveBeenCalledWith('/flash-sale');
  });

  it('exports FlashSaleEditView function', () => {
    expect(FlashSaleEditView).toBeDefined();
    expect(typeof FlashSaleEditView).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof FlashSaleEditView).toBe('function');
    expect(FlashSaleEditView.name).toBe('FlashSaleEditView');
  });

  it('renders Box component', () => {
    const { container } = render(<FlashSaleEditView />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toBeInTheDocument();
  });

  it('uses useParams hook to get flash sale ID', () => {
    render(<FlashSaleEditView />);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ id: 'flash-sale-123' }),
      })
    );
  });
});
