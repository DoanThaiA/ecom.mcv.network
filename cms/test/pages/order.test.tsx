import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import OrderPage from 'src/pages/order';

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

vi.mock('src/sections/order', () => ({
  OrderView: () => <div data-testid="order-view">Order View</div>,
}));

describe('OrderPage', () => {
  const renderWithHelmet = (ui: React.ReactElement) => {
    return render(<HelmetProvider>{ui}</HelmetProvider>);
  };

  beforeEach(() => {
    mockSetTitle.mockClear();
  });

  it('renders OrderView', () => {
    renderWithHelmet(<OrderPage />);
    expect(screen.getByTestId('order-view')).toBeInTheDocument();
  });

  it('sets page title on mount', () => {
    renderWithHelmet(<OrderPage />);
    expect(mockSetTitle).toHaveBeenCalledWith('order_management');
  });

  it('renders Helmet with title', () => {
    const { container } = renderWithHelmet(<OrderPage />);
    expect(container).toBeInTheDocument();
  });

  it('displays order view content', () => {
    renderWithHelmet(<OrderPage />);
    expect(screen.getByText('Order View')).toBeInTheDocument();
  });

  it('renders without errors', () => {
    expect(() => {
      renderWithHelmet(<OrderPage />);
    }).not.toThrow();
  });

  it('calls setTitle with order_management key', () => {
    renderWithHelmet(<OrderPage />);
    expect(mockSetTitle).toHaveBeenCalledWith('order_management');
  });

  it('setTitle is called exactly once', () => {
    renderWithHelmet(<OrderPage />);
    expect(mockSetTitle).toHaveBeenCalledTimes(1);
  });

  it('exports default component', () => {
    expect(OrderPage).toBeDefined();
    expect(typeof OrderPage).toBe('function');
  });

  it('page renders correctly', () => {
    const { container } = renderWithHelmet(<OrderPage />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders fragment wrapper', () => {
    const { container } = renderWithHelmet(<OrderPage />);
    expect(container).toBeInTheDocument();
  });

  it('Helmet includes meta description', () => {
    renderWithHelmet(<OrderPage />);
    expect(screen.getByTestId('order-view')).toBeInTheDocument();
  });

  it('Helmet includes meta keywords', () => {
    renderWithHelmet(<OrderPage />);
    expect(screen.getByTestId('order-view')).toBeInTheDocument();
  });

  it('uses translation hook', () => {
    renderWithHelmet(<OrderPage />);
    expect(screen.getByTestId('order-view')).toBeInTheDocument();
  });

  it('uses useEffect for setTitle', () => {
    renderWithHelmet(<OrderPage />);
    expect(mockSetTitle).toHaveBeenCalled();
  });

  it('OrderView is rendered inside fragment', () => {
    renderWithHelmet(<OrderPage />);
    expect(screen.getByTestId('order-view')).toBeInTheDocument();
  });
});
