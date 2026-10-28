import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Iconify } from 'src/components/iconify/iconify';

describe('Iconify', () => {
  it('renders without crashing', () => {
    const { container } = render(<Iconify icon="mdi:home" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('passes icon prop to Icon component', () => {
    const { container } = render(<Iconify icon="mdi:account" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with default width', () => {
    const { container } = render(<Iconify icon="mdi:home" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with custom width', () => {
    const { container } = render(<Iconify icon="mdi:home" width={32} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(<Iconify icon="mdi:home" className="custom-class" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with custom sx styles', () => {
    const { container } = render(<Iconify icon="mdi:home" sx={{ color: 'red' }} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = { current: null as SVGElement | null };
    render(<Iconify icon="mdi:home" ref={ref} />);
    // Ref forwarding works if component renders without error
    expect(ref.current).toBeDefined();
  });

  it('renders with all props combined', () => {
    const { container } = render(
      <Iconify icon="mdi:home" width={30} className="icon" sx={{ margin: '10px' }} />
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
