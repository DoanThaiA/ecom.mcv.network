import { Box, Card, MenuItem, TextField, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useTranslation } from 'react-i18next';
import type { CreateComboRequest } from 'src/types/gen/cms/cms/combos/combo';
import { DiscountType } from 'src/types/gen/shared/shared/common/enums';
import dayjs from 'dayjs';

// ----------------------------------------------------------------------

interface ComboPricingSectionProps {
  formData: Partial<CreateComboRequest>;
  onChange: (data: Partial<CreateComboRequest>) => void;
  loading?: boolean;
}

export function ComboPricingSection({
  formData,
  onChange,
  loading = false,
}: ComboPricingSectionProps) {
  const { t } = useTranslation();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card
        sx={{
          p: { xs: 2, sm: 3 },
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 600, color: 'text.primary' }}>
          {t('comboPricing')}
        </Typography>

        {/* All fields in single column for compact view */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Discount Type */}
          <TextField
            label={`${t('discountType')} *`}
            value={formData.discountType || DiscountType.DISCOUNT_TYPE_FIXED}
            onChange={(e) =>
              onChange({ ...formData, discountType: Number(e.target.value) as DiscountType })
            }
            fullWidth
            required
            select
            disabled={loading}
            size="small"
          >
            <MenuItem value={DiscountType.DISCOUNT_TYPE_FIXED}>{t('fixedDiscount')}</MenuItem>
            <MenuItem value={DiscountType.DISCOUNT_TYPE_PERCENTAGE}>
              {t('percentageDiscount')}
            </MenuItem>
          </TextField>

          {/* Discount Value */}
          <TextField
            label={`${t('discountValue')} *`}
            value={formData.discountValue || ''}
            onChange={(e) => onChange({ ...formData, discountValue: Number(e.target.value) })}
            fullWidth
            required
            type="number"
            disabled={loading}
            size="small"
            InputProps={{
              endAdornment:
                formData.discountType === DiscountType.DISCOUNT_TYPE_PERCENTAGE ? (
                  <Typography variant="body2" color="text.secondary">
                    %
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    VND
                  </Typography>
                ),
            }}
          />

          {/* Valid From */}
          <DatePicker
            label={t('validFrom')}
            value={formData.validFrom ? dayjs(formData.validFrom) : null}
            onChange={(date) =>
              onChange({ ...formData, validFrom: date ? date.toDate() : undefined })
            }
            disabled={loading}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
              },
            }}
          />

          {/* Valid To */}
          <DatePicker
            label={t('validTo')}
            value={formData.validTo ? dayjs(formData.validTo) : null}
            onChange={(date) =>
              onChange({ ...formData, validTo: date ? date.toDate() : undefined })
            }
            disabled={loading}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
              },
            }}
          />
        </Box>
      </Card>
    </LocalizationProvider>
  );
}
