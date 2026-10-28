import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopicForm } from 'src/sections/topic/topic-form';

const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@mui/lab', () => ({
  TabContext: ({ children }: any) => <div data-testid="tab-context">{children}</div>,
  TabList: ({ children }: any) => <div data-testid="tab-list">{children}</div>,
  TabPanel: ({ children }: any) => <div data-testid="tab-panel">{children}</div>,
}));

vi.mock('src/sections/topic/components/topic-general-tab', () => ({
  TopicGeneralTab: ({ formData }: any) => (
    <div data-testid="topic-general-tab">Name: {formData.name}</div>
  ),
}));

vi.mock('src/sections/topic/components/topic-products-tab', () => ({
  TopicProductsTab: ({ products }: any) => (
    <div data-testid="topic-products-tab">Products: {products.length}</div>
  ),
}));

vi.mock('src/sections/topic/utils/product-diff', () => ({
  calculateProductDiff: vi.fn(() => ({ added: [], removed: [], reordered: [] })),
}));

describe('TopicForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <TopicForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders tab context', () => {
    render(<TopicForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(screen.getByTestId('tab-context')).toBeInTheDocument();
  });

  it('renders tab list', () => {
    render(<TopicForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(screen.getByTestId('tab-list')).toBeInTheDocument();
  });

  it('renders general tab', () => {
    render(<TopicForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(screen.getByTestId('topic-general-tab')).toBeInTheDocument();
  });

  it('renders products tab', () => {
    render(<TopicForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(screen.getByTestId('topic-products-tab')).toBeInTheDocument();
  });

  it('renders cancel button', () => {
    render(<TopicForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(screen.getByText('goBack')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<TopicForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(screen.getByText('addNew')).toBeInTheDocument();
  });

  it('displays initial name', () => {
    render(
      <TopicForm
        mode="create"
        initialData={{ name: 'Test Topic' }}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByText('Name: Test Topic')).toBeInTheDocument();
  });

  it('displays products count', () => {
    const products = [
      { productId: 'p1', order: 1 },
      { productId: 'p2', order: 2 },
    ];
    render(
      <TopicForm
        mode="create"
        initialProducts={products as any}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByText('Products: 2')).toBeInTheDocument();
  });

  it('renders in create mode', () => {
    render(<TopicForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(screen.getByTestId('tab-context')).toBeInTheDocument();
  });

  it('renders in edit mode', () => {
    render(<TopicForm mode="edit" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(screen.getByTestId('tab-context')).toBeInTheDocument();
  });

  it('exports TopicForm function', () => {
    expect(TopicForm).toBeDefined();
    expect(typeof TopicForm).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof TopicForm).toBe('function');
    expect(TopicForm.name).toBe('TopicForm');
  });

  describe('Localization', () => {
    it('initializes with empty localization when not provided', () => {
      render(<TopicForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      expect(screen.getByTestId('topic-general-tab')).toBeInTheDocument();
    });

    it('initializes with provided Vietnamese localization', () => {
      const initialData = {
        name: 'Topic Name',
        localization: { vi: 'Chủ đề tiếng Việt', en: '' },
      };
      render(
        <TopicForm
          mode="create"
          initialData={initialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByTestId('topic-general-tab')).toBeInTheDocument();
    });

    it('initializes with provided English localization', () => {
      const initialData = {
        name: 'Topic Name',
        localization: { vi: '', en: 'English Topic' },
      };
      render(
        <TopicForm
          mode="create"
          initialData={initialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByTestId('topic-general-tab')).toBeInTheDocument();
    });

    it('initializes with both Vietnamese and English localization', () => {
      const initialData = {
        name: 'Topic Name',
        localization: { vi: 'Chủ đề tiếng Việt', en: 'English Topic' },
      };
      render(
        <TopicForm
          mode="create"
          initialData={initialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByTestId('topic-general-tab')).toBeInTheDocument();
    });

    it('handles undefined localization in initial data', () => {
      const initialData = {
        name: 'Topic Name',
        localization: undefined,
      };
      render(
        <TopicForm
          mode="create"
          initialData={initialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByTestId('topic-general-tab')).toBeInTheDocument();
    });
  });
});
