import { Box, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

interface ReturnFilterProps {
  dateFrom: Dayjs | null;
  dateTo: Dayjs | null;
  orderNumber: string;
  onDateFromChange: (date: Dayjs | null) => void;
  onDateToChange: (date: Dayjs | null) => void;
  onOrderNumberChange: (value: string) => void;
}

export function ReturnFilter({
  dateFrom,
  dateTo,
  orderNumber,
  onDateFromChange,
  onDateToChange,
  onOrderNumberChange,
}: ReturnFilterProps) {
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
      </Box>
    </LocalizationProvider>
  );
}

// Default date range: 2 months ago to today
export const getDefaultReturnDateRange = () => ({
  dateFrom: dayjs().subtract(2, 'month'),
  dateTo: dayjs(),
});
