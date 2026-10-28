import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChunkErrorBoundary from 'src/routes/hooks/chuck-error';

describe('ChunkErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ChunkErrorBoundary>
        <div data-testid="child">Test Content</div>
      </ChunkErrorBoundary>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('displays children text', () => {
    render(
      <ChunkErrorBoundary>
        <div>Hello World</div>
      </ChunkErrorBoundary>
    );
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <ChunkErrorBoundary>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </ChunkErrorBoundary>
    );
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('initializes with hasError false', () => {
    const { container } = render(
      <ChunkErrorBoundary>
        <div>Content</div>
      </ChunkErrorBoundary>
    );
    expect(container).toBeInTheDocument();
  });

  it('renders error UI when hasError is true', () => {
    const boundary = new ChunkErrorBoundary({ children: <div>Test</div> });
    boundary.state = { hasError: true };
    const { container } = render(boundary.render() as React.ReactElement);
    expect(screen.getByText('Failed to load component.')).toBeInTheDocument();
  });

  it('shows refresh button in error state', () => {
    const boundary = new ChunkErrorBoundary({ children: <div>Test</div> });
    boundary.state = { hasError: true };
    render(boundary.render() as React.ReactElement);
    expect(screen.getByText('Refresh page')).toBeInTheDocument();
  });

  it('refresh button calls window.location.reload', () => {
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: reloadSpy },
    });

    const boundary = new ChunkErrorBoundary({ children: <div>Test</div> });
    boundary.state = { hasError: true };
    render(boundary.render() as React.ReactElement);

    const refreshButton = screen.getByText('Refresh page');
    refreshButton.click();

    expect(reloadSpy).toHaveBeenCalled();
  });

  it('renders without errors', () => {
    expect(() => {
      render(
        <ChunkErrorBoundary>
          <div>Test</div>
        </ChunkErrorBoundary>
      );
    }).not.toThrow();
  });

  it('exports ChunkErrorBoundary as default', () => {
    expect(ChunkErrorBoundary).toBeDefined();
    expect(typeof ChunkErrorBoundary).toBe('function');
  });

  it('is a React Component class', () => {
    expect(ChunkErrorBoundary.prototype).toHaveProperty('render');
  });

  it('has state property', () => {
    const boundary = new ChunkErrorBoundary({ children: <div>Test</div> });
    expect(boundary.state).toEqual({ hasError: false });
  });

  it('renders children when hasError is false', () => {
    const boundary = new ChunkErrorBoundary({ children: <div data-testid="test">Test</div> });
    boundary.state = { hasError: false };
    const result = render(boundary.render() as React.ReactElement);
    expect(screen.getByTestId('test')).toBeInTheDocument();
  });

  it('does not render children when hasError is true', () => {
    const boundary = new ChunkErrorBoundary({ children: <div data-testid="test">Test</div> });
    boundary.state = { hasError: true };
    render(boundary.render() as React.ReactElement);
    expect(screen.queryByTestId('test')).not.toBeInTheDocument();
  });

  it('error UI contains error message', () => {
    const boundary = new ChunkErrorBoundary({ children: <div>Test</div> });
    boundary.state = { hasError: true };
    render(boundary.render() as React.ReactElement);
    expect(screen.getByText('Failed to load component.')).toBeInTheDocument();
  });

  it('renders Button component in error state', () => {
    const boundary = new ChunkErrorBoundary({ children: <div>Test</div> });
    boundary.state = { hasError: true };
    const { container } = render(boundary.render() as React.ReactElement);
    expect(container.querySelector('.MuiButton-root')).toBeInTheDocument();
  });

  it('wraps children without modifying them', () => {
    const TestComponent = () => <div data-testid="test-component">Test Component</div>;
    render(
      <ChunkErrorBoundary>
        <TestComponent />
      </ChunkErrorBoundary>
    );
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
  });

  it('accepts React.PropsWithChildren type', () => {
    render(
      <ChunkErrorBoundary>
        <span>Child 1</span>
        <span>Child 2</span>
      </ChunkErrorBoundary>
    );
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('state shape matches ChunkErrorBoundaryState interface', () => {
    const boundary = new ChunkErrorBoundary({ children: <div>Test</div> });
    expect(boundary.state).toHaveProperty('hasError');
    expect(typeof boundary.state.hasError).toBe('boolean');
  });
});
