import { Card, FormControlLabel, Radio, RadioGroup, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { ProductDiscountSubType } from 'src/types/promotion';

// ----------------------------------------------------------------------

interface ClassificationSectionProps {
  value: ProductDiscountSubType;
  onChange: (value: ProductDiscountSubType) => void;
  disabled?: boolean;
}

export function ClassificationSection({
  value,
  onChange,
  disabled = false,
}: ClassificationSectionProps) {
  const { t } = useTranslation();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value) as ProductDiscountSubType);
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
        {t('classification')}
        <Typography component="span" color="error">
          *
        </Typography>
      </Typography>

      <RadioGroup row value={value} onChange={handleChange}>
        <FormControlLabel
          value={ProductDiscountSubType.PRODUCT_DISCOUNT_SUB_TYPE_AUTO_APPLY}
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
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                {t('promotionProgram')}
              </Typography>
            </Stack>
          }
        />
      </RadioGroup>
    </Card>
  );
}
