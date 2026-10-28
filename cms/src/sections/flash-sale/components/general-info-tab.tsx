import { Box, Card, FormControlLabel, Stack, Switch, TextField, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

import type { FlashSaleFormData } from '../flash-sale-form';

// ----------------------------------------------------------------------

interface GeneralInfoTabProps {
  formData: FlashSaleFormData;
  onChange: (data: FlashSaleFormData) => void;
  loading?: boolean;
}

export function GeneralInfoTab({ formData, onChange, loading = false }: GeneralInfoTabProps) {
  const { t } = useTranslation();

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...formData, name: event.target.value });
  };

  const handleStartTimeChange = (value: Dayjs | null) => {
    onChange({ ...formData, startTime: value?.toDate() });
  };

  const handleEndTimeChange = (value: Dayjs | null) => {
    onChange({ ...formData, endTime: value?.toDate() });
  };

  const handleIsEnabledChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...formData, isEnabled: event.target.checked });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card
        sx={{
          p: 3,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          borderRadius: 2,
        }}
      >
        <Stack spacing={3}>
          {/* Program Name */}
          <Box>
            <Typography
              component="label"
              sx={{
                display: 'block',
                mb: 1,
                fontSize: 14,
                fontWeight: 500,
                color: 'text.primary',
              }}
            >
              {t('programName')} <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder={t('enterProgramName')}
              value={formData.name || ''}
              onChange={handleNameChange}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                },
              }}
            />
          </Box>

          {/* Time Range */}
          <Box>
            <Typography
              component="label"
              sx={{
                display: 'block',
                mb: 1,
                fontSize: 14,
                fontWeight: 500,
                color: 'text.primary',
              }}
            >
              {t('programTime')} <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <DateTimePicker
                value={formData.startTime ? dayjs(formData.startTime) : null}
                onChange={handleStartTimeChange}
                disabled={loading}
                format="DD/MM/YYYY HH:mm"
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    placeholder: t('startTime'),
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                      },
                    },
                  },
                }}
              />
              <Typography sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
                -
              </Typography>
              <DateTimePicker
                value={formData.endTime ? dayjs(formData.endTime) : null}
                onChange={handleEndTimeChange}
                disabled={loading}
                format="DD/MM/YYYY HH:mm"
                minDateTime={formData.startTime ? dayjs(formData.startTime) : undefined}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    placeholder: t('endTime'),
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                      },
                    },
                  },
                }}
              />
            </Stack>
          </Box>

          {/* Status */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isEnabled}
                  onChange={handleIsEnabledChange}
                  disabled={loading}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#0165FC',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#0165FC',
                    },
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'text.primary',
                  }}
                >
                  {formData.isEnabled ? t('active') : t('inactive')}
                </Typography>
              }
            />
          </Box>
        </Stack>
      </Card>
    </LocalizationProvider>
  );
}
