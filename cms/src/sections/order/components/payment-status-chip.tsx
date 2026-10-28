import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PaymentStatus, getPaymentStatusKey } from 'src/types/orders';

interface PaymentStatusChipProps {
  status: PaymentStatus;
  size?: 'small' | 'medium';
}

const getPaymentStatusColor = (
  status: PaymentStatus
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case PaymentStatus.PENDING:
      return 'warning';
    case PaymentStatus.PAID:
      return 'success';
    case PaymentStatus.FAILED:
      return 'error';
    case PaymentStatus.REFUNDED:
      return 'info';
    default:
      return 'default';
  }
};

export function PaymentStatusChip({ status, size = 'small' }: PaymentStatusChipProps) {
  const { t } = useTranslation();

  const statusKey = getPaymentStatusKey(status);
  const color = getPaymentStatusColor(status);

  return <Chip label={t(statusKey)} color={color} size={size} />;
}
