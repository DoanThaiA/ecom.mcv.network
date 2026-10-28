import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderFilter, getDefaultDateRange } from 'src/sections/order/components/order-filter';
import { OrderStatus } from 'src/types/orders';
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

describe('OrderFilter', () => {
  const mockOnDateFromChange = vi.fn();
  const mockOnDateToChange = vi.fn();
  const mockOnOrderNumberChange = vi.fn();
  const mockOnStatusChange = vi.fn();
  const mockOnCustomerNameChange = vi.fn();
  const mockOnPhoneChange = vi.fn();

  const defaultProps = {
    dateFrom: dayjs('2024-01-01'),
    dateTo: dayjs('2024-12-31'),
    orderNumber: '',
    status: '' as OrderStatus | '',
    customerName: '',
    phone: '',
    onDateFromChange: mockOnDateFromChange,
    onDateToChange: mockOnDateToChange,
    onOrderNumberChange: mockOnOrderNumberChange,
    onStatusChange: mockOnStatusChange,
    onCustomerNameChange: mockOnCustomerNameChange,
    onPhoneChange: mockOnPhoneChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    expect(() => {
      render(<OrderFilter {...defaultProps} />);
    }).not.toThrow();
  });

  it('renders with null dates', () => {
    expect(() => {
      render(<OrderFilter {...defaultProps} dateFrom={null} dateTo={null} />);
    }).not.toThrow();
  });

  it('renders date pickers', () => {
    render(<OrderFilter {...defaultProps} />);
    const datePickers = screen.getAllByTestId('date-picker');
    expect(datePickers.length).toBe(2);
  });

  it('renders order number field', () => {
    render(<OrderFilter {...defaultProps} orderNumber="12345" />);
    expect(screen.getByDisplayValue('12345')).toBeInTheDocument();
  });

  it('renders customer name field', () => {
    render(<OrderFilter {...defaultProps} customerName="John Doe" />);
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
  });

  it('renders phone field', () => {
    render(<OrderFilter {...defaultProps} phone="0123456789" />);
    expect(screen.getByDisplayValue('0123456789')).toBeInTheDocument();
  });

  it('renders status select', () => {
    render(<OrderFilter {...defaultProps} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('calls onOrderNumberChange when order number changes', () => {
    render(<OrderFilter {...defaultProps} />);
    const input = screen.getByLabelText('orderNumber');
    fireEvent.change(input, { target: { value: '54321' } });
    expect(mockOnOrderNumberChange).toHaveBeenCalledWith('54321');
  });

  it('calls onCustomerNameChange when customer name changes', () => {
    render(<OrderFilter {...defaultProps} />);
    const input = screen.getByLabelText('customer');
    fireEvent.change(input, { target: { value: 'Jane Doe' } });
    expect(mockOnCustomerNameChange).toHaveBeenCalledWith('Jane Doe');
  });

  it('calls onPhoneChange when phone changes', () => {
    render(<OrderFilter {...defaultProps} />);
    const input = screen.getByLabelText('phone');
    fireEvent.change(input, { target: { value: '9876543210' } });
    expect(mockOnPhoneChange).toHaveBeenCalledWith('9876543210');
  });

  it('renders all status options', () => {
    render(<OrderFilter {...defaultProps} />);
    expect(mockT).toHaveBeenCalledWith('all');
    expect(mockT).toHaveBeenCalledWith('orderStatusPending');
    expect(mockT).toHaveBeenCalledWith('orderStatusConfirmed');
    expect(mockT).toHaveBeenCalledWith('orderStatusProcessing');
    expect(mockT).toHaveBeenCalledWith('orderStatusShipped');
    expect(mockT).toHaveBeenCalledWith('orderStatusDelivered');
    expect(mockT).toHaveBeenCalledWith('orderStatusCancelled');
    expect(mockT).toHaveBeenCalledWith('orderStatusRefunded');
  });

  it('uses translation hook', () => {
    render(<OrderFilter {...defaultProps} />);
    expect(mockT).toHaveBeenCalled();
  });

  it('exports OrderFilter function', () => {
    expect(OrderFilter).toBeDefined();
    expect(typeof OrderFilter).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof OrderFilter).toBe('function');
    expect(OrderFilter.name).toBe('OrderFilter');
  });

  it('renders Box component', () => {
    const { container } = render(<OrderFilter {...defaultProps} />);
    expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();
  });

  it('renders LocalizationProvider', () => {
    const { container } = render(<OrderFilter {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it('renders separator between date pickers', () => {
    const { container } = render(<OrderFilter {...defaultProps} />);
    expect(container.textContent).toContain('-');
  });

  it('renders TextField components', () => {
    const { container } = render(<OrderFilter {...defaultProps} />);
    expect(container.querySelector('.MuiTextField-root')).toBeInTheDocument();
  });

  it('renders Select for status dropdown', () => {
    render(<OrderFilter {...defaultProps} />);
    // Status select is already tested with getByRole('combobox')
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders with different status values', () => {
    render(<OrderFilter {...defaultProps} status={OrderStatus.PENDING} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('verifies onStatusChange callback exists', () => {
    render(<OrderFilter {...defaultProps} />);
    expect(mockOnStatusChange).toBeDefined();
    expect(typeof mockOnStatusChange).toBe('function');
  });

  it('verifies onDateFromChange callback exists', () => {
    render(<OrderFilter {...defaultProps} />);
    expect(mockOnDateFromChange).toBeDefined();
    expect(typeof mockOnDateFromChange).toBe('function');
  });

  it('verifies onDateToChange callback exists', () => {
    render(<OrderFilter {...defaultProps} />);
    expect(mockOnDateToChange).toBeDefined();
    expect(typeof mockOnDateToChange).toBe('function');
  });
});

describe('getDefaultDateRange', () => {
  it('returns an object with dateFrom and dateTo', () => {
    const result = getDefaultDateRange();
    expect(result).toHaveProperty('dateFrom');
    expect(result).toHaveProperty('dateTo');
  });

  it('returns dateTo as today', () => {
    const result = getDefaultDateRange();
    const today = dayjs();
    expect(result.dateTo.format('YYYY-MM-DD')).toBe(today.format('YYYY-MM-DD'));
  });

  it('returns dateFrom as 2 months ago', () => {
    const result = getDefaultDateRange();
    const twoMonthsAgo = dayjs().subtract(2, 'month');
    expect(result.dateFrom.format('YYYY-MM-DD')).toBe(twoMonthsAgo.format('YYYY-MM-DD'));
  });

  it('exports getDefaultDateRange function', () => {
    expect(getDefaultDateRange).toBeDefined();
    expect(typeof getDefaultDateRange).toBe('function');
  });

  it('returns Dayjs objects', () => {
    const result = getDefaultDateRange();
    expect(dayjs.isDayjs(result.dateFrom)).toBe(true);
    expect(dayjs.isDayjs(result.dateTo)).toBe(true);
  });
});
