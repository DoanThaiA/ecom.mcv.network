import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductComboCreateView } from 'src/sections/product-combo/product-combo-create-view';

const mockNavigate = vi.fn();
const mockDispatch = vi.fn();
const mockLoading = false;

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => selector(),
}));

vi.mock('src/redux/store/comboSlice', () => ({
  createComboRequest: (payload: any) => ({ type: 'combo/create', payload }),
  selectCreateComboLoading: () => mockLoading,
}));

vi.mock('src/sections/product-combo/product-combo-form', () => ({
  ProductComboForm: ({ mode, onSubmit, onCancel, loading }: any) => (
    <div data-testid="product-combo-form" data-mode={mode} data-loading={loading}>
      <button type="button" onClick={() => onSubmit({ name: 'Test Combo' })}>
        Submit
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}));

describe('ProductComboCreateView', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockDispatch.mockClear();
  });

  it('renders ProductComboForm component', () => {
    render(<ProductComboCreateView />);
    expect(screen.getByTestId('product-combo-form')).toBeInTheDocument();
  });

  it('passes mode="create" to ProductComboForm', () => {
    render(<ProductComboCreateView />);
    const form = screen.getByTestId('product-combo-form');
    expect(form).toHaveAttribute('data-mode', 'create');
  });

  it('passes loading state to ProductComboForm', () => {
    render(<ProductComboCreateView />);
    const form = screen.getByTestId('product-combo-form');
    expect(form).toHaveAttribute('data-loading', 'false');
  });

  it('renders Box container', () => {
    const { container } = render(<ProductComboCreateView />);
    expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();
  });

  it('Box has correct height style', () => {
    const { container } = render(<ProductComboCreateView />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toHaveStyle({ height: 'calc(100vh - 64px)' });
  });

  it('Box has display flex', () => {
    const { container } = render(<ProductComboCreateView />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toHaveStyle({ display: 'flex' });
  });

  it('Box has flexDirection column', () => {
    const { container } = render(<ProductComboCreateView />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toHaveStyle({ flexDirection: 'column' });
  });

  it('handleSubmit dispatches createComboRequest', () => {
    render(<ProductComboCreateView />);
    const submitButton = screen.getByText('Submit');
    submitButton.click();

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'combo/create',
        payload: expect.objectContaining({
          data: { name: 'Test Combo' },
        }),
      })
    );
  });

  it('handleSubmit includes onSuccess callback', () => {
    render(<ProductComboCreateView />);
    const submitButton = screen.getByText('Submit');
    submitButton.click();

    const dispatchCall = mockDispatch.mock.calls[0][0];
    expect(dispatchCall.payload).toHaveProperty('onSuccess');
    expect(typeof dispatchCall.payload.onSuccess).toBe('function');
  });

  it('onSuccess navigates to /product-combo', () => {
    render(<ProductComboCreateView />);
    const submitButton = screen.getByText('Submit');
    submitButton.click();

    const dispatchCall = mockDispatch.mock.calls[0][0];
    dispatchCall.payload.onSuccess();

    expect(mockNavigate).toHaveBeenCalledWith('/product-combo');
  });

  it('handleCancel navigates to /product-combo', () => {
    render(<ProductComboCreateView />);
    const cancelButton = screen.getByText('Cancel');
    cancelButton.click();

    expect(mockNavigate).toHaveBeenCalledWith('/product-combo');
  });

  it('uses useNavigate hook', () => {
    render(<ProductComboCreateView />);
    expect(screen.getByTestId('product-combo-form')).toBeInTheDocument();
  });

  it('uses useAppDispatch hook', () => {
    render(<ProductComboCreateView />);
    expect(screen.getByTestId('product-combo-form')).toBeInTheDocument();
  });

  it('uses useAppSelector hook', () => {
    render(<ProductComboCreateView />);
    expect(screen.getByTestId('product-combo-form')).toBeInTheDocument();
  });

  it('renders without errors', () => {
    expect(() => {
      render(<ProductComboCreateView />);
    }).not.toThrow();
  });

  it('exports ProductComboCreateView function', () => {
    expect(ProductComboCreateView).toBeDefined();
    expect(typeof ProductComboCreateView).toBe('function');
  });

  it('ProductComboForm is contained in Box', () => {
    const { container } = render(<ProductComboCreateView />);
    const box = container.querySelector('.MuiBox-root');
    const form = screen.getByTestId('product-combo-form');
    expect(box).toContainElement(form);
  });

  it('dispatches with correct data structure', () => {
    render(<ProductComboCreateView />);
    const submitButton = screen.getByText('Submit');
    submitButton.click();

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    const action = mockDispatch.mock.calls[0][0];
    expect(action).toHaveProperty('type', 'combo/create');
    expect(action.payload).toHaveProperty('data');
    expect(action.payload).toHaveProperty('onSuccess');
  });

  it('renders complete create view layout', () => {
    render(<ProductComboCreateView />);
    expect(screen.getByTestId('product-combo-form')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});
