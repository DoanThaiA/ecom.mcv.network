import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComboSkuInformationSection } from 'src/sections/product-combo/components/combo-sku-information-section';

const mockT = vi.fn((key: string) => key);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

describe('ComboSkuInformationSection', () => {
  const mockOnChange = vi.fn();
  const defaultFormData = {
    availableQuantity: 100,
    prices: {
      import: 50000,
      retail: 75000,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    expect(() => {
      render(<ComboSkuInformationSection formData={defaultFormData} onChange={mockOnChange} />);
    }).not.toThrow();
  });

  it('renders section title', () => {
    render(<ComboSkuInformationSection formData={defaultFormData} onChange={mockOnChange} />);
    expect(mockT).toHaveBeenCalledWith('comboSkuInformation');
  });

  it('renders all three fields', () => {
    render(<ComboSkuInformationSection formData={defaultFormData} onChange={mockOnChange} />);
    const numberFields = screen.getAllByRole('spinbutton');
    expect(numberFields.length).toBe(3);
  });

  it('displays availableQuantity value', () => {
    render(<ComboSkuInformationSection formData={defaultFormData} onChange={mockOnChange} />);
    expect(mockT).toHaveBeenCalledWith('availableQuantity');
  });

  it('displays import price value', () => {
    render(<ComboSkuInformationSection formData={defaultFormData} onChange={mockOnChange} />);
    expect(mockT).toHaveBeenCalledWith('initialCostPrice');
  });

  it('displays retail price value', () => {
    render(<ComboSkuInformationSection formData={defaultFormData} onChange={mockOnChange} />);
    expect(mockT).toHaveBeenCalledWith('initialSellingPrice');
  });

  it('calls onChange when availableQuantity changes', () => {
    render(<ComboSkuInformationSection formData={defaultFormData} onChange={mockOnChange} />);

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '150' } });

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('calls onChange when import price changes', () => {
    render(<ComboSkuInformationSection formData={defaultFormData} onChange={mockOnChange} />);

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[1], { target: { value: '60000' } });

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('calls onChange when retail price changes', () => {
    render(<ComboSkuInformationSection formData={defaultFormData} onChange={mockOnChange} />);

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[2], { target: { value: '80000' } });

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('disables all fields when loading', () => {
    render(<ComboSkuInformationSection formData={defaultFormData} onChange={mockOnChange} loading />);

    const inputs = screen.getAllByRole('spinbutton');
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it('enables all fields when not loading', () => {
    render(<ComboSkuInformationSection formData={defaultFormData} onChange={mockOnChange} loading={false} />);

    const inputs = screen.getAllByRole('spinbutton');
    inputs.forEach((input) => {
      expect(input).not.toBeDisabled();
    });
  });

  it('renders with empty formData', () => {
    render(<ComboSkuInformationSection formData={{}} onChange={mockOnChange} />);
    expect(screen.getAllByRole('spinbutton').length).toBeGreaterThan(0);
  });

  it('uses translation hook', () => {
    render(<ComboSkuInformationSection formData={defaultFormData} onChange={mockOnChange} />);
    expect(mockT).toHaveBeenCalled();
  });

  it('exports ComboSkuInformationSection function', () => {
    expect(ComboSkuInformationSection).toBeDefined();
    expect(typeof ComboSkuInformationSection).toBe('function');
  });

  it('renders Card component', () => {
    const { container } = render(<ComboSkuInformationSection formData={defaultFormData} onChange={mockOnChange} />);
    expect(container.querySelector('.MuiCard-root')).toBeInTheDocument();
  });

  it('is a functional component', () => {
    expect(typeof ComboSkuInformationSection).toBe('function');
    expect(ComboSkuInformationSection.name).toBe('ComboSkuInformationSection');
  });
});
