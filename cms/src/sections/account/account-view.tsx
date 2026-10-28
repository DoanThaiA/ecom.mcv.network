import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';

import { useTranslation } from 'react-i18next';
import { useDialog } from 'src/hooks';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  fetchUserRequest,
  updateUserRequest,
  selectAccountUser,
  selectAccountLoading,
} from 'src/redux/store/accountSlice';
import { selectCurrentUserPermissions } from 'src/redux/store/authSlice';
import { ModulePermissionEnum } from 'src/types/gen/cms/cms/cms-users/cms-user';
import { ModulePermission } from 'src/repositories/cms-user.repository';
import { EditAccountDialog } from './edit-account-dialog';
import { NhanhVnSyncCard } from './nhanh-vn-sync-card';
import { ZaloSyncCard } from './zalo-sync-card';
import { nhanhCheckConnectionRequest } from 'src/redux/store/nhanhSlice';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function AccountView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // Get user data from Redux
  const user = useAppSelector(selectAccountUser);
  const loading = useAppSelector(selectAccountLoading);
  const userPermissions = useAppSelector(selectCurrentUserPermissions);

  const isSuperAdmin = userPermissions.includes(
    ModulePermission.super_admin as unknown as ModulePermissionEnum
  );
  const canAccessSettings =
    isSuperAdmin || userPermissions.includes(ModulePermissionEnum.MODULE_PERMISSION_SETTINGS);

  const editDialog = useDialog<{ fullName: string; phone: string; email: string }>();

  useEffect(() => {
    dispatch(fetchUserRequest({}));
    dispatch(nhanhCheckConnectionRequest({}));
  }, []);

  const handleEdit = () => {
    if (user) {
      const fullName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '';
      editDialog.open({
        fullName,
        phone: user.phone || '',
        email: user.email || '',
      });
    }
  };

  const handleSave = async (data: { fullName: string; phone: string; email: string }) => {
    // Parse fullName into firstName and lastName
    const nameParts = data.fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Dispatch Redux action to update user
    return new Promise<void>((resolve) => {
      dispatch(
        updateUserRequest({
          firstName,
          lastName,
          phone: data.phone,
          email: data.email,
          onSuccess: () => {
            editDialog.close();
            resolve();
          },
          onError: () => {
            resolve(); // Resolve anyway to let dialog handle it
          },
        })
      );
    });
  };

  // Prepare user info display
  const fullName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const infoFields = [
    {
      icon: 'mdi:account-circle',
      label: t('fullName'),
      value: fullName,
    },
    {
      icon: 'mdi:phone',
      label: t('phone'),
      value: user?.phone || '',
    },
    {
      icon: 'mdi:email',
      label: t('email'),
      value: user?.email || '',
    },
  ];

  // Show loading state
  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 1, sm: 1.5, md: 2 } }}>
      <Stack spacing={{ xs: 1.5, sm: 2 }}>
        {/* Profile Header Card */}
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
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1.25, sm: 1.5 }}
              alignItems="center"
            >
              {/* Avatar */}
              <Avatar
                sx={{
                  width: { xs: 60, sm: 70 },
                  height: { xs: 60, sm: 70 },
                  bgcolor: alpha('#0165FC', 0.08),
                  color: '#0165FC',
                  fontSize: { xs: 20, sm: 24 },
                  fontWeight: 700,
                  border: '2px solid',
                  borderColor: alpha('#0165FC', 0.12),
                }}
              >
                {initials || '?'}
              </Avatar>

              {/* Name and Email */}
              <Stack spacing={0.25} flex={1} alignItems={{ xs: 'center', sm: 'flex-start' }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#212B36',
                    fontWeight: 700,
                    fontSize: { xs: 16, sm: 18 },
                    textAlign: { xs: 'center', sm: 'left' },
                  }}
                >
                  {fullName || t('username')}
                </Typography>
                <Typography
                  sx={{
                    color: '#637381',
                    fontSize: { xs: 12, sm: 13 },
                    textAlign: { xs: 'center', sm: 'left' },
                  }}
                >
                  {user?.email || ''}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Card>

        {/* Account Details Card */}
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
                <Iconify icon="mdi:account-details" width={20} />
                {t('accountInfo')}
              </Typography>

              <Divider sx={{ borderStyle: 'dashed' }} />

              <Grid container spacing={{ xs: 1, sm: 1.25 }}>
                {infoFields.map((field, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 1.25, sm: 1.5 },
                        borderRadius: 1.25,
                        bgcolor: alpha('#919EAB', 0.04),
                        border: '1px solid',
                        borderColor: alpha('#919EAB', 0.08),
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          bgcolor: alpha('#0165FC', 0.04),
                          borderColor: alpha('#0165FC', 0.16),
                        },
                      }}
                    >
                      <Stack spacing={0.5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: { xs: 28, sm: 32 },
                              height: { xs: 28, sm: 32 },
                              borderRadius: 1,
                              bgcolor: alpha('#0165FC', 0.08),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Iconify icon={field.icon} width={16} sx={{ color: '#0165FC' }} />
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#637381',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: 0.3,
                              fontSize: { xs: 9, sm: 10 },
                            }}
                          >
                            {field.label}
                          </Typography>
                        </Stack>
                        <Typography
                          sx={{
                            fontSize: { xs: 12, sm: 13 },
                            fontWeight: 500,
                            color: '#212B36',
                            pl: { xs: 4.5, sm: 5 },
                            wordBreak: 'break-word',
                          }}
                        >
                          {field.value || '-'}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Edit Button */}
              <Box sx={{ display: 'flex', justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
                <Button
                  onClick={handleEdit}
                  variant="contained"
                  startIcon={<Iconify icon="mdi:pencil" width={16} />}
                  fullWidth={true}
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
                  }}
                >
                  {t('edit')}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Card>

        {/* Nhanh.vn Sync Card */}
        {canAccessSettings && <NhanhVnSyncCard />}

        {/* Zalo OA Sync Card */}
        {canAccessSettings && <ZaloSyncCard />}

        {/* Edit Account Dialog */}
        <EditAccountDialog
          open={editDialog.isOpen}
          onClose={editDialog.close}
          initialData={
            editDialog.data || {
              fullName: '',
              phone: '',
              email: '',
            }
          }
          onSave={handleSave}
        />
      </Stack>
    </Container>
  );
}
