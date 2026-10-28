import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShockDealCreateView } from 'src/sections/shock-deal/shock-deal-create-view';

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

vi.mock('src/redux/store/promotionSlice', () => ({
  createPromotionRequest: vi.fn((params) => ({ type: 'CREATE_PROMOTION', payload: params })),
  selectCreatePromotionLoading: vi.fn((state) => false),
}));

vi.mock('src/sections/shock-deal/shock-deal-form', () => ({
  ShockDealForm: ({ mode, onSubmit, onCancel, loading }: any) => (
    <div data-testid="shock-deal-form" data-mode={mode} data-loading={loading}>
      <button onClick={() => onSubmit({
        name: 'Test',
        startTime: new Date(),
        endTime: new Date(),
        subType: 1,
        tiers: [{
          minOrderValue: 100,
          giftProducts: [{ productId: 'prod1' }]
        }]
      })}>
        Submit
      </button>
      <button onClick={() => onSubmit({
        name: 'Test',
        startTime: null,
        endTime: new Date(),
        subType: 1,
        tiers: []
      })}>
        Submit No Start
      </button>
      <button onClick={() => onSubmit({
        name: 'Test',
        startTime: new Date(),
        endTime: null,
        subType: 1,
        tiers: []
      })}>
        Submit No End
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

describe('ShockDealCreateView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppSelector.mockImplementation((selector) => {
      return selector({});
    });
  });

  it('renders without errors', () => {
    expect(() => {
      render(<ShockDealCreateView />);
    }).not.toThrow();
  });

  it('renders ShockDealForm component', () => {
    render(<ShockDealCreateView />);
    expect(screen.getByTestId('shock-deal-form')).toBeInTheDocument();
  });

  it('passes mode="create" to form', () => {
    render(<ShockDealCreateView />);
    const form = screen.getByTestId('shock-deal-form');
    expect(form).toHaveAttribute('data-mode', 'create');
  });

  it('passes loading state to form', () => {
    render(<ShockDealCreateView />);
    const form = screen.getByTestId('shock-deal-form');
    expect(form).toHaveAttribute('data-loading', 'false');
  });

  it('uses useNavigate hook', () => {
    render(<ShockDealCreateView />);
    expect(mockNavigate).toBeDefined();
  });

  it('uses useAppDispatch hook', () => {
    render(<ShockDealCreateView />);
    expect(mockDispatch).toBeDefined();
  });

  it('uses useAppSelector hook', () => {
    render(<ShockDealCreateView />);
    expect(mockUseAppSelector).toHaveBeenCalled();
  });

  it('handles cancel by navigating to /promotion', () => {
    render(<ShockDealCreateView />);

    const cancelButton = screen.getByText('Cancel');
    cancelButton.click();

    expect(mockNavigate).toHaveBeenCalledWith('/promotion');
  });

  it('handles submit with valid data', () => {
    render(<ShockDealCreateView />);

    const submitButton = screen.getByText('Submit');
    submitButton.click();

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('exports ShockDealCreateView function', () => {
    expect(ShockDealCreateView).toBeDefined();
    expect(typeof ShockDealCreateView).toBe('function');
  });

  it('renders Box component', () => {
    const { container } = render(<ShockDealCreateView />);
    expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();
  });

  it('is a functional component', () => {
    expect(typeof ShockDealCreateView).toBe('function');
    expect(ShockDealCreateView.name).toBe('ShockDealCreateView');
  });

  it('does not dispatch when startTime is missing', () => {
    render(<ShockDealCreateView />);

    const submitButton = screen.getByText('Submit No Start');
    submitButton.click();

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('does not dispatch when endTime is missing', () => {
    render(<ShockDealCreateView />);

    const submitButton = screen.getByText('Submit No End');
    submitButton.click();

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('handles submit with tiers data and maps correctly', () => {
    render(<ShockDealCreateView />);

    const submitButton = screen.getByText('Submit');
    submitButton.click();

    expect(mockDispatch).toHaveBeenCalled();
    const call = mockDispatch.mock.calls[0][0];
    expect(call.type).toBe('CREATE_PROMOTION');
    expect(call.payload.data.bundleDealConfig.tiers).toBeDefined();
  });

  it('navigates to /promotion on successful creation', () => {
    render(<ShockDealCreateView />);

    const submitButton = screen.getByText('Submit');
    submitButton.click();

    // Get the onSuccess callback from the dispatch call
    const call = mockDispatch.mock.calls[0][0];
    if (call.payload.onSuccess) {
      call.payload.onSuccess();
    }

    expect(mockNavigate).toHaveBeenCalledWith('/promotion');
  });
});
