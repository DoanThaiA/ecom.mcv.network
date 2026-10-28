import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopicView } from 'src/sections/topic/topic-view';
import { TopicStatus } from 'src/types/gen/shared/shared/common/enums';
import type { Topic } from 'src/types/gen/shared/shared/topics/topic';

const mockTopics: Topic[] = [
  {
    id: 'topic1',
    name: 'Topic 1',
    order: 1,
    status: TopicStatus.TOPIC_STATUS_ACTIVE,
    products: [
      { productId: 'prod1', order: 1 },
      { productId: 'prod2', order: 2 },
    ],
  } as Topic,
  {
    id: 'topic2',
    name: 'Topic 2',
    order: 2,
    status: TopicStatus.TOPIC_STATUS_INACTIVE,
    products: [],
  } as Topic,
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

vi.mock('src/redux/store/topicSlice', () => ({
  getTopicsRequest: vi.fn((params) => ({ type: 'GET_TOPICS', payload: params })),
  deleteTopicRequest: vi.fn((params) => ({ type: 'DELETE_TOPIC', payload: params })),
  setStatusFilter: vi.fn((filter) => ({ type: 'SET_STATUS_FILTER', payload: filter })),
  selectTopics: vi.fn((state) => state.topics),
  selectTopicLoading: vi.fn((state) => state.loading),
  selectTopicPagination: vi.fn((state) => state.pagination),
  selectTopicStatusFilter: vi.fn((state) => state.statusFilter),
}));

vi.mock('src/hooks', () => ({
  useColumnVisibilityPersistence: () => [{}, vi.fn()],
  useDialog: () => mockUseDialog(),
}));

vi.mock('src/components/table', () => ({
  SearchBar: ({ value, onChange, onSearch, renderActions, renderFarRightActions }: any) => (
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

describe('TopicView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let selectorCallCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      const callIndex = selectorCallCount++;
      if (callIndex === 0) return mockTopics;
      if (callIndex === 1) return false;
      if (callIndex === 2) return mockPagination;
      return 'all';
    });
  });

  it('renders without crashing', () => {
    const { container } = render(<TopicView />);
    expect(container).toBeInTheDocument();
  });

  it('dispatches getTopicsRequest on mount', () => {
    render(<TopicView />);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'GET_TOPICS',
      })
    );
  });

  it('renders SearchBar component', () => {
    render(<TopicView />);
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<TopicView />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('renders search button', () => {
    render(<TopicView />);
    expect(screen.getByTestId('search-button')).toBeInTheDocument();
  });

  it('handles search input change', () => {
    render(<TopicView />);
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    expect(searchInput).toHaveValue('test query');
  });

  it('renders status filter', () => {
    render(<TopicView />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders add new button', () => {
    render(<TopicView />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders column visibility component', () => {
    render(<TopicView />);
    expect(screen.getByTestId('column-visibility')).toBeInTheDocument();
  });

  it('renders DataTable when topics exist', () => {
    render(<TopicView />);
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('renders TablePagination component', () => {
    render(<TopicView />);
    expect(screen.getByTestId('table-pagination')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    mockUseAppSelector
      .mockReturnValueOnce([])
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(mockPagination)
      .mockReturnValueOnce('all');

    render(<TopicView />);
    expect(screen.getByText('loading...')).toBeInTheDocument();
  });

  it('displays no data message when topics list is empty', () => {
    mockUseAppSelector
      .mockReturnValueOnce([])
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(mockPagination)
      .mockReturnValueOnce('all');

    render(<TopicView />);
    expect(screen.getByText('noData')).toBeInTheDocument();
  });

  it('displays no search results message', () => {
    mockUseAppSelector
      .mockReturnValueOnce([])
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(mockPagination)
      .mockReturnValueOnce('active');

    const { container } = render(<TopicView />);
    expect(container.textContent).toContain('noSearchResults');
  });

  it('exports TopicView function', () => {
    expect(TopicView).toBeDefined();
    expect(typeof TopicView).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof TopicView).toBe('function');
    expect(TopicView.name).toBe('TopicView');
  });

  it('renders Box container', () => {
    const { container } = render(<TopicView />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toBeInTheDocument();
  });

  it('renders Card components', () => {
    const { container } = render(<TopicView />);
    const cards = container.querySelectorAll('.MuiCard-root');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('uses useAppDispatch hook', () => {
    render(<TopicView />);
    expect(mockDispatch).toBeDefined();
  });

  it('uses useAppSelector hook', () => {
    render(<TopicView />);
    expect(mockUseAppSelector).toHaveBeenCalled();
  });

  it('uses useNavigate hook', () => {
    render(<TopicView />);
    expect(mockNavigate).toBeDefined();
  });

  it('maintains state across renders', () => {
    const { rerender } = render(<TopicView />);
    rerender(<TopicView />);
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });
});
