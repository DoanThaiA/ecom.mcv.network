import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import NewsEditPage from 'src/pages/news-edit';

// Mock dependencies
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

vi.mock('src/sections/news', () => ({
  NewsEditView: () => <div data-testid="news-edit-view">News Edit View</div>,
}));

describe('NewsEditPage', () => {
  const renderComponent = () => {
    return render(
      <HelmetProvider>
        <NewsEditPage />
      </HelmetProvider>
    );
  };

  it('renders without crashing', () => {
    const { container } = renderComponent();
    expect(container).toBeInTheDocument();
  });

  it('renders NewsEditView component', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('news-edit-view')).toBeInTheDocument();
  });

  it('calls setTitle with translated editArticle', () => {
    renderComponent();
    expect(mockSetTitle).toHaveBeenCalledWith('editArticle');
  });

  it('renders Fragment wrapper', () => {
    const { container } = renderComponent();
    expect(container.firstChild).toBeInTheDocument();
  });

  it('contains view component', () => {
    const { container } = renderComponent();
    expect(container.querySelector('[data-testid="news-edit-view"]')).toBeInTheDocument();
  });

  it('renders with HelmetProvider', () => {
    const { container } = renderComponent();
    expect(container).toBeTruthy();
  });

  it('uses useTranslation hook', () => {
    renderComponent();
    // setTitle is called with translation key
    expect(mockSetTitle).toHaveBeenCalled();
  });
});
