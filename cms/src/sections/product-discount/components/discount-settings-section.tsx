import { Box, Card, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { ProductDiscountSubType } from 'src/types/promotion';

// ----------------------------------------------------------------------

interface DiscountSettingsSectionProps {
  subType: ProductDiscountSubType;
  minimumOrderValue: number;
  voucherCode: string | undefined;
  totalUsageLimit: number | undefined;
  maxUsagePerCustomer: number | undefined;
  onMinimumOrderValueChange: (value: number) => void;
  onVoucherCodeChange: (value: string) => void;
  onTotalUsageLimitChange: (value: number | undefined) => void;
  onMaxUsagePerCustomerChange: (value: number | undefined) => void;
  disabled?: boolean;
  isEditMode?: boolean;
}

export function DiscountSettingsSection({
  subType,
  minimumOrderValue,
  voucherCode,
  totalUsageLimit,
  maxUsagePerCustomer,
  onMinimumOrderValueChange,
  onVoucherCodeChange,
  onTotalUsageLimitChange,
  onMaxUsagePerCustomerChange,
  disabled = false,
  isEditMode = false,
}: DiscountSettingsSectionProps) {
  const { t } = useTranslation();
  const showVoucherCode = subType === ProductDiscountSubType.PRODUCT_DISCOUNT_SUB_TYPE_VOUCHER;

  return (
    <Card
      sx={{
        p: 3,
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        borderRadius: 2,
        mb: 3,
      }}
    >
      {/* Voucher Code (only for voucher subtype) */}
      {showVoucherCode && (
        <Box sx={{ mb: 3 }}>
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
            {t('voucherCode')} <span style={{ color: 'red' }}>*</span>
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder={t('enterVoucherCode')}
            value={voucherCode || ''}
            onChange={(e) => onVoucherCodeChange(e.target.value.toUpperCase())}
            disabled={disabled || isEditMode}
            inputProps={{ maxLength: 50 }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              },
            }}
          />
          {/* Usage Limits - below voucher code */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
              {t('totalUsageLimit')}
            </Typography>
            <TextField
              size="small"
              type="number"
              value={totalUsageLimit || ''}
              onChange={(e) =>
                onTotalUsageLimitChange(e.target.value ? Number(e.target.value) : undefined)
              }
              disabled={disabled || isEditMode}
              inputProps={{ min: 1 }}
              placeholder={t('enterQuantity')}
              sx={{
                width: 150,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                },
              }}
            />
            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
              {t('maxUsagePerCustomer')}
            </Typography>
            <TextField
              size="small"
              type="number"
              value={maxUsagePerCustomer || ''}
              onChange={(e) =>
                onMaxUsagePerCustomerChange(e.target.value ? Number(e.target.value) : undefined)
              }
              disabled={disabled || isEditMode}
              inputProps={{ min: 1 }}
              placeholder="1"
              sx={{
                width: 100,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                },
              }}
            />
          </Stack>
        </Box>
      )}

      {/* Minimum Order Value */}
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
          {t('discountCondition')}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
            {t('minOrderValue')}
          </Typography>
          <TextField
            size="small"
            type="number"
            value={minimumOrderValue || ''}
            onChange={(e) => onMinimumOrderValueChange(Number(e.target.value))}
            disabled={disabled || isEditMode}
            inputProps={{ min: 0 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">{t('currencyVND')}</InputAdornment>,
            }}
            sx={{
              width: 180,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              },
            }}
          />
        </Stack>
      </Box>
    </Card>
  );
}
