import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { MenuButton } from 'src/layouts/components/menu-button';

describe('MenuButton', () => {
  it('renders without crashing', () => {
    const { container } = render(<MenuButton />);
    expect(container).toBeInTheDocument();
  });

  it('renders IconButton', () => {
    const { container } = render(<MenuButton />);
    expect(container.querySelector('.MuiIconButton-root')).toBeInTheDocument();
  });

  it('renders SvgIcon with paths', () => {
    const { container } = render(<MenuButton />);
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBe(3);
  });

  it('applies custom sx styles', () => {
    const { container } = render(<MenuButton sx={{ color: 'red' }} />);
    expect(container.querySelector('.MuiIconButton-root')).toBeInTheDocument();
  });

  it('handles onClick event', () => {
    const handleClick = vi.fn();
    const { container } = render(<MenuButton onClick={handleClick} />);
    const button = container.querySelector('.MuiIconButton-root');
    if (button) fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('forwards other IconButton props', () => {
    const { container } = render(<MenuButton disabled />);
    const button = container.querySelector('.MuiIconButton-root');
    expect(button).toBeDisabled();
  });

  it('renders all three menu lines', () => {
    const { container } = render(<MenuButton />);
    const paths = container.querySelectorAll('path');
    expect(paths[0]).toHaveAttribute('opacity', '0.32');
    expect(paths[1]).toHaveAttribute('fill', 'currentColor');
    expect(paths[2]).toHaveAttribute('fill', 'currentColor');
  });

  it('uses currentColor fill', () => {
    const { container } = render(<MenuButton />);
    const paths = container.querySelectorAll('path');
    paths.forEach(path => {
      expect(path).toHaveAttribute('fill', 'currentColor');
    });
  });
});
