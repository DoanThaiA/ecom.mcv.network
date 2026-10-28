import { Box, Card, Typography, Checkbox, IconButton } from '@mui/material';
import { Visibility as ViewIcon } from '@mui/icons-material';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Dayjs } from 'dayjs';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getReturnsRequest,
  getReturnTabCountsRequest,
  selectReturns,
  selectReturnLoading,
  selectReturnPagination,
  selectReturnActiveTab,
  selectReturnTabCounts,
  setReturnActiveTab,
} from 'src/redux/store/returnSlice';
import type { ReturnRequest, ReturnTab, ReturnFilters, ReturnStatus } from 'src/types/returns';
import { ReturnType } from 'src/types/returns';
import { TableImagePreview } from 'src/components/table-image-preview';
import { TablePagination } from 'src/components/table';
import {
  ReturnTabs,
  ReturnTypeTabs,
  ReturnStatusChip,
  ReturnFilter,
  getDefaultReturnDateRange,
} from './components';
import { formatPrice } from 'src/utils/format';

// ----------------------------------------------------------------------

export function ReturnView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const returns = useAppSelector(selectReturns);
  const loading = useAppSelector(selectReturnLoading);
  const pagination = useAppSelector(selectReturnPagination);
  const activeTab = useAppSelector(selectReturnActiveTab);
  const tabCounts = useAppSelector(selectReturnTabCounts);

  // Filter state
  const defaultDateRange = getDefaultReturnDateRange();
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(defaultDateRange.dateFrom);
  const [dateTo, setDateTo] = useState<Dayjs | null>(defaultDateRange.dateTo);
  const [orderNumber, setOrderNumber] = useState('');

  // Local state
  const [returnType, setReturnType] = useState<ReturnType | 'all'>(ReturnType.REFUND);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedReturns, setSelectedReturns] = useState<Set<string>>(new Set());

  // Fetch returns
  const fetchReturns = useCallback(() => {
    const filters: ReturnFilters = {
      tab: activeTab,
    };

    if (orderNumber) filters.orderNumber = orderNumber;
    if (dateFrom) filters.fromDate = dateFrom.startOf('day').toISOString();
    if (dateTo) filters.toDate = dateTo.endOf('day').toISOString();
    if (returnType !== 'all') filters.type = returnType as ReturnType;

    dispatch(
      getReturnsRequest({
        page: currentPage,
        limit: pageSize,
        filters,
      })
    );
  }, [dispatch, activeTab, currentPage, pageSize, orderNumber, dateFrom, dateTo, returnType]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  // Fetch tab counts on mount and when returnType changes
  useEffect(() => {
    // Convert 'all' to undefined for unfiltered counts
    const type = returnType === 'all' ? undefined : (returnType as 'refund' | 'exchange');
    dispatch(getReturnTabCountsRequest({ type }));
  }, [dispatch, returnType]);

  // Handlers
  const handleTabChange = (tab: ReturnTab) => {
    dispatch(setReturnActiveTab(tab));
    setCurrentPage(1);
  };

  const handleTypeChange = (type: ReturnType | 'all') => {
    setReturnType(type);
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReturns(new Set(returns.map((r) => r.id)));
    } else {
      setSelectedReturns(new Set());
    }
  };

  const handleSelectReturn = (returnId: string, checked: boolean) => {
    const newSelected = new Set(selectedReturns);
    if (checked) {
      newSelected.add(returnId);
    } else {
      newSelected.delete(returnId);
    }
    setSelectedReturns(newSelected);
  };

  const handleViewDetail = (returnRequest: ReturnRequest) => {
    navigate(`/return/${returnRequest.id}`);
  };

  const isAllSelected = returns.length > 0 && selectedReturns.size === returns.length;
  const isIndeterminate = selectedReturns.size > 0 && selectedReturns.size < returns.length;

  // Column widths configuration
  const columnWidths = {
    checkbox: '3%',
    customer: '11%',
    orderNumber: '9%',
    nhanhOrderId: '9%',
    product: '18%',
    quantity: '4%',
    amount: '9%',
    reason: '11%',
    shipping: '9%',
    status: '10%',
    actions: '7%',
  };

  // Table headers
  const headers = [
    { key: 'checkbox', label: '' },
    { key: 'customer', label: t('customer') },
    { key: 'orderNumber', label: t('orderNumber') },
    { key: 'nhanhOrderId', label: t('nhanhOrderId') },
    { key: 'product', label: t('productName') },
    { key: 'quantity', label: 'SL' },
    { key: 'amount', label: t('returnAmount') },
    { key: 'reason', label: t('returnReason') },
    { key: 'shipping', label: t('returnShipping') },
    { key: 'status', label: t('status') },
    { key: 'actions', label: t('actions') },
  ];

  // Get column style by key
  const getColumnStyle = (key: string, isLast = false) => ({
    width: columnWidths[key as keyof typeof columnWidths] ?? '10%',
    borderRight: isLast ? 'none' : '1px solid #E5E6EB',
  });

  // Render return row with grouped items
  const renderReturnRow = (ret: ReturnRequest, itemIndex: number, returnIndex: number) => {
    const item = ret.items[itemIndex];
    const isFirstItem = itemIndex === 0;
    const isLastItemOfReturn = itemIndex === ret.items.length - 1;
    const showMoreItems = isFirstItem && ret.items.length > 2;

    // Only show first 2 items, then "Xem thêm..." link
    if (itemIndex >= 2) return null;

    return (
      <Box
        key={`${ret.id}-${itemIndex}`}
        sx={{
          display: 'flex',
          bgcolor: returnIndex % 2 === 0 ? 'white' : '#FAFBFC',
          borderBottom:
            isLastItemOfReturn || itemIndex === 1 ? '2px solid #E0E3E7' : '1px solid #F0F1F3',
          minHeight: 60,
          '&:hover': { bgcolor: '#F5F7FA' },
        }}
      >
        {/* Checkbox */}
        <Box
          sx={{
            ...getColumnStyle('checkbox'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isFirstItem && (
            <Checkbox
              checked={selectedReturns.has(ret.id)}
              onChange={(e) => handleSelectReturn(ret.id, e.target.checked)}
              size="small"
            />
          )}
        </Box>

        {/* Customer column */}
        <Box
          sx={{
            ...getColumnStyle('customer'),
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {isFirstItem && (
            <>
              <Typography variant="body2" fontWeight={500} noWrap>
                {ret.customer.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {ret.customer.phone}
              </Typography>
            </>
          )}
        </Box>

        {/* Order Number column */}
        <Box
          sx={{
            ...getColumnStyle('orderNumber'),
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {isFirstItem && (
            <Typography variant="body2" sx={{ color: '#1C252E' }}>
              {ret.orderNumber}
            </Typography>
          )}
        </Box>

        {/* Nhanh.vn ID column */}
        <Box
          sx={{
            ...getColumnStyle('nhanhOrderId'),
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {isFirstItem && (
            <Typography variant="body2" sx={{ color: '#1C252E' }}>
              {ret.orderSnapshot?.nhanh.orderId || '--'}
            </Typography>
          )}
        </Box>

        {/* Product column */}
        <Box
          sx={{
            ...getColumnStyle('product'),
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TableImagePreview src={item.image} alt={item.name} width={40} height={40} />
            <Typography
              variant="body2"
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              title={item.name}
            >
              {item.name}
            </Typography>
          </Box>
          {itemIndex === 1 && ret.items.length > 2 && (
            <Typography
              variant="caption"
              sx={{ color: '#235AFF', cursor: 'pointer' }}
              onClick={() => handleViewDetail(ret)}
            >
              {t('viewMore')}...
            </Typography>
          )}
        </Box>

        {/* Quantity column */}
        <Box
          sx={{
            ...getColumnStyle('quantity'),
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body2">x{item.quantity}</Typography>
        </Box>

        {/* Amount column */}
        <Box
          sx={{
            ...getColumnStyle('amount'),
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          {isFirstItem && (
            <Typography variant="body2" fontWeight={500}>
              {formatPrice(ret.amount)}
            </Typography>
          )}
        </Box>

        {/* Reason column */}
        <Box
          sx={{
            ...getColumnStyle('reason'),
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {isFirstItem && (
            <Typography variant="body2" noWrap title={ret.reasonDetail || ''}>
              {ret.reasonDetail ||
                t(`returnReason${ret.reason.charAt(0).toUpperCase() + ret.reason.slice(1)}`)}
            </Typography>
          )}
        </Box>

        {/* Shipping column */}
        <Box
          sx={{
            ...getColumnStyle('shipping'),
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {isFirstItem && <Typography variant="body2">{ret.shippingCarrier || '--'}</Typography>}
        </Box>

        {/* Status column */}
        <Box
          sx={{
            ...getColumnStyle('status'),
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isFirstItem && <ReturnStatusChip status={ret.status} size="small" />}
        </Box>

        {/* Actions column */}
        <Box
          sx={{
            ...getColumnStyle('actions', true),
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isFirstItem && (
            <IconButton
              size="small"
              onClick={() => handleViewDetail(ret)}
              sx={{ color: '#235AFF' }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - var(--layout-header-desktop-height) - 16px)',
        overflow: 'hidden',
      }}
    >
      {/* Header Card */}
      <Card sx={{ mb: 2, mx: 2, mt: 2, flexShrink: 0 }}>
        {/* Type Tabs - Đơn trả hàng/hoàn tiền | Đổi hàng */}
        <ReturnTypeTabs activeType={returnType} onChange={handleTypeChange} />

        {/* Status Tabs */}
        <ReturnTabs activeTab={activeTab} tabCounts={tabCounts} onChange={handleTabChange} />

        {/* Filters */}
        <ReturnFilter
          dateFrom={dateFrom}
          dateTo={dateTo}
          orderNumber={orderNumber}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onOrderNumberChange={setOrderNumber}
        />
      </Card>

      {/* Table */}
      <Card
        sx={{
          mx: 2,
          flex: 1,
          overflow: 'auto',
        }}
      >
        {/* Table Container */}
        <Box sx={{ width: '100%', minWidth: 1000 }}>
          {/* Table Header */}
          <Box
            sx={{
              display: 'flex',
              bgcolor: '#F7F8FA',
              borderBottom: '2px solid #E5E6EB',
              position: 'sticky',
              top: 0,
              zIndex: 1,
            }}
          >
            {headers.map((header, index) => (
              <Box
                key={header.key}
                sx={{
                  ...getColumnStyle(header.key, index === headers.length - 1),
                  p: 1.5,
                  fontWeight: 600,
                  fontSize: 14,
                  color: '#1C252E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent:
                    header.key === 'checkbox' ||
                    header.key === 'quantity' ||
                    header.key === 'status' ||
                    header.key === 'actions'
                      ? 'center'
                      : header.key === 'amount'
                        ? 'flex-end'
                        : 'flex-start',
                }}
              >
                {header.key === 'checkbox' ? (
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    size="small"
                  />
                ) : (
                  header.label
                )}
              </Box>
            ))}
          </Box>

          {/* Table Body */}
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">{t('loading')}...</Typography>
            </Box>
          ) : returns.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">{t('noData')}</Typography>
            </Box>
          ) : (
            returns.map((ret, returnIndex) =>
              ret.items
                .slice(0, 2)
                .map((_, itemIndex) => renderReturnRow(ret, itemIndex, returnIndex))
            )
          )}
        </Box>
      </Card>

      {/* Pagination */}
      <Box sx={{ px: 2 }}>
        <TablePagination
          totalItems={pagination?.total ?? 0}
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={pagination?.totalPages ?? 0}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setCurrentPage(1);
          }}
        />
      </Box>
    </Box>
  );
}
