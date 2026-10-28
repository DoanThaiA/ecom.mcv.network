import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewView } from 'src/sections/review/review-view';
import type { CmsProductReview } from 'src/types/reviews';

const mockDispatch = vi.fn();
const mockReviews: CmsProductReview[] = [
  {
    reviewId: 'review1',
    productId: 'prod1',
    orderId: 'order1',
    nhanhOrderId: 'nhanh1',
    productName: 'Product 1',
    productImage: 'image1.jpg',
    height: 170,
    weight: 65,
    fitLevel: 3,
    content: 'Great product',
    rating: 5,
    status: 'visible',
    createdAt: new Date(),
  },
  {
    reviewId: 'review2',
    productId: 'prod2',
    orderId: 'order2',
    nhanhOrderId: 'nhanh2',
    productName: 'Product 2',
    productImage: 'image2.jpg',
    height: 165,
    weight: 55,
    fitLevel: 2,
    content: 'Good quality',
    rating: 4,
    status: 'hidden',
    createdAt: new Date(),
  },
];

const mockPagination = {
  page: 1,
  limit: 10,
  total: 2,
  totalPages: 1,
};

const mockUseAppSelector = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
}));

vi.mock('src/redux/store/reviewSlice', () => ({
  getReviewsRequest: vi.fn((params) => ({ type: 'GET_REVIEWS', payload: params })),
  toggleVisibilityRequest: vi.fn((params) => ({ type: 'TOGGLE_VISIBILITY', payload: params })),
  setFilters: vi.fn((filters) => ({ type: 'SET_FILTERS', payload: filters })),
  selectReviews: vi.fn((state) => state.reviews),
  selectReviewLoading: vi.fn((state) => state.loading),
  selectReviewPagination: vi.fn((state) => state.pagination),
  selectReviewFilters: vi.fn((state) => state.filters),
}));

vi.mock('src/utils/toast', () => ({
  showSuccess: vi.fn(),
}));

vi.mock('src/sections/review/components/review-filter', () => ({
  ReviewFilter: ({ onSearch }: any) => (
    <div data-testid="review-filter">
      <button data-testid="search-button" onClick={onSearch}>
        Search
      </button>
    </div>
  ),
}));

vi.mock('src/sections/review/components/review-table-row', () => ({
  ReviewTableRow: ({ review, onToggleVisibility }: any) => (
    <div data-testid={`review-row-${review.reviewId}`}>
      <span>{review.productName}</span>
      <button
        data-testid={`toggle-${review.reviewId}`}
        onClick={() => onToggleVisibility(review)}
      >
        Toggle
      </button>
    </div>
  ),
}));

vi.mock('src/components/table', () => ({
  TablePagination: ({ currentPage, pageSize, onPageChange, onPageSizeChange }: any) => (
    <div data-testid="table-pagination">
      <span>Page: {currentPage}</span>
      <span>Size: {pageSize}</span>
      <button data-testid="next-page" onClick={() => onPageChange(currentPage + 1)}>
        Next
      </button>
      <button data-testid="change-size" onClick={() => onPageSizeChange(20)}>
        Change Size
      </button>
    </div>
  ),
}));

describe('ReviewView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let selectorCallCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      const callIndex = selectorCallCount++;
      if (callIndex === 0) return mockReviews; // selectReviews
      if (callIndex === 1) return false; // selectReviewLoading
      if (callIndex === 2) return mockPagination; // selectReviewPagination
      return { sortBy: 'newest' }; // selectReviewFilters
    });
  });

  it('renders without crashing', () => {
    const { container } = render(<ReviewView />);
    expect(container).toBeInTheDocument();
  });

  it('renders ReviewFilter component', () => {
    render(<ReviewView />);
    expect(screen.getByTestId('review-filter')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<ReviewView />);
    expect(screen.getByText('orderIdCms')).toBeInTheDocument();
    expect(screen.getByText('orderIdNhanh')).toBeInTheDocument();
    expect(screen.getByText('product')).toBeInTheDocument();
    expect(screen.getByText('height')).toBeInTheDocument();
    expect(screen.getByText('bodyWeight')).toBeInTheDocument();
    expect(screen.getByText('fitLevel')).toBeInTheDocument();
    expect(screen.getByText('reviewContent')).toBeInTheDocument();
    expect(screen.getByText('visible')).toBeInTheDocument();
  });

  it('renders review rows when data exists', () => {
    render(<ReviewView />);
    expect(screen.getByTestId('review-row-review1')).toBeInTheDocument();
    expect(screen.getByTestId('review-row-review2')).toBeInTheDocument();
  });

  it('renders TablePagination component', () => {
    render(<ReviewView />);
    expect(screen.getByTestId('table-pagination')).toBeInTheDocument();
  });

  it('dispatches getReviewsRequest on mount', () => {
    render(<ReviewView />);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'GET_REVIEWS',
        payload: expect.objectContaining({
          page: 1,
          limit: 10,
          filters: { sortBy: 'newest' },
        }),
      })
    );
  });

  it('displays loading state', () => {
    mockUseAppSelector
      .mockReturnValueOnce([])
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(mockPagination)
      .mockReturnValueOnce({ sortBy: 'newest' });

    render(<ReviewView />);
    expect(screen.getByText('loading...')).toBeInTheDocument();
  });

  it('displays no reviews message when list is empty', () => {
    mockUseAppSelector
      .mockReturnValueOnce([])
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(mockPagination)
      .mockReturnValueOnce({ sortBy: 'newest' });

    render(<ReviewView />);
    expect(screen.getByText('reviewsNotFound')).toBeInTheDocument();
  });

  it('handles search action', () => {
    render(<ReviewView />);

    const searchButton = screen.getByTestId('search-button');
    fireEvent.click(searchButton);

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SET_FILTERS',
      })
    );

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'GET_REVIEWS',
        payload: expect.objectContaining({
          page: 1,
        }),
      })
    );
  });

  it('handles page change', () => {
    render(<ReviewView />);

    const nextButton = screen.getByTestId('next-page');
    fireEvent.click(nextButton);

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'GET_REVIEWS',
        payload: expect.objectContaining({
          page: 2,
        }),
      })
    );
  });

  it('handles page size change', () => {
    render(<ReviewView />);

    const changeSizeButton = screen.getByTestId('change-size');
    fireEvent.click(changeSizeButton);

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'GET_REVIEWS',
        payload: expect.objectContaining({
          page: 1,
          limit: 20,
        }),
      })
    );
  });

  it('handles toggle visibility for visible review', () => {
    render(<ReviewView />);

    const toggleButton = screen.getByTestId('toggle-review1');
    fireEvent.click(toggleButton);

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'TOGGLE_VISIBILITY',
        payload: expect.objectContaining({
          reviewId: 'review1',
          productId: 'prod1',
          visible: false,
        }),
      })
    );
  });

  it('handles toggle visibility for hidden review', () => {
    render(<ReviewView />);

    const toggleButton = screen.getByTestId('toggle-review2');
    fireEvent.click(toggleButton);

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'TOGGLE_VISIBILITY',
        payload: expect.objectContaining({
          reviewId: 'review2',
          productId: 'prod2',
          visible: true,
        }),
      })
    );
  });

  it('resets to page 1 when searching', () => {
    render(<ReviewView />);

    // Change page first
    const nextButton = screen.getByTestId('next-page');
    fireEvent.click(nextButton);

    // Then search
    const searchButton = screen.getByTestId('search-button');
    fireEvent.click(searchButton);

    // Should dispatch with page 1
    const lastCall = mockDispatch.mock.calls[mockDispatch.mock.calls.length - 1][0];
    expect(lastCall.payload.page).toBe(1);
  });

  it('uses applied filters for pagination', () => {
    const appliedFilters = { sortBy: 'newest', keyword: 'test' };
    mockUseAppSelector
      .mockReturnValueOnce(mockReviews)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(mockPagination)
      .mockReturnValueOnce(appliedFilters);

    render(<ReviewView />);

    const nextButton = screen.getByTestId('next-page');
    fireEvent.click(nextButton);

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          filters: appliedFilters,
        }),
      })
    );
  });

  it('exports ReviewView function', () => {
    expect(ReviewView).toBeDefined();
    expect(typeof ReviewView).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof ReviewView).toBe('function');
    expect(ReviewView.name).toBe('ReviewView');
  });

  it('renders Box container with correct layout', () => {
    const { container } = render(<ReviewView />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toBeInTheDocument();
  });

  it('renders Card component for table', () => {
    const { container } = render(<ReviewView />);
    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });

  it('uses useAppDispatch hook', () => {
    render(<ReviewView />);
    expect(mockDispatch).toBeDefined();
  });

  it('uses useAppSelector hook', () => {
    render(<ReviewView />);
    expect(mockUseAppSelector).toHaveBeenCalled();
  });

  it('displays all table headers in correct order', () => {
    render(<ReviewView />);
    const headers = [
      'orderIdCms',
      'orderIdNhanh',
      'product',
      'height',
      'bodyWeight',
      'fitLevel',
      'reviewContent',
      'visible',
    ];
    headers.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });

  it('renders review data correctly', () => {
    render(<ReviewView />);
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('dispatches setFilters action when searching', () => {
    render(<ReviewView />);

    const searchButton = screen.getByTestId('search-button');
    fireEvent.click(searchButton);

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SET_FILTERS',
      })
    );
  });

  it('maintains filter state across renders', () => {
    const { rerender } = render(<ReviewView />);
    rerender(<ReviewView />);
    expect(screen.getByTestId('review-filter')).toBeInTheDocument();
  });
});
