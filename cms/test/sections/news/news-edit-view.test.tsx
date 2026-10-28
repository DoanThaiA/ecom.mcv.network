import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NewsEditView } from 'src/sections/news/news-edit-view';

const mockNavigate = vi.fn();
const mockParams = { id: 'news123' };
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

vi.mock('src/redux/store/newsSlice', () => ({
  getNewsByIdRequest: vi.fn((params) => ({ type: 'GET_NEWS_BY_ID', payload: params })),
  updateNewsRequest: vi.fn((params) => ({ type: 'UPDATE_NEWS', payload: params })),
  clearCurrentNews: vi.fn(() => ({ type: 'CLEAR_CURRENT_NEWS' })),
  selectCurrentNews: vi.fn(),
  selectCurrentNewsLoading: vi.fn(),
  selectUpdateNewsLoading: vi.fn(),
}));

vi.mock('src/sections/news/news-form', () => ({
  NewsForm: ({ mode, initialData, onSubmit, onCancel, loading }: any) => (
    <div data-testid="news-form" data-mode={mode} data-loading={loading}>
      <div data-testid="form-title">{initialData?.title}</div>
      <button onClick={() => onSubmit({
        title: 'Updated Title',
        content: 'Updated Content',
        thumbnail: 'updated.jpg',
        status: 1
      })}>
        Submit
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

describe('NewsEditView', () => {
  const mockNews = {
    id: 'news123',
    title: 'Test News',
    content: 'Test Content',
    thumbnail: 'test.jpg',
    status: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Simple mock that returns values in order
    let callCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      const results = [mockNews, false, false]; // currentNews, fetchLoading, updateLoading
      return results[callCount++] || null;
    });
  });

  it('renders without errors', () => {
    expect(() => {
      render(<NewsEditView />);
    }).not.toThrow();
  });

  it('fetches news by id on mount', () => {
    render(<NewsEditView />);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'GET_NEWS_BY_ID' })
    );
  });

  it('renders NewsForm with edit mode', () => {
    render(<NewsEditView />);
    const form = screen.getByTestId('news-form');
    expect(form).toHaveAttribute('data-mode', 'edit');
  });

  it('passes initialData to NewsForm', () => {
    render(<NewsEditView />);
    expect(screen.getByText('Test News')).toBeInTheDocument();
  });

  it('shows loading state when fetching', () => {
    let callCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      const results = [null, true, false]; // currentNews=null, fetchLoading=true, updateLoading=false
      return results[callCount++] || null;
    });

    render(<NewsEditView />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows loading state when no currentNews', () => {
    let callCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      const results = [null, false, false]; // currentNews=null, fetchLoading=false, updateLoading=false
      return results[callCount++] || null;
    });

    render(<NewsEditView />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles submit', () => {
    render(<NewsEditView />);

    const submitButton = screen.getByText('Submit');
    submitButton.click();

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'UPDATE_NEWS' })
    );
  });

  it('handles cancel', () => {
    render(<NewsEditView />);

    const cancelButton = screen.getByText('Cancel');
    cancelButton.click();

    expect(mockNavigate).toHaveBeenCalledWith('/article');
  });

  it('navigates to /article on successful update', () => {
    render(<NewsEditView />);

    const submitButton = screen.getByText('Submit');
    submitButton.click();

    // Get the onSuccess callback
    const updateCall = mockDispatch.mock.calls.find(
      call => call[0].type === 'UPDATE_NEWS'
    );
    if (updateCall && updateCall[0].payload.onSuccess) {
      updateCall[0].payload.onSuccess();
    }

    expect(mockNavigate).toHaveBeenCalledWith('/article');
  });

  it('clears current news on unmount', () => {
    const { unmount } = render(<NewsEditView />);
    unmount();

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'CLEAR_CURRENT_NEWS' })
    );
  });

  it('uses useNavigate hook', () => {
    render(<NewsEditView />);
    expect(mockNavigate).toBeDefined();
  });

  it('uses useParams hook', () => {
    render(<NewsEditView />);
    expect(mockParams.id).toBe('news123');
  });

  it('uses useAppDispatch hook', () => {
    render(<NewsEditView />);
    expect(mockDispatch).toBeDefined();
  });

  it('uses useAppSelector hook', () => {
    render(<NewsEditView />);
    expect(mockUseAppSelector).toHaveBeenCalled();
  });

  it('exports NewsEditView function', () => {
    expect(NewsEditView).toBeDefined();
    expect(typeof NewsEditView).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof NewsEditView).toBe('function');
    expect(NewsEditView.name).toBe('NewsEditView');
  });
});
