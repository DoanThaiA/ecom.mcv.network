import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
import { affiliateRepository } from 'src/repositories';
import type {
  QueryAffiliateOrdersResponse,
  AffiliateOrderListItem,
} from 'src/types/gen/cms/cms/affiliate-analytics/affiliate-analytics';
import { formatPrice, formatDate } from 'src/utils/format';

// ----------------------------------------------------------------------

interface AffiliatesOrdersTabProps {
  affiliateId: string;
}

export function AffiliatesOrdersTab({ affiliateId }: AffiliatesOrdersTabProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [data, setData] = useState<QueryAffiliateOrdersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(dayjs().subtract(2, 'month'));
  const [dateTo, setDateTo] = useState<Dayjs | null>(dayjs());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await affiliateRepository.getAffiliateOrders({
        affiliateId,
        page: currentPage,
        limit: pageSize,
        dateFrom: dateFrom?.format('YYYY-MM-DD'),
        dateTo: dateTo?.format('YYYY-MM-DD'),
      });
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [affiliateId, currentPage, pageSize, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columnWidths = {
    index: '5%',
    orderNumber: '15%',
    customer: '20%',
    orderValue: '15%',
    totalDiscount: '15%',
    paymentAmount: '15%',
    createdAt: '15%',
  };

  const headers = [
    { key: 'index', label: '#', align: 'center' as const },
    { key: 'orderNumber', label: t('orderNumber'), align: 'left' as const },
    { key: 'customer', label: t('customer'), align: 'left' as const },
    { key: 'orderValue', label: t('orderValue'), align: 'right' as const },
    { key: 'totalDiscount', label: t('totalPromotionValue'), align: 'right' as const },
    { key: 'paymentAmount', label: t('paymentAmount'), align: 'right' as const },
    { key: 'createdAt', label: t('createdAt'), align: 'center' as const },
  ];

  const getColStyle = (key: string, isLast = false) => ({
    width: columnWidths[key as keyof typeof columnWidths] ?? '10%',
    borderRight: isLast ? 'none' : '1px solid #E5E6EB',
  });

  const handleOrderClick = (orderId: string) => {
    navigate(`/order/${orderId}`);
  };

  return (
    <Box>
      {/* Date Range Filter */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Card sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" fontWeight={600}>
              {t('dateRangeFilter')}:
            </Typography>
            <DatePicker
              value={dateFrom}
              onChange={(d) => {
                setDateFrom(d);
                setCurrentPage(1);
              }}
              slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
            />
            <Typography variant="body2">-</Typography>
            <DatePicker
              value={dateTo}
              onChange={(d) => {
                setDateTo(d);
                setCurrentPage(1);
              }}
              slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
            />
          </Stack>
        </Card>
      </LocalizationProvider>

      {/* Table */}
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

          {/* Body */}
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : !data?.data.length ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">{t('noData')}</Typography>
            </Box>
          ) : (
            data.data.map((row, index) => (
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
                {/* Index */}
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

                {/* Order Number (Clickable Link) */}
                <Box
                  sx={{
                    ...getColStyle('orderNumber'),
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#235AFF',
                      fontWeight: 500,
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                    onClick={() => handleOrderClick(row.orderId)}
                  >
                    {row.orderNumber}
                  </Typography>
                </Box>

                {/* Customer (Name + Phone) */}
                <Box
                  sx={{
                    ...getColStyle('customer'),
                    p: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="body2" fontWeight={500} noWrap>
                    {row.customer?.name || '--'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.customer?.phone || '--'}
                  </Typography>
                </Box>

                {/* Order Value */}
                <Box
                  sx={{
                    ...getColStyle('orderValue'),
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Typography variant="body2">{formatPrice(row.orderTotal)}</Typography>
                </Box>

                {/* Total Discount (Red/Orange) */}
                <Box
                  sx={{
                    ...getColStyle('totalDiscount'),
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#F62E2E' }}>
                    -{formatPrice(row.totalDiscount)}
                  </Typography>
                </Box>

                {/* Payment Amount */}
                <Box
                  sx={{
                    ...getColStyle('paymentAmount'),
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Typography variant="body2">{formatPrice(row.paymentAmount)}</Typography>
                </Box>

                {/* Created At */}
                <Box
                  sx={{
                    ...getColStyle('createdAt', true),
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="body2">{formatDate(row.createdAt)}</Typography>
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Card>

      {/* Pagination */}
      <TablePagination
        totalItems={data?.total ?? 0}
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
