import { Chip, type ChipProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ReturnStatus, getReturnStatusKey } from 'src/types/returns';

interface ReturnStatusChipProps {
  status: ReturnStatus;
  size?: ChipProps['size'];
}

const STATUS_COLORS: Record<ReturnStatus, string> = {
  [ReturnStatus.PENDING]: '#FF9500', // Orange - Chờ xử lý
  [ReturnStatus.CONFIRMED]: '#235AFF', // Blue - Xác nhận hoàn
  [ReturnStatus.REFUNDED]: '#178B30', // Green - Hoàn tiền thành công
  [ReturnStatus.REJECTED]: '#F62E2E', // Red - Từ chối yêu cầu
};

export function ReturnStatusChip({ status, size = 'small' }: ReturnStatusChipProps) {
  const { t } = useTranslation();

  const color = STATUS_COLORS[status] || '#666';
  const label = t(getReturnStatusKey(status));

  return (
    <Chip
      label={label}
      size={size}
      sx={{
        color,
        bgcolor: `${color}15`,
        fontWeight: 500,
        fontSize: size === 'small' ? 12 : 14,
        '& .MuiChip-label': {
          px: 1.5,
        },
      }}
    />
  );
}
