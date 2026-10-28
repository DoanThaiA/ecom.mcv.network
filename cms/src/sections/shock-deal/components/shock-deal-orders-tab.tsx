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
import { promotionRepository } from 'src/repositories/promotion.repository';
import type {
  BundleDealOrderRow,
  BundleDealOrdersResponse,
} from 'src/types/gen/cms/cms/promotions/promotion';
import { formatPrice, formatDate } from 'src/utils/format';

// ----------------------------------------------------------------------

interface ShockDealOrdersTabProps {
  promotionId: string;
}

export function ShockDealOrdersTab({ promotionId }: ShockDealOrdersTabProps) {
  const { t } = useTranslation();

  const [data, setData] = useState<BundleDealOrdersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(dayjs().subtract(2, 'month'));
  const [dateTo, setDateTo] = useState<Dayjs | null>(dayjs());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await promotionRepository.getPromotionOrders(promotionId, {
        page: currentPage,
        limit: pageSize,
        fromDate: dateFrom?.startOf('day').toISOString(),
        toDate: dateTo?.endOf('day').toISOString(),
      });
      setData(res as BundleDealOrdersResponse);
    } finally {
      setLoading(false);
    }
  }, [promotionId, currentPage, pageSize, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columnWidths = {
    orderNumber: '12%',
    nhanhOrderId: '9%',
    customer: '15%',
    giftProducts: '30%',
    giftQuantity: '8%',
    giftValue: '13%',
    paymentAmount: '13%',
  };

  const headers = [
    { key: 'orderNumber', label: 'ID' },
    { key: 'nhanhOrderId', label: t('nhanhOrderId') },
    { key: 'customer', label: t('customer') },
    { key: 'giftProducts', label: t('giftProduct') },
    { key: 'giftQuantity', label: t('quantity') },
    { key: 'giftValue', label: t('giftTotalValue') },
    { key: 'paymentAmount', label: t('paymentAmount') },
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
        <Box sx={{ minWidth: 900 }}>
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
                  justifyContent: ['giftQuantity'].includes(h.key)
                    ? 'center'
                    : ['giftUnitPrice', 'giftValue', 'paymentAmount'].includes(h.key)
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
              <Box sx={{ ...getColStyle('orderNumber'), p: 1.5 }}>
                <Typography variant="body2" fontWeight={600}>
                  {t('total')}: {summary.totalOrders}
                </Typography>
              </Box>
              <Box sx={{ ...getColStyle('nhanhOrderId') }} />
              <Box sx={{ ...getColStyle('customer') }} />
              <Box sx={{ ...getColStyle('giftProducts') }} />
              <Box
                sx={{
                  ...getColStyle('giftQuantity'),
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {summary.totalQuantity ?? 0}
                </Typography>
              </Box>
              <Box
                sx={{
                  ...getColStyle('giftValue'),
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
              <Box
                sx={{
                  ...getColStyle('paymentAmount', true),
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}
              >
                <Typography variant="body2" fontWeight={600} sx={{ color: '#178B30' }}>
                  {formatPrice(summary.totalPaymentAmount)}
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
                key={`${row.orderId}-${index}`}
                sx={{
                  display: 'flex',
                  bgcolor: index % 2 === 0 ? 'white' : '#FAFBFC',
                  borderBottom: '1px solid #F0F1F3',
                  minHeight: 48,
                  '&:hover': { bgcolor: '#F5F7FA' },
                }}
              >
                <Box sx={{ ...getColStyle('orderNumber'), p: 1.5 }}>
                  <Typography variant="body2" sx={{ color: '#235AFF', fontWeight: 500 }}>
                    {row.orderNumber}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(row.createdAt)}
                  </Typography>
                </Box>
                <Box sx={{ ...getColStyle('nhanhOrderId'), p: 1.5 }}>
                  <Typography variant="body2">{row.nhanhOrderId || '--'}</Typography>
                </Box>
                <Box sx={{ ...getColStyle('customer'), p: 1.5 }}>
                  <Typography variant="body2" fontWeight={500} noWrap>
                    {row.customerName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.customerPhone}
                  </Typography>
                </Box>
                <Box sx={{ ...getColStyle('giftProducts'), p: 1.5, overflow: 'hidden' }}>
                  {row.giftProducts?.map((gift, gi) => (
                    <Typography key={gi} variant="body2" noWrap title={gift.name}>
                      {gift.name}{' '}
                      <Typography component="span" variant="caption" color="text.secondary">
                        x{gift.quantity} ({formatPrice(gift.unitPrice)})
                      </Typography>
                    </Typography>
                  ))}
                </Box>
                <Box
                  sx={{
                    ...getColStyle('giftQuantity'),
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="body2">{row.totalGiftQuantity}</Typography>
                </Box>
                <Box
                  sx={{
                    ...getColStyle('giftValue'),
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#F62E2E' }}>
                    {formatPrice(row.totalGiftValue)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    ...getColStyle('paymentAmount', true),
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#178B30' }}>
                    {formatPrice(row.paymentAmount)}
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
