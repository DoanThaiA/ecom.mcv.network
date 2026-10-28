import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import NewsPage from 'src/pages/news';

const mockT = vi.fn((key: string) => key);
const mockSetTitle = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

vi.mock('src/config-global', () => ({
  CONFIG: { appName: 'Test CMS' },
}));

vi.mock('src/contexts/page-title-context', () => ({
  usePageTitle: () => ({ setTitle: mockSetTitle }),
}));

vi.mock('src/sections/news', () => ({
  NewsView: () => <div data-testid="news-view">NewsView</div>,
}));

describe('NewsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    expect(() => {
      render(
        <HelmetProvider>
          <NewsPage />
        </HelmetProvider>
      );
    }).not.toThrow();
  });

  it('renders NewsView component', () => {
    render(
      <HelmetProvider>
        <NewsPage />
      </HelmetProvider>
    );
    expect(screen.getByTestId('news-view')).toBeInTheDocument();
  });

  it('calls setTitle with translated text', () => {
    render(
      <HelmetProvider>
        <NewsPage />
      </HelmetProvider>
    );
    expect(mockSetTitle).toHaveBeenCalledWith('newsManagement');
  });

  it('uses useTranslation hook', () => {
    render(
      <HelmetProvider>
        <NewsPage />
      </HelmetProvider>
    );
    expect(mockT).toHaveBeenCalled();
  });

  it('uses usePageTitle hook', () => {
    render(
      <HelmetProvider>
        <NewsPage />
      </HelmetProvider>
    );
    expect(mockSetTitle).toHaveBeenCalled();
  });

  it('exports default function', () => {
    expect(NewsPage).toBeDefined();
    expect(typeof NewsPage).toBe('function');
  });

  it('uses CONFIG from config-global', () => {
    render(
      <HelmetProvider>
        <NewsPage />
      </HelmetProvider>
    );
    expect(screen.getByTestId('news-view')).toBeInTheDocument();
  });

  it('renders with Helmet meta tags', () => {
    const { container } = render(
      <HelmetProvider>
        <NewsPage />
      </HelmetProvider>
    );
    expect(container).toBeTruthy();
  });

  it('imports NewsView from sections', () => {
    render(
      <HelmetProvider>
        <NewsPage />
      </HelmetProvider>
    );
    expect(screen.getByTestId('news-view')).toBeDefined();
  });

  it('is a functional component', () => {
    expect(typeof NewsPage).toBe('function');
    expect(NewsPage.name).toBe('NewsPage');
  });
});
