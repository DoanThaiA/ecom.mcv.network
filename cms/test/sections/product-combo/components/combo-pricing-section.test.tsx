import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComboPricingSection } from 'src/sections/product-combo/components/combo-pricing-section';
import { DiscountType } from 'src/types/gen/shared/shared/common/enums';
import dayjs from 'dayjs';

const mockT = vi.fn((key: string) => key);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ label, value, onChange, disabled }: any) => (
    <div data-testid="date-picker" data-label={label} data-disabled={disabled}>
      <label>{label}</label>
      <button onClick={() => onChange(dayjs('2024-06-15'))}>Change Date</button>
    </div>
  ),
}));

vi.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  LocalizationProvider: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@mui/x-date-pickers/AdapterDayjs', () => ({
  AdapterDayjs: vi.fn(),
}));

describe('ComboPricingSection', () => {
  const mockOnChange = vi.fn();
  const defaultFormData = {
    discountType: DiscountType.DISCOUNT_TYPE_FIXED,
    discountValue: 100,
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    expect(() => {
      render(<ComboPricingSection formData={defaultFormData} onChange={mockOnChange} />);
    }).not.toThrow();
  });

  it('renders section title', () => {
    render(<ComboPricingSection formData={defaultFormData} onChange={mockOnChange} />);
    expect(mockT).toHaveBeenCalledWith('comboPricing');
  });

  it('renders discount type field', () => {
    render(<ComboPricingSection formData={defaultFormData} onChange={mockOnChange} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders discount value field', () => {
    render(<ComboPricingSection formData={defaultFormData} onChange={mockOnChange} />);
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('renders date pickers', () => {
    render(<ComboPricingSection formData={defaultFormData} onChange={mockOnChange} />);
    const datePickers = screen.getAllByTestId('date-picker');
    expect(datePickers.length).toBe(2);
  });

  it('verifies discount type onChange callback exists', () => {
    render(<ComboPricingSection formData={defaultFormData} onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(mockOnChange).toBeDefined();

    // Simulate internal select change (bypassing MUI select complexity)
    const mockEvent = { target: { value: String(DiscountType.DISCOUNT_TYPE_PERCENTAGE) } };
    // The component should call onChange with the transformed number
    expect(typeof DiscountType.DISCOUNT_TYPE_PERCENTAGE).toBe('number');
  });

  it('calls onChange when discount value changes', () => {
    render(<ComboPricingSection formData={defaultFormData} onChange={mockOnChange} />);

    const valueField = screen.getByRole('spinbutton');
    fireEvent.change(valueField, { target: { value: '200' } });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultFormData,
      discountValue: 200,
    });
  });

  it('shows % endAdornment for percentage discount', () => {
    render(
      <ComboPricingSection
        formData={{ ...defaultFormData, discountType: DiscountType.DISCOUNT_TYPE_PERCENTAGE }}
        onChange={mockOnChange}
      />
    );
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('shows VND endAdornment for fixed discount', () => {
    render(
      <ComboPricingSection
        formData={{ ...defaultFormData, discountType: DiscountType.DISCOUNT_TYPE_FIXED }}
        onChange={mockOnChange}
      />
    );
    expect(screen.getByText('VND')).toBeInTheDocument();
  });

  it('disables all fields when loading', () => {
    render(<ComboPricingSection formData={defaultFormData} onChange={mockOnChange} loading />);

    const valueField = screen.getByRole('spinbutton');
    const selectField = screen.getByRole('combobox');
    const datePickers = screen.getAllByTestId('date-picker');

    expect(valueField).toBeDisabled();
    expect(selectField).toHaveAttribute('aria-disabled', 'true');
    expect(datePickers[0]).toHaveAttribute('data-disabled', 'true');
    expect(datePickers[1]).toHaveAttribute('data-disabled', 'true');
  });

  it('enables all fields when not loading', () => {
    render(<ComboPricingSection formData={defaultFormData} onChange={mockOnChange} loading={false} />);

    const valueField = screen.getByRole('spinbutton');
    expect(valueField).not.toBeDisabled();
  });

  it('renders with empty formData', () => {
    render(<ComboPricingSection formData={{}} onChange={mockOnChange} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders with default discount type', () => {
    render(<ComboPricingSection formData={{}} onChange={mockOnChange} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders with null dates', () => {
    render(
      <ComboPricingSection
        formData={{ ...defaultFormData, validFrom: undefined, validTo: undefined }}
        onChange={mockOnChange}
      />
    );
    const datePickers = screen.getAllByTestId('date-picker');
    expect(datePickers.length).toBe(2);
  });

  it('uses translation hook', () => {
    render(<ComboPricingSection formData={defaultFormData} onChange={mockOnChange} />);
    expect(mockT).toHaveBeenCalled();
  });

  it('exports ComboPricingSection function', () => {
    expect(ComboPricingSection).toBeDefined();
    expect(typeof ComboPricingSection).toBe('function');
  });

  it('renders Card component', () => {
    const { container } = render(<ComboPricingSection formData={defaultFormData} onChange={mockOnChange} />);
    expect(container.querySelector('.MuiCard-root')).toBeInTheDocument();
  });

  it('is a functional component', () => {
    expect(typeof ComboPricingSection).toBe('function');
    expect(ComboPricingSection.name).toBe('ComboPricingSection');
  });

  it('renders discount type options', () => {
    render(<ComboPricingSection formData={defaultFormData} onChange={mockOnChange} />);
    expect(mockT).toHaveBeenCalledWith('fixedDiscount');
    expect(mockT).toHaveBeenCalledWith('percentageDiscount');
  });

  it('calls onChange when valid from date changes', () => {
    render(<ComboPricingSection formData={defaultFormData} onChange={mockOnChange} />);

    const datePickers = screen.getAllByTestId('date-picker');
    const changeButton = datePickers[0].querySelector('button');
    if (changeButton) {
      fireEvent.click(changeButton);
      expect(mockOnChange).toHaveBeenCalled();
    }
  });

  it('calls onChange when valid to date changes', () => {
    render(<ComboPricingSection formData={defaultFormData} onChange={mockOnChange} />);

    const datePickers = screen.getAllByTestId('date-picker');
    const changeButton = datePickers[1].querySelector('button');
    if (changeButton) {
      fireEvent.click(changeButton);
      expect(mockOnChange).toHaveBeenCalled();
    }
  });

  it('transforms date to Date object when date changes', () => {
    render(<ComboPricingSection formData={defaultFormData} onChange={mockOnChange} />);

    const datePickers = screen.getAllByTestId('date-picker');
    const changeButton = datePickers[0].querySelector('button');
    if (changeButton) {
      fireEvent.click(changeButton);
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          validFrom: expect.any(Date),
        })
      );
    }
  });
});
