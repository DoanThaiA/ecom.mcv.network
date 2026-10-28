import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import type { Promotion } from 'src/types/promotion';
import { formatPrice } from 'src/utils/format';
import { TableImagePreview } from 'src/components/table-image-preview';
import { TablePagination } from 'src/components/table';
import { promotionRepository } from 'src/repositories/promotion.repository';

// ----------------------------------------------------------------------

function isVoucherSubType(value: unknown): boolean {
  return value === 2 || value === 'PRODUCT_DISCOUNT_SUB_TYPE_VOUCHER';
}

function isPercentageDiscountType(value: unknown): boolean {
  return value === 'percentage' || value === 2 || value === 'DISCOUNT_TYPE_PERCENTAGE';
}

interface ProductRow {
  productId: string;
  code: string;
  name: string;
  image: string;
  originalPrice: number;
  discountType: unknown;
  discountValue: number;
  discountedPrice: number;
}

interface ProductDiscountInfoSectionProps {
  promotion: Promotion;
  promotionId: string;
}

export function ProductDiscountInfoSection({
  promotion,
  promotionId,
}: ProductDiscountInfoSectionProps) {
  const { t } = useTranslation();
  const config = promotion.productDiscountConfig;

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(
    async (page: number, limit: number) => {
      setLoading(true);
      try {
        const result = await promotionRepository.getPromotionProducts(promotionId, {
          page,
          limit,
        });
        setProducts(
          (result.docs || []).map((p: any) => ({
            productId: p.productId,
            code: p.code || '',
            name: p.name || '',
            image: p.images?.avatar ?? '',
            originalPrice: p.originalPrice || 0,
            discountType: p.discountType,
            discountValue: p.discountValue || 0,
            discountedPrice: p.discountedPrice || 0,
          }))
        );
        setTotalDocs(result.totalDocs);
        setTotalPages(result.totalPages);
      } finally {
        setLoading(false);
      }
    },
    [promotionId]
  );

  useEffect(() => {
    fetchProducts(1, 10);
  }, [fetchProducts]);

  if (!config) return null;

  const isVoucher = isVoucherSubType(config.subType);

  return (
    <Box>
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('information')}
        </Typography>
        <Stack spacing={1.5}>
          <InfoRow label={t('minimumOrderValue')} value={formatPrice(config.minimumOrderValue)} />
          {isVoucher && config.voucherCode && (
            <InfoRow label={t('voucherCode')} value={config.voucherCode} />
          )}
          {config.totalUsageLimit !== undefined && (
            <InfoRow label={t('totalUsageLimit')} value={String(config.totalUsageLimit)} />
          )}
          {config.maxUsagePerCustomer !== undefined && (
            <InfoRow label={t('maxUsagePerCustomer')} value={String(config.maxUsagePerCustomer)} />
          )}
        </Stack>
      </Card>

      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('productList')} ({totalDocs})
        </Typography>

        {loading && products.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            <Box sx={{ overflowX: 'auto' }}>
              <Box sx={{ minWidth: 700 }}>
                <ProductHeader t={t} />
                {products.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">{t('noData')}</Typography>
                  </Box>
                ) : (
                  products.map((product, index) => (
                    <Box
                      key={product.productId}
                      sx={{
                        display: 'flex',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        py: 1,
                        px: 1.5,
                        bgcolor: index % 2 === 0 ? 'white' : '#FAFBFC',
                        '&:hover': { bgcolor: '#F5F7FA' },
                      }}
                    >
                      <Col width="5%" align="center">
                        <Typography variant="body2">
                          {(currentPage - 1) * pageSize + index + 1}
                        </Typography>
                      </Col>
                      <Col width="12%">
                        <Typography variant="body2">{product.code}</Typography>
                      </Col>
                      <Col width="7%">
                        <TableImagePreview
                          src={product.image || undefined}
                          alt={product.name}
                          width={40}
                          height={40}
                        />
                      </Col>
                      <Col width="26%">
                        <Typography variant="body2" noWrap title={product.name}>
                          {product.name}
                        </Typography>
                      </Col>
                      <Col width="15%" align="right">
                        <Typography variant="body2">
                          {formatPrice(product.originalPrice)}
                        </Typography>
                      </Col>
                      <Col width="15%" align="right">
                        <Typography variant="body2">
                          {isPercentageDiscountType(product.discountType)
                            ? `${product.discountValue}%`
                            : formatPrice(product.discountValue)}
                        </Typography>
                      </Col>
                      <Col width="20%" align="right">
                        <Typography variant="body2">
                          {formatPrice(product.discountedPrice)}
                        </Typography>
                      </Col>
                    </Box>
                  ))
                )}
              </Box>
            </Box>

            <TablePagination
              totalItems={totalDocs}
              currentPage={currentPage}
              pageSize={pageSize}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                fetchProducts(page, pageSize);
              }}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
                fetchProducts(1, size);
              }}
            />
          </>
        )}
      </Card>
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

function Col({
  width,
  align,
  children,
}: {
  width: string;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        width,
        display: 'flex',
        alignItems: 'center',
        justifyContent:
          align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
      }}
    >
      {children}
    </Box>
  );
}

function ProductHeader({ t }: { t: (key: string) => string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        bgcolor: '#F7F8FA',
        borderBottom: '2px solid #E5E6EB',
        py: 1,
        px: 1.5,
      }}
    >
      <Box sx={{ width: '5%' }}>
        <Typography variant="body2" fontWeight={600}>
          #
        </Typography>
      </Box>
      <Box sx={{ width: '12%' }}>
        <Typography variant="body2" fontWeight={600}>
          {t('productCode')}
        </Typography>
      </Box>
      <Box sx={{ width: '7%' }}>
        <Typography variant="body2" fontWeight={600}>
          {t('image')}
        </Typography>
      </Box>
      <Box sx={{ width: '26%' }}>
        <Typography variant="body2" fontWeight={600}>
          {t('productName')}
        </Typography>
      </Box>
      <Box sx={{ width: '15%', textAlign: 'right' }}>
        <Typography variant="body2" fontWeight={600}>
          {t('sellingPrice')}
        </Typography>
      </Box>
      <Box sx={{ width: '15%', textAlign: 'right' }}>
        <Typography variant="body2" fontWeight={600}>
          {t('discountAmount')}
        </Typography>
      </Box>
      <Box sx={{ width: '20%', textAlign: 'right' }}>
        <Typography variant="body2" fontWeight={600}>
          {t('discountedPrice')}
        </Typography>
      </Box>
    </Box>
  );
}
