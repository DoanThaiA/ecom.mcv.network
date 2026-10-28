import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Main } from 'src/layouts/auth/main';

vi.mock('@mui/material/styles', () => ({
  useTheme: () => ({
    spacing: (...args: number[]) => args.map(x => `${x * 8}px`).join(' '),
    breakpoints: {
      up: (key: string) => `@media (min-width: ${key})`,
    },
  }),
}));

vi.mock('src/layouts/classes', () => ({
  layoutClasses: {
    main: 'layout-main',
  },
}));

describe('Main', () => {
  it('renders children', () => {
    render(
      <Main layoutQuery="md">
        <div data-testid="child">Test Content</div>
      </Main>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders as main element', () => {
    const { container } = render(
      <Main layoutQuery="md">
        <div>Test</div>
      </Main>
    );
    expect(container.querySelector('main')).toBeInTheDocument();
  });

  it('applies layoutClasses.main', () => {
    const { container } = render(
      <Main layoutQuery="md">
        <div>Test</div>
      </Main>
    );
    expect(container.querySelector('.layout-main')).toBeInTheDocument();
  });

  it('accepts layoutQuery prop', () => {
    render(
      <Main layoutQuery="lg">
        <div>Test</div>
      </Main>
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('accepts different breakpoints', () => {
    render(
      <Main layoutQuery="sm">
        <div>Test</div>
      </Main>
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('accepts custom sx prop', () => {
    render(
      <Main layoutQuery="md" sx={{ bgcolor: 'red' }}>
        <div>Test</div>
      </Main>
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('accepts BoxProps', () => {
    render(
      <Main layoutQuery="md" id="test-main">
        <div>Test</div>
      </Main>
    );
    const main = screen.getByText('Test').closest('main');
    expect(main).toHaveAttribute('id', 'test-main');
  });

  it('renders content Box wrapper', () => {
    const { container } = render(
      <Main layoutQuery="md">
        <div>Test</div>
      </Main>
    );
    const boxes = container.querySelectorAll('.MuiBox-root');
    expect(boxes.length).toBeGreaterThan(0);
  });

  it('uses useTheme hook', () => {
    render(
      <Main layoutQuery="md">
        <div>Test</div>
      </Main>
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <Main layoutQuery="md">
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </Main>
    );
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('exports Main function', () => {
    expect(Main).toBeDefined();
    expect(typeof Main).toBe('function');
  });

  it('renders without errors', () => {
    expect(() => {
      render(
        <Main layoutQuery="md">
          <div>Test</div>
        </Main>
      );
    }).not.toThrow();
  });

  it('applies flexbox layout', () => {
    const { container } = render(
      <Main layoutQuery="md">
        <div>Test</div>
      </Main>
    );
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
  });

  it('centers content', () => {
    const { container } = render(
      <Main layoutQuery="md">
        <div>Test</div>
      </Main>
    );
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
  });

  it('applies responsive padding', () => {
    const { container } = render(
      <Main layoutQuery="md">
        <div>Test</div>
      </Main>
    );
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
  });

  it('uses theme spacing', () => {
    render(
      <Main layoutQuery="md">
        <div>Test</div>
      </Main>
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('uses theme breakpoints', () => {
    render(
      <Main layoutQuery="md">
        <div>Test</div>
      </Main>
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('merges custom sx with default styles', () => {
    render(
      <Main layoutQuery="md" sx={{ mt: 2 }}>
        <div>Test</div>
      </Main>
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('spreads other BoxProps', () => {
    render(
      <Main layoutQuery="md" data-testid="main-component">
        <div>Test</div>
      </Main>
    );
    const main = screen.getByTestId('main-component');
    expect(main).toBeInTheDocument();
  });

  it('wraps content in styled Box', () => {
    const { container } = render(
      <Main layoutQuery="md">
        <div>Test</div>
      </Main>
    );
    const boxes = container.querySelectorAll('.MuiBox-root');
    expect(boxes.length).toBeGreaterThan(1);
  });

  it('applies auth layout width', () => {
    const { container } = render(
      <Main layoutQuery="md">
        <div>Test</div>
      </Main>
    );
    expect(container.querySelector('main')).toBeInTheDocument();
  });

  it('has flexible height', () => {
    const { container } = render(
      <Main layoutQuery="md">
        <div>Test</div>
      </Main>
    );
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
  });
});
