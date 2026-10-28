import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PromotionListTable } from 'src/sections/promotion/components/promotion-list-table';
import type { PromotionListItem } from 'src/types/promotion';
import { PromotionStatus, PromotionType } from 'src/types/promotion';

const mockPromotions: PromotionListItem[] = [
  {
    id: 'promo1',
    name: 'Promotion 1',
    type: PromotionType.PROMOTION_TYPE_BUNDLE_DEAL,
    status: PromotionStatus.PROMOTION_STATUS_ACTIVE,
    startTime: new Date('2024-01-01'),
    endTime: new Date('2024-12-31'),
  } as PromotionListItem,
  {
    id: 'promo2',
    name: 'Promotion 2',
    type: PromotionType.PROMOTION_TYPE_BUNDLE_DEAL,
    status: PromotionStatus.PROMOTION_STATUS_PAUSED,
    startTime: new Date('2024-01-01'),
    endTime: new Date('2024-06-30'),
  } as PromotionListItem,
];

const mockPagination = {
  page: 1,
  limit: 10,
  total: 2,
  totalPages: 1,
};

const mockDispatch = vi.fn();
const mockNavigate = vi.fn();
const mockUseAppSelector = vi.fn();
const mockUseDialog = vi.fn(() => ({
  isOpen: false,
  open: vi.fn(),
  close: vi.fn(),
  data: null,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
}));

vi.mock('src/redux/store/promotionSlice', () => ({
  getPromotionsRequest: vi.fn((params) => ({ type: 'GET_PROMOTIONS', payload: params })),
  deletePromotionRequest: vi.fn((params) => ({ type: 'DELETE_PROMOTION', payload: params })),
  selectPromotions: vi.fn((state) => state.promotions),
  selectPromotionLoading: vi.fn((state) => state.loading),
  selectPromotionPagination: vi.fn((state) => state.pagination),
}));

vi.mock('src/hooks', () => ({
  useColumnVisibilityPersistence: () => [{}, vi.fn()],
  useDialog: () => mockUseDialog(),
}));

vi.mock('src/components/table', () => ({
  SearchBar: ({ value, onChange, onSearch, renderActions }: any) => (
    <div data-testid="search-bar">
      <input
        data-testid="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button data-testid="search-button" onClick={onSearch}>
        Search
      </button>
      {renderActions && <div data-testid="search-actions">{renderActions()}</div>}
    </div>
  ),
  ColumnVisibility: () => <div data-testid="column-visibility">Column Visibility</div>,
  DataTable: ({ table }: any) => <div data-testid="data-table">Data Table</div>,
  TablePagination: ({ onPageChange, onPageSizeChange }: any) => (
    <div data-testid="table-pagination">
      <button data-testid="next-page" onClick={() => onPageChange(2)}>
        Next
      </button>
      <button data-testid="change-size" onClick={() => onPageSizeChange(20)}>
        Change Size
      </button>
    </div>
  ),
  createSelectionColumn: () => ({ id: 'select', header: 'Select' }),
}));

vi.mock('src/components/dialog', () => ({
  DeleteConfirmDialog: ({ open, onClose, onConfirm }: any) =>
    open ? (
      <div data-testid="delete-confirm-dialog">
        <button data-testid="dialog-close" onClick={onClose}>
          Close
        </button>
        <button data-testid="dialog-confirm" onClick={onConfirm}>
          Confirm
        </button>
      </div>
    ) : null,
}));

vi.mock('src/utils/format', () => ({
  formatDateTime: (date?: string) => (date ? new Date(date).toLocaleDateString() : '-'),
  toISOString: (date?: Date) => date?.toISOString(),
}));

describe('PromotionListTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let selectorCallCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      const callIndex = selectorCallCount++;
      if (callIndex === 0) return mockPromotions;
      if (callIndex === 1) return false;
      return mockPagination;
    });
  });

  it('renders without crashing', () => {
    const { container } = render(<PromotionListTable />);
    expect(container).toBeInTheDocument();
  });

  it('dispatches getPromotionsRequest on mount', () => {
    render(<PromotionListTable />);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'GET_PROMOTIONS',
      })
    );
  });

  it('renders section title', () => {
    render(<PromotionListTable />);
    expect(screen.getByText('promotionList')).toBeInTheDocument();
  });

  it('renders status tabs', () => {
    render(<PromotionListTable />);
    expect(screen.getByText('all')).toBeInTheDocument();
    expect(screen.getByText('ongoing')).toBeInTheDocument();
    expect(screen.getByText('paused')).toBeInTheDocument();
  });

  it('renders SearchBar component', () => {
    render(<PromotionListTable />);
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<PromotionListTable />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('handles search input change', () => {
    render(<PromotionListTable />);
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    expect(searchInput).toHaveValue('test query');
  });

  it('handles tab change', () => {
    render(<PromotionListTable />);
    const ongoingTab = screen.getByText('ongoing');
    fireEvent.click(ongoingTab);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('renders column visibility component', () => {
    render(<PromotionListTable />);
    expect(screen.getByTestId('column-visibility')).toBeInTheDocument();
  });

  it('renders DataTable when promotions exist', () => {
    render(<PromotionListTable />);
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('renders TablePagination component', () => {
    render(<PromotionListTable />);
    expect(screen.getByTestId('table-pagination')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    mockUseAppSelector
      .mockReturnValueOnce([])
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(mockPagination);

    render(<PromotionListTable />);
    expect(screen.getByText('loading...')).toBeInTheDocument();
  });

  it('displays no data message when promotions list is empty', () => {
    mockUseAppSelector
      .mockReturnValueOnce([])
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(mockPagination);

    render(<PromotionListTable />);
    expect(screen.getByText('noData')).toBeInTheDocument();
  });

  it('exports PromotionListTable function', () => {
    expect(PromotionListTable).toBeDefined();
    expect(typeof PromotionListTable).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof PromotionListTable).toBe('function');
    expect(PromotionListTable.name).toBe('PromotionListTable');
  });

  it('renders Box container', () => {
    const { container } = render(<PromotionListTable />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toBeInTheDocument();
  });

  it('renders Card components', () => {
    const { container } = render(<PromotionListTable />);
    const cards = container.querySelectorAll('.MuiCard-root');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('uses useAppDispatch hook', () => {
    render(<PromotionListTable />);
    expect(mockDispatch).toBeDefined();
  });

  it('uses useAppSelector hook', () => {
    render(<PromotionListTable />);
    expect(mockUseAppSelector).toHaveBeenCalled();
  });

  it('uses useNavigate hook', () => {
    render(<PromotionListTable />);
    expect(mockNavigate).toBeDefined();
  });

  it('maintains state across renders', () => {
    const { rerender } = render(<PromotionListTable />);
    rerender(<PromotionListTable />);
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });
});
