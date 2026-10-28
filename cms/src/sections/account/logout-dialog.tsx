import { Dialog, DialogContent, Typography, Button, Stack, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

interface LogoutDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function LogoutDialog({ open, onClose, onConfirm, loading = false }: LogoutDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 357,
          borderRadius: '10px',
          p: 3,
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header with close button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            mb: 2,
          }}
        >
          {/* Invisible placeholder for symmetry */}
          <Box sx={{ width: 24, height: 24, visibility: 'hidden' }} />

          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              flex: 1,
              textAlign: 'center',
              fontSize: 18,
              fontWeight: 600,
              lineHeight: 1.44,
              color: '#000000',
            }}
          >
            {t('confirm')}
          </Typography>

          {/* Close button */}
          <IconButton
            onClick={onClose}
            disabled={loading}
            sx={{
              width: 24,
              height: 24,
              p: 0,
              color: '#000000',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 24 }} />
          </IconButton>
        </Box>

        {/* Message */}
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 400,
            lineHeight: 1.5,
            textAlign: 'center',
            color: '#000000',
            mb: 2,
          }}
        >
          {t('logoutConfirmMessage')}
        </Typography>

        {/* Action buttons */}
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            sx={{
              width: 95,
              height: 40,
              borderColor: '#0165FC',
              color: '#0165FC',
              borderRadius: '5px',
              fontWeight: 600,
              fontSize: 14,
              '&:hover': {
                borderColor: '#0165FC',
                bgcolor: 'rgba(1, 101, 252, 0.04)',
              },
            }}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={onConfirm}
            disabled={loading}
            sx={{
              height: 40,
              bgcolor: '#0165FC',
              color: '#FFFFFF',
              borderRadius: '5px',
              fontWeight: 600,
              fontSize: 14,
              px: 2,
              '&:hover': {
                bgcolor: '#0052CC',
              },
              '&:disabled': {
                bgcolor: '#0165FC',
                opacity: 0.6,
              },
            }}
          >
            {t('logout')}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
