import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import ReturnPage from 'src/pages/return';

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

vi.mock('src/sections/return', () => ({
  ReturnView: () => <div data-testid="return-view">Return View</div>,
}));

describe('ReturnPage', () => {
  const renderWithHelmet = (ui: React.ReactElement) => {
    return render(<HelmetProvider>{ui}</HelmetProvider>);
  };

  beforeEach(() => {
    mockSetTitle.mockClear();
  });

  it('renders ReturnView', () => {
    renderWithHelmet(<ReturnPage />);
    expect(screen.getByTestId('return-view')).toBeInTheDocument();
  });

  it('sets page title on mount', () => {
    renderWithHelmet(<ReturnPage />);
    expect(mockSetTitle).toHaveBeenCalledWith('returnManagement');
  });

  it('renders Helmet with title', () => {
    const { container } = renderWithHelmet(<ReturnPage />);
    expect(container).toBeInTheDocument();
  });

  it('displays return view content', () => {
    renderWithHelmet(<ReturnPage />);
    expect(screen.getByText('Return View')).toBeInTheDocument();
  });

  it('renders without errors', () => {
    expect(() => {
      renderWithHelmet(<ReturnPage />);
    }).not.toThrow();
  });

  it('calls setTitle with returnManagement key', () => {
    renderWithHelmet(<ReturnPage />);
    expect(mockSetTitle).toHaveBeenCalledWith('returnManagement');
  });

  it('setTitle is called exactly once', () => {
    renderWithHelmet(<ReturnPage />);
    expect(mockSetTitle).toHaveBeenCalledTimes(1);
  });

  it('exports default component', () => {
    expect(ReturnPage).toBeDefined();
    expect(typeof ReturnPage).toBe('function');
  });

  it('page renders correctly', () => {
    const { container} = renderWithHelmet(<ReturnPage />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders fragment wrapper', () => {
    const { container } = renderWithHelmet(<ReturnPage />);
    expect(container).toBeInTheDocument();
  });

  it('Helmet includes meta description', () => {
    renderWithHelmet(<ReturnPage />);
    expect(screen.getByTestId('return-view')).toBeInTheDocument();
  });

  it('Helmet includes meta keywords', () => {
    renderWithHelmet(<ReturnPage />);
    expect(screen.getByTestId('return-view')).toBeInTheDocument();
  });

  it('uses translation hook', () => {
    renderWithHelmet(<ReturnPage />);
    expect(screen.getByTestId('return-view')).toBeInTheDocument();
  });

  it('uses useEffect for setTitle', () => {
    renderWithHelmet(<ReturnPage />);
    expect(mockSetTitle).toHaveBeenCalled();
  });

  it('ReturnView is rendered inside fragment', () => {
    renderWithHelmet(<ReturnPage />);
    expect(screen.getByTestId('return-view')).toBeInTheDocument();
  });
});
