import {
  Box,
  Card,
  Typography,
  Checkbox,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Payment as PayIcon,
} from '@mui/icons-material';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getWithdrawalRequestsRequest,
  getWithdrawalRequestTabCountsRequest,
  selectWithdrawalRequests,
  selectWithdrawalRequestLoading,
  selectWithdrawalRequestPagination,
  selectWithdrawalRequestActiveTab,
  selectWithdrawalRequestActionLoading,
  setWithdrawalRequestActiveTab,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,
  payWithdrawalRequest,
  bulkApproveWithdrawalRequests,
  bulkRejectWithdrawalRequests,
  bulkPayWithdrawalRequests,
} from 'src/redux/store/withdrawalRequestSlice';
import type {
  WithdrawalRequestListItem,
  WithdrawalRequestTab,
  WithdrawalRequestFilters,
} from 'src/types/withdrawal-request';
import { TablePagination } from 'src/components/table';
import {
  WithdrawalRequestStatusChip,
  WithdrawalRequestFilter,
  BulkActionButtons,
  RejectionDialog,
  ConfirmActionDialog,
} from './components';
import { formatPrice, formatDate } from 'src/utils/format';

// Types for confirm dialog
type ConfirmAction = 'approve' | 'pay';
type ConfirmTarget = { type: 'single'; id: string } | { type: 'bulk' };

// ----------------------------------------------------------------------

export function WithdrawalRequestView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const requests = useAppSelector(selectWithdrawalRequests);
  const loading = useAppSelector(selectWithdrawalRequestLoading);
  const pagination = useAppSelector(selectWithdrawalRequestPagination);
  const activeTab = useAppSelector(selectWithdrawalRequestActiveTab);
  const actionLoading = useAppSelector(selectWithdrawalRequestActionLoading);

  // Local state
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>('approve');
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>({ type: 'bulk' });

  // Helper to normalize status (handles both number and string)
  const normalizeStatus = (status: string | number): string => {
    if (typeof status === 'number') {
      switch (status) {
        case 1:
          return 'pending';
        case 2:
          return 'approved';
        case 3:
          return 'paid';
        case 4:
          return 'rejected';
        default:
          return 'pending';
      }
    }
    return String(status).toLowerCase();
  };

  // Fetch requests
  const fetchRequests = useCallback(() => {
    const filters: WithdrawalRequestFilters = {
      tab: activeTab,
    };

    if (search) filters.search = search;

    dispatch(
      getWithdrawalRequestsRequest({
        page: currentPage,
        limit: pageSize,
        filters,
      })
    );
  }, [dispatch, activeTab, currentPage, pageSize, search]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Fetch tab counts on mount
  useEffect(() => {
    dispatch(getWithdrawalRequestTabCountsRequest());
  }, [dispatch]);

  // Handlers
  const handleTabChange = (tab: WithdrawalRequestTab) => {
    dispatch(setWithdrawalRequestActiveTab(tab));
    setCurrentPage(1);
    setSelectedRequests(new Set());
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(new Set(requests.map((r) => r.id)));
    } else {
      setSelectedRequests(new Set());
    }
  };

  const handleSelectRequest = (requestId: string, checked: boolean) => {
    const newSelected = new Set(selectedRequests);
    if (checked) {
      newSelected.add(requestId);
    } else {
      newSelected.delete(requestId);
    }
    setSelectedRequests(newSelected);
  };

  const handleViewDetail = (request: WithdrawalRequestListItem) => {
    navigate(`/withdrawal-request/${request.id}`);
  };

  // Single action handlers - open confirm dialog
  const handleSingleApprove = (request: WithdrawalRequestListItem) => {
    setConfirmAction('approve');
    setConfirmTarget({ type: 'single', id: request.id });
    setConfirmDialogOpen(true);
  };

  const handleSinglePay = (request: WithdrawalRequestListItem) => {
    setConfirmAction('pay');
    setConfirmTarget({ type: 'single', id: request.id });
    setConfirmDialogOpen(true);
  };

  const handleSingleReject = (request: WithdrawalRequestListItem) => {
    setRejectingRequestId(request.id);
    setRejectDialogOpen(true);
  };

  // Bulk action handlers - open confirm dialog
  const handleBulkApproveClick = () => {
    setConfirmAction('approve');
    setConfirmTarget({ type: 'bulk' });
    setConfirmDialogOpen(true);
  };

  const handleBulkReject = () => {
    setRejectingRequestId(null);
    setRejectDialogOpen(true);
  };

  const handleBulkPayClick = () => {
    setConfirmAction('pay');
    setConfirmTarget({ type: 'bulk' });
    setConfirmDialogOpen(true);
  };

  // Confirm dialog handler
  const handleConfirmAction = () => {
    if (confirmTarget.type === 'single') {
      if (confirmAction === 'approve') {
        dispatch(
          approveWithdrawalRequest({
            id: confirmTarget.id,
            onSuccess: () => {
              setConfirmDialogOpen(false);
              fetchRequests();
              dispatch(getWithdrawalRequestTabCountsRequest());
            },
          })
        );
      } else {
        dispatch(
          payWithdrawalRequest({
            id: confirmTarget.id,
            onSuccess: () => {
              setConfirmDialogOpen(false);
              fetchRequests();
              dispatch(getWithdrawalRequestTabCountsRequest());
            },
          })
        );
      }
    } else {
      // Bulk actions
      if (confirmAction === 'approve') {
        dispatch(
          bulkApproveWithdrawalRequests({
            ids: Array.from(selectedRequests),
            onSuccess: () => {
              setConfirmDialogOpen(false);
              setSelectedRequests(new Set());
              fetchRequests();
              dispatch(getWithdrawalRequestTabCountsRequest());
            },
          })
        );
      } else {
        dispatch(
          bulkPayWithdrawalRequests({
            ids: Array.from(selectedRequests),
            onSuccess: () => {
              setConfirmDialogOpen(false);
              setSelectedRequests(new Set());
              fetchRequests();
              dispatch(getWithdrawalRequestTabCountsRequest());
            },
          })
        );
      }
    }
  };

  // Reject handlers (both single and bulk)
  const handleConfirmReject = (reason: string) => {
    if (rejectingRequestId) {
      // Single reject
      dispatch(
        rejectWithdrawalRequest({
          id: rejectingRequestId,
          reason,
          onSuccess: () => {
            setRejectingRequestId(null);
            setRejectDialogOpen(false);
            fetchRequests();
            dispatch(getWithdrawalRequestTabCountsRequest());
          },
        })
      );
    } else {
      // Bulk reject
      dispatch(
        bulkRejectWithdrawalRequests({
          ids: Array.from(selectedRequests),
          reason,
          onSuccess: () => {
            setSelectedRequests(new Set());
            setRejectDialogOpen(false);
            fetchRequests();
            dispatch(getWithdrawalRequestTabCountsRequest());
          },
        })
      );
    }
  };

  const isAllSelected = requests.length > 0 && selectedRequests.size === requests.length;
  const isIndeterminate = selectedRequests.size > 0 && selectedRequests.size < requests.length;

  // Header cell style
  const headerCellSx = {
    fontWeight: 600,
    bgcolor: '#F5F6FA',
    borderBottom: '2px solid #E5E6EB',
    whiteSpace: 'nowrap',
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
        {/* Page Title */}
        <Box sx={{ p: 2, borderBottom: '1px solid #E5E6EB' }}>
          <Typography variant="h5" fontWeight={600}>
            {t('withdrawalRequestList')}
          </Typography>
        </Box>

        {/* Filters */}
        <WithdrawalRequestFilter
          search={search}
          activeTab={activeTab}
          onSearchChange={handleSearchChange}
          onTabChange={handleTabChange}
        />

        {/* Bulk Actions */}
        <BulkActionButtons
          selectedCount={selectedRequests.size}
          selectedStatuses={requests
            .filter((r) => selectedRequests.has(r.id))
            .map((r) => normalizeStatus(r.status))}
          loading={actionLoading}
          onApprove={handleBulkApproveClick}
          onReject={handleBulkReject}
          onPay={handleBulkPayClick}
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
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={headerCellSx}>
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    size="small"
                  />
                </TableCell>
                <TableCell sx={headerCellSx}>{t('agentName')}</TableCell>
                <TableCell sx={headerCellSx} align="right">
                  {t('amount')}
                </TableCell>
                <TableCell sx={headerCellSx}>{t('requestDate')}</TableCell>
                <TableCell sx={headerCellSx}>{t('processor')}</TableCell>
                <TableCell sx={headerCellSx}>{t('processDate')}</TableCell>
                <TableCell sx={headerCellSx} align="center">
                  {t('status')}
                </TableCell>
                <TableCell sx={headerCellSx} align="center">
                  {t('actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">{t('loading')}...</Typography>
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">{t('noData')}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request, index) => (
                  <TableRow
                    key={request.id}
                    hover
                    sx={{
                      bgcolor: index % 2 === 0 ? 'white' : '#FAFBFC',
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedRequests.has(request.id)}
                        onChange={(e) => handleSelectRequest(request.id, e.target.checked)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500} noWrap>
                        {request.agentName}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={500}>
                        {formatPrice(request.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(request.requestDate)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{'--'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{'--'}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <WithdrawalRequestStatusChip status={request.status} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        {normalizeStatus(request.status) === 'pending' && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleSingleApprove(request)}
                              disabled={actionLoading}
                              sx={{ color: '#178B30' }}
                              title={t('approveRequest')}
                            >
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleSingleReject(request)}
                              disabled={actionLoading}
                              sx={{ color: '#F62E2E' }}
                              title={t('rejectRequestTitle')}
                            >
                              <RejectIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                        {normalizeStatus(request.status) === 'approved' && (
                          <IconButton
                            size="small"
                            onClick={() => handleSinglePay(request)}
                            disabled={actionLoading}
                            sx={{ color: '#0165FC' }}
                            title={t('payRequest')}
                          >
                            <PayIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetail(request)}
                          sx={{ color: '#235AFF' }}
                          title={t('detail')}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
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

      {/* Rejection Dialog */}
      <RejectionDialog
        open={rejectDialogOpen}
        loading={actionLoading}
        onClose={() => {
          setRejectDialogOpen(false);
          setRejectingRequestId(null);
        }}
        onConfirm={handleConfirmReject}
      />

      {/* Confirm Action Dialog */}
      <ConfirmActionDialog
        open={confirmDialogOpen}
        loading={actionLoading}
        action={confirmAction}
        count={confirmTarget.type === 'single' ? 1 : selectedRequests.size}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmAction}
      />
    </Box>
  );
}
