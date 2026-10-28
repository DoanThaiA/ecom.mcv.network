import { Chip, type ChipProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  getWithdrawalStatusKey,
  getWithdrawalStatusColor,
  WithdrawalRequestStatus,
} from 'src/types/withdrawal-request';

interface WithdrawalRequestStatusChipProps {
  status: string | number | WithdrawalRequestStatus;
  size?: ChipProps['size'];
}

export function WithdrawalRequestStatusChip({
  status,
  size = 'medium',
}: WithdrawalRequestStatusChipProps) {
  const { t } = useTranslation();

  return (
    <Chip
      label={t(getWithdrawalStatusKey(status))}
      color={getWithdrawalStatusColor(status)}
      size={size}
      sx={{ fontWeight: 500 }}
    />
  );
}
