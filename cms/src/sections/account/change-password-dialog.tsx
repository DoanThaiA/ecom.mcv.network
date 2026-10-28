import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
}

export function ChangePasswordDialog({ open, onClose, onSave }: ChangePasswordDialogProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setError('');
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange =
    (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      setError('');
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
          {t('changePassword')}
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
          {/* Current Password Field */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 500,
                lineHeight: 1.375,
                color: '#000000',
              }}
            >
              {t('currentPassword')}
            </Typography>
            <TextField
              value={formData.currentPassword}
              onChange={handleChange('currentPassword')}
              disabled={isLoading}
              type={showCurrentPassword ? 'text' : 'password'}
              fullWidth
              size="small"
              required
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      edge="end"
                      sx={{ color: '#363636' }}
                    >
                      <Iconify icon={showCurrentPassword ? 'mdi:eye-off' : 'mdi:eye'} width={20} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* New Password Field */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 500,
                lineHeight: 1.375,
                color: '#000000',
              }}
            >
              {t('newPassword')}
            </Typography>
            <TextField
              value={formData.newPassword}
              onChange={handleChange('newPassword')}
              disabled={isLoading}
              type={showNewPassword ? 'text' : 'password'}
              fullWidth
              size="small"
              required
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                      sx={{ color: '#363636' }}
                    >
                      <Iconify icon={showNewPassword ? 'mdi:eye-off' : 'mdi:eye'} width={20} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Confirm Password Field */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 500,
                lineHeight: 1.375,
                color: '#000000',
              }}
            >
              {t('reEnterNewPassword')}
            </Typography>
            <TextField
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              disabled={isLoading}
              type={showConfirmPassword ? 'text' : 'password'}
              fullWidth
              size="small"
              required
              error={!!error}
              helperText={error}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  height: 55,
                  '& fieldset': {
                    borderColor: error ? '#F62E2E' : '#CBCCD4',
                  },
                  '&:hover fieldset': {
                    borderColor: error ? '#F62E2E' : '#CBCCD4',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: error ? '#F62E2E' : '#0165FC',
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      sx={{ color: '#363636' }}
                    >
                      <Iconify icon={showConfirmPassword ? 'mdi:eye-off' : 'mdi:eye'} width={20} />
                    </IconButton>
                  </InputAdornment>
                ),
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
              fontWeight: 600,
              lineHeight: 1.5625,
              textTransform: 'none',
              boxShadow: 'none',
              height: 55,
              '&:hover': {
                bgcolor: '#0052CC',
                boxShadow: 'none',
              },
              '&.Mui-disabled': {
                bgcolor: '#CBCCD4',
                color: '#FFFFFF',
              },
            }}
            startIcon={isLoading && <CircularProgress size={20} sx={{ color: '#FFFFFF' }} />}
          >
            {isLoading ? t('changingPassword') : t('changePassword')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
