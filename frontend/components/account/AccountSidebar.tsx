'use client';

import { showSuccessToast } from '@/lib/helpers/toastHelper';
import { AppLocale } from '@/lib/locale';
import {
  changePasswordRequest,
  getCurrentUserRequest,
} from '@/lib/store/slices/accountSlice';
import { logoutRequest } from '@/lib/store/slices/authSlice';
import {
  ExitIcon,
  FileTextIcon,
  LockClosedIcon,
  PersonIcon,
} from '@radix-ui/react-icons';
import { Box, Button, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  ChangePasswordDialog,
  ChangePasswordFormData,
} from '../auth/ChangePasswordDialog';
import { LogoutDialog } from './LogoutDialog';

interface AccountSidebarProps {
  locale: AppLocale;
}

export function AccountSidebar({ locale }: AccountSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const t = useTranslations('account');
  const tChangePassword = useTranslations('changePassword');
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    dispatch(getCurrentUserRequest());
  }, []);

  const handleLogout = () => {
    dispatch(logoutRequest());
    setLogoutDialogOpen(false);
    router.push(`/${locale}`);
    showSuccessToast(t('logoutSuccess'));
  };

  const handleChangePassword = (data: ChangePasswordFormData) => {
    dispatch(
      changePasswordRequest({
        oldPassword: data.currentPassword,
        password: data.newPassword,
        onSuccess: () => {
          showSuccessToast(tChangePassword('success.passwordUpdated'));
          setResetPasswordDialogOpen(false);
        },
      })
    );
  };

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  const isOrderHistoryPage = pathname === `/${locale}/account/order-history`;
  const isAccountPage = pathname === `/${locale}/account`;

  const menuItems = [
    {
      icon: PersonIcon,
      label: t('accountInfo'),
      labelShort: t('accountInfoShort'),
      href: `/${locale}/account`,
      isActive: isAccountPage,
      isLogout: false,
      isChangePassword: false,
    },
    {
      icon: LockClosedIcon,
      label: t('changePassword'),
      labelShort: t('changePasswordShort'),
      href: '#',
      isActive: false,
      isLogout: false,
      isChangePassword: true,
    },
    {
      icon: FileTextIcon,
      label: t('orderHistory'),
      labelShort: t('orderHistoryShort'),
      href: `/${locale}/account/order-history`,
      isActive: isOrderHistoryPage,
      isLogout: false,
      isChangePassword: false,
    },
    {
      icon: ExitIcon,
      label: t('logout'),
      labelShort: t('logoutShort'),
      href: '#',
      isActive: false,
      isLogout: true,
      isChangePassword: false,
    },
  ];

  if (!isMounted) {
    return (
      <Box className="w-full lg:w-[287px] bg-white rounded-[14px] border border-[#A4A1AA33] shadow-[0px_4px_8px_0px_#1D21291F] h-[120px] lg:h-[240px] lg:self-start" />
    );
  }

  const handleItemClick = (item: (typeof menuItems)[0]) => {
    if (item.isChangePassword) {
      setResetPasswordDialogOpen(true);
    } else if (item.isLogout) {
      setLogoutDialogOpen(true);
    } else {
      handleNavigate(item.href);
    }
  };

  return (
    <>
      {/* Mobile: Compact grid tabs */}
      <Box className="lg:hidden w-full">
        <Box className="grid grid-cols-4 bg-white rounded-xl overflow-hidden border border-[#EBEBEB]">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Box
                key={index}
                onClick={() => handleItemClick(item)}
                className={`w-full flex justify-center items-center flex-col py-2 ${
                  item.isActive
                    ? 'bg-primary-light border-b-2 border-primary'
                    : 'bg-white border-b-2 border-transparent hover:bg-[#FAFAFA]'
                }`}
              >
                <Box
                  className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 ${
                    item.isActive
                      ? 'bg-primary text-white'
                      : 'bg-[#F5F5F5] text-[#666666]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </Box>
                <Text
                  className={`text-[10px] font-bold leading-normal text-center whitespace-normal ${
                    item.isActive ? 'text-primary' : 'text-[#333333]'
                  }`}
                >
                  {item.labelShort}
                </Text>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Desktop: Vertical list */}
      <Box className="hidden lg:flex lg:flex-col w-[287px] bg-white rounded-[14px] border border-[#A4A1AA33] shadow-[0px_4px_8px_0px_#1D21291F] overflow-hidden self-start">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Button
              key={index}
              variant="ghost"
              onClick={() => handleItemClick(item)}
              className={`flex items-center justify-start gap-[13px] px-[26px] py-3 w-full rounded-none cursor-pointer ${
                item.isActive
                  ? 'bg-[#0E1422] text-white hover:bg-[#0E1422]'
                  : 'text-black hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <Text className="text-base font-normal">{item.label}</Text>
            </Button>
          );
        })}
      </Box>

      {/* Logout Dialog */}
      <LogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={handleLogout}
      />

      <ChangePasswordDialog
        open={resetPasswordDialogOpen}
        onOpenChange={setResetPasswordDialogOpen}
        onSubmit={handleChangePassword}
      />
    </>
  );
}
