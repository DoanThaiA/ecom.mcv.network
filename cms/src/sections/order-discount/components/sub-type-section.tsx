import { Box, Card, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { OrderDiscountSubType } from 'src/types/promotion';

// ----------------------------------------------------------------------

interface SubTypeSectionProps {
  value: OrderDiscountSubType;
  onChange: (value: OrderDiscountSubType) => void;
  disabled?: boolean;
}

export function SubTypeSection({ value, onChange, disabled = false }: SubTypeSectionProps) {
  const { t } = useTranslation();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value) as OrderDiscountSubType);
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
        {t('orderDiscountSubType')}
      </Typography>

      <RadioGroup value={value} onChange={handleChange}>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <FormControlLabel
            value={OrderDiscountSubType.ORDER_DISCOUNT_SUB_TYPE_AUTO_APPLY}
            control={<Radio />}
            label={t('autoApply')}
            disabled={disabled}
            sx={{
              '& .MuiFormControlLabel-label': {
                fontSize: 14,
              },
            }}
          />
          <FormControlLabel
            value={OrderDiscountSubType.ORDER_DISCOUNT_SUB_TYPE_PROMO_CODE}
            control={<Radio />}
            label={t('promoCodeType')}
            disabled={disabled}
            sx={{
              '& .MuiFormControlLabel-label': {
                fontSize: 14,
              },
            }}
          />
        </Box>
      </RadioGroup>
    </Card>
  );
}
