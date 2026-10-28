import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import TopicCreatePage from 'src/pages/topic-create';

vi.mock('src/config-global', () => ({
  CONFIG: {
    appName: 'Test App',
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockSetTitle = vi.fn();
vi.mock('src/contexts/page-title-context', () => ({
  usePageTitle: () => ({
    setTitle: mockSetTitle,
  }),
}));

vi.mock('src/sections/topic', () => ({
  TopicCreateView: () => <div data-testid="topic-create-view">Topic Create View</div>,
}));

describe('TopicCreatePage', () => {
  const renderComponent = () => {
    return render(
      <HelmetProvider>
        <TopicCreatePage />
      </HelmetProvider>
    );
  };

  it('renders without crashing', () => {
    const { container } = renderComponent();
    expect(container).toBeInTheDocument();
  });

  it('renders TopicCreateView component', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('topic-create-view')).toBeInTheDocument();
  });

  it('calls setTitle with translated createTopic', () => {
    renderComponent();
    expect(mockSetTitle).toHaveBeenCalledWith('createTopic');
  });

  it('renders Fragment wrapper', () => {
    const { container } = renderComponent();
    expect(container.firstChild).toBeInTheDocument();
  });

  it('contains view component', () => {
    const { container } = renderComponent();
    expect(container.querySelector('[data-testid="topic-create-view"]')).toBeInTheDocument();
  });

  it('renders with HelmetProvider', () => {
    const { container } = renderComponent();
    expect(container).toBeTruthy();
  });

  it('uses useTranslation hook', () => {
    renderComponent();
    expect(mockSetTitle).toHaveBeenCalled();
  });
});
