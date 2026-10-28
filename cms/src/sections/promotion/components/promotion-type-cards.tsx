import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

// ----------------------------------------------------------------------

interface PromotionTypeCard {
  titleKey: string;
  descriptionKey: string;
  path: string;
  disabled: boolean;
}

const PROMOTION_TYPES: PromotionTypeCard[] = [
  {
    titleKey: 'productDiscount',
    descriptionKey: 'productDiscountDesc',
    path: '/product-discount/create',
    disabled: false,
  },
  {
    titleKey: 'invoiceDiscount',
    descriptionKey: 'invoiceDiscountDesc',
    path: '/order-discount/create',
    disabled: false,
  },
  {
    titleKey: 'comboPromotion',
    descriptionKey: 'comboPromotionDesc',
    path: '/combo-promotion/create',
    disabled: true,
  },
  {
    titleKey: 'shockDeal',
    descriptionKey: 'shockDealDesc',
    path: '/shock-deal/create',
    disabled: false,
  },
];

// ----------------------------------------------------------------------

export function PromotionTypeCards() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t('createPromotion')}
      </Typography>

      <Grid container spacing={2}>
        {PROMOTION_TYPES.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.titleKey}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
              }}
            >
              <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {t(card.titleKey)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  {t(card.descriptionKey)}
                </Typography>
              </CardContent>

              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant="contained"
                  size="small"
                  disabled={card.disabled}
                  onClick={() => navigate(card.path)}
                  sx={{
                    minWidth: 80,
                    ...(card.disabled && {
                      bgcolor: 'grey.300',
                      color: 'grey.600',
                    }),
                  }}
                >
                  {t('create')}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
