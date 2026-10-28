import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';

import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  nhanhRedirectRequest,
  nhanhSyncAllRequest,
  nhanhSyncProductCategoriesRequest,
  nhanhSyncProductsRequest,
  selectNhanhIsConnected,
  selectNhanhLoading,
  selectNhanhLoadingCategories,
  selectNhanhLoadingProducts,
} from 'src/redux/store/nhanhSlice';
import { Iconify } from 'src/components/iconify';
import { SyncHistoryTable } from './sync-history-table';

// ----------------------------------------------------------------------

export function NhanhVnSyncCard() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const isConnected = useAppSelector(selectNhanhIsConnected);
  const isLoading = useAppSelector(selectNhanhLoading);
  const isLoadingCategories = useAppSelector(selectNhanhLoadingCategories);
  const isLoadingProducts = useAppSelector(selectNhanhLoadingProducts);

  const handleLogin = () => {
    dispatch(nhanhRedirectRequest({}));
  };

  const handleSync = () => {
    dispatch(nhanhSyncAllRequest({}));
  };

  const handleSyncCategories = () => {
    dispatch(nhanhSyncProductCategoriesRequest({}));
  };

  const handleSyncProducts = () => {
    dispatch(nhanhSyncProductsRequest({}));
  };

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
              <Iconify icon="mdi:sync" width={20} />
              {t('nhanhVnSync')}
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

          {/* Description with Icon */}
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
                  icon={isConnected ? 'mdi:cloud-sync' : 'mdi:cloud-off-outline'}
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
                  {isConnected ? t('syncData') : t('loginToNhanhVn')}
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
                    ? 'Đồng bộ dữ liệu sản phẩm, đơn hàng và khách hàng từ Nhanh.vn'
                    : 'Kết nối với Nhanh.vn để quản lý sản phẩm và đơn hàng'}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Action Buttons */}
          {/* <Box sx={{ display: 'flex', justifyContent: { xs: 'stretch', sm: 'flex-end' }, gap: 1 }}>
            {!isConnected ? (
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
                  bgcolor: '#0165FC',
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
                {isLoading ? t('loggingInToNhanhVn') : t('signin')}
              </Button>
            ) : (
              <Button
                onClick={handleSync}
                disabled={isLoading}
                variant="contained"
                startIcon={
                  isLoading ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <Iconify icon="mdi:sync" width={16} />
                  )
                }
                sx={{
                  borderRadius: 1.25,
                  px: { xs: 2, sm: 2.5 },
                  py: { xs: 0.875, sm: 1 },
                  fontSize: { xs: 12, sm: 13 },
                  fontWeight: 600,
                  textTransform: 'none',
                  bgcolor: '#00AB55',
                  maxWidth: { sm: 'fit-content' },
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: '#007B55',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    bgcolor: '#A4A1AA',
                    color: '#FFFFFF',
                  },
                }}
              >
                {isLoading ? t('syncing') : t('syncData')}
              </Button>
            )}
          </Box> */}

          {/* Sync Buttons */}
          {isConnected && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: { xs: 'stretch', sm: 'flex-end' },
                gap: 1,
                flexWrap: 'wrap',
              }}
            >
              <Button
                onClick={handleSyncProducts}
                disabled={isLoadingProducts}
                variant="contained"
                startIcon={
                  isLoadingProducts ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <Iconify icon="mdi:package-variant-closed" width={16} />
                  )
                }
                sx={{
                  borderRadius: 1.25,
                  px: { xs: 2, sm: 2.5 },
                  py: { xs: 0.875, sm: 1 },
                  fontSize: { xs: 12, sm: 13 },
                  fontWeight: 600,
                  textTransform: 'none',
                  bgcolor: '#0165FC',
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
                {isLoadingProducts ? t('syncing') : t('syncProducts')}
              </Button>

              <Button
                onClick={handleSyncCategories}
                disabled={isLoadingCategories}
                variant="contained"
                startIcon={
                  isLoadingCategories ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <Iconify icon="mdi:folder-sync" width={16} />
                  )
                }
                sx={{
                  borderRadius: 1.25,
                  px: { xs: 2, sm: 2.5 },
                  py: { xs: 0.875, sm: 1 },
                  fontSize: { xs: 12, sm: 13 },
                  fontWeight: 600,
                  textTransform: 'none',
                  bgcolor: '#0165FC',
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
                {isLoadingCategories ? t('syncing') : t('categorySync')}
              </Button>
            </Box>
          )}

          {/* Sync History Section */}
          {isConnected && <SyncHistoryTable />}
        </Stack>
      </Box>
    </Card>
  );
}
