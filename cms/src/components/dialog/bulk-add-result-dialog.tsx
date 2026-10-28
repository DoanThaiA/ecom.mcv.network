import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

interface FailedProductItem {
  productId: string;
  productCode: string;
  reason: string;
}

const REASON_COLOR_MAP: Record<string, 'error' | 'warning' | 'info'> = {
  duplicate: 'warning',
  notFound: 'error',
  conflict: 'warning',
  noStock: 'error',
  noImage: 'info',
};

interface BulkAddResultDialogProps {
  open: boolean;
  onClose: () => void;
  addedCount: number;
  failedCount: number;
  failedProducts: FailedProductItem[];
}

export function BulkAddResultDialog({
  open,
  onClose,
  addedCount,
  failedCount,
  failedProducts,
}: BulkAddResultDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '10px',
          p: 3,
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('bulkAddResultTitle')}
          </Typography>
          <IconButton onClick={onClose} sx={{ p: 0.5 }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Summary */}
        <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckCircleOutlineIcon sx={{ color: 'success.main' }} />
            <Typography variant="body1">
              {t('bulkAddResultAdded', { count: addedCount })}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <ErrorOutlineIcon sx={{ color: 'error.main' }} />
            <Typography variant="body1">
              {t('bulkAddResultFailed', { count: failedCount })}
            </Typography>
          </Stack>
        </Stack>

        {/* Failed products table */}
        {failedProducts.length > 0 && (
          <TableContainer sx={{ maxHeight: 400, mb: 3 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('productCode')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('reason')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {failedProducts.map((fp, index) => (
                  <TableRow key={`${fp.productId}-${fp.reason}`}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {fp.productCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t(`bulkAddReason_${fp.reason}`)}
                        color={REASON_COLOR_MAP[fp.reason] || 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Close button */}
        <Stack direction="row" justifyContent="center">
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              minWidth: 120,
              bgcolor: '#0165FC',
              '&:hover': { bgcolor: '#0052CC' },
            }}
          >
            {t('close')}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
