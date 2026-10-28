'use client';

import { useState } from 'react';
import { Flex, Text, Box, Avatar } from '@radix-ui/themes';
import {
  PersonIcon,
  LockClosedIcon,
  ArchiveIcon,
  ExitIcon,
} from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { LogoutDialog } from '@/components/account/LogoutDialog';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { logoutRequest } from '@/lib/store/slices/authSlice';
import { changePasswordRequest } from '@/lib/store/slices/accountSlice';
import { useRouter } from 'next/navigation';
import { getUserFullName } from '@/lib/helpers/userHelper';
import { AppLocale } from '@/lib/locale';
import {
  ChangePasswordDialog,
  ChangePasswordFormData,
} from '../auth/ChangePasswordDialog';
import { showSuccessToast } from '@/lib/helpers/toastHelper';

interface UserMenuPopoverProps {
  locale: AppLocale;
  onClose?: () => void;
}

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export function UserMenuPopover({ locale, onClose }: UserMenuPopoverProps) {
  const t = useTranslations('userMenu');
  const tAccount = useTranslations('account');
  const tChangePassword = useTranslations('changePassword');
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] =
    useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.account);

  const userName = getUserFullName(user) || 'User';

  const handleLogout = () => {
    dispatch(logoutRequest());
    setLogoutDialogOpen(false);
    if (onClose) onClose();
    router.push(`/${locale}`);
    showSuccessToast(tAccount('logoutSuccess'));
  };

  const handleChangePassword = (data: ChangePasswordFormData) => {
    dispatch(
      changePasswordRequest({
        oldPassword: data.currentPassword,
        password: data.newPassword,
        onSuccess: () => {
          showSuccessToast(tChangePassword('success.passwordUpdated'));
          setChangePasswordDialogOpen(false);
        },
      })
    );
  };

  const menuItems: MenuItem[] = [
    {
      key: 'accountInfo',
      icon: <PersonIcon width="20" height="20" />,
      href: `/${locale}/account`,
    },
    {
      key: 'changePassword',
      icon: <LockClosedIcon width="20" height="20" />,
      onClick: () => setChangePasswordDialogOpen(true),
    },
    {
      key: 'orderHistory',
      icon: <ArchiveIcon width="20" height="20" />,
      href: `/${locale}/account/order-history`,
    },
    {
      key: 'logout',
      icon: <ExitIcon width="20" height="20" />,
      onClick: () => setLogoutDialogOpen(true),
    },
  ];

  return (
    <Box
      style={{
        width: '280px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
      }}
    >
      {/* User Profile Section */}
      <Box
        style={{
          padding: '20px',
          borderBottom: '1px solid #F3F4F6',
        }}
      >
        <Flex gap="3" align="center">
          {/* User Avatar */}
          <Avatar
            size="4"
            fallback={userName.charAt(0)}
            radius="full"
            style={{
              backgroundColor: '#C89F5D',
              color: 'white',
            }}
          />

          {/* User Name */}
          <Text
            size="4"
            weight="medium"
            style={{
              color: '#111827',
            }}
          >
            {userName}
          </Text>
        </Flex>
      </Box>

      {/* Menu Items */}
      <Flex direction="column" gap="0">
        {menuItems.map((item, index) => {
          const content = (
            <Flex gap="3" align="center">
              {/* Icon */}
              <Box
                style={{
                  color: '#6B7280',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {item.icon}
              </Box>

              {/* Menu Text */}
              <Text
                size="3"
                style={{
                  color: '#374151',
                  fontWeight: 400,
                }}
              >
                {t(item.key as any)}
              </Text>
            </Flex>
          );

          const itemStyle = {
            padding: '14px 20px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            borderTop: index === 0 ? 'none' : '1px solid #F3F4F6',
          };

          if (item.href) {
            return (
              <Link
                key={item.key}
                href={item.href}
                className="no-underline"
                onClick={onClose}
              >
                <Box
                  style={itemStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {content}
                </Box>
              </Link>
            );
          }

          return (
            <Box
              key={item.key}
              style={itemStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onClick={item.onClick}
            >
              {content}
            </Box>
          );
        })}
      </Flex>

      {/* Logout Dialog */}
      <LogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={handleLogout}
      />

      <ChangePasswordDialog
        open={changePasswordDialogOpen}
        onOpenChange={setChangePasswordDialogOpen}
        onSubmit={handleChangePassword}
      />
    </Box>
  );
}
