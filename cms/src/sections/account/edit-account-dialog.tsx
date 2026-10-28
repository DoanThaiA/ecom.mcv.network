import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

interface EditAccountDialogProps {
  open: boolean;
  onClose: () => void;
  initialData: {
    fullName: string;
    phone: string;
    email: string;
  };
  onSave: (data: { fullName: string; phone: string; email: string }) => void;
}

export function EditAccountDialog({ open, onClose, initialData, onSave }: EditAccountDialogProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(initialData);

  // Update form data when dialog opens with new initialData
  useEffect(() => {
    if (open) {
      setFormData(initialData);
    }
  }, [open, initialData]);

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave(formData);
      handleClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange =
    (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '14px',
          boxShadow: '0px 12px 40px 0px rgba(0, 0, 0, 0.16)',
          width: 512,
          maxWidth: 512,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: '16px',
          borderBottom: '1px solid #E5E6EC',
          bgcolor: '#FFFFFF',
        }}
      >
        {/* Empty box for spacing */}
        <Box sx={{ width: 24, height: 24 }} />

        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 500,
            lineHeight: 1.33,
            textTransform: 'uppercase',
            color: '#000000',
          }}
        >
          {t('editAccountInfo')}
        </Typography>

        <IconButton
          onClick={handleClose}
          disabled={isLoading}
          sx={{
            width: 24,
            height: 24,
            p: 0,
            '&:hover': { bgcolor: 'transparent' },
          }}
        >
          <CloseIcon sx={{ fontSize: 20, color: '#363636' }} />
        </IconButton>
      </Box>

      {/* Content */}
      <DialogContent
        sx={{
          p: '24px 36px 0px',
          bgcolor: '#FFFFFF',
          borderRadius: '0px 0px 14px 14px',
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            pb: '24px',
          }}
        >
          {/* Full Name Field */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 500,
                lineHeight: 1.375,
                color: '#000000',
              }}
            >
              {t('fullName')}
            </Typography>
            <TextField
              value={formData.fullName}
              onChange={handleChange('fullName')}
              disabled={isLoading}
              fullWidth
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  height: 55,
                  '& fieldset': {
                    borderColor: '#CBCCD4',
                  },
                  '&:hover fieldset': {
                    borderColor: '#CBCCD4',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0165FC',
                  },
                },
              }}
            />
          </Box>

          {/* Phone Field */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 500,
                lineHeight: 1.375,
                color: '#000000',
              }}
            >
              {t('phone')}
            </Typography>
            <TextField
              value={formData.phone}
              onChange={handleChange('phone')}
              disabled={isLoading}
              fullWidth
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  height: 55,
                  '& fieldset': {
                    borderColor: '#CBCCD4',
                  },
                  '&:hover fieldset': {
                    borderColor: '#CBCCD4',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0165FC',
                  },
                },
              }}
            />
          </Box>

          {/* Email Field */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 500,
                lineHeight: 1.375,
                color: '#000000',
              }}
            >
              {t('email')}
            </Typography>
            <TextField
              value={formData.email}
              onChange={handleChange('email')}
              disabled={isLoading}
              type="email"
              fullWidth
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  height: 55,
                  '& fieldset': {
                    borderColor: '#CBCCD4',
                  },
                  '&:hover fieldset': {
                    borderColor: '#CBCCD4',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0165FC',
                  },
                },
              }}
            />
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            fullWidth
            sx={{
              bgcolor: '#0165FC',
              color: '#FFFFFF',
              borderRadius: '8px',
              p: '15px 0px',
              fontSize: 16,
              fontWeight: 500,
              lineHeight: 1.21,
              textTransform: 'none',
              boxShadow: '0px 2px 10px 0px rgba(244, 103, 0, 0.05)',
              '&:hover': {
                bgcolor: '#0052CC',
              },
              '&.Mui-disabled': {
                bgcolor: '#CBCCD4',
                color: '#FFFFFF',
              },
            }}
            startIcon={isLoading && <CircularProgress size={20} sx={{ color: '#FFFFFF' }} />}
          >
            {isLoading ? t('updating') : t('update')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
