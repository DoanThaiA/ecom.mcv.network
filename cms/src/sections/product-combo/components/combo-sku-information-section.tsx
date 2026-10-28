import { Box, Card, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { ProductPrices } from 'src/types/gen/shared/shared/products/product';

// Local interface for combo SKU information
interface ComboSkuInfo {
  availableQuantity?: number;
  prices?: ProductPrices;
}

// ----------------------------------------------------------------------

interface ComboSkuInformationSectionProps {
  formData: Partial<ComboSkuInfo>;
  onChange: (data: Partial<ComboSkuInfo>) => void;
  loading?: boolean;
}

export function ComboSkuInformationSection({
  formData,
  onChange,
  loading = false,
}: ComboSkuInformationSectionProps) {
  const { t } = useTranslation();

  return (
    <Card
      sx={{
        p: { xs: 2, sm: 3 },
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 600, color: 'text.primary' }}>
        {t('comboSkuInformation')}
      </Typography>

      {/* All fields in single column for compact view */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label={t('availableQuantity')}
          value={formData.availableQuantity || ''}
          onChange={(e) => onChange({ ...formData, availableQuantity: Number(e.target.value) })}
          fullWidth
          type="number"
          disabled={loading}
          size="small"
        />
        <TextField
          label={`${t('initialCostPrice')} *`}
          value={formData.prices?.import || ''}
          onChange={(e) =>
            onChange({
              ...formData,
              prices: {
                ...formData.prices,
                retail: formData.prices?.retail || 0,
                import: Number(e.target.value),
              },
            })
          }
          fullWidth
          required
          type="number"
          disabled={loading}
          size="small"
        />
        <TextField
          label={t('initialSellingPrice')}
          value={formData.prices?.retail || ''}
          onChange={(e) =>
            onChange({
              ...formData,
              prices: { ...formData.prices, retail: Number(e.target.value) },
            })
          }
          fullWidth
          type="number"
          disabled={loading}
          size="small"
        />
      </Box>
    </Card>
  );
}
