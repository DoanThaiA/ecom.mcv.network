import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Card, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getMyWithdrawalRequestByIdRequest,
  clearCurrentWithdrawalRequest,
  selectCurrentWithdrawalRequest,
  selectCurrentWithdrawalRequestLoading,
} from 'src/redux/store/affiliatePortalSlice';
import { formatPrice, formatDate } from 'src/utils/format';
import { WithdrawalRequestStatus } from 'src/types/withdrawal-request';

const getStatusColor = (status: WithdrawalRequestStatus): string => {
  switch (status) {
    case WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_PENDING:
      return '#FF9500';
    case WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_APPROVED:
      return '#0165FC';
    case WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_PAID:
      return '#178B30';
    case WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_REJECTED:
      return '#F62E2E';
    default:
      return '#000000';
  }
};

const getStatusLabel = (status: WithdrawalRequestStatus, t: (key: string) => string): string => {
  switch (status) {
    case WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_PENDING:
      return t('withdrawalStatusPending');
    case WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_APPROVED:
      return t('withdrawalStatusApproved');
    case WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_PAID:
      return t('withdrawalStatusPaid');
    case WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_REJECTED:
      return t('withdrawalStatusRejected');
    default:
      return '-';
  }
};

/**
 * My Withdrawal Request Detail View — read-only detail for affiliate's own withdrawal request.
 */
export function MyWithdrawalRequestDetailView() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const request = useAppSelector(selectCurrentWithdrawalRequest);
  const loading = useAppSelector(selectCurrentWithdrawalRequestLoading);

  useEffect(() => {
    if (id) {
      dispatch(getMyWithdrawalRequestByIdRequest({ id }));
    }
    return () => {
      dispatch(clearCurrentWithdrawalRequest());
    };
  }, [dispatch, id]);

  const status = request?.status ?? WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_UNSPECIFIED;

  const showProcessorFields =
    status === WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_APPROVED ||
    status === WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_PAID ||
    status === WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_REJECTED;
  const showReceivedDate = status === WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_PAID;
  const showRejectionReason = status === WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_REJECTED;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        {t('withdrawalRequestDetail')}
      </Typography>

      <Card sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          {t('basicInfo')}
        </Typography>

        {loading && !request ? (
          <Typography color="text.secondary">{t('loading')}...</Typography>
        ) : (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,
              }}
            >
              {/* Left column */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <DetailRow label={t('agentName')} value={request?.agentName} />
                <DetailRow label={t('recipientName')} value={request?.recipientName} />
                <DetailRow label={t('bankAccountNumber')} value={request?.bankAccountNumber} />
                <DetailRow label={t('note')} value={request?.note} />
                {showProcessorFields && (
                  <DetailRow label={t('processorName')} value={request?.processedBy} />
                )}
                {showRejectionReason && (
                  <DetailRow label={t('rejectionReason')} value={request?.rejectionReason} />
                )}
              </Box>

              {/* Right column */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <DetailRow label={t('requestCode')} value={request?.id?.slice(-8).toUpperCase()} />
                <DetailRow
                  label={t('withdrawalAmount')}
                  value={request?.amount !== undefined ? formatPrice(request.amount) : undefined}
                />
                <DetailRow
                  label={t('withdrawalDateSent')}
                  value={request?.requestDate ? formatDate(request.requestDate) : undefined}
                />
                <DetailRow label={t('bankName')} value={request?.bankName} />
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180 }}>
                    {t('status')}:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: getStatusColor(status), fontWeight: 500 }}
                  >
                    {getStatusLabel(status, t)}
                  </Typography>
                </Box>
                {showProcessorFields && (
                  <DetailRow
                    label={t('processDate')}
                    value={request?.processedDate ? formatDate(request.processedDate) : undefined}
                  />
                )}
                {showReceivedDate && (
                  <DetailRow
                    label={t('withdrawalDateReceived')}
                    value={request?.processedDate ? formatDate(request.processedDate) : undefined}
                  />
                )}
              </Box>
            </Box>
          </>
        )}

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            {t('back')}
          </Button>
        </Box>
      </Card>
    </Box>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180 }}>
        {label}:
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value ?? '-'}
      </Typography>
    </Box>
  );
}
