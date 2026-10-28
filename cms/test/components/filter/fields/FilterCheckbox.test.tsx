import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterCheckbox } from 'src/components/filter/fields/FilterCheckbox';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('components/filter/fields/FilterCheckbox', () => {
  it('renders checkbox with label', () => {
    const mockOnChange = vi.fn();
    
    render(<FilterCheckbox label="testLabel" checked={false} onChange={mockOnChange} />);
    
    expect(screen.getByText('testLabel')).toBeDefined();
    expect(screen.getByRole('checkbox')).toBeDefined();
  });

  it('renders checked checkbox when checked is true', () => {
    const mockOnChange = vi.fn();
    
    render(<FilterCheckbox label="testLabel" checked={true} onChange={mockOnChange} />);
    
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('renders unchecked checkbox when checked is false', () => {
    const mockOnChange = vi.fn();
    
    render(<FilterCheckbox label="testLabel" checked={false} onChange={mockOnChange} />);
    
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('calls onChange with true when unchecked checkbox is clicked', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    
    render(<FilterCheckbox label="testLabel" checked={false} onChange={mockOnChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when checked checkbox is clicked', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    
    render(<FilterCheckbox label="testLabel" checked={true} onChange={mockOnChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(mockOnChange).toHaveBeenCalledWith(false);
  });

  it('translates label using t function', () => {
    const mockOnChange = vi.fn();
    
    render(<FilterCheckbox label="filterLabel" checked={false} onChange={mockOnChange} />);
    
    // Since our mock returns the key itself, we should see the key as the label
    expect(screen.getByText('filterLabel')).toBeDefined();
  });
});
