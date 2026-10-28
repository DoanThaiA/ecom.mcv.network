import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  Box,
  Card,
  Grid,
  LinearProgress,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useReactTable, getCoreRowModel, createColumnHelper } from '@tanstack/react-table';
import { DataTable } from 'src/components/table/data-table';
import { TablePagination } from 'src/components/table/table-pagination';
import { SearchBar } from 'src/components/table';
import { formatPrice } from 'src/utils/format';
import { productCategoryRepository } from 'src/repositories/product-category.repository';
import type { ProductCategory } from 'src/types/gen/shared/shared/product-categories/product-category';
import type { AffiliateCommissionAnalyticsItem } from 'src/types/gen/cms/cms/affiliate-analytics/affiliate-analytics';
import type { AffiliateTrackingAnalyticsItem } from 'src/types/gen/cms/cms/affiliate-analytics/affiliate-analytics';
import {
  getOverviewRequest,
  getCommissionAnalyticsRequest,
  getTrackingAnalyticsRequest,
  resetState,
  selectOverview,
  selectOverviewLoading,
  selectCommissionAnalytics,
  selectCommissionAnalyticsLoading,
  selectCommissionAnalyticsPagination,
  selectTrackingAnalytics,
  selectTrackingAnalyticsLoading,
  selectTrackingAnalyticsPagination,
} from 'src/redux/store/affiliatesPerformanceSlice';

const getDefaultDateRange = () => ({
  dateFrom: dayjs().subtract(2, 'month'),
  dateTo: dayjs(),
});

interface AffiliatesPerformanceViewProps {
  affiliateId: string;
}

/**
 * Affiliates Performance View — admin view for a specific affiliate's analytics.
 */
export function AffiliatesPerformanceView({ affiliateId }: AffiliatesPerformanceViewProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const overview = useAppSelector(selectOverview);
  const overviewLoading = useAppSelector(selectOverviewLoading);

  const commissionAnalytics = useAppSelector(selectCommissionAnalytics);
  const commissionAnalyticsLoading = useAppSelector(selectCommissionAnalyticsLoading);
  const commissionPagination = useAppSelector(selectCommissionAnalyticsPagination);

  const trackingAnalytics = useAppSelector(selectTrackingAnalytics);
  const trackingAnalyticsLoading = useAppSelector(selectTrackingAnalyticsLoading);
  const trackingPagination = useAppSelector(selectTrackingAnalyticsPagination);

  const [activeTab, setActiveTab] = useState(0);
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(getDefaultDateRange().dateFrom);
  const [dateTo, setDateTo] = useState<Dayjs | null>(getDefaultDateRange().dateTo);
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  // Commission tab state
  const [commCategory, setCommCategory] = useState('');
  const [commSearchInput, setCommSearchInput] = useState('');
  const [commSearchQuery, setCommSearchQuery] = useState('');
  const [commPage, setCommPage] = useState(1);
  const [commPageSize, setCommPageSize] = useState(10);
  const commSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Tracking tab state
  const [trackCategory, setTrackCategory] = useState('');
  const [trackSearchInput, setTrackSearchInput] = useState('');
  const [trackSearchQuery, setTrackSearchQuery] = useState('');
  const [trackPage, setTrackPage] = useState(1);
  const [trackPageSize, setTrackPageSize] = useState(10);
  const trackSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productCategoryRepository.getProductCategories({
          page: 1,
          limit: 1000,
          filters: {},
          sort: [{ orderBy: 'name', order: 'asc' }],
        });
        setCategories(response);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!affiliateId) return;
    dispatch(
      getOverviewRequest({
        affiliateId,
        dateFrom: dateFrom?.startOf('day').toISOString(),
        dateTo: dateTo?.endOf('day').toISOString(),
      })
    );
  }, [dispatch, affiliateId, dateFrom, dateTo]);

  const fetchCommissionAnalytics = useCallback(() => {
    if (!affiliateId) return;
    dispatch(
      getCommissionAnalyticsRequest({
        affiliateId,
        page: commPage,
        limit: commPageSize,
        dateFrom: dateFrom?.startOf('day').toISOString(),
        dateTo: dateTo?.endOf('day').toISOString(),
        search: commSearchQuery || undefined,
        categoryName: commCategory || undefined,
      })
    );
  }, [
    dispatch,
    affiliateId,
    commPage,
    commPageSize,
    dateFrom,
    dateTo,
    commSearchQuery,
    commCategory,
  ]);

  const fetchTrackingAnalytics = useCallback(() => {
    if (!affiliateId) return;
    dispatch(
      getTrackingAnalyticsRequest({
        affiliateId,
        page: trackPage,
        limit: trackPageSize,
        dateFrom: dateFrom?.startOf('day').toISOString(),
        dateTo: dateTo?.endOf('day').toISOString(),
        search: trackSearchQuery || undefined,
        categoryName: trackCategory || undefined,
      })
    );
  }, [
    dispatch,
    affiliateId,
    trackPage,
    trackPageSize,
    dateFrom,
    dateTo,
    trackSearchQuery,
    trackCategory,
  ]);

  useEffect(() => {
    fetchCommissionAnalytics();
  }, [fetchCommissionAnalytics]);

  useEffect(() => {
    fetchTrackingAnalytics();
  }, [fetchTrackingAnalytics]);

  useEffect(() => {
    return () => {
      dispatch(resetState());
    };
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (commSearchTimeoutRef.current) clearTimeout(commSearchTimeoutRef.current);
      if (trackSearchTimeoutRef.current) clearTimeout(trackSearchTimeoutRef.current);
    };
  }, []);

  const handleCommSearchInputChange = (value: string) => {
    setCommSearchInput(value);
    if (commSearchTimeoutRef.current) clearTimeout(commSearchTimeoutRef.current);
    commSearchTimeoutRef.current = setTimeout(() => {
      setCommSearchQuery(value);
      setCommPage(1);
    }, 300);
  };

  const handleCommSearch = () => {
    if (commSearchTimeoutRef.current) clearTimeout(commSearchTimeoutRef.current);
    setCommSearchQuery(commSearchInput);
    setCommPage(1);
  };

  const handleCommCategoryChange = (value: string) => {
    setCommCategory(value);
    setCommPage(1);
  };

  const handleTrackSearchInputChange = (value: string) => {
    setTrackSearchInput(value);
    if (trackSearchTimeoutRef.current) clearTimeout(trackSearchTimeoutRef.current);
    trackSearchTimeoutRef.current = setTimeout(() => {
      setTrackSearchQuery(value);
      setTrackPage(1);
    }, 300);
  };

  const handleTrackSearch = () => {
    if (trackSearchTimeoutRef.current) clearTimeout(trackSearchTimeoutRef.current);
    setTrackSearchQuery(trackSearchInput);
    setTrackPage(1);
  };

  const handleTrackCategoryChange = (value: string) => {
    setTrackCategory(value);
    setTrackPage(1);
  };

  const metrics = useMemo(() => {
    if (!overview) return [];
    return [
      { labelKey: 'totalClicks', value: overview.totalClicks.toLocaleString() },
      { labelKey: 'successfulOrders', value: overview.successfulOrders.toLocaleString() },
      { labelKey: 'conversionRate', value: `${overview.conversionRate.toFixed(2)}%` },
      { labelKey: 'revenueGenerated', value: formatPrice(overview.revenueGenerated) },
      { labelKey: 'estimatedCommission', value: formatPrice(overview.estimatedCommission) },
    ];
  }, [overview]);

  // Commission table
  const commColumnHelper = createColumnHelper<AffiliateCommissionAnalyticsItem>();
  const commColumns = useMemo(
    () => [
      commColumnHelper.accessor('productCode', { header: t('productCode'), size: 120 }),
      commColumnHelper.accessor('productName', { header: t('productName'), size: 250 }),
      commColumnHelper.accessor('commissionRate', {
        header: t('commissionRate'),
        size: 100,
        cell: (info) => `${info.getValue().toFixed(2)}%`,
      }),
      commColumnHelper.accessor('successfulOrders', {
        header: t('successfulOrders'),
        size: 120,
        cell: (info) => info.getValue().toLocaleString(),
      }),
      commColumnHelper.accessor('revenueGenerated', {
        header: t('revenueGenerated'),
        size: 150,
        cell: (info) => formatPrice(info.getValue()),
      }),
      commColumnHelper.accessor('estimatedCommission', {
        header: t('estimatedCommission'),
        size: 150,
        cell: (info) => formatPrice(info.getValue()),
      }),
    ],
    [commColumnHelper, t]
  );

  const commTable = useReactTable({
    data: commissionAnalytics,
    columns: commColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  // Tracking table
  const trackColumnHelper = createColumnHelper<AffiliateTrackingAnalyticsItem>();
  const trackColumns = useMemo(
    () => [
      trackColumnHelper.accessor('productCode', { header: t('productCode'), size: 120 }),
      trackColumnHelper.accessor('productName', { header: t('productName'), size: 250 }),
      trackColumnHelper.accessor('clicks', {
        header: t('clicks'),
        size: 100,
        cell: (info) => info.getValue().toLocaleString(),
      }),
      trackColumnHelper.accessor('successfulOrders', {
        header: t('successfulOrders'),
        size: 120,
        cell: (info) => info.getValue().toLocaleString(),
      }),
      trackColumnHelper.accessor('conversionRate', {
        header: t('conversionRate'),
        size: 120,
        cell: (info) => `${info.getValue().toFixed(2)}%`,
      }),
    ],
    [trackColumnHelper, t]
  );

  const trackTable = useReactTable({
    data: trackingAnalytics,
    columns: trackColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      {/* Date Range Filter */}
      <Card sx={{ p: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" sx={{ minWidth: 100 }}>
              {t('dateRange')}:
            </Typography>
            <DatePicker
              label={t('from')}
              value={dateFrom}
              onChange={(newValue) => setDateFrom(newValue as Dayjs)}
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
            />
            <Box sx={{ color: 'text.secondary' }}>-</Box>
            <DatePicker
              label={t('to')}
              value={dateTo}
              onChange={(newValue) => setDateTo(newValue as Dayjs)}
              format="DD/MM/YYYY"
              minDate={dateFrom || undefined}
              slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
            />
          </Box>
        </LocalizationProvider>
      </Card>

      {/* Overview Section */}
      <Card sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('overview')}
        </Typography>
        {overviewLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {t('loading')}...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {metrics.map((metric) => (
              <Card
                key={metric.labelKey}
                sx={{
                  p: 2,
                  flex: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 'none',
                }}
              >
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t(metric.labelKey)}
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {metric.value}
                </Typography>
              </Card>
            ))}
          </Box>
        )}
      </Card>

      {/* Analytics Tabs */}
      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={t('commissionAnalytics')} />
          <Tab label={t('trafficConversion')} />
        </Tabs>

        {/* Tab 0: Commission Analytics */}
        {activeTab === 0 && (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Select
                size="small"
                value={commCategory}
                onChange={(e) => handleCommCategoryChange(e.target.value)}
                displayEmpty
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="">{t('allCategories')}</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              <SearchBar
                value={commSearchInput}
                onChange={handleCommSearchInputChange}
                placeholder={t('searchProductCodeName')}
                showSearchButton
                onSearch={handleCommSearch}
                sx={{ width: 'auto' }}
              />
            </Box>
            <Box sx={{ position: 'relative', flex: 1, overflow: 'auto', minHeight: 400 }}>
              {commissionAnalyticsLoading && (
                <LinearProgress
                  sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}
                />
              )}
              <Box
                sx={{
                  opacity: commissionAnalyticsLoading ? 0.5 : 1,
                  pointerEvents: commissionAnalyticsLoading ? 'none' : 'auto',
                }}
              >
                {commissionAnalytics.length === 0 && !commissionAnalyticsLoading ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">{t('noData')}</Typography>
                  </Box>
                ) : (
                  <DataTable table={commTable} compact />
                )}
              </Box>
            </Box>
            <Box sx={{ mt: 2 }}>
              <TablePagination
                totalItems={commissionPagination?.total ?? 0}
                currentPage={commPage}
                pageSize={commPageSize}
                totalPages={commissionPagination?.totalPages ?? 1}
                onPageChange={setCommPage}
                onPageSizeChange={(size) => {
                  setCommPageSize(size);
                  setCommPage(1);
                }}
              />
            </Box>
          </Box>
        )}

        {/* Tab 1: Traffic & Conversion */}
        {activeTab === 1 && (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Select
                size="small"
                value={trackCategory}
                onChange={(e) => handleTrackCategoryChange(e.target.value)}
                displayEmpty
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="">{t('allCategories')}</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              <SearchBar
                value={trackSearchInput}
                onChange={handleTrackSearchInputChange}
                placeholder={t('searchProductCodeName')}
                showSearchButton
                onSearch={handleTrackSearch}
                sx={{ width: 'auto' }}
              />
            </Box>
            <Box sx={{ position: 'relative', flex: 1, overflow: 'auto', minHeight: 400 }}>
              {trackingAnalyticsLoading && (
                <LinearProgress
                  sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}
                />
              )}
              <Box
                sx={{
                  opacity: trackingAnalyticsLoading ? 0.5 : 1,
                  pointerEvents: trackingAnalyticsLoading ? 'none' : 'auto',
                }}
              >
                {trackingAnalytics.length === 0 && !trackingAnalyticsLoading ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">{t('noData')}</Typography>
                  </Box>
                ) : (
                  <DataTable table={trackTable} compact />
                )}
              </Box>
            </Box>
            <Box sx={{ mt: 2 }}>
              <TablePagination
                totalItems={trackingPagination?.total ?? 0}
                currentPage={trackPage}
                pageSize={trackPageSize}
                totalPages={trackingPagination?.totalPages ?? 1}
                onPageChange={setTrackPage}
                onPageSizeChange={(size) => {
                  setTrackPageSize(size);
                  setTrackPage(1);
                }}
              />
            </Box>
          </Box>
        )}
      </Card>
    </Box>
  );
}
