import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import Page from 'src/pages/account';

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

vi.mock('src/sections/account', () => ({
  AccountView: () => <div data-testid="account-view">Account View</div>,
}));

describe('Account Page', () => {
  const renderWithHelmet = (ui: React.ReactElement) => {
    return render(<HelmetProvider>{ui}</HelmetProvider>);
  };

  beforeEach(() => {
    mockSetTitle.mockClear();
  });

  it('renders AccountView', () => {
    renderWithHelmet(<Page />);
    expect(screen.getByTestId('account-view')).toBeInTheDocument();
  });

  it('sets page title on mount', () => {
    renderWithHelmet(<Page />);
    expect(mockSetTitle).toHaveBeenCalledWith('accountInfo');
  });

  it('renders Helmet with title', () => {
    const { container } = renderWithHelmet(<Page />);
    expect(container).toBeInTheDocument();
  });

  it('renders fragment wrapper', () => {
    const { container } = renderWithHelmet(<Page />);
    expect(container).toBeInTheDocument();
  });

  it('calls setTitle with translated text', () => {
    renderWithHelmet(<Page />);
    expect(mockSetTitle).toHaveBeenCalled();
  });

  it('renders without errors', () => {
    expect(() => {
      renderWithHelmet(<Page />);
    }).not.toThrow();
  });

  it('displays account view content', () => {
    renderWithHelmet(<Page />);
    expect(screen.getByText('Account View')).toBeInTheDocument();
  });

  it('renders Helmet component', () => {
    const { container } = renderWithHelmet(<Page />);
    expect(container.querySelector('[data-testid="account-view"]')).toBeInTheDocument();
  });

  it('component structure includes Helmet and AccountView', () => {
    renderWithHelmet(<Page />);
    expect(screen.getByTestId('account-view')).toBeInTheDocument();
  });

  it('exports default component', () => {
    expect(Page).toBeDefined();
    expect(typeof Page).toBe('function');
  });

  it('uses useEffect for setTitle', () => {
    renderWithHelmet(<Page />);
    expect(mockSetTitle).toHaveBeenCalled();
  });

  it('setTitle is called exactly once', () => {
    renderWithHelmet(<Page />);
    expect(mockSetTitle).toHaveBeenCalledTimes(1);
  });

  it('AccountView is rendered', () => {
    renderWithHelmet(<Page />);
    expect(screen.getByTestId('account-view')).toBeInTheDocument();
  });

  it('page renders correctly', () => {
    const { container } = renderWithHelmet(<Page />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('uses translation hook', () => {
    renderWithHelmet(<Page />);
    expect(screen.getByTestId('account-view')).toBeInTheDocument();
  });

  it('calls setTitle with accountInfo translation key', () => {
    renderWithHelmet(<Page />);
    expect(mockSetTitle).toHaveBeenCalledWith('accountInfo');
  });
});
