import { Card, FormControlLabel, Radio, RadioGroup, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { BundleDealSubType } from 'src/types/promotion';

// ----------------------------------------------------------------------

interface ClassificationSectionProps {
  value: BundleDealSubType;
  onChange: (value: BundleDealSubType) => void;
  disabled?: boolean;
}

export function ClassificationSection({
  value,
  onChange,
  disabled = false,
}: ClassificationSectionProps) {
  const { t } = useTranslation();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value) as BundleDealSubType);
  };

  return (
    <Card
      sx={{
        p: 2.5,
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        borderRadius: 2,
        mb: 2,
      }}
    >
      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 600,
          color: 'text.primary',
          mb: 1.5,
        }}
      >
        {t('classification')}
      </Typography>

      <RadioGroup value={value} onChange={handleChange}>
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
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                {t('buyToReceiveGift')}
              </Typography>
            </Stack>
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
          label={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{t('buyXGetY')}</Typography>
            </Stack>
          }
        />
      </RadioGroup>
    </Card>
  );
}
