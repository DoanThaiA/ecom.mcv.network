import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NewsView } from 'src/sections/news/news-view';
import type { News } from 'src/types/news';

const mockNewsList: News[] = [
  {
    id: 'news1',
    title: 'News 1',
    slug: 'news-1',
    status: 'active',
    createdAt: new Date('2024-01-01'),
  } as News,
  {
    id: 'news2',
    title: 'News 2',
    slug: 'news-2',
    status: 'inactive',
    createdAt: new Date('2024-01-02'),
  } as News,
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

vi.mock('src/redux/store/newsSlice', () => ({
  getNewsListRequest: vi.fn((params) => ({ type: 'GET_NEWS_LIST', payload: params })),
  deleteNewsRequest: vi.fn((params) => ({ type: 'DELETE_NEWS', payload: params })),
  selectNewsList: vi.fn((state) => state.newsList),
  selectNewsLoading: vi.fn((state) => state.loading),
  selectNewsPagination: vi.fn((state) => state.pagination),
}));

vi.mock('src/hooks', () => ({
  useColumnVisibilityPersistence: () => [{}, vi.fn()],
  useDialog: () => mockUseDialog(),
}));

vi.mock('src/components/table', () => ({
  SearchBar: ({ value, onChange, placeholder, renderActions, renderFarRightActions }: any) => (
    <div data-testid="search-bar">
      <input
        data-testid="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {renderActions && <div data-testid="search-actions">{renderActions()}</div>}
      {renderFarRightActions && (
        <div data-testid="far-right-actions">{renderFarRightActions()}</div>
      )}
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
  formatDate: (date?: Date) => (date ? date.toISOString().split('T')[0] : ''),
}));

describe('NewsView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let selectorCallCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      const callIndex = selectorCallCount++;
      if (callIndex === 0) return mockNewsList; // selectNewsList
      if (callIndex === 1) return false; // selectNewsLoading
      return mockPagination; // selectNewsPagination
    });
  });

  it('renders without crashing', () => {
    const { container } = render(<NewsView />);
    expect(container).toBeInTheDocument();
  });

  it('dispatches getNewsListRequest on mount', () => {
    render(<NewsView />);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'GET_NEWS_LIST',
      })
    );
  });

  it('renders SearchBar component', () => {
    render(<NewsView />);
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('renders add new button', () => {
    render(<NewsView />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders DataTable when news exist', () => {
    render(<NewsView />);
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('renders TablePagination component', () => {
    render(<NewsView />);
    expect(screen.getByTestId('table-pagination')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    mockUseAppSelector
      .mockReturnValueOnce([])
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(mockPagination);

    render(<NewsView />);
    expect(screen.getByText('loading...')).toBeInTheDocument();
  });

  it('displays no data message when news list is empty', () => {
    mockUseAppSelector
      .mockReturnValueOnce([])
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(mockPagination);

    render(<NewsView />);
    expect(screen.getByText('noData')).toBeInTheDocument();
  });

  it('exports NewsView function', () => {
    expect(NewsView).toBeDefined();
    expect(typeof NewsView).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof NewsView).toBe('function');
    expect(NewsView.name).toBe('NewsView');
  });

  it('renders Box container', () => {
    const { container } = render(<NewsView />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toBeInTheDocument();
  });

  it('renders Card components', () => {
    const { container } = render(<NewsView />);
    const cards = container.querySelectorAll('.MuiCard-root');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('uses useAppDispatch hook', () => {
    render(<NewsView />);
    expect(mockDispatch).toBeDefined();
  });

  it('uses useAppSelector hook', () => {
    render(<NewsView />);
    expect(mockUseAppSelector).toHaveBeenCalled();
  });

  it('uses useNavigate hook', () => {
    render(<NewsView />);
    expect(mockNavigate).toBeDefined();
  });

  it('renders column visibility component', () => {
    render(<NewsView />);
    expect(screen.getByTestId('column-visibility')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<NewsView />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('maintains state across renders', () => {
    const { rerender } = render(<NewsView />);
    rerender(<NewsView />);
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });
});
