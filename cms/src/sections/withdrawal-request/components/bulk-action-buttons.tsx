import { Box, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PaymentIcon from '@mui/icons-material/Payment';
import { useTranslation } from 'react-i18next';

interface BulkActionButtonsProps {
  selectedCount: number;
  selectedStatuses: string[];
  loading?: boolean;
  onApprove: () => void;
  onReject: () => void;
  onPay: () => void;
}

export function BulkActionButtons({
  selectedCount,
  selectedStatuses,
  loading = false,
  onApprove,
  onReject,
  onPay,
}: BulkActionButtonsProps) {
  const { t } = useTranslation();

  if (selectedCount === 0) return null;

  // Check if any selected item has specific status
  const hasPending = selectedStatuses.includes('pending');
  const hasApproved = selectedStatuses.includes('approved');

  // Buttons enabled state based on selected statuses
  const canApprove = hasPending;
  const canReject = hasPending;
  const canPay = hasApproved;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        bgcolor: '#F5F6FA',
        borderBottom: '1px solid #E5E6EB',
      }}
    >
      <Box sx={{ fontWeight: 500, color: 'text.secondary' }}>
        {t('selected')}: {selectedCount}
      </Box>

      <Button
        variant="contained"
        color="primary"
        size="small"
        startIcon={<CheckCircleIcon />}
        onClick={onApprove}
        disabled={loading || !canApprove}
        sx={{ textTransform: 'none' }}
      >
        {t('approveRequest')}
      </Button>

      <Button
        variant="outlined"
        color="error"
        size="small"
        startIcon={<CancelIcon />}
        onClick={onReject}
        disabled={loading || !canReject}
        sx={{ textTransform: 'none' }}
      >
        {t('rejectRequestTitle')}
      </Button>

      <Button
        variant="contained"
        color="success"
        size="small"
        startIcon={<PaymentIcon />}
        onClick={onPay}
        disabled={loading || !canPay}
        sx={{ textTransform: 'none' }}
      >
        {t('payRequest')}
      </Button>
    </Box>
  );
}
