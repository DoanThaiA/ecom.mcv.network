import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterActions } from 'src/components/filter/FilterActions';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('components/filter/FilterActions', () => {
  it('renders clear and apply buttons', () => {
    const mockClear = vi.fn();
    const mockApply = vi.fn();
    
    render(<FilterActions onClear={mockClear} onApply={mockApply} />);
    
    expect(screen.getByText('clearFilter')).toBeDefined();
    expect(screen.getByText('applyFilter')).toBeDefined();
  });

  it('calls onClear when clear button is clicked', async () => {
    const user = userEvent.setup();
    const mockClear = vi.fn();
    const mockApply = vi.fn();
    
    render(<FilterActions onClear={mockClear} onApply={mockApply} />);
    
    const clearButton = screen.getByText('clearFilter');
    await user.click(clearButton);
    
    expect(mockClear).toHaveBeenCalledTimes(1);
  });

  it('calls onApply when apply button is clicked', async () => {
    const user = userEvent.setup();
    const mockClear = vi.fn();
    const mockApply = vi.fn();
    
    render(<FilterActions onClear={mockClear} onApply={mockApply} />);
    
    const applyButton = screen.getByText('applyFilter');
    await user.click(applyButton);
    
    expect(mockApply).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when loading', () => {
    const mockClear = vi.fn();
    const mockApply = vi.fn();
    
    render(<FilterActions onClear={mockClear} onApply={mockApply} loading={true} />);
    
    const clearButton = screen.getByText('clearFilter') as HTMLButtonElement;
    const applyButton = screen.getByText('applyFilter') as HTMLButtonElement;
    
    expect(clearButton.disabled).toBe(true);
    expect(applyButton.disabled).toBe(true);
  });

  it('enables buttons when not loading', () => {
    const mockClear = vi.fn();
    const mockApply = vi.fn();
    
    render(<FilterActions onClear={mockClear} onApply={mockApply} loading={false} />);
    
    const clearButton = screen.getByText('clearFilter') as HTMLButtonElement;
    const applyButton = screen.getByText('applyFilter') as HTMLButtonElement;
    
    expect(clearButton.disabled).toBe(false);
    expect(applyButton.disabled).toBe(false);
  });

  it('defaults loading to false', () => {
    const mockClear = vi.fn();
    const mockApply = vi.fn();
    
    render(<FilterActions onClear={mockClear} onApply={mockApply} />);
    
    const clearButton = screen.getByText('clearFilter') as HTMLButtonElement;
    const applyButton = screen.getByText('applyFilter') as HTMLButtonElement;
    
    expect(clearButton.disabled).toBe(false);
    expect(applyButton.disabled).toBe(false);
  });
});
