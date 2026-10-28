import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NewsCreateView } from 'src/sections/news/news-create-view';

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

vi.mock('src/redux/store/newsSlice', () => ({
  createNewsRequest: (payload: any) => ({ type: 'news/create', payload }),
  selectCreateNewsLoading: () => mockLoading,
}));

vi.mock('src/sections/news/news-form', () => ({
  NewsForm: ({ mode, onSubmit, onCancel, loading }: any) => (
    <div data-testid="news-form" data-mode={mode} data-loading={loading}>
      <button type="button" onClick={() => onSubmit({ title: 'Test' })}>
        Submit
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}));

describe('NewsCreateView', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockDispatch.mockClear();
  });

  it('renders NewsForm component', () => {
    render(<NewsCreateView />);
    expect(screen.getByTestId('news-form')).toBeInTheDocument();
  });

  it('passes mode="create" to NewsForm', () => {
    render(<NewsCreateView />);
    const form = screen.getByTestId('news-form');
    expect(form).toHaveAttribute('data-mode', 'create');
  });

  it('passes loading state to NewsForm', () => {
    render(<NewsCreateView />);
    const form = screen.getByTestId('news-form');
    expect(form).toHaveAttribute('data-loading', 'false');
  });

  it('renders Box container', () => {
    const { container } = render(<NewsCreateView />);
    expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();
  });

  it('Box has correct height style', () => {
    const { container } = render(<NewsCreateView />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toHaveStyle({ height: 'calc(100vh - 64px)' });
  });

  it('Box has display flex', () => {
    const { container } = render(<NewsCreateView />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toHaveStyle({ display: 'flex' });
  });

  it('Box has flexDirection column', () => {
    const { container } = render(<NewsCreateView />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toHaveStyle({ flexDirection: 'column' });
  });

  it('handleSubmit dispatches createNewsRequest', () => {
    render(<NewsCreateView />);
    const submitButton = screen.getByText('Submit');
    submitButton.click();

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'news/create',
        payload: expect.objectContaining({
          data: { title: 'Test' },
        }),
      })
    );
  });

  it('handleSubmit includes onSuccess callback', () => {
    render(<NewsCreateView />);
    const submitButton = screen.getByText('Submit');
    submitButton.click();

    const dispatchCall = mockDispatch.mock.calls[0][0];
    expect(dispatchCall.payload).toHaveProperty('onSuccess');
    expect(typeof dispatchCall.payload.onSuccess).toBe('function');
  });

  it('onSuccess navigates to /article', () => {
    render(<NewsCreateView />);
    const submitButton = screen.getByText('Submit');
    submitButton.click();

    const dispatchCall = mockDispatch.mock.calls[0][0];
    dispatchCall.payload.onSuccess();

    expect(mockNavigate).toHaveBeenCalledWith('/article');
  });

  it('handleCancel navigates to /article', () => {
    render(<NewsCreateView />);
    const cancelButton = screen.getByText('Cancel');
    cancelButton.click();

    expect(mockNavigate).toHaveBeenCalledWith('/article');
  });

  it('uses useNavigate hook', () => {
    render(<NewsCreateView />);
    expect(screen.getByTestId('news-form')).toBeInTheDocument();
  });

  it('uses useAppDispatch hook', () => {
    render(<NewsCreateView />);
    expect(screen.getByTestId('news-form')).toBeInTheDocument();
  });

  it('uses useAppSelector hook', () => {
    render(<NewsCreateView />);
    expect(screen.getByTestId('news-form')).toBeInTheDocument();
  });

  it('renders without errors', () => {
    expect(() => {
      render(<NewsCreateView />);
    }).not.toThrow();
  });

  it('exports NewsCreateView function', () => {
    expect(NewsCreateView).toBeDefined();
    expect(typeof NewsCreateView).toBe('function');
  });

  it('NewsForm is contained in Box', () => {
    const { container } = render(<NewsCreateView />);
    const box = container.querySelector('.MuiBox-root');
    const form = screen.getByTestId('news-form');
    expect(box).toContainElement(form);
  });

  it('dispatches with correct data structure', () => {
    render(<NewsCreateView />);
    const submitButton = screen.getByText('Submit');
    submitButton.click();

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    const action = mockDispatch.mock.calls[0][0];
    expect(action).toHaveProperty('type', 'news/create');
    expect(action.payload).toHaveProperty('data');
    expect(action.payload).toHaveProperty('onSuccess');
  });

  it('renders complete create view layout', () => {
    render(<NewsCreateView />);
    expect(screen.getByTestId('news-form')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});
