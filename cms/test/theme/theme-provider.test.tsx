import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'src/theme/theme-provider';

vi.mock('src/theme/create-theme', () => ({
  createTheme: vi.fn(() => ({
    palette: { mode: 'light' },
  })),
}));

vi.mock('@mui/material/styles', () => ({
  Experimental_CssVarsProvider: ({ children }: any) => <div data-testid="css-vars-provider">{children}</div>,
}));

vi.mock('@mui/material/CssBaseline', () => ({
  default: () => <div data-testid="css-baseline" />,
}));

describe('ThemeProvider', () => {
  it('renders without errors', () => {
    expect(() => {
      render(<ThemeProvider><div>Test</div></ThemeProvider>);
    }).not.toThrow();
  });

  it('renders children', () => {
    render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders CssVarsProvider', () => {
    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    );
    expect(screen.getByTestId('css-vars-provider')).toBeInTheDocument();
  });

  it('renders CssBaseline', () => {
    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    );
    expect(screen.getByTestId('css-baseline')).toBeInTheDocument();
  });

  it('calls createTheme', async () => {
    const { createTheme } = await import('src/theme/create-theme');
    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    );
    expect(createTheme).toHaveBeenCalled();
  });

  it('exports ThemeProvider function', () => {
    expect(ThemeProvider).toBeDefined();
    expect(typeof ThemeProvider).toBe('function');
  });

  it('is a functional component', () => {
    expect(ThemeProvider.name).toBe('ThemeProvider');
  });

  it('accepts children prop', () => {
    render(
      <ThemeProvider>
        <span>Child 1</span>
        <span>Child 2</span>
      </ThemeProvider>
    );
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('renders with different children types', () => {
    render(
      <ThemeProvider>
        <div>
          <p>Paragraph</p>
          <button>Button</button>
        </div>
      </ThemeProvider>
    );
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
    expect(screen.getByText('Button')).toBeInTheDocument();
  });

  it('renders with string children', () => {
    render(<ThemeProvider>Plain text</ThemeProvider>);
    expect(screen.getByText('Plain text')).toBeInTheDocument();
  });
});
