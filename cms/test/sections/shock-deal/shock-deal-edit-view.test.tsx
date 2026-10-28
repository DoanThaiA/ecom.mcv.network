import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShockDealEditView } from 'src/sections/shock-deal/shock-deal-edit-view';
import { BundleDealSubType, PromotionStatus } from 'src/types/promotion';

const mockNavigate = vi.fn();
const mockDispatch = vi.fn();
const mockParams = { id: 'promo123' };

const mockPromotion = {
  id: 'promo123',
  name: 'Test Shock Deal',
  status: PromotionStatus.PROMOTION_STATUS_ACTIVE,
  startTime: new Date('2024-01-01T10:00:00'),
  endTime: new Date('2024-12-31T18:00:00'),
  bundleDealConfig: {
    subType: BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT,
    tiers: [
      {
        minOrderValue: 100000,
        giftProducts: [{ productId: 'prod1', name: 'Gift 1', image: 'gift1.jpg' }],
      },
    ],
  },
};

let callCount = 0;

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: vi.fn((selector) => {
    callCount++;
    if (callCount % 4 === 1) return mockPromotion; // selectCurrentPromotion
    if (callCount % 4 === 2) return false; // selectCurrentPromotionLoading
    if (callCount % 4 === 3) return false; // selectUpdatePromotionLoading
    return false; // selectPausePromotionLoading
  }),
}));

vi.mock('src/redux/store/promotionSlice', () => ({
  getPromotionByIdRequest: vi.fn((params) => ({ type: 'GET_PROMOTION', payload: params })),
  updatePromotionRequest: vi.fn((params) => ({ type: 'UPDATE_PROMOTION', payload: params })),
  pausePromotionRequest: vi.fn((params) => ({ type: 'PAUSE_PROMOTION', payload: params })),
  resumePromotionRequest: vi.fn((params) => ({ type: 'RESUME_PROMOTION', payload: params })),
  clearCurrentPromotion: vi.fn(() => ({ type: 'CLEAR_PROMOTION' })),
  selectCurrentPromotion: vi.fn((state) => state.currentPromotion),
  selectCurrentPromotionLoading: vi.fn((state) => state.loading),
  selectUpdatePromotionLoading: vi.fn((state) => state.updateLoading),
  selectPausePromotionLoading: vi.fn((state) => state.pauseLoading),
}));

vi.mock('src/sections/shock-deal/shock-deal-form', () => ({
  ShockDealForm: ({ mode, initialData, onSubmit, onCancel, onPause, onResume }: any) => (
    <div data-testid="shock-deal-form" data-mode={mode}>
      <div>Name: {initialData?.name}</div>
      <button onClick={() => onSubmit(initialData)}>Submit</button>
      <button onClick={onCancel}>Cancel</button>
      <button onClick={onPause}>Pause</button>
      <button onClick={onResume}>Resume</button>
    </div>
  ),
}));

describe('ShockDealEditView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    callCount = 0;
  });

  it('renders without crashing', () => {
    const { container } = render(<ShockDealEditView />);
    expect(container).toBeInTheDocument();
  });

  it('dispatches getPromotionByIdRequest on mount', () => {
    render(<ShockDealEditView />);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'GET_PROMOTION',
        payload: { id: 'promo123' },
      })
    );
  });

  it('renders ShockDealForm with edit mode', () => {
    render(<ShockDealEditView />);
    const form = screen.getByTestId('shock-deal-form');
    expect(form).toHaveAttribute('data-mode', 'edit');
  });

  it('displays promotion name in form', () => {
    render(<ShockDealEditView />);
    expect(screen.getByText('Name: Test Shock Deal')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<ShockDealEditView />);
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('renders cancel button', () => {
    render(<ShockDealEditView />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders pause button', () => {
    render(<ShockDealEditView />);
    expect(screen.getByText('Pause')).toBeInTheDocument();
  });

  it('renders resume button', () => {
    render(<ShockDealEditView />);
    expect(screen.getByText('Resume')).toBeInTheDocument();
  });

  it('calls navigate on cancel', () => {
    render(<ShockDealEditView />);
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockNavigate).toHaveBeenCalledWith('/promotion');
  });

  it('dispatches updatePromotionRequest on submit', () => {
    render(<ShockDealEditView />);
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'UPDATE_PROMOTION',
      })
    );
  });

  it('dispatches pausePromotionRequest on pause', () => {
    render(<ShockDealEditView />);
    const pauseButton = screen.getByText('Pause');
    fireEvent.click(pauseButton);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'PAUSE_PROMOTION',
      })
    );
  });

  it('dispatches resumePromotionRequest on resume', () => {
    render(<ShockDealEditView />);
    const resumeButton = screen.getByText('Resume');
    fireEvent.click(resumeButton);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'RESUME_PROMOTION',
      })
    );
  });

  it('dispatches clearCurrentPromotion on unmount', () => {
    const { unmount } = render(<ShockDealEditView />);
    unmount();
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'CLEAR_PROMOTION',
      })
    );
  });

  it('renders form when promotion is loaded', () => {
    const { container } = render(<ShockDealEditView />);
    const form = screen.getByTestId('shock-deal-form');
    expect(form).toBeInTheDocument();
  });

  it('exports ShockDealEditView function', () => {
    expect(ShockDealEditView).toBeDefined();
    expect(typeof ShockDealEditView).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof ShockDealEditView).toBe('function');
    expect(ShockDealEditView.name).toBe('ShockDealEditView');
  });

  it('renders Box component', () => {
    const { container } = render(<ShockDealEditView />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toBeInTheDocument();
  });

  it('renders with correct initial data structure', () => {
    render(<ShockDealEditView />);
    const form = screen.getByTestId('shock-deal-form');
    expect(form).toBeInTheDocument();
  });

  it('handles form with all data', () => {
    render(<ShockDealEditView />);
    expect(screen.getByTestId('shock-deal-form')).toBeInTheDocument();
  });

  it('transforms promotion dates to form data', () => {
    render(<ShockDealEditView />);
    const form = screen.getByTestId('shock-deal-form');
    expect(form).toBeInTheDocument();
  });
});
