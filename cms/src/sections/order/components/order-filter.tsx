import { Box, MenuItem, Select, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { OrderStatus } from 'src/types/orders';

interface OrderFilterProps {
  dateFrom: Dayjs | null;
  dateTo: Dayjs | null;
  orderNumber: string;
  status: OrderStatus | '';
  customerName: string;
  phone: string;
  onDateFromChange: (date: Dayjs | null) => void;
  onDateToChange: (date: Dayjs | null) => void;
  onOrderNumberChange: (value: string) => void;
  onStatusChange: (value: OrderStatus | '') => void;
  onCustomerNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}

const STATUS_OPTIONS: { value: OrderStatus | ''; labelKey: string }[] = [
  { value: '', labelKey: 'all' },
  { value: OrderStatus.PENDING, labelKey: 'orderStatusPending' },
  { value: OrderStatus.CONFIRMED, labelKey: 'orderStatusConfirmed' },
  { value: OrderStatus.PROCESSING, labelKey: 'orderStatusProcessing' },
  { value: OrderStatus.SHIPPED, labelKey: 'orderStatusShipped' },
  { value: OrderStatus.DELIVERED, labelKey: 'orderStatusDelivered' },
  { value: OrderStatus.CANCELLED, labelKey: 'orderStatusCancelled' },
  { value: OrderStatus.REFUNDED, labelKey: 'orderStatusRefunded' },
];

export function OrderFilter({
  dateFrom,
  dateTo,
  orderNumber,
  status,
  customerName,
  phone,
  onDateFromChange,
  onDateToChange,
  onOrderNumberChange,
  onStatusChange,
  onCustomerNameChange,
  onPhoneChange,
}: OrderFilterProps) {
  const { t } = useTranslation();

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      height: 40,
      fontSize: 14,
      backgroundColor: '#fff',
    },
    '& .MuiInputLabel-root': {
      fontSize: 14,
    },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', py: 2, px: 2 }}>
        {/* Date Range */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <DatePicker
            label={t('createdAt')}
            value={dateFrom}
            onChange={onDateFromChange}
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                size: 'small',
                sx: { ...inputSx, width: 150 },
              },
            }}
          />
          <Box sx={{ color: '#637381' }}>-</Box>
          <DatePicker
            value={dateTo}
            onChange={onDateToChange}
            format="DD/MM/YYYY"
            minDate={dateFrom || undefined}
            slotProps={{
              textField: {
                size: 'small',
                sx: { ...inputSx, width: 150 },
              },
            }}
          />
        </Box>

        {/* Order Number */}
        <TextField
          label={t('orderNumber')}
          value={orderNumber}
          onChange={(e) => onOrderNumberChange(e.target.value)}
          size="small"
          sx={{ ...inputSx, width: 150 }}
        />

        {/* Status */}
        <Select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as OrderStatus | '')}
          size="small"
          displayEmpty
          sx={{
            minWidth: 150,
            height: 40,
            fontSize: 14,
            backgroundColor: '#fff',
          }}
        >
          {STATUS_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {t(option.labelKey)}
            </MenuItem>
          ))}
        </Select>

        {/* Customer Name */}
        <TextField
          label={t('customer')}
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          size="small"
          sx={{ ...inputSx, width: 150 }}
        />

        {/* Phone */}
        <TextField
          label={t('phone')}
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          size="small"
          sx={{ ...inputSx, width: 150 }}
        />
      </Box>
    </LocalizationProvider>
  );
}

// Default date range: 6 months ago to today
export const getDefaultDateRange = () => ({
  dateFrom: dayjs().subtract(6, 'month'),
  dateTo: dayjs(),
});
