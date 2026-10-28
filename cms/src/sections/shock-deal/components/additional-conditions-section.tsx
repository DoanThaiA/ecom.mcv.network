import { Box, Card, Checkbox, Divider, FormControlLabel, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { FormattedNumberInput } from 'src/components/input';

// ----------------------------------------------------------------------

interface AdditionalConditionsSectionProps {
  minimumOrderValue?: number;
  maxGiftQuantity?: number;
  onMinimumOrderValueChange: (value: number | undefined) => void;
  onMaxGiftQuantityChange: (value: number | undefined) => void;
  notApplicableWithOtherPromotions: boolean;
  onNotApplicableChange: (value: boolean) => void;
  disabled?: boolean;
  /** When true, renders without Card wrapper for inline usage */
  inline?: boolean;
}

export function AdditionalConditionsSection({
  minimumOrderValue,
  maxGiftQuantity,
  onMinimumOrderValueChange,
  onMaxGiftQuantityChange,
  notApplicableWithOtherPromotions,
  onNotApplicableChange,
  disabled = false,
  inline = false,
}: AdditionalConditionsSectionProps) {
  const { t } = useTranslation();

  // Determine checkbox states based on whether values are set
  const isMinOrderValueEnabled = minimumOrderValue !== undefined;
  const isMaxGiftQuantityEnabled = maxGiftQuantity !== undefined;

  const handleMinOrderValueCheckChange = (checked: boolean) => {
    if (checked) {
      onMinimumOrderValueChange(0);
    } else {
      onMinimumOrderValueChange(undefined);
    }
  };

  const handleMaxGiftQuantityCheckChange = (checked: boolean) => {
    if (checked) {
      onMaxGiftQuantityChange(1);
    } else {
      onMaxGiftQuantityChange(undefined);
    }
  };

  const content = (
    <>
      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 600,
          color: 'text.primary',
          mb: 1.5,
        }}
      >
        {t('additionalConditions')}
      </Typography>

      <Stack spacing={1.5}>
        {/* Minimum Order Value */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isMinOrderValueEnabled}
                onChange={(e) => handleMinOrderValueCheckChange(e.target.checked)}
                disabled={disabled}
                sx={{
                  '&.Mui-checked': {
                    color: '#0165FC',
                  },
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: 14, fontWeight: 500, minWidth: 150 }}>
                {t('invoiceValueFrom')}
              </Typography>
            }
            sx={{ mr: 0 }}
          />
          <FormattedNumberInput
            value={minimumOrderValue}
            onChange={onMinimumOrderValueChange}
            suffix="đ"
            allowEmpty={true}
            min={0}
            size="small"
            disabled={disabled || !isMinOrderValueEnabled}
            sx={{
              width: 200,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              },
            }}
          />
        </Box>

        {/* Max Gift Quantity */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isMaxGiftQuantityEnabled}
                onChange={(e) => handleMaxGiftQuantityCheckChange(e.target.checked)}
                disabled={disabled}
                sx={{
                  '&.Mui-checked': {
                    color: '#0165FC',
                  },
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: 14, fontWeight: 500, minWidth: 150 }}>
                {t('limitGiftProductQuantity')}
              </Typography>
            }
            sx={{ mr: 0 }}
          />
          <FormattedNumberInput
            value={maxGiftQuantity}
            onChange={onMaxGiftQuantityChange}
            allowEmpty={true}
            min={1}
            size="small"
            disabled={disabled || !isMaxGiftQuantityEnabled}
            sx={{
              width: 200,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              },
            }}
          />
        </Box>

        {/* Not applicable with other promotions */}
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={notApplicableWithOtherPromotions}
                onChange={(e) => onNotApplicableChange(e.target.checked)}
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
                {t('notApplicableWithOtherPromotions')}
              </Typography>
            }
          />
        </Box>
      </Stack>
    </>
  );

  if (inline) {
    return (
      <Box sx={{ mt: 2 }}>
        <Divider sx={{ mb: 2 }} />
        {content}
      </Box>
    );
  }

  return (
    <Card
      sx={{
        p: 2.5,
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        borderRadius: 2,
        mb: 2,
      }}
    >
      {content}
    </Card>
  );
}
