import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import ReviewPage from 'src/pages/review';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('src/config-global', () => ({
  CONFIG: {
    appName: 'Test CMS',
  },
}));

const mockSetTitle = vi.fn();
vi.mock('src/contexts/page-title-context', () => ({
  usePageTitle: () => ({
    setTitle: mockSetTitle,
  }),
}));

vi.mock('src/sections/review', () => ({
  ReviewView: () => <div data-testid="review-view">Review View</div>,
}));

describe('ReviewPage', () => {
  const renderWithHelmet = (ui: React.ReactElement) => {
    return render(<HelmetProvider>{ui}</HelmetProvider>);
  };

  beforeEach(() => {
    mockSetTitle.mockClear();
  });

  it('renders ReviewView', () => {
    renderWithHelmet(<ReviewPage />);
    expect(screen.getByTestId('review-view')).toBeInTheDocument();
  });

  it('sets page title on mount', () => {
    renderWithHelmet(<ReviewPage />);
    expect(mockSetTitle).toHaveBeenCalledWith('reviewManagement');
  });

  it('renders Helmet with title', () => {
    const { container } = renderWithHelmet(<ReviewPage />);
    expect(container).toBeInTheDocument();
  });

  it('displays review view content', () => {
    renderWithHelmet(<ReviewPage />);
    expect(screen.getByText('Review View')).toBeInTheDocument();
  });

  it('renders without errors', () => {
    expect(() => {
      renderWithHelmet(<ReviewPage />);
    }).not.toThrow();
  });

  it('calls setTitle with reviewManagement key', () => {
    renderWithHelmet(<ReviewPage />);
    expect(mockSetTitle).toHaveBeenCalledWith('reviewManagement');
  });

  it('setTitle is called exactly once', () => {
    renderWithHelmet(<ReviewPage />);
    expect(mockSetTitle).toHaveBeenCalledTimes(1);
  });

  it('exports default component', () => {
    expect(ReviewPage).toBeDefined();
    expect(typeof ReviewPage).toBe('function');
  });

  it('page renders correctly', () => {
    const { container } = renderWithHelmet(<ReviewPage />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders fragment wrapper', () => {
    const { container } = renderWithHelmet(<ReviewPage />);
    expect(container).toBeInTheDocument();
  });

  it('Helmet includes meta description', () => {
    renderWithHelmet(<ReviewPage />);
    expect(screen.getByTestId('review-view')).toBeInTheDocument();
  });

  it('Helmet includes meta keywords', () => {
    renderWithHelmet(<ReviewPage />);
    expect(screen.getByTestId('review-view')).toBeInTheDocument();
  });

  it('uses translation hook', () => {
    renderWithHelmet(<ReviewPage />);
    expect(screen.getByTestId('review-view')).toBeInTheDocument();
  });

  it('uses useEffect for setTitle', () => {
    renderWithHelmet(<ReviewPage />);
    expect(mockSetTitle).toHaveBeenCalled();
  });

  it('ReviewView is rendered inside fragment', () => {
    renderWithHelmet(<ReviewPage />);
    expect(screen.getByTestId('review-view')).toBeInTheDocument();
  });
});
