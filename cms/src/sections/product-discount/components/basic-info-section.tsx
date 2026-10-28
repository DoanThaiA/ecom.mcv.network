import { Box, Card, FormControlLabel, Stack, Switch, TextField, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

interface BasicInfoSectionProps {
  name: string;
  startTime: Date | undefined;
  endTime: Date | undefined;
  isEnabled: boolean;
  onNameChange: (value: string) => void;
  onStartTimeChange: (value: Date | undefined) => void;
  onEndTimeChange: (value: Date | undefined) => void;
  onEnabledChange: (value: boolean) => void;
  disabled?: boolean;
  isEditMode?: boolean;
}

export function BasicInfoSection({
  name,
  startTime,
  endTime,
  isEnabled,
  onNameChange,
  onStartTimeChange,
  onEndTimeChange,
  onEnabledChange,
  disabled = false,
  isEditMode = false,
}: BasicInfoSectionProps) {
  const { t } = useTranslation();

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onNameChange(event.target.value);
  };

  const handleStartTimeChange = (value: Dayjs | null) => {
    onStartTimeChange(value?.toDate());
  };

  const handleEndTimeChange = (value: Dayjs | null) => {
    onEndTimeChange(value?.toDate());
  };

  const handleEnabledChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onEnabledChange(event.target.checked);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card
        sx={{
          p: 3,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          borderRadius: 2,
          mb: 3,
        }}
      >
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 600,
            color: 'text.primary',
            mb: 2,
          }}
        >
          {t('basicInformation')}
        </Typography>

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
              value={name}
              onChange={handleNameChange}
              disabled={disabled || isEditMode}
              inputProps={{ maxLength: 100 }}
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
                value={startTime ? dayjs(startTime) : null}
                onChange={handleStartTimeChange}
                disabled={disabled}
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
                value={endTime ? dayjs(endTime) : null}
                onChange={handleEndTimeChange}
                disabled={disabled}
                format="DD/MM/YYYY HH:mm"
                minDateTime={startTime ? dayjs(startTime) : undefined}
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
                  checked={isEnabled}
                  onChange={handleEnabledChange}
                  disabled={disabled}
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
                  {isEnabled ? t('active') : t('inactive')}
                </Typography>
              }
            />
          </Box>
        </Stack>
      </Card>
    </LocalizationProvider>
  );
}
