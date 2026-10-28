import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import VerifiedIcon from '@mui/icons-material/Verified';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  zaloRedirectRequest,
  zaloCheckConnectionRequest,
  selectZaloIsConnected,
  selectZaloLoading,
  selectZaloOAInfo,
} from 'src/redux/store/zaloSlice';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ZaloSyncCard() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // Get state from Redux
  const isConnected = useAppSelector(selectZaloIsConnected);
  const isLoading = useAppSelector(selectZaloLoading);
  const oaInfo = useAppSelector(selectZaloOAInfo);

  useEffect(() => {
    // Check connection status on mount
    dispatch(zaloCheckConnectionRequest({}));
  }, [dispatch]);

  const handleLogin = () => {
    // Dispatch action to get redirect URL and open authentication window
    dispatch(zaloRedirectRequest({}));
  };

  // Format follower count (e.g., 1234 -> "1,234")
  const formatFollowers = (count: number): string => count.toLocaleString('vi-VN');

  return (
    <Card
      sx={{
        borderRadius: 1.5,
        boxShadow: '0px 2px 8px rgba(145, 158, 171, 0.1)',
        transition: 'box-shadow 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0px 4px 12px rgba(145, 158, 171, 0.14)',
        },
      }}
    >
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Stack spacing={{ xs: 1.5, sm: 1.75 }}>
          {/* Header with Status Badge */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1, sm: 0 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#212B36',
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                fontSize: { xs: 14, sm: 15 },
              }}
            >
              <Iconify icon="mdi:message-text" width={20} />
              {t('zaloOaSync')}
            </Typography>

            <Chip
              label={
                isConnected ? t('connected') || 'Connected' : t('notConnected') || 'Not Connected'
              }
              icon={
                <Iconify icon={isConnected ? 'mdi:check-circle' : 'mdi:close-circle'} width={12} />
              }
              size="small"
              sx={{
                height: { xs: 24, sm: 26 },
                fontWeight: 600,
                fontSize: { xs: 10, sm: 11 },
                bgcolor: isConnected ? alpha('#00AB55', 0.16) : alpha('#FF5630', 0.16),
                color: isConnected ? '#00AB55' : '#FF5630',
                '& .MuiChip-icon': {
                  color: 'inherit',
                },
              }}
            />
          </Stack>

          <Divider sx={{ borderStyle: 'dashed' }} />

          {/* OA Info Card - Show when connected and has oaInfo */}
          {isConnected && oaInfo ? (
            <Box
              sx={{
                p: { xs: 1.25, sm: 1.5 },
                borderRadius: 1.25,
                bgcolor: alpha('#919EAB', 0.04),
                border: '1px solid',
                borderColor: alpha('#919EAB', 0.08),
              }}
            >
              {/* OA Header - Avatar, Name, Verified */}
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar
                  src={oaInfo.avatar}
                  alt={oaInfo.name}
                  sx={{
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                    border: '2px solid #fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography
                      sx={{
                        fontSize: { xs: 13, sm: 14 },
                        fontWeight: 600,
                        color: '#212B36',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {oaInfo.name}
                    </Typography>
                    {oaInfo.is_verified && (
                      <VerifiedIcon
                        sx={{
                          fontSize: { xs: 14, sm: 16 },
                          color: '#0288D1',
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </Stack>
                  <Typography
                    sx={{
                      fontSize: { xs: 11, sm: 12 },
                      fontWeight: 400,
                      color: '#637381',
                    }}
                  >
                    {oaInfo.cate_name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: 10, sm: 11 },
                      fontWeight: 400,
                      color: '#919EAB',
                    }}
                  >
                    {formatFollowers(oaInfo.num_follower)} {t('followers')}
                  </Typography>
                </Box>
              </Stack>

              {/* OA Package Info */}
              {(oaInfo.package_name || oaInfo.package_valid_through_date) && (
                <>
                  <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
                  <Stack spacing={0.75}>
                    {oaInfo.package_name && (
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography
                          sx={{
                            fontSize: { xs: 11, sm: 12 },
                            fontWeight: 400,
                            color: '#637381',
                          }}
                        >
                          {t('servicePackage')}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: { xs: 11, sm: 12 },
                            fontWeight: 600,
                            color: '#212B36',
                          }}
                        >
                          {oaInfo.package_name}
                        </Typography>
                      </Stack>
                    )}
                    {oaInfo.package_valid_through_date && (
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography
                          sx={{
                            fontSize: { xs: 11, sm: 12 },
                            fontWeight: 400,
                            color: '#637381',
                          }}
                        >
                          {t('validUntil')}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: { xs: 11, sm: 12 },
                            fontWeight: 600,
                            color: '#212B36',
                          }}
                        >
                          {oaInfo.package_valid_through_date}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </>
              )}
            </Box>
          ) : (
            /* Description with Icon - Show when not connected */
            <Box
              sx={{
                p: { xs: 1.25, sm: 1.5 },
                borderRadius: 1.25,
                bgcolor: alpha('#919EAB', 0.04),
                border: '1px solid',
                borderColor: alpha('#919EAB', 0.08),
              }}
            >
              <Stack direction="row" spacing={{ xs: 1, sm: 1.25 }} alignItems="flex-start">
                <Box
                  sx={{
                    width: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },
                    borderRadius: 1,
                    bgcolor: alpha('#0165FC', 0.08),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Iconify
                    icon={isConnected ? 'mdi:link-variant' : 'mdi:link-variant-off'}
                    width={18}
                    sx={{ color: '#0165FC' }}
                  />
                </Box>
                <Box flex={1}>
                  <Typography
                    sx={{
                      fontSize: { xs: 12, sm: 13 },
                      fontWeight: 500,
                      color: '#212B36',
                      lineHeight: 1.5,
                    }}
                  >
                    {isConnected ? t('zaloOaConnected') : t('loginToZaloOa')}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: 10, sm: 11 },
                      color: '#637381',
                      mt: 0.25,
                      lineHeight: 1.5,
                    }}
                  >
                    {isConnected
                      ? 'Kết nối với Zalo OA để gửi tin nhắn và quản lý khách hàng'
                      : 'Kết nối với Zalo OA để gửi tin nhắn tự động và chăm sóc khách hàng'}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          {/* Action Buttons */}
          {!isConnected && (
            <Box sx={{ display: 'flex', justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
              <Button
                onClick={handleLogin}
                disabled={isLoading}
                variant="contained"
                fullWidth={true}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <Iconify icon="mdi:login" width={16} />
                  )
                }
                sx={{
                  borderRadius: 1.25,
                  px: { xs: 2, sm: 2.5 },
                  py: { xs: 0.875, sm: 1 },
                  fontSize: { xs: 12, sm: 13 },
                  fontWeight: 600,
                  textTransform: 'none',
                  bgcolor: '#0068FF',
                  maxWidth: { sm: 'fit-content' },
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: '#0052CC',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    bgcolor: '#A4A1AA',
                    color: '#FFFFFF',
                  },
                }}
              >
                {isLoading ? t('loggingInToZaloOa') : t('signin')}
              </Button>
            </Box>
          )}
        </Stack>
      </Box>
    </Card>
  );
}
