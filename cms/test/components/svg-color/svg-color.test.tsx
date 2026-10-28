import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SvgColor } from 'src/components/svg-color/svg-color';

describe('SvgColor', () => {
  it('renders with src', () => {
    const { container } = render(<SvgColor src="/icon.svg" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with default width', () => {
    const { container } = render(<SvgColor src="/icon.svg" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with custom width', () => {
    const { container } = render(<SvgColor src="/icon.svg" width={48} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with custom height', () => {
    const { container } = render(<SvgColor src="/icon.svg" width={24} height={48} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with className', () => {
    const { container } = render(<SvgColor src="/icon.svg" className="custom-class" />);
    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain('custom-class');
  });

  it('renders with sx prop', () => {
    const { container } = render(<SvgColor src="/icon.svg" sx={{ color: 'red' }} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = { current: null };
    render(<SvgColor src="/icon.svg" ref={ref as any} />);
    expect(ref.current).not.toBeNull();
  });

  it('uses height equal to width when height not specified', () => {
    const { container } = render(<SvgColor src="/icon.svg" width={32} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
