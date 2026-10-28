import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { Promotion } from 'src/types/promotion';
import { BundleDealSubType } from 'src/types/promotion';
import { formatPrice } from 'src/utils/format';
import { TableImagePreview } from 'src/components/table-image-preview';

// ----------------------------------------------------------------------

interface ShockDealInfoSectionProps {
  promotion: Promotion;
}

export function ShockDealInfoSection({ promotion }: ShockDealInfoSectionProps) {
  const { t } = useTranslation();
  const config = promotion.bundleDealConfig;

  if (!config) return null;

  const isBuyToGetGift = config.subType === BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT;

  return (
    <Box>
      {!isBuyToGetGift && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('information')}
          </Typography>
          <Stack spacing={1.5}>
            {config.minimumOrderValue !== undefined && (
              <InfoRow
                label={t('minimumOrderValue')}
                value={formatPrice(config.minimumOrderValue)}
              />
            )}
            {config.requiredQuantity !== undefined && (
              <InfoRow
                label={t('requiredProductQuantity')}
                value={String(config.requiredQuantity)}
              />
            )}
            {config.giftQuantity !== undefined && (
              <InfoRow label={t('giftProductQuantity')} value={String(config.giftQuantity)} />
            )}
            {config.maxGiftQuantity !== undefined && (
              <InfoRow label={t('maxGiftQuantity')} value={String(config.maxGiftQuantity)} />
            )}
          </Stack>
        </Card>
      )}

      {isBuyToGetGift && config.tiers?.length > 0 && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('discountCondition')}
          </Typography>
          <TierTable tiers={config.tiers} t={t} />
        </Card>
      )}

      {!isBuyToGetGift && config.requiredProducts?.length > 0 && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('productList')}
          </Typography>
          <GiftProductTable products={config.requiredProducts} t={t} />
        </Card>
      )}

      {!isBuyToGetGift && config.giftProducts?.length > 0 && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('giftProduct')}
          </Typography>
          <GiftProductTable products={config.giftProducts} t={t} />
        </Card>
      )}
    </Box>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Typography variant="body1">
      <strong>{label}:</strong> {value}
    </Typography>
  );
}

interface TierData {
  minOrderValue: number;
  giftProducts: { productId: string; name: string; image: string }[];
}

function TierTable({ tiers, t }: { tiers: TierData[]; t: (key: string) => string }) {
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        component="table"
        sx={{
          width: '100%',
          minWidth: 600,
          borderCollapse: 'collapse',
          '& th, & td': { border: '1px solid #E5E6EB', p: 1.5 },
        }}
      >
        <Box component="thead" sx={{ bgcolor: '#F7F8FA' }}>
          <Box component="tr">
            <Box component="th" rowSpan={2} sx={{ width: 60, textAlign: 'center' }}>
              <Typography variant="body2" fontWeight={600}>
                #
              </Typography>
            </Box>
            <Box component="th" rowSpan={2} sx={{ width: 200 }}>
              <Typography variant="body2" fontWeight={600}>
                {t('discountCondition')}
              </Typography>
            </Box>
            <Box component="th" colSpan={2} sx={{ textAlign: 'center' }}>
              <Typography variant="body2" fontWeight={600}>
                {t('giftProduct')}
              </Typography>
            </Box>
          </Box>
          <Box component="tr">
            <Box component="th" sx={{ width: 80 }}>
              <Typography variant="body2" fontWeight={600}>
                {t('image')}
              </Typography>
            </Box>
            <Box component="th">
              <Typography variant="body2" fontWeight={600}>
                {t('productName')}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box component="tbody">
          {tiers.map((tier, tierIndex) => {
            const products = tier.giftProducts || [];
            const rowSpan = Math.max(products.length, 1);

            return products.length === 0 ? (
              <Box component="tr" key={tierIndex}>
                <Box component="td" sx={{ textAlign: 'center' }}>
                  <Typography variant="body2">{tierIndex + 1}</Typography>
                </Box>
                <Box component="td">
                  <Typography variant="body2">
                    {t('minOrderValue')}: {formatPrice(tier.minOrderValue)}
                  </Typography>
                </Box>
                <Box component="td" />
                <Box component="td" />
              </Box>
            ) : (
              products.map((product, pIndex) => (
                <Box component="tr" key={`${tierIndex}-${pIndex}`}>
                  {pIndex === 0 && (
                    <>
                      <Box
                        component="td"
                        rowSpan={rowSpan}
                        sx={{ textAlign: 'center', verticalAlign: 'middle' }}
                      >
                        <Typography variant="body2">{tierIndex + 1}</Typography>
                      </Box>
                      <Box component="td" rowSpan={rowSpan} sx={{ verticalAlign: 'middle' }}>
                        <Typography variant="body2">
                          {t('minOrderValue')}: {formatPrice(tier.minOrderValue)}
                        </Typography>
                      </Box>
                    </>
                  )}
                  <Box component="td" sx={{ textAlign: 'center' }}>
                    <TableImagePreview
                      src={product.image || undefined}
                      alt={product.name}
                      width={40}
                      height={40}
                    />
                  </Box>
                  <Box component="td">
                    <Typography variant="body2">{product.name}</Typography>
                  </Box>
                </Box>
              ))
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

function GiftProductTable({
  products,
  t,
}: {
  products: { productId: string; name: string; image: string }[];
  t: (key: string) => string;
}) {
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box sx={{ minWidth: 400 }}>
        <Box
          sx={{
            display: 'flex',
            bgcolor: '#F7F8FA',
            borderBottom: '2px solid #E5E6EB',
            py: 1,
            px: 1.5,
          }}
        >
          <Box sx={{ width: '10%' }}>
            <Typography variant="body2" fontWeight={600}>
              #
            </Typography>
          </Box>
          <Box sx={{ width: '15%' }}>
            <Typography variant="body2" fontWeight={600}>
              {t('image')}
            </Typography>
          </Box>
          <Box sx={{ width: '75%' }}>
            <Typography variant="body2" fontWeight={600}>
              {t('productName')}
            </Typography>
          </Box>
        </Box>
        {products.map((product, index) => (
          <Box
            key={product.productId}
            sx={{
              display: 'flex',
              borderBottom: '1px solid',
              borderColor: 'divider',
              py: 1,
              px: 1.5,
              alignItems: 'center',
              bgcolor: index % 2 === 0 ? 'white' : '#FAFBFC',
            }}
          >
            <Box sx={{ width: '10%' }}>
              <Typography variant="body2">{index + 1}</Typography>
            </Box>
            <Box sx={{ width: '15%' }}>
              <TableImagePreview
                src={product.image || undefined}
                alt={product.name}
                width={40}
                height={40}
              />
            </Box>
            <Box sx={{ width: '75%' }}>
              <Typography variant="body2">{product.name}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
