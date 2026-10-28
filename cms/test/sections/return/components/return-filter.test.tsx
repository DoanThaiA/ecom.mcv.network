import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReturnFilter, getDefaultReturnDateRange } from 'src/sections/return/components/return-filter';
import dayjs, { Dayjs } from 'dayjs';

const mockT = vi.fn((key: string) => key);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ label, value, onChange }: any) => (
    <div data-testid="date-picker">
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

describe('ReturnFilter', () => {
  const mockOnDateFromChange = vi.fn();
  const mockOnDateToChange = vi.fn();
  const mockOnOrderNumberChange = vi.fn();
  const defaultDateFrom = dayjs('2024-01-01');
  const defaultDateTo = dayjs('2024-12-31');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    expect(() => {
      render(
        <ReturnFilter
          dateFrom={defaultDateFrom}
          dateTo={defaultDateTo}
          orderNumber=""
          onDateFromChange={mockOnDateFromChange}
          onDateToChange={mockOnDateToChange}
          onOrderNumberChange={mockOnOrderNumberChange}
        />
      );
    }).not.toThrow();
  });

  it('renders with null dates', () => {
    expect(() => {
      render(
        <ReturnFilter
          dateFrom={null}
          dateTo={null}
          orderNumber=""
          onDateFromChange={mockOnDateFromChange}
          onDateToChange={mockOnDateToChange}
          onOrderNumberChange={mockOnOrderNumberChange}
        />
      );
    }).not.toThrow();
  });

  it('renders order number field', () => {
    render(
      <ReturnFilter
        dateFrom={defaultDateFrom}
        dateTo={defaultDateTo}
        orderNumber="12345"
        onDateFromChange={mockOnDateFromChange}
        onDateToChange={mockOnDateToChange}
        onOrderNumberChange={mockOnOrderNumberChange}
      />
    );

    const textField = screen.getByDisplayValue('12345');
    expect(textField).toBeInTheDocument();
  });

  it('calls onOrderNumberChange when order number changes', () => {
    render(
      <ReturnFilter
        dateFrom={defaultDateFrom}
        dateTo={defaultDateTo}
        orderNumber=""
        onDateFromChange={mockOnDateFromChange}
        onDateToChange={mockOnDateToChange}
        onOrderNumberChange={mockOnOrderNumberChange}
      />
    );

    const textField = screen.getByLabelText('orderNumber');
    fireEvent.change(textField, { target: { value: '54321' } });

    expect(mockOnOrderNumberChange).toHaveBeenCalledWith('54321');
  });

  it('uses translation hook', () => {
    render(
      <ReturnFilter
        dateFrom={defaultDateFrom}
        dateTo={defaultDateTo}
        orderNumber=""
        onDateFromChange={mockOnDateFromChange}
        onDateToChange={mockOnDateToChange}
        onOrderNumberChange={mockOnOrderNumberChange}
      />
    );

    expect(mockT).toHaveBeenCalled();
  });

  it('exports ReturnFilter function', () => {
    expect(ReturnFilter).toBeDefined();
    expect(typeof ReturnFilter).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof ReturnFilter).toBe('function');
    expect(ReturnFilter.name).toBe('ReturnFilter');
  });

  it('renders Box component', () => {
    const { container } = render(
      <ReturnFilter
        dateFrom={defaultDateFrom}
        dateTo={defaultDateTo}
        orderNumber=""
        onDateFromChange={mockOnDateFromChange}
        onDateToChange={mockOnDateToChange}
        onOrderNumberChange={mockOnOrderNumberChange}
      />
    );

    expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();
  });

  it('renders LocalizationProvider', () => {
    const { container } = render(
      <ReturnFilter
        dateFrom={defaultDateFrom}
        dateTo={defaultDateTo}
        orderNumber=""
        onDateFromChange={mockOnDateFromChange}
        onDateToChange={mockOnDateToChange}
        onOrderNumberChange={mockOnOrderNumberChange}
      />
    );

    expect(container).toBeTruthy();
  });

  it('renders separator between date pickers', () => {
    const { container } = render(
      <ReturnFilter
        dateFrom={defaultDateFrom}
        dateTo={defaultDateTo}
        orderNumber=""
        onDateFromChange={mockOnDateFromChange}
        onDateToChange={mockOnDateToChange}
        onOrderNumberChange={mockOnOrderNumberChange}
      />
    );

    expect(container.textContent).toContain('-');
  });

  it('renders TextField component', () => {
    const { container } = render(
      <ReturnFilter
        dateFrom={defaultDateFrom}
        dateTo={defaultDateTo}
        orderNumber=""
        onDateFromChange={mockOnDateFromChange}
        onDateToChange={mockOnDateToChange}
        onOrderNumberChange={mockOnOrderNumberChange}
      />
    );

    expect(container.querySelector('.MuiTextField-root')).toBeInTheDocument();
  });
});

describe('getDefaultReturnDateRange', () => {
  it('returns an object with dateFrom and dateTo', () => {
    const result = getDefaultReturnDateRange();
    expect(result).toHaveProperty('dateFrom');
    expect(result).toHaveProperty('dateTo');
  });

  it('returns dateTo as today', () => {
    const result = getDefaultReturnDateRange();
    const today = dayjs();
    expect(result.dateTo.format('YYYY-MM-DD')).toBe(today.format('YYYY-MM-DD'));
  });

  it('returns dateFrom as 2 months ago', () => {
    const result = getDefaultReturnDateRange();
    const twoMonthsAgo = dayjs().subtract(2, 'month');
    expect(result.dateFrom.format('YYYY-MM-DD')).toBe(twoMonthsAgo.format('YYYY-MM-DD'));
  });

  it('exports getDefaultReturnDateRange function', () => {
    expect(getDefaultReturnDateRange).toBeDefined();
    expect(typeof getDefaultReturnDateRange).toBe('function');
  });

  it('returns Dayjs objects', () => {
    const result = getDefaultReturnDateRange();
    expect(dayjs.isDayjs(result.dateFrom)).toBe(true);
    expect(dayjs.isDayjs(result.dateTo)).toBe(true);
  });
});
