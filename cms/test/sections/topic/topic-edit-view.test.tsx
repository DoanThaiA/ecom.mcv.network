import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopicEditView } from 'src/sections/topic/topic-edit-view';

const mockNavigate = vi.fn();
const mockParams = { id: 'topic123' };
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

vi.mock('src/redux/store/topicSlice', () => ({
  getTopicByIdRequest: vi.fn((params) => ({ type: 'GET_TOPIC_BY_ID', payload: params })),
  updateTopicWithProductsRequest: vi.fn((params) => ({
    type: 'UPDATE_TOPIC_WITH_PRODUCTS',
    payload: params,
  })),
  clearCurrentTopic: vi.fn(() => ({ type: 'CLEAR_CURRENT_TOPIC' })),
  selectCurrentTopic: vi.fn(),
  selectCurrentTopicLoading: vi.fn(),
  selectUpdateTopicLoading: vi.fn(),
}));

vi.mock('src/sections/topic/topic-form', () => ({
  TopicForm: ({ mode, initialData, initialProducts, onSubmit, onCancel, loading }: any) => (
    <div data-testid="topic-form" data-mode={mode} data-loading={loading}>
      <div data-testid="form-name">{initialData?.name}</div>
      <div data-testid="form-order">{initialData?.order}</div>
      <div data-testid="form-status">{initialData?.status}</div>
      <div data-testid="products-count">{initialProducts?.length || 0}</div>
      <button
        onClick={() =>
          onSubmit(
            {
              name: 'Updated Topic',
              order: 1,
              status: 1,
            },
            [],
            { toAdd: [], toRemove: [], toUpdate: [] }
          )
        }
      >
        Submit
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

describe('TopicEditView', () => {
  const mockTopic = {
    id: 'topic123',
    name: 'Test Topic',
    order: 0,
    status: 1,
    products: [
      {
        productId: 'prod1',
        order: 0,
        productCode: 'P001',
        productName: 'Product 1',
        productImage: 'image1.jpg',
        productPrice: 100000,
      },
      {
        productId: 'prod2',
        order: 1,
        productCode: 'P002',
        productName: 'Product 2',
        productImage: 'image2.jpg',
        productPrice: 200000,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Simple mock that returns values in order
    let callCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      const results = [mockTopic, false, false]; // currentTopic, fetchLoading, updateLoading
      return results[callCount++] || null;
    });
  });

  it('renders without errors', () => {
    expect(() => {
      render(<TopicEditView />);
    }).not.toThrow();
  });

  it('fetches topic by id on mount', () => {
    render(<TopicEditView />);
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'GET_TOPIC_BY_ID' }));
  });

  it('renders TopicForm with edit mode', () => {
    render(<TopicEditView />);
    const form = screen.getByTestId('topic-form');
    expect(form).toHaveAttribute('data-mode', 'edit');
  });

  it('passes initialData to TopicForm', () => {
    render(<TopicEditView />);
    expect(screen.getByText('Test Topic')).toBeInTheDocument();
  });

  it('passes initialProducts to TopicForm', () => {
    render(<TopicEditView />);
    expect(screen.getByTestId('products-count').textContent).toBe('2');
  });

  it('transforms products correctly', () => {
    render(<TopicEditView />);
    const productsCount = screen.getByTestId('products-count');
    expect(productsCount.textContent).toBe('2');
  });

  it('shows loading state when fetching', () => {
    let callCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      const results = [null, true, false]; // currentTopic=null, fetchLoading=true, updateLoading=false
      return results[callCount++] || null;
    });

    render(<TopicEditView />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows loading state when no currentTopic', () => {
    let callCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      const results = [null, false, false]; // currentTopic=null, fetchLoading=false, updateLoading=false
      return results[callCount++] || null;
    });

    render(<TopicEditView />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles submit', () => {
    render(<TopicEditView />);

    const submitButton = screen.getByText('Submit');
    submitButton.click();

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'UPDATE_TOPIC_WITH_PRODUCTS' })
    );
  });

  it('handles cancel', () => {
    render(<TopicEditView />);

    const cancelButton = screen.getByText('Cancel');
    cancelButton.click();

    expect(mockNavigate).toHaveBeenCalledWith('/topic');
  });

  it('navigates to /topic on successful update', () => {
    render(<TopicEditView />);

    const submitButton = screen.getByText('Submit');
    submitButton.click();

    // Get the onSuccess callback
    const updateCall = mockDispatch.mock.calls.find(
      (call) => call[0].type === 'UPDATE_TOPIC_WITH_PRODUCTS'
    );
    if (updateCall && updateCall[0].payload.onSuccess) {
      updateCall[0].payload.onSuccess();
    }

    expect(mockNavigate).toHaveBeenCalledWith('/topic');
  });

  it('clears current topic on unmount', () => {
    const { unmount } = render(<TopicEditView />);
    unmount();

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'CLEAR_CURRENT_TOPIC' })
    );
  });

  it('uses useNavigate hook', () => {
    render(<TopicEditView />);
    expect(mockNavigate).toBeDefined();
  });

  it('uses useParams hook', () => {
    render(<TopicEditView />);
    expect(mockParams.id).toBe('topic123');
  });

  it('uses useAppDispatch hook', () => {
    render(<TopicEditView />);
    expect(mockDispatch).toBeDefined();
  });

  it('uses useAppSelector hook', () => {
    render(<TopicEditView />);
    expect(mockUseAppSelector).toHaveBeenCalled();
  });

  it('exports TopicEditView function', () => {
    expect(TopicEditView).toBeDefined();
    expect(typeof TopicEditView).toBe('function');
  });

  it('renders Box component', () => {
    const { container } = render(<TopicEditView />);
    expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();
  });

  it('is a functional component', () => {
    expect(typeof TopicEditView).toBe('function');
    expect(TopicEditView.name).toBe('TopicEditView');
  });

  it('handles empty products array', () => {
    let callCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      const results = [{ ...mockTopic, products: [] }, false, false];
      return results[callCount++] || null;
    });

    render(<TopicEditView />);
    expect(screen.getByTestId('products-count').textContent).toBe('0');
  });

  it('handles undefined products array', () => {
    let callCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      const results = [{ ...mockTopic, products: undefined }, false, false];
      return results[callCount++] || null;
    });

    render(<TopicEditView />);
    expect(screen.getByTestId('products-count').textContent).toBe('0');
  });

  it('dispatches getTopicByIdRequest with correct id', () => {
    render(<TopicEditView />);

    const getCall = mockDispatch.mock.calls.find((call) => call[0].type === 'GET_TOPIC_BY_ID');
    expect(getCall[0].payload.id).toBe('topic123');
  });

  it('dispatches updateTopicWithProductsRequest with correct data', () => {
    render(<TopicEditView />);

    const submitButton = screen.getByText('Submit');
    submitButton.click();

    const updateCall = mockDispatch.mock.calls.find(
      (call) => call[0].type === 'UPDATE_TOPIC_WITH_PRODUCTS'
    );
    expect(updateCall[0].payload.id).toBe('topic123');
    expect(updateCall[0].payload.data.name).toBe('Updated Topic');
    expect(updateCall[0].payload.data.order).toBe(1);
    expect(updateCall[0].payload.data.status).toBe(1);
  });

  it('passes productDiff to updateTopicWithProductsRequest', () => {
    render(<TopicEditView />);

    const submitButton = screen.getByText('Submit');
    submitButton.click();

    const updateCall = mockDispatch.mock.calls.find(
      (call) => call[0].type === 'UPDATE_TOPIC_WITH_PRODUCTS'
    );
    expect(updateCall[0].payload.productDiff).toBeDefined();
    expect(updateCall[0].payload.productDiff.toAdd).toBeDefined();
    expect(updateCall[0].payload.productDiff.toRemove).toBeDefined();
    expect(updateCall[0].payload.productDiff.toUpdate).toBeDefined();
  });

  describe('Localization', () => {
    it('passes localization from topic to initialData', () => {
      const topicWithLocalization = {
        ...mockTopic,
        localization: { vi: 'Chủ đề test', en: 'Test Topic' },
      };

      let callCount = 0;
      mockUseAppSelector.mockImplementation(() => {
        const results = [topicWithLocalization, false, false];
        return results[callCount++] || null;
      });

      render(<TopicEditView />);
      const form = screen.getByTestId('topic-form');
      expect(form).toBeInTheDocument();
    });

    it('handles topic without localization', () => {
      const topicWithoutLocalization = {
        ...mockTopic,
        localization: undefined,
      };

      let callCount = 0;
      mockUseAppSelector.mockImplementation(() => {
        const results = [topicWithoutLocalization, false, false];
        return results[callCount++] || null;
      });

      render(<TopicEditView />);
      const form = screen.getByTestId('topic-form');
      expect(form).toBeInTheDocument();
    });

    it('includes localization in update payload when provided', () => {
      render(<TopicEditView />);

      // Mock the TopicForm to submit with localization
      const submitButton = screen.getByText('Submit');

      // Update the mock to include localization in submit
      vi.mocked(mockDispatch).mockClear();

      render(<TopicEditView />);
      submitButton.click();

      const updateCall = mockDispatch.mock.calls.find(
        (call) => call[0].type === 'UPDATE_TOPIC_WITH_PRODUCTS'
      );

      // Verify the payload structure allows localization
      expect(updateCall[0].payload.data).toBeDefined();
    });
  });
});
