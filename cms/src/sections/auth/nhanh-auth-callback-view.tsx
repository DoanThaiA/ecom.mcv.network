import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

import { useTranslation } from 'react-i18next';
import { useAppDispatch } from 'src/redux/store/store';
import { nhanhCallbackRequest } from 'src/redux/store/nhanhSlice';

// ----------------------------------------------------------------------

type AuthStatus = 'loading' | 'success' | 'error';

export function NhanhAuthCallbackView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(3);

  useEffect(() => {
    const accessCode = searchParams.get('accessCode');

    if (!accessCode) {
      setStatus('error');
      setErrorMessage('Missing access code');
      return;
    }

    // Dispatch saga action to authenticate with Nhanh.vn
    dispatch(
      nhanhCallbackRequest({
        accessCode,
        onSuccess: () => {
          setStatus('success');
        },
        onError: (error: string) => {
          setStatus('error');
          setErrorMessage(error);
        },
      })
    );
  }, [searchParams, dispatch]);

  // Countdown timer when success
  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [status, countdown]);

  // Navigate to homepage when countdown reaches 0
  useEffect(() => {
    if (status === 'success' && countdown === 0) {
      navigate('/');
    }
  }, [status, countdown, navigate]);

  // Handle immediate navigation
  const handleGoToHomepage = () => {
    navigate('/');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#F5F5F5',
        p: 3,
      }}
    >
      <Card
        sx={{
          maxWidth: 500,
          width: '100%',
          p: 4,
          textAlign: 'center',
          borderRadius: '14px',
          boxShadow: '0px 4px 8px rgba(29, 33, 41, 0.12)',
        }}
      >
        {/* Loading State */}
        {status === 'loading' && (
          <Box>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography
              variant="h5"
              sx={{
                fontSize: 24,
                fontWeight: 600,
                color: '#000000',
                mb: 1,
              }}
            >
              {t('nhanhAuthProcessing')}
            </Typography>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 400,
                color: '#606060',
              }}
            >
              {t('nhanhAuthCallback')}
            </Typography>
          </Box>
        )}

        {/* Success State */}
        {status === 'success' && (
          <Box>
            <CheckCircleIcon
              sx={{
                fontSize: 80,
                color: '#4CAF50',
                mb: 2,
              }}
            />
            <Typography
              variant="h5"
              sx={{
                fontSize: 24,
                fontWeight: 600,
                color: '#000000',
                mb: 1,
              }}
            >
              {t('syncSuccess')}
            </Typography>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 400,
                color: '#606060',
                mb: 2,
              }}
            >
              {t('nhanhAuthSuccess')}
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 400,
                color: '#909090',
                mb: 3,
              }}
            >
              {t('redirectingIn', { seconds: countdown })}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleGoToHomepage}
              sx={{
                textTransform: 'none',
                fontSize: 16,
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: '8px',
              }}
            >
              {t('goToHomepage')}
            </Button>
          </Box>
        )}

        {/* Error State */}
        {status === 'error' && (
          <Box>
            <ErrorIcon
              sx={{
                fontSize: 80,
                color: '#F44336',
                mb: 2,
              }}
            />
            <Typography
              variant="h5"
              sx={{
                fontSize: 24,
                fontWeight: 600,
                color: '#000000',
                mb: 1,
              }}
            >
              {t('nhanhAuthFailed')}
            </Typography>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 400,
                color: '#606060',
              }}
            >
              {errorMessage || t('nhanhAuthFailed')}
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
}
