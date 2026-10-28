import { useTranslation } from 'react-i18next';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { Promotion } from 'src/types/promotion';
import { formatPrice } from 'src/utils/format';

// ----------------------------------------------------------------------

function isPercentageType(value: unknown): boolean {
  return value === 'percentage' || value === 2 || value === 'DISCOUNT_TYPE_PERCENTAGE';
}

function isPromoCodeSubType(value: unknown): boolean {
  return value === 2 || value === 'ORDER_DISCOUNT_SUB_TYPE_PROMO_CODE';
}

interface OrderDiscountInfoSectionProps {
  promotion: Promotion;
}

export function OrderDiscountInfoSection({ promotion }: OrderDiscountInfoSectionProps) {
  const { t } = useTranslation();
  const config = promotion.orderDiscountConfig;

  if (!config) return null;

  const isPromoCode = isPromoCodeSubType(config.subType);
  const isPercentage = isPercentageType(config.discountType);

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t('information')}
      </Typography>
      <Stack spacing={1.5}>
        <InfoRow label={t('discountType')} value={isPercentage ? '%' : 'VND'} />
        <InfoRow
          label={t('discountValue')}
          value={isPercentage ? `${config.discountValue}%` : formatPrice(config.discountValue)}
        />
        {isPercentage && config.maxDiscountValue !== undefined && (
          <InfoRow label={t('maxDiscountValue')} value={formatPrice(config.maxDiscountValue)} />
        )}
        <InfoRow label={t('minimumOrderValue')} value={formatPrice(config.minimumOrderValue)} />
        {isPromoCode && config.promoCode && (
          <InfoRow label={t('promoCode')} value={config.promoCode} />
        )}
        {config.totalUsageLimit !== undefined && (
          <InfoRow label={t('totalUsageLimit')} value={String(config.totalUsageLimit)} />
        )}
        <InfoRow
          label={t('singleUsePerCustomer')}
          value={config.singleUsePerCustomer ? t('yes') : t('no')}
        />
      </Stack>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Typography variant="body1">
      <strong>{label}:</strong> {value}
    </Typography>
  );
}
