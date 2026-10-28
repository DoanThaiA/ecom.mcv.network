import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs, { Dayjs } from 'dayjs';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { TablePagination } from 'src/components/table';
import { TableImagePreview } from 'src/components/table-image-preview';
import { promotionRepository } from 'src/repositories/promotion.repository';
import type {
  BundleDealGiftProductStatsRow,
  BundleDealProductStatsResponse,
} from 'src/types/gen/cms/cms/promotions/promotion';
import { formatPrice } from 'src/utils/format';

// ----------------------------------------------------------------------

interface ShockDealProductsTabProps {
  promotionId: string;
}

export function ShockDealProductsTab({ promotionId }: ShockDealProductsTabProps) {
  const { t } = useTranslation();

  const [data, setData] = useState<BundleDealProductStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(dayjs().subtract(2, 'month'));
  const [dateTo, setDateTo] = useState<Dayjs | null>(dayjs());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await promotionRepository.getPromotionProductStats(promotionId, {
        page: currentPage,
        limit: pageSize,
        fromDate: dateFrom?.startOf('day').toISOString(),
        toDate: dateTo?.endOf('day').toISOString(),
      });
      setData(res as BundleDealProductStatsResponse);
    } finally {
      setLoading(false);
    }
  }, [promotionId, currentPage, pageSize, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columnWidths = {
    index: '5%',
    code: '14%',
    image: '8%',
    name: '27%',
    sellingPrice: '15%',
    quantityGifted: '15%',
    giftValue: '16%',
  };

  const headers = [
    { key: 'index', label: '#', align: 'center' as const },
    { key: 'code', label: t('productCode'), align: 'left' as const },
    { key: 'image', label: t('image'), align: 'left' as const },
    { key: 'name', label: t('productName'), align: 'left' as const },
    { key: 'sellingPrice', label: t('sellingPrice'), align: 'right' as const },
    { key: 'quantityGifted', label: t('quantityGifted'), align: 'center' as const },
    { key: 'giftValue', label: t('giftTotalValue'), align: 'right' as const },
  ];

  const getColStyle = (key: string, isLast = false) => ({
    width: columnWidths[key as keyof typeof columnWidths] ?? '10%',
    borderRight: isLast ? 'none' : '1px solid #E5E6EB',
  });

  const summary = data?.summary;

  return (
    <Box>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Card sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" fontWeight={600}>
              {t('dateRangeFilter')}:
            </Typography>
            <DatePicker
              value={dateFrom}
              onChange={(d) => {
                setDateFrom(d as Dayjs | null);
                setCurrentPage(1);
              }}
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
            />
            <Typography variant="body2">-</Typography>
            <DatePicker
              value={dateTo}
              onChange={(d) => {
                setDateTo(d as Dayjs | null);
                setCurrentPage(1);
              }}
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
            />
          </Stack>
        </Card>
      </LocalizationProvider>

      <Card sx={{ overflow: 'auto' }}>
        <Box sx={{ minWidth: 700 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', bgcolor: '#F7F8FA', borderBottom: '2px solid #E5E6EB' }}>
            {headers.map((h, i) => (
              <Box
                key={h.key}
                sx={{
                  ...getColStyle(h.key, i === headers.length - 1),
                  p: 1.5,
                  fontWeight: 600,
                  fontSize: 14,
                  color: '#1C252E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent:
                    h.align === 'center'
                      ? 'center'
                      : h.align === 'right'
                        ? 'flex-end'
                        : 'flex-start',
                }}
              >
                {h.label}
              </Box>
            ))}
          </Box>

          {/* Summary */}
          {summary && (
            <Box sx={{ display: 'flex', bgcolor: '#F0F4F8', borderBottom: '1px solid #E5E6EB' }}>
              <Box sx={{ ...getColStyle('index'), p: 1.5 }}>
                <Typography variant="body2" fontWeight={600}>
                  {t('total')}
                </Typography>
              </Box>
              <Box sx={{ ...getColStyle('code') }} />
              <Box sx={{ ...getColStyle('image') }} />
              <Box sx={{ ...getColStyle('name') }} />
              <Box sx={{ ...getColStyle('sellingPrice') }} />
              <Box
                sx={{
                  ...getColStyle('quantityGifted'),
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {summary.totalQuantity}
                </Typography>
              </Box>
              <Box
                sx={{
                  ...getColStyle('giftValue', true),
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}
              >
                <Typography variant="body2" fontWeight={600} sx={{ color: '#F62E2E' }}>
                  {formatPrice(summary.totalGiftValue ?? 0)}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Body */}
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : !data?.docs.length ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">{t('noData')}</Typography>
            </Box>
          ) : (
            data.docs.map((row, index) => (
              <Box
                key={row.productId}
                sx={{
                  display: 'flex',
                  bgcolor: index % 2 === 0 ? 'white' : '#FAFBFC',
                  borderBottom: '1px solid #F0F1F3',
                  minHeight: 48,
                  '&:hover': { bgcolor: '#F5F7FA' },
                }}
              >
                <Box
                  sx={{
                    ...getColStyle('index'),
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="body2">
                    {(currentPage - 1) * pageSize + index + 1}
                  </Typography>
                </Box>
                <Box sx={{ ...getColStyle('code'), p: 1.5, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2">{row.code}</Typography>
                </Box>
                <Box
                  sx={{ ...getColStyle('image'), p: 1.5, display: 'flex', alignItems: 'center' }}
                >
                  <TableImagePreview
                    src={row.image ?? undefined}
                    alt={row.name}
                    width={40}
                    height={40}
                  />
                </Box>
                <Box
                  sx={{
                    ...getColStyle('name'),
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <Typography variant="body2" noWrap title={row.name}>
                    {row.name}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    ...getColStyle('sellingPrice'),
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Typography variant="body2">{formatPrice(row.sellingPrice)}</Typography>
                </Box>
                <Box
                  sx={{
                    ...getColStyle('quantityGifted'),
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="body2">{row.quantityGifted}</Typography>
                </Box>
                <Box
                  sx={{
                    ...getColStyle('giftValue', true),
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#F62E2E' }}>
                    {formatPrice(row.giftValue)}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Card>

      <TablePagination
        totalItems={data?.totalDocs ?? 0}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </Box>
  );
}
