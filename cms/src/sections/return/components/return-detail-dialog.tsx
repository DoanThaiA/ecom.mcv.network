import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { ReturnRequest } from 'src/types/returns';
import { ReturnStatusChip } from './return-status-chip';
import { formatPrice, formatDate } from 'src/utils/format';
import { TableImagePreview } from 'src/components/table-image-preview';

interface ReturnDetailDialogProps {
  open: boolean;
  returnRequest: ReturnRequest | null;
  onClose: () => void;
}

export function ReturnDetailDialog({ open, returnRequest, onClose }: ReturnDetailDialogProps) {
  const { t } = useTranslation();

  if (!returnRequest) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">
          {t('returnRequestDetail')} - {returnRequest.returnNumber}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Customer Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            {t('customerInfo')}
          </Typography>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                {t('customerName')}:
              </Typography>
              <Typography variant="body2">{returnRequest.customer.name}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                {t('phone')}:
              </Typography>
              <Typography variant="body2">{returnRequest.customer.phone}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                {t('orderNumber')}:
              </Typography>
              <Typography variant="body2" sx={{ color: '#235AFF' }}>
                {returnRequest.orderNumber}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Return Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            {t('returnInfo')}
          </Typography>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                {t('status')}:
              </Typography>
              <ReturnStatusChip status={returnRequest.status} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                {t('reason')}:
              </Typography>
              <Typography variant="body2">
                {returnRequest.reasonDetail || t(returnRequest.reason)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                {t('shippingCarrier')}:
              </Typography>
              <Typography variant="body2">{returnRequest.shippingCarrier || '--'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                {t('createdAt')}:
              </Typography>
              <Typography variant="body2">{formatDate(returnRequest.createdAt)}</Typography>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Products */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            {t('products')}
          </Typography>
          <Stack spacing={1}>
            {returnRequest.items.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 1,
                  bgcolor: '#F7F8FA',
                  borderRadius: 1,
                }}
              >
                <TableImagePreview src={item.image} alt={item.name} width={48} height={48} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={500}>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.code}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">x{item.quantity}</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatPrice(item.subtotal)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Total */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {t('totalRefundAmount')}: {formatPrice(returnRequest.amount)}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          {t('close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
