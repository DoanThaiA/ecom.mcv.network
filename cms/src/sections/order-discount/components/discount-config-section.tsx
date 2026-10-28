import {
  Box,
  Card,
  FormControlLabel,
  InputAdornment,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { FormattedNumberInput } from 'src/components/input';
import { DiscountType, OrderDiscountSubType } from 'src/types/promotion';

// ----------------------------------------------------------------------

interface DiscountConfigSectionProps {
  subType: OrderDiscountSubType;
  promoCode: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountValue: number | undefined;
  minimumOrderValue: number;
  onPromoCodeChange: (value: string) => void;
  onDiscountTypeChange: (value: DiscountType) => void;
  onDiscountValueChange: (value: number) => void;
  onMaxDiscountValueChange: (value: number | undefined) => void;
  onMinimumOrderValueChange: (value: number) => void;
  disabled?: boolean;
}

export function DiscountConfigSection({
  subType,
  promoCode,
  discountType,
  discountValue,
  maxDiscountValue,
  minimumOrderValue,
  onPromoCodeChange,
  onDiscountTypeChange,
  onDiscountValueChange,
  onMaxDiscountValueChange,
  onMinimumOrderValueChange,
  disabled = false,
}: DiscountConfigSectionProps) {
  const { t } = useTranslation();

  const showPromoCode = subType === OrderDiscountSubType.ORDER_DISCOUNT_SUB_TYPE_PROMO_CODE;
  const isPercentageType = discountType === DiscountType.DISCOUNT_TYPE_PERCENTAGE;

  const handleDiscountTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onDiscountTypeChange(Number(event.target.value) as DiscountType);
  };

  const handlePercentageValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value) || 0;
    // For percentage, limit to 100
    if (value > 100) {
      onDiscountValueChange(100);
    } else {
      onDiscountValueChange(value);
    }
  };

  const handleDiscountValueChange = (value: number | undefined) => {
    onDiscountValueChange(value ?? 0);
  };

  const handleMaxDiscountValueChange = (value: number | undefined) => {
    onMaxDiscountValueChange(value);
  };

  const handleMinimumOrderValueChange = (value: number | undefined) => {
    onMinimumOrderValueChange(value ?? 0);
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
        {t('discountConfiguration')}
      </Typography>

      <Stack spacing={3}>
        {/* Promo Code Field - Only show for PROMO_CODE sub type */}
        {showPromoCode && (
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
              {t('promoCode')} <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder={t('enterPromoCode')}
              value={promoCode}
              onChange={(e) => onPromoCodeChange(e.target.value.toUpperCase())}
              disabled={disabled}
              inputProps={{ maxLength: 50 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                },
              }}
            />
          </Box>
        )}

        {/* Discount Type */}
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
            {t('discountType')} <span style={{ color: 'red' }}>*</span>
          </Typography>
          <RadioGroup value={discountType} onChange={handleDiscountTypeChange} row>
            <FormControlLabel
              value={DiscountType.DISCOUNT_TYPE_FIXED}
              control={<Radio />}
              label={t('fixedDiscount')}
              disabled={disabled}
            />
            <FormControlLabel
              value={DiscountType.DISCOUNT_TYPE_PERCENTAGE}
              control={<Radio />}
              label={t('percentageDiscount')}
              disabled={disabled}
            />
          </RadioGroup>
        </Box>

        {/* Discount Value and Max Discount - Horizontal layout for percentage type */}
        {isPercentageType ? (
          <Stack direction="row" spacing={2}>
            {/* Discount Value (Percentage) */}
            <Box sx={{ flex: 1 }}>
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
                {t('discountValue')} <span style={{ color: 'red' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={discountValue || ''}
                onChange={handlePercentageValueChange}
                disabled={disabled}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                inputProps={{
                  min: 0,
                  max: 100,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  },
                }}
              />
            </Box>

            {/* Max Discount Value */}
            <Box sx={{ flex: 1 }}>
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
                {t('maxDiscountValue')}
              </Typography>
              <FormattedNumberInput
                fullWidth
                size="small"
                value={maxDiscountValue}
                onChange={handleMaxDiscountValueChange}
                disabled={disabled}
                suffix="VND"
                min={0}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  },
                }}
              />
            </Box>
          </Stack>
        ) : (
          /* Discount Value (Fixed) */
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
              {t('discountValue')} <span style={{ color: 'red' }}>*</span>
            </Typography>
            <FormattedNumberInput
              fullWidth
              size="small"
              value={discountValue || undefined}
              onChange={handleDiscountValueChange}
              disabled={disabled}
              suffix="VND"
              min={0}
              allowEmpty={false}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                },
              }}
            />
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
            {t('minimumOrderValue')} <span style={{ color: 'red' }}>*</span>
          </Typography>
          <FormattedNumberInput
            fullWidth
            size="small"
            value={minimumOrderValue || undefined}
            onChange={handleMinimumOrderValueChange}
            disabled={disabled}
            suffix="VND"
            min={0}
            allowEmpty={false}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              },
            }}
          />
        </Box>
      </Stack>
    </Card>
  );
}
