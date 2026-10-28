import { Box, Chip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { ProductExtended } from 'src/types/products';
import { formatPrice } from 'src/utils/format';

// ----------------------------------------------------------------------

const getStatusColor = (status: number) => {
  switch (status) {
    case 1: // new
      return '#0165FC';
    case 2: // selling
      return '#178B30';
    case 3: // stopped
      return '#FF9500';
    case 0: // out of stock
      return '#000000';
    default:
      return '#000000';
  }
};

const getStatusLabel = (status: number, t: any) => {
  const statusMap: Record<number, string> = {
    1: 'new',
    2: 'selling',
    3: 'stopped',
    0: 'outOfStock',
  };
  return t(statusMap[status] || 'new');
};

interface InfoRowProps {
  label: string;
  value: string | React.ReactNode;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <Box sx={{ display: 'flex', mb: 1.5, alignItems: 'flex-start' }}>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: '#000000',
          width: 160,
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        component="div"
        sx={{ color: '#000000', flex: 1, wordBreak: 'break-word' }}
      >
        {value}
      </Typography>
    </Box>
  );
}

// ----------------------------------------------------------------------

interface ProductInfoTabProps {
  product: ProductExtended;
}

export function ProductInfoTab({ product }: ProductInfoTabProps) {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* Product Info Section */}
      <Box
        sx={{
          p: 3,
          mx: 3,
          mt: 3,
          border: '1px solid #E5E6EB',
          borderRadius: 1,
          bgcolor: '#FFFFFF',
        }}
      >
        <Box sx={{ display: 'flex', gap: 4 }}>
          {/* Left Column */}
          <Box sx={{ flex: '1 1 35%', minWidth: 0 }}>
            <InfoRow label={t('product_name') + ':'} value={product.name} />
            <InfoRow label={t('product_code') + ':'} value={product.code} />
            <InfoRow label={t('category') + ':'} value={product.category?.name || '--'} />
            <InfoRow label={t('product_type') + ':'} value={product.type || '--'} />
            <InfoRow
              label={t('size') + ':'}
              value={product.attributes?.find((attr) => attr.name === 'Kích cỡ')?.value || '--'}
            />
            <InfoRow label={t('supplier') + ':'} value={product.suppliers?.name || '--'} />
            <InfoRow label={t('costPrice') + ':'} value={formatPrice(product.prices.import)} />
            <InfoRow label={t('vat_in') + ':'} value={product.vat ? `${product.vat}%` : '--'} />
            <InfoRow
              label={t('cost_price_with_vat') + ':'}
              value={
                product.prices.import && product.vat
                  ? formatPrice(product.prices.import * (1 + product.vat / 100))
                  : '--'
              }
            />
            <InfoRow label={t('avgCostPrice') + ':'} value={formatPrice(product.prices.avgCost)} />
            <InfoRow
              label={t('industry_category') + ':'}
              value={product.internalCategory?.name || '--'}
            />
          </Box>

          {/* Middle Column */}
          <Box sx={{ flex: '1 1 35%', minWidth: 0 }}>
            <InfoRow
              label={t('status') + ':'}
              value={
                <Chip
                  label={getStatusLabel(product.status, t)}
                  size="small"
                  sx={{
                    bgcolor: `${getStatusColor(product.status)}15`,
                    color: getStatusColor(product.status),
                    fontWeight: 500,
                    borderRadius: '4px',
                    border: `1px solid ${getStatusColor(product.status)}`,
                    height: 'auto',
                    padding: '2px 8px',
                    '& .MuiChip-label': {
                      padding: 0,
                      fontSize: '12px',
                    },
                  }}
                />
              }
            />
            <InfoRow label={t('barcode') + ':'} value={product.barcode || '--'} />
            <InfoRow label={t('brand') + ':'} value={product.brand?.name || '--'} />
            <InfoRow
              label={t('createdAt') + ':'}
              value={new Date(product.createdAt).toLocaleString('vi-VN')}
            />
            <InfoRow
              label={t('color') + ':'}
              value={product.attributes?.find((attr) => attr.name === 'Màu sắc')?.value || '--'}
            />
            <InfoRow
              label={t('material') + ':'}
              value={product.attributes?.find((attr) => attr.name === 'Chất liệu')?.value || '--'}
            />
            <InfoRow
              label={t('style') + ':'}
              value={product.attributes?.find((attr) => attr.name === 'Kiểu dáng')?.value || '--'}
            />
            <InfoRow label={t('sellingPrice') + ':'} value={formatPrice(product.prices.retail)} />
            <InfoRow label={t('vat_out') + ':'} value={product.vat ? `${product.vat}%` : '--'} />
            <InfoRow
              label={t('selling_price_with_vat') + ':'}
              value={
                product.prices.retail && product.vat
                  ? formatPrice(product.prices.retail * (1 + product.vat / 100))
                  : '--'
              }
            />
            <InfoRow
              label={t('wholesalePrice') + ':'}
              value={formatPrice(product.prices.wholesale)}
            />
            <InfoRow
              label={t('wholesale_price_with_vat') + ':'}
              value={
                product.prices.wholesale && product.vat
                  ? formatPrice(product.prices.wholesale * (1 + product.vat / 100))
                  : '--'
              }
            />
          </Box>

          {/* Right Column - Images */}
          <Box sx={{ flex: '0 0 200px' }}>
            {product.images?.avatar && (
              <Box
                component="img"
                src={product.images.avatar}
                alt="Product"
                sx={{
                  width: '100%',
                  height: 200,
                  objectFit: 'cover',
                  borderRadius: 1,
                  mb: 1,
                }}
              />
            )}
            {product.images?.others && product.images.others.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {product.images.others.slice(0, 4).map((img, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={img}
                    alt={`Product ${index + 1}`}
                    sx={{
                      width: 48,
                      height: 48,
                      objectFit: 'cover',
                      borderRadius: 0.5,
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
