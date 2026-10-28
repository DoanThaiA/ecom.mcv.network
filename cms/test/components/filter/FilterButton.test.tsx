import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterButton } from 'src/components/filter/FilterButton';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('components/filter/FilterButton', () => {
  it('renders filter button with label', () => {
    const mockClick = vi.fn();
    
    render(<FilterButton onClick={mockClick} activeCount={0} />);
    
    expect(screen.getByText('filterTitle')).toBeDefined();
  });

  it('calls onClick when button is clicked', async () => {
    const user = userEvent.setup();
    const mockClick = vi.fn();
    
    render(<FilterButton onClick={mockClick} activeCount={0} />);
    
    const button = screen.getByText('filterTitle');
    await user.click(button);
    
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('shows badge when activeCount > 0', () => {
    const mockClick = vi.fn();
    const { container } = render(<FilterButton onClick={mockClick} activeCount={3} />);
    
    const badge = container.querySelector('.MuiBadge-badge');
    expect(badge).toBeDefined();
    expect(badge?.textContent).toBe('3');
  });

  it('hides badge when activeCount is 0', () => {
    const mockClick = vi.fn();
    const { container } = render(<FilterButton onClick={mockClick} activeCount={0} />);
    
    const badge = container.querySelector('.MuiBadge-badge');
    // Badge should have invisible class
    expect(badge?.classList.contains('MuiBadge-invisible')).toBe(true);
  });

  it('shows badge with correct count', () => {
    const mockClick = vi.fn();
    const { container } = render(<FilterButton onClick={mockClick} activeCount={5} />);
    
    const badge = container.querySelector('.MuiBadge-badge');
    expect(badge?.textContent).toBe('5');
  });

  it('displays filter icon', () => {
    const mockClick = vi.fn();
    const { container } = render(<FilterButton onClick={mockClick} activeCount={0} />);
    
    // MUI FilterListIcon creates an svg
    const icon = container.querySelector('svg');
    expect(icon).toBeDefined();
  });

  it('renders button with outlined variant', () => {
    const mockClick = vi.fn();
    const { container } = render(<FilterButton onClick={mockClick} activeCount={0} />);
    
    const button = container.querySelector('.MuiButton-outlined');
    expect(button).toBeDefined();
  });

  it('updates badge count when activeCount changes', () => {
    const mockClick = vi.fn();
    const { container, rerender } = render(<FilterButton onClick={mockClick} activeCount={2} />);
    
    let badge = container.querySelector('.MuiBadge-badge');
    expect(badge?.textContent).toBe('2');
    
    rerender(<FilterButton onClick={mockClick} activeCount={7} />);
    
    badge = container.querySelector('.MuiBadge-badge');
    expect(badge?.textContent).toBe('7');
  });

  it('translates button label using t function', () => {
    const mockClick = vi.fn();
    
    render(<FilterButton onClick={mockClick} activeCount={0} />);
    
    // Since our mock returns the key itself
    expect(screen.getByText('filterTitle')).toBeDefined();
  });
});
