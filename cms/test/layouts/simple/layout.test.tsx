import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SimpleLayout } from 'src/layouts/simple/layout';

describe('SimpleLayout', () => {
  it('renders children', () => {
    render(
      <SimpleLayout>
        <div data-testid="child">Test Content</div>
      </SimpleLayout>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('displays children text', () => {
    render(
      <SimpleLayout>
        <div>Hello World</div>
      </SimpleLayout>
    );
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders without content prop', () => {
    render(
      <SimpleLayout>
        <div>Content</div>
      </SimpleLayout>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with empty content prop', () => {
    render(
      <SimpleLayout content={{}}>
        <div>Content</div>
      </SimpleLayout>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with compact content', () => {
    render(
      <SimpleLayout content={{ compact: true }}>
        <div data-testid="compact-child">Compact Content</div>
      </SimpleLayout>
    );
    expect(screen.getByTestId('compact-child')).toBeInTheDocument();
  });

  it('renders with non-compact content', () => {
    render(
      <SimpleLayout content={{ compact: false }}>
        <div data-testid="non-compact-child">Non-compact Content</div>
      </SimpleLayout>
    );
    expect(screen.getByTestId('non-compact-child')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <SimpleLayout>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </SimpleLayout>
    );
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('renders without errors', () => {
    expect(() => {
      render(
        <SimpleLayout>
          <div>Test</div>
        </SimpleLayout>
      );
    }).not.toThrow();
  });

  it('exports SimpleLayout as a function', () => {
    expect(SimpleLayout).toBeDefined();
    expect(typeof SimpleLayout).toBe('function');
  });

  it('renders Box container', () => {
    const { container } = render(
      <SimpleLayout>
        <div>Content</div>
      </SimpleLayout>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies minHeight style', () => {
    const { container } = render(
      <SimpleLayout>
        <div>Content</div>
      </SimpleLayout>
    );
    expect(container.firstChild).toHaveStyle({ minHeight: '100vh' });
  });

  it('applies display flex', () => {
    const { container } = render(
      <SimpleLayout>
        <div>Content</div>
      </SimpleLayout>
    );
    expect(container.firstChild).toHaveStyle({ display: 'flex' });
  });

  it('applies flexDirection column', () => {
    const { container } = render(
      <SimpleLayout>
        <div>Content</div>
      </SimpleLayout>
    );
    expect(container.firstChild).toHaveStyle({ flexDirection: 'column' });
  });

  it('handles string children', () => {
    render(<SimpleLayout>Plain text content</SimpleLayout>);
    expect(screen.getByText('Plain text content')).toBeInTheDocument();
  });

  it('handles fragment children', () => {
    render(
      <SimpleLayout>
        <>
          <div>Fragment Child 1</div>
          <div>Fragment Child 2</div>
        </>
      </SimpleLayout>
    );
    expect(screen.getByText('Fragment Child 1')).toBeInTheDocument();
    expect(screen.getByText('Fragment Child 2')).toBeInTheDocument();
  });

  it('renders nested components', () => {
    render(
      <SimpleLayout>
        <div>
          <span>Nested</span>
        </div>
      </SimpleLayout>
    );
    expect(screen.getByText('Nested')).toBeInTheDocument();
  });

  it('accepts ReactNode children', () => {
    render(
      <SimpleLayout>
        <button type="button">Button Child</button>
      </SimpleLayout>
    );
    expect(screen.getByRole('button', { name: 'Button Child' })).toBeInTheDocument();
  });

  it('renders with undefined content.compact', () => {
    render(
      <SimpleLayout content={{ compact: undefined }}>
        <div>Content</div>
      </SimpleLayout>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('component structure is correct', () => {
    const { container } = render(
      <SimpleLayout>
        <div data-testid="test-child">Test</div>
      </SimpleLayout>
    );
    const child = screen.getByTestId('test-child');
    expect(container.firstChild).toContainElement(child);
  });

  it('renders successfully with all props', () => {
    const { container } = render(
      <SimpleLayout content={{ compact: true }}>
        <div>Full Props</div>
      </SimpleLayout>
    );
    expect(container.firstChild).not.toBeNull();
  });
});
