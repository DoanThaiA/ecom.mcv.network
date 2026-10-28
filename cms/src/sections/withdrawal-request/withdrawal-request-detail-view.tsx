import { Box, Card, Typography, Button, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getWithdrawalRequestByIdRequest,
  selectCurrentWithdrawalRequest,
  selectCurrentWithdrawalRequestLoading,
  selectWithdrawalRequestActionLoading,
  clearCurrentWithdrawalRequest,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,
  payWithdrawalRequest,
  getWithdrawalRequestTabCountsRequest,
} from 'src/redux/store/withdrawalRequestSlice';
import { RejectionDialog } from './components';
import { formatPrice, formatDate } from 'src/utils/format';
import { getWithdrawalStatusKey } from 'src/types/withdrawal-request';

// ----------------------------------------------------------------------

/** Get hex color for status text display */
const getStatusTextColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return '#FF9500';
    case 'approved':
      return '#0165FC';
    case 'paid':
      return '#178B30';
    case 'rejected':
      return '#F62E2E';
    default:
      return '#000000';
  }
};

export function WithdrawalRequestDetailView() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const request = useAppSelector(selectCurrentWithdrawalRequest);
  const loading = useAppSelector(selectCurrentWithdrawalRequestLoading);
  const actionLoading = useAppSelector(selectWithdrawalRequestActionLoading);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getWithdrawalRequestByIdRequest({ id }));
    }

    return () => {
      dispatch(clearCurrentWithdrawalRequest());
    };
  }, [dispatch, id]);

  const handleBack = () => {
    navigate('/withdrawal-request');
  };

  const handleApprove = () => {
    if (!id) return;
    dispatch(
      approveWithdrawalRequest({
        id,
        onSuccess: () => {
          dispatch(getWithdrawalRequestByIdRequest({ id }));
          dispatch(getWithdrawalRequestTabCountsRequest());
        },
      })
    );
  };

  const handleReject = () => {
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = (reason: string) => {
    if (!id) return;
    dispatch(
      rejectWithdrawalRequest({
        id,
        reason,
        onSuccess: () => {
          setRejectDialogOpen(false);
          dispatch(getWithdrawalRequestByIdRequest({ id }));
          dispatch(getWithdrawalRequestTabCountsRequest());
        },
      })
    );
  };

  const handlePay = () => {
    if (!id) return;
    dispatch(
      payWithdrawalRequest({
        id,
        onSuccess: () => {
          dispatch(getWithdrawalRequestByIdRequest({ id }));
          dispatch(getWithdrawalRequestTabCountsRequest());
        },
      })
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!request) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">{t('noData')}</Typography>
      </Box>
    );
  }

  // Helper to normalize status (handles both number and string)
  const normalizeStatus = (statusValue: string | number): string => {
    if (typeof statusValue === 'number') {
      switch (statusValue) {
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
    return String(statusValue).toLowerCase();
  };

  // Determine which actions to show based on status
  const status = normalizeStatus(request.status);
  const showApproveReject = status === 'pending';
  const showPay = status === 'approved';
  const showBackOnly = status === 'paid' || status === 'rejected';

  return (
    <Box sx={{ p: 2 }}>
      {/* Page Title */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          {t('withdrawalRequestDetail')}
        </Typography>
      </Box>

      {/* Request Details Card */}
      <Card sx={{ p: 3, boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
          {t('basicInformation')}
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          {/* Left Column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex' }}>
              <Typography variant="body2" fontWeight={600} sx={{ width: 200, flexShrink: 0 }}>
                {t('agentName')}:
              </Typography>
              <Typography variant="body2">{request.agentName}</Typography>
            </Box>

            <Box sx={{ display: 'flex' }}>
              <Typography variant="body2" fontWeight={600} sx={{ width: 200, flexShrink: 0 }}>
                {t('recipientName')}:
              </Typography>
              <Typography variant="body2">{request.recipientName}</Typography>
            </Box>

            <Box sx={{ display: 'flex' }}>
              <Typography variant="body2" fontWeight={600} sx={{ width: 200, flexShrink: 0 }}>
                {t('bankAccountNumber')}:
              </Typography>
              <Typography variant="body2">{request.bankAccountNumber}</Typography>
            </Box>

            <Box sx={{ display: 'flex' }}>
              <Typography variant="body2" fontWeight={600} sx={{ width: 200, flexShrink: 0 }}>
                {t('note')}:
              </Typography>
              <Typography variant="body2">{request.note || '-'}</Typography>
            </Box>
          </Box>

          {/* Right Column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex' }}>
              <Typography variant="body2" fontWeight={600} sx={{ width: 200, flexShrink: 0 }}>
                {t('amount')}:
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: '#178B30' }}>
                {formatPrice(request.amount)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex' }}>
              <Typography variant="body2" fontWeight={600} sx={{ width: 200, flexShrink: 0 }}>
                {t('requestDate')}:
              </Typography>
              <Typography variant="body2">{formatDate(request.requestDate)}</Typography>
            </Box>

            <Box sx={{ display: 'flex' }}>
              <Typography variant="body2" fontWeight={600} sx={{ width: 200, flexShrink: 0 }}>
                {t('bankName')}:
              </Typography>
              <Typography variant="body2">{request.bankName}</Typography>
            </Box>

            <Box sx={{ display: 'flex' }}>
              <Typography variant="body2" fontWeight={600} sx={{ width: 200, flexShrink: 0 }}>
                {t('status')}:
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ color: getStatusTextColor(status) }}
              >
                {t(getWithdrawalStatusKey(request.status))}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Additional info when rejected */}
        {request.rejectionReason && (
          <Box sx={{ display: 'flex', mt: 2 }}>
            <Typography variant="body2" fontWeight={600} sx={{ width: 200, flexShrink: 0 }}>
              {t('rejectionReason')}:
            </Typography>
            <Typography variant="body2" sx={{ color: '#F62E2E' }}>
              {request.rejectionReason}
            </Typography>
          </Box>
        )}

        {/* Action Buttons - centered below the card content */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          {showBackOnly && (
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack}>
              {t('back')}
            </Button>
          )}

          {showApproveReject && (
            <>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleReject}
                disabled={actionLoading}
              >
                {t('rejectRequestTitle')}
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                {t('approveRequest')}
              </Button>
            </>
          )}

          {showPay && (
            <Button
              variant="contained"
              color="success"
              onClick={handlePay}
              disabled={actionLoading}
            >
              {t('payRequest')}
            </Button>
          )}
        </Box>
      </Card>

      {/* Rejection Dialog */}
      <RejectionDialog
        open={rejectDialogOpen}
        loading={actionLoading}
        onClose={() => setRejectDialogOpen(false)}
        onConfirm={handleConfirmReject}
      />
    </Box>
  );
}
