import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { OrderStatus, getOrderStatusKey, getOrderStatusColor } from 'src/types/orders';

interface OrderStatusChipProps {
  status: OrderStatus;
  size?: 'small' | 'medium';
}

export function OrderStatusChip({ status, size = 'medium' }: OrderStatusChipProps) {
  const { t } = useTranslation();

  const statusKey = getOrderStatusKey(status);
  const color = getOrderStatusColor(status);

  return <Chip label={t(statusKey)} color={color} size={size} />;
}
