import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, Grid, IconButton, MenuItem, Select, Typography } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useReactTable, getCoreRowModel, createColumnHelper } from '@tanstack/react-table';
import { DataTable } from 'src/components/table/data-table';
import { TablePagination } from 'src/components/table/table-pagination';
import { formatPrice, formatDate } from 'src/utils/format';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import { selectCurrentUser } from 'src/redux/store/authSlice';
import {
  getMyWithdrawalRequestsRequest,
  getMyBalanceRequest,
  selectMyWithdrawalRequests,
  selectMyWithdrawalRequestsLoading,
  selectMyWithdrawalRequestsPagination,
  selectMyBalance,
} from 'src/redux/store/affiliatePortalSlice';
import { WithdrawalRequestStatusChip } from 'src/sections/withdrawal-request/components/withdrawal-request-status-chip';
import type { WithdrawalRequestListItem, WithdrawalRequestTab } from 'src/types/withdrawal-request';
import { WithdrawalRequestStatus } from 'src/types/withdrawal-request';
import { affiliatePortalRepository } from 'src/repositories/affiliate-portal.repository';
import type { Affiliate } from 'src/types/gen/shared/shared/affiliates/affiliate';
import { CreateWithdrawalRequestDialog } from './components/create-withdrawal-request-dialog';

const STATUS_OPTIONS: { value: WithdrawalRequestTab; labelKey: string }[] = [
  { value: 'all', labelKey: 'all' },
  { value: 'pending', labelKey: 'withdrawalStatusPending' },
  { value: 'approved', labelKey: 'withdrawalStatusApproved' },
  { value: 'paid', labelKey: 'withdrawalStatusPaid' },
  { value: 'rejected', labelKey: 'withdrawalStatusRejected' },
];

/**
 * My Withdrawal Requests View — affiliate manages their withdrawal requests with balance overview.
 */
export function MyWithdrawalRequestsView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);

  const requests = useAppSelector(selectMyWithdrawalRequests);
  const loading = useAppSelector(selectMyWithdrawalRequestsLoading);
  const pagination = useAppSelector(selectMyWithdrawalRequestsPagination);
  const balance = useAppSelector(selectMyBalance);

  const [statusFilter, setStatusFilter] = useState<WithdrawalRequestTab>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [affiliateInfo, setAffiliateInfo] = useState<Affiliate | null>(null);

  useEffect(() => {
    dispatch(getMyBalanceRequest());
  }, [dispatch]);

  useEffect(() => {
    if (!currentUser?.affiliateId) return;
    affiliatePortalRepository
      .getMyProfile()
      .then((affiliate) => setAffiliateInfo(affiliate))
      .catch(() => {});
  }, [currentUser?.affiliateId]);

  const fetchRequests = useCallback(() => {
    dispatch(
      getMyWithdrawalRequestsRequest({
        page: currentPage,
        limit: pageSize,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      })
    );
  }, [dispatch, currentPage, pageSize, statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const columnHelper = createColumnHelper<WithdrawalRequestListItem>();

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'index',
        header: '#',
        size: 50,
        cell: (info) => (currentPage - 1) * pageSize + info.row.index + 1,
      }),
      columnHelper.accessor('id', {
        header: t('requestCode'),
        size: 160,
        cell: (info) => (
          <Typography variant="body2" color="primary" sx={{ fontFamily: 'monospace' }}>
            {info.getValue()?.slice(-8).toUpperCase()}
          </Typography>
        ),
      }),
      columnHelper.accessor('amount', {
        header: t('withdrawalAmount'),
        size: 130,
        cell: (info) => formatPrice(info.getValue()),
      }),
      columnHelper.accessor('status', {
        header: t('status'),
        size: 120,
        cell: (info) => <WithdrawalRequestStatusChip status={info.getValue()} size="small" />,
      }),
      columnHelper.accessor('requestDate', {
        header: t('withdrawalDateSent'),
        size: 140,
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.display({
        id: 'receivedDate',
        header: t('withdrawalDateReceived'),
        size: 140,
        cell: (info) => {
          const { status, processedDate } = info.row.original;
          if (status === WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_PAID && processedDate) {
            return formatDate(processedDate);
          }
          return '-';
        },
      }),
      columnHelper.display({
        id: 'accountInfo',
        header: () => (
          <Box sx={{ textAlign: 'center', width: '100%' }}>{t('commissionAccountInfo')}</Box>
        ),
        size: 200,
        cell: (info) => (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">{info.row.original.recipientName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {info.row.original.bankAccountNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {info.row.original.bankName}
            </Typography>
          </Box>
        ),
      }),
      columnHelper.accessor('amount', {
        id: 'actualReceived',
        header: t('actualReceived'),
        size: 130,
        cell: (info) => {
          const status = info.row.original.status;
          return status === WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_PAID
            ? formatPrice(info.getValue())
            : formatPrice(0);
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: t('actions'),
        size: 70,
        cell: (info) => (
          <IconButton
            size="small"
            onClick={() => navigate(`/my-withdrawal-requests/${info.row.original.id}`)}
            sx={{ color: 'success.main' }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        ),
      }),
    ],
    [columnHelper, t, currentPage, pageSize, navigate]
  );

  const table = useReactTable({
    data: requests,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const balanceCards = [
    {
      labelKey: 'availableCommission',
      value: balance?.availableBalance ?? 0,
      color: 'success.main',
    },
    {
      labelKey: 'pendingCommission',
      value: balance?.pendingAmount ?? 0,
      color: 'warning.main',
    },
    { labelKey: 'withdrawnAmount', value: balance?.totalWithdrawn ?? 0, color: 'text.primary' },
    { labelKey: 'totalCommission', value: balance?.totalEarned ?? 0, color: 'text.primary' },
  ];

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5">{t('myWithdrawalRequests')}</Typography>

      {/* Balance cards */}
      <Grid container spacing={2}>
        {balanceCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.labelKey}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t(card.labelKey)}
              </Typography>
              <Typography variant="h6" sx={{ color: card.color, fontWeight: 600 }}>
                {formatPrice(card.value)}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* List section */}
      <Card>
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {t('withdrawalRequestList')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {t('status')}
              </Typography>
              <Select
                size="small"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as WithdrawalRequestTab);
                  setCurrentPage(1);
                }}
                sx={{ minWidth: 130 }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Button variant="contained" onClick={() => setDialogOpen(true)}>
              {t('withdraw')}
            </Button>
          </Box>
        </Box>

        <Box sx={{ p: 2 }}>
          <Box sx={{ overflow: 'auto', minHeight: 300 }}>
            {loading ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">{t('loading')}...</Typography>
              </Box>
            ) : requests.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">{t('noData')}</Typography>
              </Box>
            ) : (
              <DataTable table={table} />
            )}
          </Box>
          <Box sx={{ mt: 2 }}>
            <TablePagination
              totalItems={pagination?.total ?? 0}
              currentPage={currentPage}
              pageSize={pageSize}
              totalPages={pagination?.totalPages ?? 1}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </Box>
        </Box>
      </Card>

      <CreateWithdrawalRequestDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={fetchRequests}
        defaultRecipientName={affiliateInfo?.bankAccountHolder ?? ''}
        defaultBankAccountNumber={affiliateInfo?.bankAccountNumber ?? ''}
        defaultBankName={affiliateInfo?.bankName ?? ''}
        availableBalance={balance?.availableBalance}
      />
    </Box>
  );
}
