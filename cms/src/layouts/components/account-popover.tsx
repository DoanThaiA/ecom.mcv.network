import type { IconButtonProps } from '@mui/material/IconButton';

import { useCallback, useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';

import { AccountCircle, LockReset, Logout } from '@mui/icons-material';

import { useRouter } from 'src/routes/hooks';

import { useTranslation } from 'react-i18next';
import { useDialog } from 'src/hooks';
import { appLocalStorage, localStorageKeys } from 'src/services/localStorage';
import { useAppDispatch } from 'src/redux/store/store';
import { logoutRequest } from 'src/redux/store/authSlice';
import { changePasswordRequest } from 'src/redux/store/accountSlice';
import type { User } from 'src/types/gen/shared/shared/users/user';
import { ChangePasswordDialog } from 'src/sections/account/change-password-dialog';

// ----------------------------------------------------------------------

export type AccountPopoverProps = IconButtonProps & {
  data?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    info?: React.ReactNode;
  }[];
};

export function AccountPopover({ data = [], sx, ...other }: AccountPopoverProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const changePasswordDialog = useDialog();
  const userInfo = appLocalStorage.getItem<User>(localStorageKeys.USER);
  const [user] = useState({
    username:
      userInfo?.firstName && userInfo?.lastName
        ? `${userInfo.firstName} ${userInfo.lastName}`
        : userInfo?.email || 'User',
  });

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleClickItem = useCallback(
    (path: string) => {
      handleClosePopover();
      router.push(path);
    },
    [handleClosePopover, router]
  );

  const handleChangePasswordClick = useCallback(() => {
    handleClosePopover();
    changePasswordDialog.open();
  }, [handleClosePopover, changePasswordDialog]);

  const handleChangePassword = async (data: { currentPassword: string; newPassword: string }) => {
    dispatch(
      changePasswordRequest({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        onSuccess: () => {
          changePasswordDialog.close();
        },
        onError: () => {},
      })
    );
  };

  const handleLogoutClick = useCallback(() => {
    // Close popover first
    handleClosePopover();

    // Dispatch logout with navigate callback
    // Navigation happens AFTER saga completes (API call, clear storage, clear token)
    dispatch(
      logoutRequest({
        onSuccess: () => {
          router.replace('/sign-in');
        },
      })
    );
  }, [handleClosePopover, dispatch, router]);

  const menuItems = [
    {
      label: t('accountInfo'),
      icon: <AccountCircle sx={{ fontSize: 24, color: '#606060' }} />,
      onClick: () => handleClickItem('/account'),
    },
    {
      label: t('changePassword'),
      icon: <LockReset sx={{ fontSize: 24, color: '#606060' }} />,
      onClick: handleChangePasswordClick,
    },
    {
      label: t('logout'),
      icon: <Logout sx={{ fontSize: 24, color: '#606060' }} />,
      onClick: handleLogoutClick,
    },
  ];

  return (
    <>
      <IconButton
        onClick={handleOpenPopover}
        sx={{
          p: '2px',
          width: 40,
          height: 40,
          background: (theme) =>
            `conic-gradient(${theme.vars.palette.primary.light}, ${theme.vars.palette.warning.light}, ${theme.vars.palette.primary.light})`,
          ...sx,
        }}
        {...other}
      >
        <Avatar src="" sx={{ width: 1, height: 1 }}>
          {user?.username.charAt(0).toUpperCase() ?? ''}
        </Avatar>
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: 350,
              borderRadius: '14px',
              boxShadow: '0px 4px 8px rgba(29, 33, 41, 0.12)',
            },
          },
        }}
      >
        {/* User Info Section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            px: 2,
            py: 2,
          }}
        >
          <Avatar src="" sx={{ width: 55, height: 55 }}>
            {user?.username.charAt(0).toUpperCase() ?? ''}
          </Avatar>
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 500,
              lineHeight: 1.5,
              color: '#000000',
            }}
          >
            {user?.username ?? ''}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: '#CBCCD4' }} />

        {/* Menu Items */}
        <Box sx={{ py: 1 }}>
          {menuItems.map((item, index) => (
            <Box
              key={index}
              onClick={item.onClick}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '13px',
                px: 2,
                py: 1.5,
                height: 50,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              {item.icon}
              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 400,
                  lineHeight: 1.21,
                  color: '#000000',
                }}
              >
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Popover>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={changePasswordDialog.isOpen}
        onClose={changePasswordDialog.close}
        onSave={handleChangePassword}
      />
    </>
  );
}
