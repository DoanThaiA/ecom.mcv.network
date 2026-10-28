import {
  Box,
  Card,
  Typography,
  Checkbox,
  IconButton,
  Tooltip,
  Button,
  CircularProgress,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Dayjs } from 'dayjs';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getOrdersRequest,
  selectOrders,
  selectOrderLoading,
  selectOrderPagination,
  selectActiveTab,
  selectTabCounts,
  setActiveTab,
} from 'src/redux/store/orderSlice';
import {
  nhanhUnsyncedCountRequest,
  nhanhRetryOrderSyncRequest,
  selectNhanhRetryingOrderIds,
} from 'src/redux/store/nhanhSlice';
import type { Order, OrderTab, OrderStatus, OrderFilters } from 'src/types/orders';
import { TableImagePreview } from 'src/components/table-image-preview';
import { TablePagination } from 'src/components/table';
import { OrderTabs, OrderFilter, OrderStatusChip, getDefaultDateRange } from './components';
import { formatPrice, formatDate } from 'src/utils/format';

// ----------------------------------------------------------------------

export function OrderView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const orders = useAppSelector(selectOrders);
  const loading = useAppSelector(selectOrderLoading);
  const pagination = useAppSelector(selectOrderPagination);
  const activeTab = useAppSelector(selectActiveTab);
  const tabCounts = useAppSelector(selectTabCounts);
  const retryingOrderIds = useAppSelector(selectNhanhRetryingOrderIds);

  // Fetch unsynced count on mount so tab badge is accurate
  useEffect(() => {
    dispatch(nhanhUnsyncedCountRequest());
  }, [dispatch]);

  // Filter state
  const defaultDateRange = getDefaultDateRange();
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(defaultDateRange.dateFrom);
  const [dateTo, setDateTo] = useState<Dayjs | null>(defaultDateRange.dateTo);
  const [orderNumber, setOrderNumber] = useState('');
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selection state
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  // Calculate total summary
  const totalSummary = useMemo(() => {
    return {
      quantity: orders.reduce(
        (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
        0
      ),
      total: orders.reduce((sum, order) => sum + order.total, 0),
    };
  }, [orders]);

  // Fetch orders
  const fetchOrders = useCallback(() => {
    const filters: OrderFilters = {
      tab: activeTab,
    };

    if (orderNumber) filters.orderNumber = orderNumber;
    if (status) filters.status = status;
    if (phone) filters.phone = phone;
    if (dateFrom) filters.fromDate = dateFrom.startOf('day').toISOString();
    if (dateTo) filters.toDate = dateTo.endOf('day').toISOString();
    if (activeTab === 'nhanhUnsynced') filters.nhanhSynced = false;

    dispatch(
      getOrdersRequest({
        page: currentPage,
        limit: pageSize,
        filters,
      })
    );
  }, [dispatch, activeTab, currentPage, pageSize, orderNumber, status, phone, dateFrom, dateTo]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handlers
  const handleTabChange = (tab: OrderTab) => {
    dispatch(setActiveTab(tab));
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(new Set(orders.map((o) => o.id)));
    } else {
      setSelectedOrders(new Set());
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    const newSelected = new Set(selectedOrders);
    if (checked) {
      newSelected.add(orderId);
    } else {
      newSelected.delete(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const isAllSelected = orders.length > 0 && selectedOrders.size === orders.length;
  const isIndeterminate = selectedOrders.size > 0 && selectedOrders.size < orders.length;

  // Column widths configuration (percentage based for responsive)
  const columnWidths = {
    checkbox: '3%',
    id: '10%',
    nhanhOrderId: '8%',
    customer: '10%',
    product: '17%',
    price: '8%',
    quantity: '4%',
    shipping: '7%',
    total: '9%',
    description: '11%',
    status: '13%',
  };

  // Table headers
  const headers = [
    { key: 'checkbox', label: '' },
    { key: 'id', label: t('id') },
    { key: 'nhanhOrderId', label: t('nhanhOrderId') },
    { key: 'customer', label: t('customer') },
    { key: 'product', label: t('products') },
    { key: 'price', label: t('price') },
    { key: 'quantity', label: 'SL' },
    { key: 'shipping', label: t('shipping') },
    { key: 'total', label: t('paymentAmount') },
    { key: 'description', label: t('description') },
    { key: 'status', label: t('status') },
  ];

  // Get column style by key
  const getColumnStyle = (key: string, isLast = false) => ({
    width: columnWidths[key as keyof typeof columnWidths] ?? '10%',
    borderRight: isLast ? 'none' : '1px solid #E5E6EB',
  });

  // Render order row with grouped items
  const renderOrderRow = (order: Order, itemIndex: number, orderIndex: number) => {
    const item = order.items[itemIndex];
    const isFirstItem = itemIndex === 0;
    const isLastItemOfOrder = itemIndex === order.items.length - 1;

    return (
      <Box
        key={`${order.id}-${itemIndex}`}
        sx={{
          display: 'flex',
          bgcolor: orderIndex % 2 === 0 ? 'white' : '#FAFBFC',
          borderBottom: isLastItemOfOrder ? '2px solid #E0E3E7' : '1px solid #F0F1F3',
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
              checked={selectedOrders.has(order.id)}
              onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
              size="small"
            />
          )}
        </Box>

        {/* ID column */}
        <Box
          sx={{
            ...getColumnStyle('id'),
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {isFirstItem && (
            <>
              <Typography
                variant="body2"
                sx={{
                  color: '#235AFF',
                  cursor: 'pointer',
                  fontWeight: 500,
                  '&:hover': { textDecoration: 'underline' },
                }}
                onClick={() => navigate(`/order/${order.id}`)}
              >
                {order.orderNumber}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(order.createdAt)}
              </Typography>
            </>
          )}
        </Box>

        {/* Nhanh.vn ID column */}
        <Box
          sx={{
            ...getColumnStyle('nhanhOrderId'),
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {isFirstItem &&
            (order.nhanh?.orderId ? (
              <>
                <Typography variant="body2" sx={{ color: '#1C252E' }}>
                  {order.nhanh.orderId}
                </Typography>
                <Tooltip title={t('copy')} arrow>
                  <IconButton
                    size="small"
                    onClick={() => navigator.clipboard.writeText(String(order.nhanh?.orderId))}
                    sx={{ p: 0.25 }}
                  >
                    <ContentCopyIcon sx={{ fontSize: 14, color: '#637381' }} />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Tooltip
                title={order.nhanh?.syncError || t('nhanhRetrySyncTooltip')}
                arrow
                placement="top"
              >
                <span>
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    disabled={retryingOrderIds.includes(order.id)}
                    startIcon={
                      retryingOrderIds.includes(order.id) ? (
                        <CircularProgress size={12} color="inherit" />
                      ) : (
                        <RefreshIcon sx={{ fontSize: 14 }} />
                      )
                    }
                    onClick={() =>
                      dispatch(
                        nhanhRetryOrderSyncRequest({
                          orderId: order.id,
                          onSuccess: fetchOrders,
                        })
                      )
                    }
                    sx={{ minWidth: 0, px: 1, py: 0.25, fontSize: 12, textTransform: 'none' }}
                  >
                    {t('retry')}
                  </Button>
                </span>
              </Tooltip>
            ))}
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
                {order.customer?.name || '--'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {order.customer?.phone || '--'}
              </Typography>
            </>
          )}
        </Box>

        {/* Product column */}
        <Box
          sx={{
            ...getColumnStyle('product'),
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            overflow: 'hidden',
          }}
        >
          <TableImagePreview src={item.image} alt={item.name} width={40} height={40} />
          <Typography
            variant="body2"
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            title={item.name}
          >
            {item.name}
          </Typography>
        </Box>

        {/* Price column */}
        <Box
          sx={{
            ...getColumnStyle('price'),
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <Typography variant="body2">{formatPrice(item.price)}</Typography>
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
          <Typography variant="body2">{item.quantity}</Typography>
        </Box>

        {/* Shipping column */}
        <Box
          sx={{
            ...getColumnStyle('shipping'),
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isFirstItem && (
            <Typography variant="body2">
              {order.shippingFee > 0 ? formatPrice(order.shippingFee) : '--'}
            </Typography>
          )}
        </Box>

        {/* Total column */}
        <Box
          sx={{
            ...getColumnStyle('total'),
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          {isFirstItem && (
            <>
              <Typography variant="body2" sx={{ color: '#178B30', fontWeight: 500 }}>
                {formatPrice(order.total)}
              </Typography>
              {order.discount && order.discount > 0 && (
                <Typography variant="caption" sx={{ color: '#F62E2E' }}>
                  -{formatPrice(order.discount)}
                </Typography>
              )}
            </>
          )}
        </Box>

        {/* Description column */}
        <Box
          sx={{
            ...getColumnStyle('description'),
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {isFirstItem && (
            <Typography variant="body2" noWrap title={order.note || ''}>
              {order.note || '--'}
            </Typography>
          )}
        </Box>

        {/* Status column */}
        <Box
          sx={{
            ...getColumnStyle('status', true),
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isFirstItem && <OrderStatusChip status={order.status} size="small" />}
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
      {/* Tabs */}
      <Card sx={{ mb: 2, mx: 2, mt: 2, flexShrink: 0 }}>
        <OrderTabs activeTab={activeTab} tabCounts={tabCounts} onChange={handleTabChange} />

        {/* Filters */}
        <OrderFilter
          dateFrom={dateFrom}
          dateTo={dateTo}
          orderNumber={orderNumber}
          status={status}
          customerName={customerName}
          phone={phone}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onOrderNumberChange={setOrderNumber}
          onStatusChange={setStatus}
          onCustomerNameChange={setCustomerName}
          onPhoneChange={setPhone}
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
        <Box sx={{ width: '100%', minWidth: 900 }}>
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
                    header.key === 'shipping' ||
                    header.key === 'status'
                      ? 'center'
                      : ['price', 'total'].includes(header.key)
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

          {/* Summary Row */}
          <Box
            sx={{
              display: 'flex',
              bgcolor: '#F0F4F8',
              borderBottom: '1px solid #E5E6EB',
              position: 'sticky',
              top: 52,
              zIndex: 1,
            }}
          >
            <Box sx={{ ...getColumnStyle('checkbox') }} />
            <Box sx={{ ...getColumnStyle('id') }} />
            <Box sx={{ ...getColumnStyle('nhanhOrderId') }} />
            <Box sx={{ ...getColumnStyle('customer'), p: 1.5 }}>
              <Typography variant="body2" fontWeight={600}>
                {t('total')}
              </Typography>
            </Box>
            <Box sx={{ ...getColumnStyle('product') }} />
            <Box sx={{ ...getColumnStyle('price') }} />
            <Box
              sx={{
                ...getColumnStyle('quantity'),
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                {totalSummary.quantity}
              </Typography>
            </Box>
            <Box sx={{ ...getColumnStyle('shipping') }} />
            <Box
              sx={{
                ...getColumnStyle('total'),
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <Typography variant="body2" fontWeight={600} sx={{ color: '#178B30' }}>
                {formatPrice(totalSummary.total)}
              </Typography>
            </Box>
            <Box sx={{ ...getColumnStyle('description') }} />
            <Box sx={{ ...getColumnStyle('status', true) }} />
          </Box>

          {/* Table Body */}
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">{t('loading')}...</Typography>
            </Box>
          ) : orders.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">{t('noData')}</Typography>
            </Box>
          ) : (
            orders.map((order, orderIndex) =>
              order.items.map((_, itemIndex) => renderOrderRow(order, itemIndex, orderIndex))
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
