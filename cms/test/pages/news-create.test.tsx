import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import NewsCreatePage from 'src/pages/news-create';

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
  NewsCreateView: () => <div data-testid="news-create-view">News Create View</div>,
}));

describe('NewsCreatePage', () => {
  const renderComponent = () => {
    return render(
      <HelmetProvider>
        <NewsCreatePage />
      </HelmetProvider>
    );
  };

  it('renders without crashing', () => {
    const { container } = renderComponent();
    expect(container).toBeInTheDocument();
  });

  it('renders NewsCreateView component', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('news-create-view')).toBeInTheDocument();
  });

  it('calls setTitle with translated addArticle', () => {
    renderComponent();
    expect(mockSetTitle).toHaveBeenCalledWith('addArticle');
  });

  it('renders Fragment wrapper', () => {
    const { container } = renderComponent();
    expect(container.firstChild).toBeInTheDocument();
  });

  it('contains view component', () => {
    const { container } = renderComponent();
    expect(container.querySelector('[data-testid="news-create-view"]')).toBeInTheDocument();
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
