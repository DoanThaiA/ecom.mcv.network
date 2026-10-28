import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BasicInfoSection } from 'src/sections/shock-deal/components/basic-info-section';

const mockOnNameChange = vi.fn();
const mockOnStartTimeChange = vi.fn();
const mockOnEndTimeChange = vi.fn();

const mockStartDate = new Date('2024-01-01T10:00:00');
const mockEndDate = new Date('2024-12-31T18:00:00');

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@mui/x-date-pickers/DateTimePicker', () => ({
  DateTimePicker: ({ value, onChange, disabled, slotProps, format }: any) => (
    <div data-testid="date-time-picker" data-disabled={disabled}>
      <input
        type="text"
        value={value ? value.format(format) : ''}
        onChange={(e) => {
          if (onChange) {
            // Mock dayjs object with toDate method
            const mockDayjs = {
              toDate: () => new Date(e.target.value),
              format: (fmt: string) => e.target.value,
            };
            onChange(mockDayjs);
          }
        }}
        placeholder={slotProps?.textField?.placeholder}
        disabled={disabled}
      />
    </div>
  ),
}));

vi.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  LocalizationProvider: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@mui/x-date-pickers/AdapterDayjs', () => ({
  AdapterDayjs: vi.fn(),
}));

vi.mock('dayjs', () => {
  const mockDayjs = (date?: any) => {
    const d = date ? new Date(date) : new Date();
    return {
      toDate: () => d,
      format: (fmt: string) => {
        if (fmt === 'DD/MM/YYYY HH:mm') {
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = d.getFullYear();
          const hours = String(d.getHours()).padStart(2, '0');
          const minutes = String(d.getMinutes()).padStart(2, '0');
          return `${day}/${month}/${year} ${hours}:${minutes}`;
        }
        return d.toISOString();
      },
    };
  };
  return { default: mockDayjs };
});

describe('BasicInfoSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <BasicInfoSection
        name=""
        startTime={undefined}
        endTime={undefined}
        onNameChange={mockOnNameChange}
        onStartTimeChange={mockOnStartTimeChange}
        onEndTimeChange={mockOnEndTimeChange}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders basic information title', () => {
    render(
      <BasicInfoSection
        name=""
        startTime={undefined}
        endTime={undefined}
        onNameChange={mockOnNameChange}
        onStartTimeChange={mockOnStartTimeChange}
        onEndTimeChange={mockOnEndTimeChange}
      />
    );
    expect(screen.getByText('basicInformation')).toBeInTheDocument();
  });

  it('renders program name label with required indicator', () => {
    render(
      <BasicInfoSection
        name=""
        startTime={undefined}
        endTime={undefined}
        onNameChange={mockOnNameChange}
        onStartTimeChange={mockOnStartTimeChange}
        onEndTimeChange={mockOnEndTimeChange}
      />
    );
    expect(screen.getByText('programName')).toBeInTheDocument();
  });

  it('renders name input field', () => {
    render(
      <BasicInfoSection
        name=""
        startTime={undefined}
        endTime={undefined}
        onNameChange={mockOnNameChange}
        onStartTimeChange={mockOnStartTimeChange}
        onEndTimeChange={mockOnEndTimeChange}
      />
    );
    expect(screen.getByPlaceholderText('enterProgramName')).toBeInTheDocument();
  });

  it('displays current name value', () => {
    render(
      <BasicInfoSection
        name="Test Program"
        startTime={undefined}
        endTime={undefined}
        onNameChange={mockOnNameChange}
        onStartTimeChange={mockOnStartTimeChange}
        onEndTimeChange={mockOnEndTimeChange}
      />
    );
    const input = screen.getByPlaceholderText('enterProgramName');
    expect(input).toHaveValue('Test Program');
  });

  it('calls onNameChange when name input changes', () => {
    render(
      <BasicInfoSection
        name=""
        startTime={undefined}
        endTime={undefined}
        onNameChange={mockOnNameChange}
        onStartTimeChange={mockOnStartTimeChange}
        onEndTimeChange={mockOnEndTimeChange}
      />
    );
    const input = screen.getByPlaceholderText('enterProgramName');
    fireEvent.change(input, { target: { value: 'New Program' } });
    expect(mockOnNameChange).toHaveBeenCalledWith('New Program');
  });

  it('renders apply time label with required indicator', () => {
    render(
      <BasicInfoSection
        name=""
        startTime={undefined}
        endTime={undefined}
        onNameChange={mockOnNameChange}
        onStartTimeChange={mockOnStartTimeChange}
        onEndTimeChange={mockOnEndTimeChange}
      />
    );
    expect(screen.getByText('applyTime')).toBeInTheDocument();
  });

  it('renders start time picker', () => {
    render(
      <BasicInfoSection
        name=""
        startTime={undefined}
        endTime={undefined}
        onNameChange={mockOnNameChange}
        onStartTimeChange={mockOnStartTimeChange}
        onEndTimeChange={mockOnEndTimeChange}
      />
    );
    expect(screen.getByPlaceholderText('startTime')).toBeInTheDocument();
  });

  it('renders end time picker', () => {
    render(
      <BasicInfoSection
        name=""
        startTime={undefined}
        endTime={undefined}
        onNameChange={mockOnNameChange}
        onStartTimeChange={mockOnStartTimeChange}
        onEndTimeChange={mockOnEndTimeChange}
      />
    );
    expect(screen.getByPlaceholderText('endTime')).toBeInTheDocument();
  });

  it('displays start time when provided', () => {
    render(
      <BasicInfoSection
        name=""
        startTime={mockStartDate}
        endTime={undefined}
        onNameChange={mockOnNameChange}
        onStartTimeChange={mockOnStartTimeChange}
        onEndTimeChange={mockOnEndTimeChange}
      />
    );
    const startInput = screen.getByPlaceholderText('startTime');
    expect(startInput).toHaveValue('01/01/2024 10:00');
  });

  it('displays end time when provided', () => {
    render(
      <BasicInfoSection
        name=""
        startTime={undefined}
        endTime={mockEndDate}
        onNameChange={mockOnNameChange}
        onStartTimeChange={mockOnStartTimeChange}
        onEndTimeChange={mockOnEndTimeChange}
      />
    );
    const endInput = screen.getByPlaceholderText('endTime');
    expect(endInput).toHaveValue('31/12/2024 18:00');
  });

  it('disables all inputs when disabled prop is true', () => {
    render(
      <BasicInfoSection
        name=""
        startTime={undefined}
        endTime={undefined}
        onNameChange={mockOnNameChange}
        onStartTimeChange={mockOnStartTimeChange}
        onEndTimeChange={mockOnEndTimeChange}
        disabled
      />
    );
    const nameInput = screen.getByPlaceholderText('enterProgramName');
    expect(nameInput).toBeDisabled();

    const datePickers = screen.getAllByTestId('date-time-picker');
    datePickers.forEach((picker) => {
      expect(picker).toHaveAttribute('data-disabled', 'true');
    });
  });

  it('exports BasicInfoSection function', () => {
    expect(BasicInfoSection).toBeDefined();
    expect(typeof BasicInfoSection).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof BasicInfoSection).toBe('function');
    expect(BasicInfoSection.name).toBe('BasicInfoSection');
  });

  it('renders Card component', () => {
    const { container } = render(
      <BasicInfoSection
        name=""
        startTime={undefined}
        endTime={undefined}
        onNameChange={mockOnNameChange}
        onStartTimeChange={mockOnStartTimeChange}
        onEndTimeChange={mockOnEndTimeChange}
      />
    );
    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });

  it('renders Typography components', () => {
    const { container } = render(
      <BasicInfoSection
        name=""
        startTime={undefined}
        endTime={undefined}
        onNameChange={mockOnNameChange}
        onStartTimeChange={mockOnStartTimeChange}
        onEndTimeChange={mockOnEndTimeChange}
      />
    );
    const typography = container.querySelectorAll('.MuiTypography-root');
    expect(typography.length).toBeGreaterThan(0);
  });

  it('renders TextField component', () => {
    const { container } = render(
      <BasicInfoSection
        name=""
        startTime={undefined}
        endTime={undefined}
        onNameChange={mockOnNameChange}
        onStartTimeChange={mockOnStartTimeChange}
        onEndTimeChange={mockOnEndTimeChange}
      />
    );
    const textField = container.querySelector('.MuiTextField-root');
    expect(textField).toBeInTheDocument();
  });

  it('renders Stack components', () => {
    const { container } = render(
      <BasicInfoSection
        name=""
        startTime={undefined}
        endTime={undefined}
        onNameChange={mockOnNameChange}
        onStartTimeChange={mockOnStartTimeChange}
        onEndTimeChange={mockOnEndTimeChange}
      />
    );
    const stacks = container.querySelectorAll('.MuiStack-root');
    expect(stacks.length).toBeGreaterThan(0);
  });

  it('renders date time pickers', () => {
    render(
      <BasicInfoSection
        name=""
        startTime={undefined}
        endTime={undefined}
        onNameChange={mockOnNameChange}
        onStartTimeChange={mockOnStartTimeChange}
        onEndTimeChange={mockOnEndTimeChange}
      />
    );
    const datePickers = screen.getAllByTestId('date-time-picker');
    expect(datePickers.length).toBe(2);
  });

  it('renders both start and end time pickers', () => {
    render(
      <BasicInfoSection
        name=""
        startTime={mockStartDate}
        endTime={mockEndDate}
        onNameChange={mockOnNameChange}
        onStartTimeChange={mockOnStartTimeChange}
        onEndTimeChange={mockOnEndTimeChange}
      />
    );
    expect(screen.getByPlaceholderText('startTime')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('endTime')).toBeInTheDocument();
  });

  it('handles empty name', () => {
    render(
      <BasicInfoSection
        name=""
        startTime={undefined}
        endTime={undefined}
        onNameChange={mockOnNameChange}
        onStartTimeChange={mockOnStartTimeChange}
        onEndTimeChange={mockOnEndTimeChange}
      />
    );
    const input = screen.getByPlaceholderText('enterProgramName');
    expect(input).toHaveValue('');
  });

  it('handles undefined start time', () => {
    render(
      <BasicInfoSection
        name=""
        startTime={undefined}
        endTime={undefined}
        onNameChange={mockOnNameChange}
        onStartTimeChange={mockOnStartTimeChange}
        onEndTimeChange={mockOnEndTimeChange}
      />
    );
    const startInput = screen.getByPlaceholderText('startTime');
    expect(startInput).toHaveValue('');
  });

  it('handles undefined end time', () => {
    render(
      <BasicInfoSection
        name=""
        startTime={undefined}
        endTime={undefined}
        onNameChange={mockOnNameChange}
        onStartTimeChange={mockOnStartTimeChange}
        onEndTimeChange={mockOnEndTimeChange}
      />
    );
    const endInput = screen.getByPlaceholderText('endTime');
    expect(endInput).toHaveValue('');
  });

  it('renders with all props provided', () => {
    const { container } = render(
      <BasicInfoSection
        name="Full Test"
        startTime={mockStartDate}
        endTime={mockEndDate}
        onNameChange={mockOnNameChange}
        onStartTimeChange={mockOnStartTimeChange}
        onEndTimeChange={mockOnEndTimeChange}
        disabled={false}
      />
    );
    expect(container).toBeInTheDocument();
  });
});
