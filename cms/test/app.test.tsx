import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import App from 'src//app';

// Mock the dependencies
vi.mock('src/theme/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>,
}));

vi.mock('src/contexts/breadcrumb-context', () => ({
  BreadcrumbProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="breadcrumb-provider">{children}</div>,
}));

vi.mock('src/routes/sections', () => ({
  Router: () => <div data-testid="router">Router</div>,
}));

vi.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="toast-container">Toast</div>,
}));

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  it('renders ThemeProvider', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('theme-provider')).toBeInTheDocument();
  });

  it('renders BreadcrumbProvider inside ThemeProvider', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('breadcrumb-provider')).toBeInTheDocument();
  });

  it('renders Router component', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('router')).toBeInTheDocument();
  });

  it('renders ToastContainer component', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('toast-container')).toBeInTheDocument();
  });

  it('has correct provider nesting order', () => {
    const { container } = render(<App />);
    const themeProvider = container.querySelector('[data-testid="theme-provider"]');
    const breadcrumbProvider = container.querySelector('[data-testid="breadcrumb-provider"]');
    
    expect(themeProvider).toBeInTheDocument();
    expect(breadcrumbProvider).toBeInTheDocument();
  });

  it('renders all main components', () => {
    const { getByTestId } = render(<App />);
    
    expect(getByTestId('theme-provider')).toBeInTheDocument();
    expect(getByTestId('breadcrumb-provider')).toBeInTheDocument();
    expect(getByTestId('router')).toBeInTheDocument();
    expect(getByTestId('toast-container')).toBeInTheDocument();
  });
});
