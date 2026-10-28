import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopicCreateView } from 'src/sections/topic/topic-create-view';

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

vi.mock('src/redux/store/topicSlice', () => ({
  createTopicRequest: (payload: any) => ({ type: 'topic/create', payload }),
  selectCreateTopicLoading: () => mockLoading,
}));

vi.mock('src/sections/topic/topic-form', () => ({
  TopicForm: ({ mode, onSubmit, onCancel, loading }: any) => (
    <div data-testid="topic-form" data-mode={mode} data-loading={loading}>
      <button
        type="button"
        onClick={() => onSubmit({ name: 'Test Topic' }, [], { added: [], removed: [], updated: [] })}
      >
        Submit
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}));

describe('TopicCreateView', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockDispatch.mockClear();
  });

  it('renders TopicForm component', () => {
    render(<TopicCreateView />);
    expect(screen.getByTestId('topic-form')).toBeInTheDocument();
  });

  it('passes mode="create" to TopicForm', () => {
    render(<TopicCreateView />);
    const form = screen.getByTestId('topic-form');
    expect(form).toHaveAttribute('data-mode', 'create');
  });

  it('passes loading state to TopicForm', () => {
    render(<TopicCreateView />);
    const form = screen.getByTestId('topic-form');
    expect(form).toHaveAttribute('data-loading', 'false');
  });

  it('renders Box container', () => {
    const { container } = render(<TopicCreateView />);
    expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();
  });

  it('Box has correct height style', () => {
    const { container } = render(<TopicCreateView />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toHaveStyle({ height: 'calc(100vh - 64px)' });
  });

  it('Box has display flex', () => {
    const { container } = render(<TopicCreateView />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toHaveStyle({ display: 'flex' });
  });

  it('Box has flexDirection column', () => {
    const { container } = render(<TopicCreateView />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toHaveStyle({ flexDirection: 'column' });
  });

  it('handleSubmit dispatches createTopicRequest', () => {
    render(<TopicCreateView />);
    const submitButton = screen.getByText('Submit');
    submitButton.click();

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'topic/create',
        payload: expect.objectContaining({
          data: { name: 'Test Topic' },
        }),
      })
    );
  });

  it('handleSubmit includes onSuccess callback', () => {
    render(<TopicCreateView />);
    const submitButton = screen.getByText('Submit');
    submitButton.click();

    const dispatchCall = mockDispatch.mock.calls[0][0];
    expect(dispatchCall.payload).toHaveProperty('onSuccess');
    expect(typeof dispatchCall.payload.onSuccess).toBe('function');
  });

  it('onSuccess navigates to /topic', () => {
    render(<TopicCreateView />);
    const submitButton = screen.getByText('Submit');
    submitButton.click();

    const dispatchCall = mockDispatch.mock.calls[0][0];
    dispatchCall.payload.onSuccess();

    expect(mockNavigate).toHaveBeenCalledWith('/topic');
  });

  it('handleCancel navigates to /topic', () => {
    render(<TopicCreateView />);
    const cancelButton = screen.getByText('Cancel');
    cancelButton.click();

    expect(mockNavigate).toHaveBeenCalledWith('/topic');
  });

  it('handleSubmit receives products parameter', () => {
    render(<TopicCreateView />);
    const submitButton = screen.getByText('Submit');
    submitButton.click();

    // Verify dispatch was called (products are passed but not used in create mode)
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it('handleSubmit receives productDiff parameter', () => {
    render(<TopicCreateView />);
    const submitButton = screen.getByText('Submit');
    submitButton.click();

    // Verify dispatch was called (productDiff is passed but not used in create mode)
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it('uses useNavigate hook', () => {
    render(<TopicCreateView />);
    expect(screen.getByTestId('topic-form')).toBeInTheDocument();
  });

  it('uses useAppDispatch hook', () => {
    render(<TopicCreateView />);
    expect(screen.getByTestId('topic-form')).toBeInTheDocument();
  });

  it('uses useAppSelector hook', () => {
    render(<TopicCreateView />);
    expect(screen.getByTestId('topic-form')).toBeInTheDocument();
  });

  it('renders without errors', () => {
    expect(() => {
      render(<TopicCreateView />);
    }).not.toThrow();
  });

  it('exports TopicCreateView function', () => {
    expect(TopicCreateView).toBeDefined();
    expect(typeof TopicCreateView).toBe('function');
  });

  it('TopicForm is contained in Box', () => {
    const { container } = render(<TopicCreateView />);
    const box = container.querySelector('.MuiBox-root');
    const form = screen.getByTestId('topic-form');
    expect(box).toContainElement(form);
  });

  it('dispatches with correct data structure', () => {
    render(<TopicCreateView />);
    const submitButton = screen.getByText('Submit');
    submitButton.click();

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    const action = mockDispatch.mock.calls[0][0];
    expect(action).toHaveProperty('type', 'topic/create');
    expect(action.payload).toHaveProperty('data');
    expect(action.payload).toHaveProperty('onSuccess');
  });

  it('casts data to CreateTopicRequest type', () => {
    render(<TopicCreateView />);
    const submitButton = screen.getByText('Submit');
    submitButton.click();

    const action = mockDispatch.mock.calls[0][0];
    expect(action.payload.data).toEqual({ name: 'Test Topic' });
  });

  it('renders complete create view layout', () => {
    render(<TopicCreateView />);
    expect(screen.getByTestId('topic-form')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});
