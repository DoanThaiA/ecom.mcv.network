import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterRangeInput } from 'src/components/filter/fields/FilterRangeInput';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('components/filter/fields/FilterRangeInput', () => {
  it('renders from and to text fields', () => {
    const mockChange = vi.fn();
    const value = { from: undefined, to: undefined };
    
    render(<FilterRangeInput value={value} onChange={mockChange} />);
    
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBe(2);
  });

  it('displays custom placeholders', () => {
    const mockChange = vi.fn();
    const value = { from: undefined, to: undefined };
    
    render(
      <FilterRangeInput
        value={value}
        onChange={mockChange}
        placeholderFrom="minValue"
        placeholderTo="maxValue"
      />
    );
    
    expect(screen.getByPlaceholderText('minValue')).toBeDefined();
    expect(screen.getByPlaceholderText('maxValue')).toBeDefined();
  });

  it('displays default placeholders when not provided', () => {
    const mockChange = vi.fn();
    const value = { from: undefined, to: undefined };
    
    render(<FilterRangeInput value={value} onChange={mockChange} />);
    
    expect(screen.getByPlaceholderText('from')).toBeDefined();
    expect(screen.getByPlaceholderText('to')).toBeDefined();
  });

  it('displays from and to values', () => {
    const mockChange = vi.fn();
    const value = { from: 100, to: 500 };
    
    render(<FilterRangeInput value={value} onChange={mockChange} />);
    
    const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[];
    expect(inputs[0].value).toBe('100');
    expect(inputs[1].value).toBe('500');
  });

  it('calls onChange with updated from value', () => {
    const mockChange = vi.fn();
    const value = { from: undefined, to: undefined };

    render(<FilterRangeInput value={value} onChange={mockChange} />);

    const fromInput = screen.getByPlaceholderText('from') as HTMLInputElement;
    fireEvent.change(fromInput, { target: { value: '50' } });

    expect(mockChange).toHaveBeenCalledWith({ from: 50, to: undefined });
  });

  it('calls onChange with updated to value', () => {
    const mockChange = vi.fn();
    const value = { from: undefined, to: undefined };

    render(<FilterRangeInput value={value} onChange={mockChange} />);

    const toInput = screen.getByPlaceholderText('to') as HTMLInputElement;
    fireEvent.change(toInput, { target: { value: '200' } });

    expect(mockChange).toHaveBeenCalledWith({ from: undefined, to: 200 });
  });

  it('handles empty from input by setting undefined', () => {
    const mockChange = vi.fn();
    const value = { from: 100, to: 500 };

    render(<FilterRangeInput value={value} onChange={mockChange} />);

    const fromInput = screen.getByPlaceholderText('from') as HTMLInputElement;
    fireEvent.change(fromInput, { target: { value: '' } });

    expect(mockChange).toHaveBeenCalledWith({ from: undefined, to: 500 });
  });

  it('handles empty to input by setting undefined', () => {
    const mockChange = vi.fn();
    const value = { from: 100, to: 500 };

    render(<FilterRangeInput value={value} onChange={mockChange} />);

    const toInput = screen.getByPlaceholderText('to') as HTMLInputElement;
    fireEvent.change(toInput, { target: { value: '' } });

    expect(mockChange).toHaveBeenCalledWith({ from: 100, to: undefined });
  });

  it('renders type selector when provided', () => {
    const mockChange = vi.fn();
    const mockTypeChange = vi.fn();
    const value = { from: undefined, to: undefined };

    const typeSelector = {
      label: 'typeLabel',
      value: 'type1',
      options: [
        { value: 'type1', label: 'Type 1' },
        { value: 'type2', label: 'Type 2' },
      ],
      onChange: mockTypeChange,
    };

    render(<FilterRangeInput value={value} onChange={mockChange} typeSelector={typeSelector} />);

    // Multiple elements have the text (label + select label), just check at least one exists
    const labels = screen.getAllByText('typeLabel');
    expect(labels.length).toBeGreaterThan(0);
  });

  it('calls typeSelector onChange when type is changed', async () => {
    const user = userEvent.setup();
    const mockChange = vi.fn();
    const mockTypeChange = vi.fn();
    const value = { from: undefined, to: undefined };
    
    const typeSelector = {
      label: 'typeLabel',
      value: 'type1',
      options: [
        { value: 'type1', label: 'Type 1' },
        { value: 'type2', label: 'Type 2' },
      ],
      onChange: mockTypeChange,
    };
    
    render(<FilterRangeInput value={value} onChange={mockChange} typeSelector={typeSelector} />);
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    const option = screen.getByText('Type 2');
    await user.click(option);
    
    expect(mockTypeChange).toHaveBeenCalledWith('type2');
  });

  it('does not render type selector when not provided', () => {
    const mockChange = vi.fn();
    const value = { from: undefined, to: undefined };
    
    const { container } = render(<FilterRangeInput value={value} onChange={mockChange} />);
    
    const select = container.querySelector('.MuiSelect-root');
    expect(select).toBeNull();
  });

  it('displays separator between from and to inputs', () => {
    const mockChange = vi.fn();
    const value = { from: undefined, to: undefined };
    
    render(<FilterRangeInput value={value} onChange={mockChange} />);
    
    expect(screen.getByText('-')).toBeDefined();
  });

  it('sets min value to 0 for number inputs', () => {
    const mockChange = vi.fn();
    const value = { from: undefined, to: undefined };
    
    const { container } = render(<FilterRangeInput value={value} onChange={mockChange} />);
    
    const inputs = container.querySelectorAll('input[type="number"]');
    inputs.forEach((input) => {
      expect(input.getAttribute('min')).toBe('0');
    });
  });

  it('translates type selector options', async () => {
    const user = userEvent.setup();
    const mockChange = vi.fn();
    const mockTypeChange = vi.fn();
    const value = { from: undefined, to: undefined };

    const typeSelector = {
      label: 'typeLabel',
      value: 'type1',
      options: [
        { value: 'type1', label: 'option1' },
        { value: 'type2', label: 'option2' },
      ],
      onChange: mockTypeChange,
    };

    render(<FilterRangeInput value={value} onChange={mockChange} typeSelector={typeSelector} />);

    const select = screen.getByRole('combobox');
    await user.click(select);

    // Options should be translated, use getAllByText since they might appear multiple times
    const option1Elements = screen.getAllByText('option1');
    const option2Elements = screen.getAllByText('option2');
    expect(option1Elements.length).toBeGreaterThan(0);
    expect(option2Elements.length).toBeGreaterThan(0);
  });
});
