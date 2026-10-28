import { Box, Card, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { FormattedNumberInput } from 'src/components/input';
import { formatInputNumber } from 'src/utils/format';

// ----------------------------------------------------------------------

interface UsageRestrictionsSectionProps {
  notApplicableWithOtherPromotions: boolean;
  singleUsePerCustomer: boolean;
  totalUsageLimit: number | undefined;
  currentUsageCount?: number;
  onNotApplicableWithOtherChange: (value: boolean) => void;
  onSingleUsePerCustomerChange: (value: boolean) => void;
  onTotalUsageLimitChange: (value: number | undefined) => void;
  disabled?: boolean;
  mode?: 'create' | 'edit';
}

export function UsageRestrictionsSection({
  notApplicableWithOtherPromotions,
  singleUsePerCustomer,
  totalUsageLimit,
  currentUsageCount,
  onNotApplicableWithOtherChange,
  onSingleUsePerCustomerChange,
  onTotalUsageLimitChange,
  disabled = false,
  mode = 'create',
}: UsageRestrictionsSectionProps) {
  const { t } = useTranslation();

  const handleTotalUsageLimitChange = (value: number | undefined) => {
    // Ensure minimum value of 1 when set
    if (value !== undefined && value < 1) {
      onTotalUsageLimitChange(1);
    } else {
      onTotalUsageLimitChange(value);
    }
  };

  return (
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
        {t('usageRestrictions')}
      </Typography>

      <Stack spacing={2}>
        {/* Not Applicable With Other Promotions */}
        <FormControlLabel
          control={
            <Checkbox
              checked={notApplicableWithOtherPromotions}
              onChange={(e) => onNotApplicableWithOtherChange(e.target.checked)}
              disabled={disabled}
            />
          }
          label={t('notApplicableWithOther')}
          sx={{
            '& .MuiFormControlLabel-label': {
              fontSize: 14,
            },
          }}
        />

        {/* Single Use Per Customer */}
        <FormControlLabel
          control={
            <Checkbox
              checked={singleUsePerCustomer}
              onChange={(e) => onSingleUsePerCustomerChange(e.target.checked)}
              disabled={disabled}
            />
          }
          label={t('singleUsePerCustomer')}
          sx={{
            '& .MuiFormControlLabel-label': {
              fontSize: 14,
            },
          }}
        />

        {/* Total Usage Limit */}
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
            {t('totalUsageLimit')}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormattedNumberInput
              size="small"
              value={totalUsageLimit}
              onChange={handleTotalUsageLimitChange}
              disabled={disabled}
              placeholder={t('unlimited')}
              min={1}
              sx={{
                width: 200,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                },
              }}
            />
            {mode === 'edit' && currentUsageCount !== undefined && (
              <Typography variant="body2" color="text.secondary">
                {t('currentUsageCount')}: {formatInputNumber(currentUsageCount)}
              </Typography>
            )}
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}
