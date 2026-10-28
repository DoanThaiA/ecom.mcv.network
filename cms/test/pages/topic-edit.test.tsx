import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import TopicEditPage from 'src/pages/topic-edit';

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
  TopicEditView: () => <div data-testid="topic-edit-view">Topic Edit View</div>,
}));

describe('TopicEditPage', () => {
  const renderComponent = () => {
    return render(
      <HelmetProvider>
        <TopicEditPage />
      </HelmetProvider>
    );
  };

  it('renders without crashing', () => {
    const { container } = renderComponent();
    expect(container).toBeInTheDocument();
  });

  it('renders TopicEditView component', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('topic-edit-view')).toBeInTheDocument();
  });

  it('calls setTitle with translated updateTopic', () => {
    renderComponent();
    expect(mockSetTitle).toHaveBeenCalledWith('updateTopic');
  });

  it('renders Fragment wrapper', () => {
    const { container } = renderComponent();
    expect(container.firstChild).toBeInTheDocument();
  });

  it('contains view component', () => {
    const { container } = renderComponent();
    expect(container.querySelector('[data-testid="topic-edit-view"]')).toBeInTheDocument();
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
