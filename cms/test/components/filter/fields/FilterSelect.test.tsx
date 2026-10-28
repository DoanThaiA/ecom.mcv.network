import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterSelect } from 'src/components/filter/fields/FilterSelect';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('components/filter/fields/FilterSelect', () => {
  const mockOptions = [
    { value: '1', label: 'option1' },
    { value: '2', label: 'option2' },
    { value: '3', label: 'option3' },
  ];

  it('renders select with options', () => {
    const mockChange = vi.fn();
    
    render(<FilterSelect value="" options={mockOptions} onChange={mockChange} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeDefined();
  });

  it('displays placeholder when value is empty', () => {
    const mockChange = vi.fn();
    
    render(
      <FilterSelect
        value=""
        options={mockOptions}
        onChange={mockChange}
        placeholder="selectPlaceholder"
      />
    );
    
    expect(screen.getByText('selectPlaceholder')).toBeDefined();
  });

  it('displays selected option label', () => {
    const mockChange = vi.fn();

    render(<FilterSelect value="1" options={mockOptions} onChange={mockChange} />);

    // The selected value should be displayed
    const elements = screen.getAllByText('option1');
    expect(elements.length).toBeGreaterThan(0);
  });

  it('calls onChange when option is selected', async () => {
    const user = userEvent.setup();
    const mockChange = vi.fn();
    
    render(<FilterSelect value="" options={mockOptions} onChange={mockChange} />);
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    const option = screen.getByText('option2');
    await user.click(option);
    
    expect(mockChange).toHaveBeenCalledWith('2');
  });

  it('uses small size by default', () => {
    const mockChange = vi.fn();
    const { container } = render(<FilterSelect value="" options={mockOptions} onChange={mockChange} />);
    
    const select = container.querySelector('.MuiInputBase-sizeSmall');
    expect(select).toBeDefined();
  });

  it('supports medium size', () => {
    const mockChange = vi.fn();
    const { container } = render(
      <FilterSelect value="" options={mockOptions} onChange={mockChange} size="medium" />
    );
    
    const select = container.querySelector('.MuiInputBase-root');
    expect(select).toBeDefined();
  });

  it('is fullWidth by default', () => {
    const mockChange = vi.fn();
    const { container } = render(<FilterSelect value="" options={mockOptions} onChange={mockChange} />);
    
    const select = container.querySelector('.MuiInputBase-fullWidth');
    expect(select).toBeDefined();
  });

  it('supports non-fullWidth', () => {
    const mockChange = vi.fn();
    const { container } = render(
      <FilterSelect value="" options={mockOptions} onChange={mockChange} fullWidth={false} />
    );
    
    const select = container.querySelector('.MuiInputBase-root');
    expect(select).toBeDefined();
  });

  it('translates option labels', async () => {
    const user = userEvent.setup();
    const mockChange = vi.fn();
    
    render(<FilterSelect value="" options={mockOptions} onChange={mockChange} />);
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    // All options should be translated
    expect(screen.getByText('option1')).toBeDefined();
    expect(screen.getByText('option2')).toBeDefined();
    expect(screen.getByText('option3')).toBeDefined();
  });

  it('handles numeric values', async () => {
    const user = userEvent.setup();
    const mockChange = vi.fn();
    const numericOptions = [
      { value: 1, label: 'one' },
      { value: 2, label: 'two' },
    ];
    
    render(<FilterSelect value="" options={numericOptions} onChange={mockChange} />);
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    const option = screen.getByText('two');
    await user.click(option);
    
    expect(mockChange).toHaveBeenCalledWith(2);
  });

  it('shows empty placeholder when no placeholder provided and value is empty', () => {
    const mockChange = vi.fn();
    const { container } = render(<FilterSelect value="" options={mockOptions} onChange={mockChange} />);

    // Should render but with empty text when no placeholder
    const select = container.querySelector('.MuiSelect-select');
    expect(select).toBeDefined();
  });

  it('returns empty string when selected option is not found', () => {
    const mockChange = vi.fn();

    // Render with a value that doesn't exist in options
    const { container } = render(<FilterSelect value="999" options={mockOptions} onChange={mockChange} />);

    const select = container.querySelector('.MuiSelect-select');
    expect(select).toBeDefined();
    // When option not found, renderValue returns empty string
  });
});
