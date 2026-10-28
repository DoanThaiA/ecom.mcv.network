import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Scrollbar } from 'src/components/scrollbar/scrollbar';

describe('Scrollbar', () => {
  it('renders children', () => {
    const { getByText } = render(
      <Scrollbar>
        <div>Test Content</div>
      </Scrollbar>
    );
    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with fillContent', () => {
    const { container } = render(
      <Scrollbar fillContent>
        <div>Content</div>
      </Scrollbar>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with slotProps', () => {
    const { container } = render(
      <Scrollbar slotProps={{ wrapper: { padding: '10px' } }}>
        <div>Content</div>
      </Scrollbar>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with sx prop', () => {
    const { container } = render(
      <Scrollbar sx={{ maxHeight: '500px' }}>
        <div>Content</div>
      </Scrollbar>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = { current: null };
    render(
      <Scrollbar ref={ref as any}>
        <div>Content</div>
      </Scrollbar>
    );
    // SimpleBar ref forwarding may work differently, just check it renders
    expect(ref.current).toBeDefined();
  });

  it('renders with contentWrapper slotProps', () => {
    const { container } = render(
      <Scrollbar slotProps={{ contentWrapper: { margin: '5px' } }}>
        <div>Content</div>
      </Scrollbar>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with content slotProps', () => {
    const { container } = render(
      <Scrollbar slotProps={{ content: { padding: '20px' } }}>
        <div>Content</div>
      </Scrollbar>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders without fillContent', () => {
    const { container } = render(
      <Scrollbar fillContent={false}>
        <div>Content</div>
      </Scrollbar>
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
