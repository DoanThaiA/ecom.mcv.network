import {
  Card,
  Stack,
  Typography,
  Switch,
  FormControlLabel,
  IconButton,
  Select,
  MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const TRIGGER_ORDER_CREATION = 'order_creation';
const TRIGGER_ORDER_COMPLETION = 'order_completion';

interface CommissionSettingsSectionProps {
  defaultRate?: number;
  autoAddEnabled: boolean;
  commissionTrigger?: string;
  onDefaultRateChange: (rate: number) => void;
  onAutoAddChange: (enabled: boolean) => void;
  onCommissionTriggerChange?: (trigger: string) => void;
  onEditDefaultRate: () => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export function CommissionSettingsSection({
  defaultRate,
  autoAddEnabled,
  commissionTrigger,
  onDefaultRateChange,
  onAutoAddChange,
  onCommissionTriggerChange,
  onEditDefaultRate,
  disabled = false,
  readOnly = false,
}: CommissionSettingsSectionProps) {
  const { t } = useTranslation();

  const handleAutoAddChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onAutoAddChange(event.target.checked);
  };

  const handleTriggerChange = (event: SelectChangeEvent) => {
    onCommissionTriggerChange?.(event.target.value);
  };

  return (
    <Card sx={{ p: 3, mb: 3, boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 2 }}>
      <Typography sx={{ fontSize: 18, fontWeight: 600, mb: 3 }}>
        {t('commissionSettings')}
      </Typography>

      <Stack spacing={3}>
        {/* Setup Commission Subsection */}
        <Stack spacing={2}>
          <Typography sx={{ fontSize: 16, fontWeight: 500, color: 'text.secondary' }}>
            {t('setupCommission')}
          </Typography>

          {/* Default Commission Rate */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography
              component="label"
              sx={{ display: 'block', fontSize: 14, fontWeight: 500, minWidth: 200 }}
            >
              {t('defaultCommissionRate')}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography sx={{ fontSize: 14 }}>
                {defaultRate != null && defaultRate !== 0 ? `${defaultRate}%` : '--'}
              </Typography>
              {readOnly || disabled ? (
                <></>
              ) : (
                <>
                  <IconButton size="small" onClick={onEditDefaultRate} disabled={disabled}>
                    <EditIcon fontSize="small" sx={{ fontSize: 18 }} />
                  </IconButton>
                </>
              )}
            </Stack>
          </Stack>

          {/* Auto-add New Products Toggle */}
          {readOnly ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography
                sx={{ fontSize: 14, fontWeight: 500, color: 'text.secondary', minWidth: 200 }}
              >
                {t('autoAddNewProducts')}:
              </Typography>
              <Typography sx={{ fontSize: 14 }}>{autoAddEnabled ? t('on') : t('off')}</Typography>
            </Stack>
          ) : (
            <FormControlLabel
              control={
                <Switch
                  checked={autoAddEnabled}
                  onChange={handleAutoAddChange}
                  disabled={disabled}
                />
              }
              label={t('autoAddNewProducts')}
              sx={{ ml: 0 }}
            />
          )}

          {/* Commission Trigger */}
          {commissionTrigger != null && (
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography
                component="label"
                sx={{ display: 'block', fontSize: 14, fontWeight: 500, minWidth: 200 }}
              >
                {t('commissionTrigger')}
              </Typography>
              {readOnly ? (
                <Typography sx={{ fontSize: 14 }}>
                  {commissionTrigger === TRIGGER_ORDER_COMPLETION
                    ? t('orderCompletion')
                    : t('orderCreation')}
                </Typography>
              ) : (
                <Select
                  value={commissionTrigger}
                  onChange={handleTriggerChange}
                  disabled={disabled}
                  size="small"
                  sx={{ minWidth: 220 }}
                >
                  <MenuItem value={TRIGGER_ORDER_CREATION}>{t('orderCreation')}</MenuItem>
                  <MenuItem value={TRIGGER_ORDER_COMPLETION}>{t('orderCompletion')}</MenuItem>
                </Select>
              )}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
