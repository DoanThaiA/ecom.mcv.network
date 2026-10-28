import { Box, Card, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

interface PromotionCompatibilitySectionProps {
  notApplicableWithOtherPromotions: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function PromotionCompatibilitySection({
  notApplicableWithOtherPromotions,
  onChange,
  disabled = false,
}: PromotionCompatibilitySectionProps) {
  const { t } = useTranslation();

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
        {t('promotionCompatibility')}
      </Typography>

      <Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={notApplicableWithOtherPromotions}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
            />
          }
          label={t('notApplicableWithOtherPromotions')}
          sx={{
            '& .MuiFormControlLabel-label': {
              fontSize: 14,
            },
          }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', ml: 4, mt: 0.5 }}
        >
          {t('notApplicableWithOtherPromotionsHelper')}
        </Typography>
      </Box>
    </Card>
  );
}
