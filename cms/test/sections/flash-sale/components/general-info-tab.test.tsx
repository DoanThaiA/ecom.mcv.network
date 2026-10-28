import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GeneralInfoTab } from 'src/sections/flash-sale/components/general-info-tab';
import type { FlashSaleFormData } from 'src/sections/flash-sale/flash-sale-form';

const mockFormData: FlashSaleFormData = {
  name: 'Test Flash Sale',
  startTime: new Date('2024-01-01T10:00:00'),
  endTime: new Date('2024-01-31T23:59:59'),
  isEnabled: true,
  productIds: [],
};

const mockOnChange = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@mui/x-date-pickers/DateTimePicker', () => ({
  DateTimePicker: ({ value, onChange, disabled, slotProps }: any) => (
    <input
      type="text"
      value={value?.format('DD/MM/YYYY HH:mm') || ''}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      placeholder={slotProps?.textField?.placeholder}
      data-testid="datetime-picker"
    />
  ),
}));

vi.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  LocalizationProvider: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@mui/x-date-pickers/AdapterDayjs', () => ({
  AdapterDayjs: vi.fn(),
}));

describe('GeneralInfoTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <GeneralInfoTab formData={mockFormData} onChange={mockOnChange} />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders program name field', () => {
    render(<GeneralInfoTab formData={mockFormData} onChange={mockOnChange} />);
    expect(screen.getByText('programName')).toBeInTheDocument();
  });

  it('renders program time label', () => {
    render(<GeneralInfoTab formData={mockFormData} onChange={mockOnChange} />);
    expect(screen.getByText('programTime')).toBeInTheDocument();
  });

  it('displays form data name in text field', () => {
    render(<GeneralInfoTab formData={mockFormData} onChange={mockOnChange} />);
    const nameInput = screen.getByDisplayValue('Test Flash Sale');
    expect(nameInput).toBeInTheDocument();
  });

  it('handles name change', () => {
    render(<GeneralInfoTab formData={mockFormData} onChange={mockOnChange} />);
    const nameInput = screen.getByDisplayValue('Test Flash Sale');
    fireEvent.change(nameInput, { target: { value: 'Updated Flash Sale' } });
    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockFormData,
      name: 'Updated Flash Sale',
    });
  });

  it('renders status switch', () => {
    const { container } = render(
      <GeneralInfoTab formData={mockFormData} onChange={mockOnChange} />
    );
    const switchInput = container.querySelector('input[type="checkbox"]');
    expect(switchInput).toBeInTheDocument();
  });

  it('displays active status when isEnabled is true', () => {
    render(<GeneralInfoTab formData={mockFormData} onChange={mockOnChange} />);
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('displays inactive status when isEnabled is false', () => {
    const inactiveFormData = { ...mockFormData, isEnabled: false };
    render(<GeneralInfoTab formData={inactiveFormData} onChange={mockOnChange} />);
    expect(screen.getByText('inactive')).toBeInTheDocument();
  });

  it('handles status toggle', () => {
    const { container } = render(
      <GeneralInfoTab formData={mockFormData} onChange={mockOnChange} />
    );
    const switchInput = container.querySelector('input[type="checkbox"]');
    if (switchInput) {
      fireEvent.click(switchInput);
      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockFormData,
        isEnabled: false,
      });
    }
  });

  it('disables inputs when loading is true', () => {
    render(<GeneralInfoTab formData={mockFormData} onChange={mockOnChange} loading />);
    const nameInput = screen.getByDisplayValue('Test Flash Sale');
    expect(nameInput).toBeDisabled();
  });

  it('exports GeneralInfoTab function', () => {
    expect(GeneralInfoTab).toBeDefined();
    expect(typeof GeneralInfoTab).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof GeneralInfoTab).toBe('function');
    expect(GeneralInfoTab.name).toBe('GeneralInfoTab');
  });

  it('renders Card component', () => {
    const { container } = render(
      <GeneralInfoTab formData={mockFormData} onChange={mockOnChange} />
    );
    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });

  it('renders Stack components', () => {
    const { container } = render(
      <GeneralInfoTab formData={mockFormData} onChange={mockOnChange} />
    );
    const stacks = container.querySelectorAll('.MuiStack-root');
    expect(stacks.length).toBeGreaterThan(0);
  });

  it('renders TextField component', () => {
    const { container } = render(
      <GeneralInfoTab formData={mockFormData} onChange={mockOnChange} />
    );
    const textField = container.querySelector('.MuiTextField-root');
    expect(textField).toBeInTheDocument();
  });

  it('renders FormControlLabel component', () => {
    const { container } = render(
      <GeneralInfoTab formData={mockFormData} onChange={mockOnChange} />
    );
    const formControlLabel = container.querySelector('.MuiFormControlLabel-root');
    expect(formControlLabel).toBeInTheDocument();
  });

  it('renders Switch component', () => {
    const { container } = render(
      <GeneralInfoTab formData={mockFormData} onChange={mockOnChange} />
    );
    const switchComponent = container.querySelector('.MuiSwitch-root');
    expect(switchComponent).toBeInTheDocument();
  });

  it('handles empty name field', () => {
    const emptyFormData = { ...mockFormData, name: '' };
    render(<GeneralInfoTab formData={emptyFormData} onChange={mockOnChange} />);
    const nameInput = screen.getByPlaceholderText('enterProgramName');
    expect(nameInput).toHaveValue('');
  });

  it('renders required asterisk for program name', () => {
    const { container } = render(
      <GeneralInfoTab formData={mockFormData} onChange={mockOnChange} />
    );
    const asterisks = container.querySelectorAll('span[style*="color: red"]');
    expect(asterisks.length).toBeGreaterThan(0);
  });

  it('renders Typography components', () => {
    const { container } = render(
      <GeneralInfoTab formData={mockFormData} onChange={mockOnChange} />
    );
    const typographies = container.querySelectorAll('.MuiTypography-root');
    expect(typographies.length).toBeGreaterThan(0);
  });
});
