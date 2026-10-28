import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  Chip,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Typography,
  Avatar,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useReactTable, getCoreRowModel, createColumnHelper } from '@tanstack/react-table';
import { DataTable } from 'src/components/table/data-table';
import { SearchBar } from 'src/components/table/search-bar';
import { TablePagination } from 'src/components/table/table-pagination';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getMyProfileRequest,
  getMyProductCommissionsRequest,
  getMyOverviewRequest,
  getMyCommissionAnalyticsRequest,
  getMyTrackingAnalyticsRequest,
  resetPortalState,
  selectMyProfile,
  selectMyProfileLoading,
  selectMyProductCommissions,
  selectMyProductCommissionsLoading,
  selectMyProductCommissionsPagination,
  selectMyOverview,
  selectMyOverviewLoading,
  selectMyCommissionAnalytics,
  selectMyCommissionAnalyticsLoading,
  selectMyCommissionAnalyticsPagination,
  selectMyTrackingAnalytics,
  selectMyTrackingAnalyticsLoading,
  selectMyTrackingAnalyticsPagination,
} from 'src/redux/store/affiliatePortalSlice';
import { AffiliateType, AffiliateStatus } from 'src/types/gen/shared/shared/common/enums';
import { formatDate, formatPrice } from 'src/utils/format';
import { showSuccess } from 'src/utils/toast';
import { getCurrentBaseUrl } from 'src/utils/environment';
import { affiliatePortalRepository } from 'src/repositories/affiliate-portal.repository';
import type { ProductCategory } from 'src/types/gen/shared/shared/product-categories/product-category';
import type { CommissionProduct } from 'src/sections/affiliates/components/commission-product-table';
import type {
  AffiliateCommissionAnalyticsItem,
  AffiliateTrackingAnalyticsItem,
} from 'src/types/gen/cms/cms/affiliate-analytics/affiliate-analytics';

const getDefaultDateRange = () => ({
  dateFrom: dayjs().subtract(2, 'month'),
  dateTo: dayjs(),
});

/**
 * My Info View — affiliate self-service page showing profile info, commission settings,
 * commission analytics, and traffic/conversion analytics (3 tabs).
 */
export function MyInfoView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const profile = useAppSelector(selectMyProfile);
  const profileLoading = useAppSelector(selectMyProfileLoading);
  const productCommissions = useAppSelector(selectMyProductCommissions);
  const productCommissionsLoading = useAppSelector(selectMyProductCommissionsLoading);
  const productCommissionsPagination = useAppSelector(selectMyProductCommissionsPagination);
  const overview = useAppSelector(selectMyOverview);
  const overviewLoading = useAppSelector(selectMyOverviewLoading);
  const commissionAnalytics = useAppSelector(selectMyCommissionAnalytics);
  const commissionAnalyticsLoading = useAppSelector(selectMyCommissionAnalyticsLoading);
  const commissionAnalyticsPagination = useAppSelector(selectMyCommissionAnalyticsPagination);
  const trackingAnalytics = useAppSelector(selectMyTrackingAnalytics);
  const trackingAnalyticsLoading = useAppSelector(selectMyTrackingAnalyticsLoading);
  const trackingAnalyticsPagination = useAppSelector(selectMyTrackingAnalyticsPagination);

  const [activeTab, setActiveTab] = useState(0);

  // Shared state
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(getDefaultDateRange().dateFrom);
  const [dateTo, setDateTo] = useState<Dayjs | null>(getDefaultDateRange().dateTo);

  // Tab 0: Commission Settings state
  const [commissionPage, setCommissionPage] = useState(1);
  const [commissionPageSize, setCommissionPageSize] = useState(10);
  const [commissionSearchInput, setCommissionSearchInput] = useState('');
  const [commissionSearchQuery, setCommissionSearchQuery] = useState('');
  const [commissionCategory, setCommissionCategory] = useState('');

  // Tab 1: Commission Analytics state
  const [commAnalyticsPage, setCommAnalyticsPage] = useState(1);
  const [commAnalyticsPageSize, setCommAnalyticsPageSize] = useState(10);
  const [commAnalyticsSearchInput, setCommAnalyticsSearchInput] = useState('');
  const [commAnalyticsSearchQuery, setCommAnalyticsSearchQuery] = useState('');
  const [commAnalyticsCategory, setCommAnalyticsCategory] = useState('');

  // Tab 2: Traffic & Conversion state
  const [trackingPage, setTrackingPage] = useState(1);
  const [trackingPageSize, setTrackingPageSize] = useState(10);
  const [trackingSearchInput, setTrackingSearchInput] = useState('');
  const [trackingSearchQuery, setTrackingSearchQuery] = useState('');
  const [trackingCategory, setTrackingCategory] = useState('');

  useEffect(() => {
    dispatch(getMyProfileRequest());
    const fetchCategories = async () => {
      try {
        const response = await affiliatePortalRepository.getPublicCategories();
        setCategories(response);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
    return () => {
      dispatch(resetPortalState());
    };
  }, [dispatch]);

  const fetchCommissions = useCallback(() => {
    dispatch(
      getMyProductCommissionsRequest({
        page: commissionPage,
        limit: commissionPageSize,
        search: commissionSearchQuery || undefined,
        categoryName: commissionCategory || undefined,
      })
    );
  }, [dispatch, commissionPage, commissionPageSize, commissionSearchQuery, commissionCategory]);

  useEffect(() => {
    if (activeTab === 0) fetchCommissions();
  }, [activeTab, fetchCommissions]);

  const fetchCommissionAnalytics = useCallback(() => {
    dispatch(
      getMyCommissionAnalyticsRequest({
        page: commAnalyticsPage,
        limit: commAnalyticsPageSize,
        dateFrom: dateFrom?.startOf('day').toISOString(),
        dateTo: dateTo?.endOf('day').toISOString(),
        search: commAnalyticsSearchQuery || undefined,
        categoryName: commAnalyticsCategory || undefined,
      })
    );
  }, [
    dispatch,
    commAnalyticsPage,
    commAnalyticsPageSize,
    dateFrom,
    dateTo,
    commAnalyticsSearchQuery,
    commAnalyticsCategory,
  ]);

  const fetchTrackingAnalytics = useCallback(() => {
    dispatch(
      getMyTrackingAnalyticsRequest({
        page: trackingPage,
        limit: trackingPageSize,
        dateFrom: dateFrom?.startOf('day').toISOString(),
        dateTo: dateTo?.endOf('day').toISOString(),
        search: trackingSearchQuery || undefined,
        categoryName: trackingCategory || undefined,
      })
    );
  }, [
    dispatch,
    trackingPage,
    trackingPageSize,
    dateFrom,
    dateTo,
    trackingSearchQuery,
    trackingCategory,
  ]);

  useEffect(() => {
    if (activeTab === 1) {
      dispatch(
        getMyOverviewRequest({
          dateFrom: dateFrom?.startOf('day').toISOString(),
          dateTo: dateTo?.endOf('day').toISOString(),
        })
      );
      fetchCommissionAnalytics();
    }
  }, [dispatch, activeTab, dateFrom, dateTo, fetchCommissionAnalytics]);

  useEffect(() => {
    if (activeTab === 2) fetchTrackingAnalytics();
  }, [activeTab, fetchTrackingAnalytics]);

  const handleCommissionSearch = useCallback(() => {
    setCommissionSearchQuery(commissionSearchInput);
    setCommissionPage(1);
  }, [commissionSearchInput]);

  const handleCommissionCategoryChange = (value: string) => {
    setCommissionCategory(value);
    setCommissionPage(1);
  };

  const handleCommAnalyticsSearch = useCallback(() => {
    setCommAnalyticsSearchQuery(commAnalyticsSearchInput);
    setCommAnalyticsPage(1);
  }, [commAnalyticsSearchInput]);

  const handleCommAnalyticsCategoryChange = (value: string) => {
    setCommAnalyticsCategory(value);
    setCommAnalyticsPage(1);
  };

  const handleTrackingSearch = useCallback(() => {
    setTrackingSearchQuery(trackingSearchInput);
    setTrackingPage(1);
  }, [trackingSearchInput]);

  const handleTrackingCategoryChange = (value: string) => {
    setTrackingCategory(value);
    setTrackingPage(1);
  };

  const affiliateLink = profile ? `${getCurrentBaseUrl()}/?ref=${profile.affiliateCode}` : '';

  const getTypeLabel = (type: AffiliateType): string => {
    const map: Partial<Record<AffiliateType, string>> = {
      [AffiliateType.AFFILIATE_TYPE_KOL]: 'KOL',
      [AffiliateType.AFFILIATE_TYPE_CTV]: 'CTV',
      [AffiliateType.AFFILIATE_TYPE_PUBLISHER]: 'Publisher',
    };
    return map[type] || '-';
  };

  const getTypeColor = (type: AffiliateType): 'primary' | 'info' | 'secondary' | 'default' => {
    const map: Partial<Record<AffiliateType, 'primary' | 'info' | 'secondary'>> = {
      [AffiliateType.AFFILIATE_TYPE_KOL]: 'primary',
      [AffiliateType.AFFILIATE_TYPE_CTV]: 'info',
      [AffiliateType.AFFILIATE_TYPE_PUBLISHER]: 'secondary',
    };
    return map[type] || 'default';
  };

  const getAffiliateLinkForProduct = (productId: string): string => {
    if (!profile) return '';
    return `${getCurrentBaseUrl()}/products/${productId}?ref=${profile.affiliateCode}`;
  };

  // Tab 0: Commission Settings columns
  const commissionColumnHelper = createColumnHelper<CommissionProduct>();
  const commissionColumns = useMemo(
    () => [
      commissionColumnHelper.accessor('productCode', { header: t('productCode'), size: 110 }),
      commissionColumnHelper.display({
        id: 'image',
        header: t('image'),
        size: 70,
        cell: (info) => (
          <Avatar
            src={info.row.original.productImage}
            variant="rounded"
            sx={{ width: 40, height: 40, bgcolor: 'grey.200' }}
          />
        ),
      }),
      commissionColumnHelper.accessor('productName', {
        header: t('productName'),
        size: 220,
        cell: (info) => (
          <Typography variant="body2" color="primary" sx={{ cursor: 'default' }}>
            {info.getValue()}
          </Typography>
        ),
      }),
      commissionColumnHelper.accessor('costPrice', {
        header: t('costPrice'),
        size: 110,
        cell: (info) => formatPrice(info.getValue()),
      }),
      commissionColumnHelper.accessor('stock', {
        header: t('stock'),
        size: 80,
        cell: (info) => info.getValue().toLocaleString(),
      }),
      commissionColumnHelper.accessor('commissionRate', {
        header: t('commissionRate'),
        size: 100,
        cell: (info) => `${info.getValue()}%`,
      }),
      commissionColumnHelper.accessor('estimatedCommission', {
        header: t('estimatedCommission'),
        size: 130,
        cell: (info) => formatPrice(info.getValue()),
      }),
      commissionColumnHelper.display({
        id: 'affiliateLink',
        header: t('affiliateLink'),
        size: 80,
        cell: (info) => {
          const link = getAffiliateLinkForProduct(info.row.original.productId);
          return (
            <IconButton
              size="small"
              onClick={() => {
                navigator.clipboard.writeText(link);
                showSuccess(t('linkCopied'));
              }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          );
        },
      }),
      commissionColumnHelper.display({
        id: 'website',
        header: t('website'),
        size: 70,
        cell: (info) => {
          const link = getAffiliateLinkForProduct(info.row.original.productId);
          return (
            <IconButton size="small" onClick={() => window.open(link, '_blank')}>
              <OpenInNewIcon fontSize="small" sx={{ color: 'success.main' }} />
            </IconButton>
          );
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [commissionColumnHelper, t, profile]
  );

  const commissionTable = useReactTable({
    data: productCommissions,
    columns: commissionColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  // Tab 1: Commission Analytics columns
  const commAnalyticsColumnHelper = createColumnHelper<AffiliateCommissionAnalyticsItem>();
  const commAnalyticsColumns = useMemo(
    () => [
      commAnalyticsColumnHelper.accessor('productCode', { header: t('productCode'), size: 110 }),
      commAnalyticsColumnHelper.accessor('productName', {
        header: t('productName'),
        size: 230,
        cell: (info) => (
          <Typography variant="body2" color="primary" sx={{ cursor: 'default' }}>
            {info.getValue()}
          </Typography>
        ),
      }),
      commAnalyticsColumnHelper.accessor('commissionRate', {
        header: t('commissionRate'),
        size: 100,
        cell: (info) => `${info.getValue().toFixed(2)}%`,
      }),
      commAnalyticsColumnHelper.accessor('successfulOrders', {
        header: t('successfulOrders'),
        size: 110,
        cell: (info) => info.getValue().toLocaleString(),
      }),
      commAnalyticsColumnHelper.accessor('revenueGenerated', {
        header: t('revenueGenerated'),
        size: 130,
        cell: (info) => formatPrice(info.getValue()),
      }),
      commAnalyticsColumnHelper.accessor('estimatedCommission', {
        header: t('estimatedCommission'),
        size: 130,
        cell: (info) => formatPrice(info.getValue()),
      }),
    ],
    [commAnalyticsColumnHelper, t]
  );

  const commAnalyticsTable = useReactTable({
    data: commissionAnalytics,
    columns: commAnalyticsColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  // Tab 2: Traffic & Conversion columns
  const trackingColumnHelper = createColumnHelper<AffiliateTrackingAnalyticsItem>();
  const trackingColumns = useMemo(
    () => [
      trackingColumnHelper.accessor('productCode', { header: t('productCode'), size: 110 }),
      trackingColumnHelper.accessor('productName', {
        header: t('productName'),
        size: 230,
        cell: (info) => (
          <Typography variant="body2" color="primary" sx={{ cursor: 'default' }}>
            {info.getValue()}
          </Typography>
        ),
      }),
      trackingColumnHelper.accessor('clicks', {
        header: t('clicks'),
        size: 90,
        cell: (info) => info.getValue().toLocaleString(),
      }),
      trackingColumnHelper.accessor('successfulOrders', {
        header: t('successfulOrders'),
        size: 110,
        cell: (info) => info.getValue().toLocaleString(),
      }),
      trackingColumnHelper.accessor('conversionRate', {
        header: t('conversionRate'),
        size: 110,
        cell: (info) => `${info.getValue().toFixed(2)}%`,
      }),
    ],
    [trackingColumnHelper, t]
  );

  const trackingTable = useReactTable({
    data: trackingAnalytics,
    columns: trackingColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const overviewMetrics = useMemo(() => {
    if (!overview) return [];
    return [
      { labelKey: 'totalClicks', value: overview.totalClicks.toLocaleString() },
      { labelKey: 'successfulOrders', value: overview.successfulOrders.toLocaleString() },
      { labelKey: 'conversionRate', value: `${overview.conversionRate.toFixed(2)}%` },
      { labelKey: 'revenueGenerated', value: formatPrice(overview.revenueGenerated) },
      { labelKey: 'estimatedCommission', value: formatPrice(overview.estimatedCommission) },
    ];
  }, [overview]);

  if (profileLoading && !profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">{t('loading')}...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
      {/* Profile info card */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('myInfo')} {profile ? `${profile.name}` : ''}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <InfoRow label={t('agentName')} value={profile?.name} />
              <InfoRow
                label={t('joinDate')}
                value={profile?.createdAt ? formatDate(profile.createdAt) : undefined}
              />
              <InfoRow label={t('email')} value={profile?.email} />
              <InfoRow label={t('recipientName')} value={profile?.bankAccountHolder} />
              <InfoRow label={t('bankAccountNumber')} value={profile?.bankAccountNumber} />
              <InfoRow label={t('note')} value={profile?.notes} />
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 200 }}>
                  {t('affiliateLink')}:
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {affiliateLink}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(affiliateLink);
                    showSuccess(t('linkCopied'));
                  }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 200 }}>
                  {t('affiliateType')}:
                </Typography>
                {profile?.type !== undefined && (
                  <Chip
                    label={getTypeLabel(profile.type)}
                    color={getTypeColor(profile.type)}
                    size="small"
                  />
                )}
              </Box>
              <InfoRow label={t('affiliateCode')} value={profile?.affiliateCode} />
              <InfoRow label={t('phone')} value={profile?.phone} />
              <InfoRow label={t('citizenId')} value={profile?.citizenId} />
              <InfoRow label={t('bankName')} value={profile?.bankName} />
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 200 }}>
                  {t('status')}:
                </Typography>
                {profile?.status !== undefined && (
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        profile.status === AffiliateStatus.AFFILIATE_STATUS_ACTIVE
                          ? 'success.main'
                          : 'text.secondary',
                      fontWeight: 500,
                    }}
                  >
                    {profile.status === AffiliateStatus.AFFILIATE_STATUS_ACTIVE
                      ? t('active')
                      : t('inactive')}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={t('commissionSettings')} />
          <Tab label={t('commissionAnalytics')} />
          <Tab label={t('trafficConversion')} />
        </Tabs>

        {/* Tab 0: Commission Settings */}
        {activeTab === 0 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {t('defaultCommissionRate')}:{' '}
              <strong>{profile?.defaultCommissionRate ?? '-'}%</strong>
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              {t('productList')}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Select
                size="small"
                value={commissionCategory}
                onChange={(e) => handleCommissionCategoryChange(e.target.value)}
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
                value={commissionSearchInput}
                onChange={setCommissionSearchInput}
                placeholder={t('searchProductCodeName')}
                onSearch={handleCommissionSearch}
                showSearchButton
                sx={{ px: 0 }}
              />
            </Box>

            <Box sx={{ position: 'relative', overflow: 'auto', minHeight: 300 }}>
              {productCommissionsLoading && (
                <LinearProgress
                  sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}
                />
              )}
              <Box
                sx={{
                  opacity: productCommissionsLoading ? 0.5 : 1,
                  pointerEvents: productCommissionsLoading ? 'none' : 'auto',
                }}
              >
                {productCommissions.length === 0 && !productCommissionsLoading ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">{t('noData')}</Typography>
                  </Box>
                ) : (
                  <DataTable table={commissionTable} compact />
                )}
              </Box>
            </Box>
            <Box sx={{ mt: 2 }}>
              <TablePagination
                totalItems={productCommissionsPagination?.total ?? 0}
                currentPage={commissionPage}
                pageSize={commissionPageSize}
                totalPages={productCommissionsPagination?.totalPages ?? 1}
                onPageChange={setCommissionPage}
                onPageSizeChange={(size) => {
                  setCommissionPageSize(size);
                  setCommissionPage(1);
                }}
              />
            </Box>
          </Box>
        )}

        {/* Tab 1: Commission Analytics */}
        {activeTab === 1 && (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('time')}
                </Typography>
                <DatePicker
                  value={dateFrom}
                  onChange={(v) => setDateFrom(v ? dayjs(v) : null)}
                  format="DD/MM/YYYY"
                  slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
                />
                <Box sx={{ color: 'text.secondary' }}>-</Box>
                <DatePicker
                  value={dateTo}
                  onChange={(v) => setDateTo(v ? dayjs(v) : null)}
                  format="DD/MM/YYYY"
                  minDate={dateFrom || undefined}
                  slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
                />
              </Box>
            </LocalizationProvider>

            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t('overview')}
            </Typography>
            {overviewLoading ? (
              <Typography color="text.secondary">{t('loading')}...</Typography>
            ) : (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {overviewMetrics.map((m) => (
                  <Card
                    key={m.labelKey}
                    sx={{
                      p: 2,
                      flex: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: 'none',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t(m.labelKey)}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {m.value}
                    </Typography>
                  </Card>
                ))}
              </Box>
            )}

            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t('productAnalytics')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Select
                size="small"
                value={commAnalyticsCategory}
                onChange={(e) => handleCommAnalyticsCategoryChange(e.target.value)}
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
                value={commAnalyticsSearchInput}
                onChange={setCommAnalyticsSearchInput}
                placeholder={t('searchProductCodeName')}
                onSearch={handleCommAnalyticsSearch}
                showSearchButton
                sx={{ px: 0 }}
              />
            </Box>

            <Box sx={{ position: 'relative', overflow: 'auto', minHeight: 300 }}>
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
                  <DataTable table={commAnalyticsTable} compact />
                )}
              </Box>
            </Box>
            <Box sx={{ mt: 1 }}>
              <TablePagination
                totalItems={commissionAnalyticsPagination?.total ?? 0}
                currentPage={commAnalyticsPage}
                pageSize={commAnalyticsPageSize}
                totalPages={commissionAnalyticsPagination?.totalPages ?? 1}
                onPageChange={setCommAnalyticsPage}
                onPageSizeChange={(size) => {
                  setCommAnalyticsPageSize(size);
                  setCommAnalyticsPage(1);
                }}
              />
            </Box>
          </Box>
        )}

        {/* Tab 2: Traffic & Conversion */}
        {activeTab === 2 && (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('time')}
                </Typography>
                <DatePicker
                  value={dateFrom}
                  onChange={(v) => setDateFrom(v ? dayjs(v) : null)}
                  format="DD/MM/YYYY"
                  slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
                />
                <Box sx={{ color: 'text.secondary' }}>-</Box>
                <DatePicker
                  value={dateTo}
                  onChange={(v) => setDateTo(v ? dayjs(v) : null)}
                  format="DD/MM/YYYY"
                  minDate={dateFrom || undefined}
                  slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
                />
              </Box>
            </LocalizationProvider>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Select
                size="small"
                value={trackingCategory}
                onChange={(e) => handleTrackingCategoryChange(e.target.value)}
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
                value={trackingSearchInput}
                onChange={setTrackingSearchInput}
                placeholder={t('searchProductCodeName')}
                onSearch={handleTrackingSearch}
                showSearchButton
                sx={{ px: 0 }}
              />
            </Box>

            <Box sx={{ position: 'relative', overflow: 'auto', minHeight: 300 }}>
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
                  <DataTable table={trackingTable} compact />
                )}
              </Box>
            </Box>
            <Box sx={{ mt: 1 }}>
              <TablePagination
                totalItems={trackingAnalyticsPagination?.total ?? 0}
                currentPage={trackingPage}
                pageSize={trackingPageSize}
                totalPages={trackingAnalyticsPagination?.totalPages ?? 1}
                onPageChange={setTrackingPage}
                onPageSizeChange={(size) => {
                  setTrackingPageSize(size);
                  setTrackingPage(1);
                }}
              />
            </Box>
          </Box>
        )}
      </Card>
    </Box>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 200 }}>
        {label}:
      </Typography>
      <Typography variant="body2">{value ?? '-'}</Typography>
    </Box>
  );
}
