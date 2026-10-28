import {
  Box,
  Card,
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

import { BundleDealSubType } from 'src/types/promotion';

// ----------------------------------------------------------------------

interface ClassificationAndBasicInfoSectionProps {
  subType: BundleDealSubType;
  onSubTypeChange: (value: BundleDealSubType) => void;
  name: string;
  startTime: Date | undefined;
  endTime: Date | undefined;
  isEnabled: boolean;
  onNameChange: (value: string) => void;
  onStartTimeChange: (value: Date | undefined) => void;
  onEndTimeChange: (value: Date | undefined) => void;
  onIsEnabledChange: (value: boolean) => void;
  disabled?: boolean;
}

export function ClassificationAndBasicInfoSection({
  subType,
  onSubTypeChange,
  name,
  startTime,
  endTime,
  isEnabled,
  onNameChange,
  onStartTimeChange,
  onEndTimeChange,
  onIsEnabledChange,
  disabled = false,
}: ClassificationAndBasicInfoSectionProps) {
  const { t } = useTranslation();

  const handleSubTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSubTypeChange(Number(event.target.value) as BundleDealSubType);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onNameChange(event.target.value);
  };

  const handleStartTimeChange = (value: Dayjs | null) => {
    onStartTimeChange(value?.toDate());
  };

  const handleEndTimeChange = (value: Dayjs | null) => {
    onEndTimeChange(value?.toDate());
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card
        sx={{
          p: 2.5,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          borderRadius: 2,
          mb: 2,
        }}
      >
        {/* Classification Section */}
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 600,
            color: 'text.primary',
            mb: 1.5,
          }}
        >
          {t('classification')} <span style={{ color: 'red' }}>*</span>
        </Typography>

        <RadioGroup row value={subType} onChange={handleSubTypeChange}>
          <FormControlLabel
            value={BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT}
            control={
              <Radio
                disabled={disabled}
                sx={{
                  '&.Mui-checked': {
                    color: '#0165FC',
                  },
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                {t('buyToReceiveGift')}
              </Typography>
            }
          />
          <FormControlLabel
            value={BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_X_GET_Y}
            control={
              <Radio
                disabled={disabled}
                sx={{
                  '&.Mui-checked': {
                    color: '#0165FC',
                  },
                }}
              />
            }
            label={<Typography sx={{ fontSize: 14, fontWeight: 500 }}>{t('buyXGetY')}</Typography>}
          />
        </RadioGroup>

        <Divider sx={{ my: 2 }} />

        {/* Basic Info Section */}
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 600,
            color: 'text.primary',
            mb: 1.5,
          }}
        >
          {t('basicInformation')}
        </Typography>

        <Stack spacing={2}>
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
              disabled={disabled}
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
              {t('applyTime')} <span style={{ color: 'red' }}>*</span>
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
              {t('status')} <span style={{ color: 'red' }}>*</span>
            </Typography>
            <RadioGroup
              row
              value={isEnabled ? 'active' : 'inactive'}
              onChange={(e) => onIsEnabledChange(e.target.value === 'active')}
            >
              <FormControlLabel
                value="active"
                control={
                  <Radio disabled={disabled} sx={{ '&.Mui-checked': { color: '#0165FC' } }} />
                }
                label={<Typography sx={{ fontSize: 14 }}>{t('active')}</Typography>}
              />
              <FormControlLabel
                value="inactive"
                control={
                  <Radio disabled={disabled} sx={{ '&.Mui-checked': { color: '#0165FC' } }} />
                }
                label={<Typography sx={{ fontSize: 14 }}>{t('inactive')}</Typography>}
              />
            </RadioGroup>
          </Box>
        </Stack>
      </Card>
    </LocalizationProvider>
  );
}
