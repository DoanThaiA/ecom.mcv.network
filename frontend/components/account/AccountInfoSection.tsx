'use client';

import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import pickBy from 'lodash/pickBy';
import { getUserFullName } from '@/lib/helpers/userHelper';
import { showInfoToast, showSuccessToast } from '@/lib/helpers/toastHelper';
import type { RootState } from '@/lib/store';
import {
  AccountStatus,
  updateUserRequest,
} from '@/lib/store/slices/accountSlice';
import { Avatar, Box, Button, Heading, Text } from '@radix-ui/themes';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslations, useLocale } from 'next-intl';
import { EditAccountDialog, EditAccountFormData } from './EditAccountDialog';
import { DeleteAccountDialog } from './DeleteAccountDialog';
import { AppLocale } from '@/lib/locale';

export function AccountInfoSection() {
  const t = useTranslations('account');
  const tCommon = useTranslations('common');
  const tAccountDeletion = useTranslations('accountDeletion');
  const locale = useLocale();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const dispatch = useDispatch();

  // Get user data from account store
  const user = useSelector((state: RootState) => state.account.user);
  const isLoading = useSelector(
    (state: RootState) => state.account.status === AccountStatus.LOADING
  );

  const handleSave = (data: EditAccountFormData) => {
    // Filter out empty string fields before sending to API
    const updates = pickBy(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        photo: data.photo,
      },
      (value) => !isNil(value) && (typeof value !== 'string' || !isEmpty(value))
    );

    if (isEmpty(updates)) return;

    // Detect if email was changed
    const emailChanged = updates.email && updates.email !== user?.email;

    dispatch(
      updateUserRequest({
        updates,
        onSuccess: () => {
          if (emailChanged) {
            showInfoToast(t('emailUpdatePending'));
          } else {
            showSuccessToast(t('profileUpdated'));
          }
          setDialogOpen(false);
        },
      })
    );
  };

  return (
    <>
      <Box className="flex-1 bg-white rounded-[14px] border border-[rgba(164,161,170,0.2)] shadow-[0px_4px_8px_0px_rgba(29,33,41,0.12)]">
        {/* Header */}
        <Box className="px-4 sm:px-8 lg:px-[60px] py-4 sm:py-5 lg:py-6 flex items-center gap-6 sm:gap-8 lg:gap-12">
          <Heading className="text-xl sm:text-2xl lg:text-[28px] font-bold leading-[1.21] uppercase text-black">
            {t('pageTitle')}
          </Heading>
        </Box>

        {/* Account Information */}
        <Box className="px-4 sm:px-8 lg:px-[60px] pt-2 sm:pt-3 lg:pt-[18px] pb-6 sm:pb-10 lg:pb-[60px]">
          <Box className="flex flex-col lg:flex-row gap-6 lg:gap-10">
            {/* Avatar Section */}
            <Box className="flex flex-row lg:flex-col items-center gap-4 lg:gap-3 shrink-0">
              <Avatar
                size="7"
                src={user?.photo?.path}
                fallback={
                  getUserFullName(user)
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'U'
                }
                radius="full"
                className="ring-2 ring-gray-200"
              />
              <Text className="text-base lg:text-lg font-semibold text-black lg:text-center">
                {getUserFullName(user)}
              </Text>
            </Box>

            {/* Info Section */}
            <Box className="flex-1 flex flex-col justify-between gap-4">
              <Box className="flex flex-col gap-3">
                {/* Email */}
                <Box className="flex flex-row justify-between items-center">
                  <Text className="text-sm sm:text-base text-[#606060] font-normal">
                    {tCommon('form.email')}
                  </Text>
                  <Text className="text-sm sm:text-base text-black font-normal truncate ml-4">
                    {user?.email || '-'}
                  </Text>
                </Box>

                {/* Phone Number */}
                <Box className="flex flex-row justify-between items-center">
                  <Text className="text-sm sm:text-base text-[#606060] font-normal">
                    {tCommon('form.phone')}
                  </Text>
                  <Text className="text-sm sm:text-base text-black font-normal">
                    {user?.phone || '-'}
                  </Text>
                </Box>
              </Box>

              {/* Buttons */}
              <Box className="flex justify-end gap-2">
                <Button
                  onClick={() => setDeleteDialogOpen(true)}
                  className="h-9 px-5 flex items-center gap-1.5 bg-white text-[#CC0000] border border-[#CC0000] hover:bg-[#FFF5F5] transition-colors cursor-pointer rounded-lg text-sm font-medium"
                >
                  {tAccountDeletion('deleteAccount')}
                </Button>
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="h-9 px-5 flex items-center gap-1.5 bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer rounded-lg text-sm font-medium shadow-sm"
                >
                  {t('editButton')}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Edit Dialog */}
      <EditAccountDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        userData={{
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          phone: user?.phone || '',
          photo: user?.photo,
        }}
        onSave={handleSave}
        isLoading={isLoading}
      />

      {/* Delete Account Dialog */}
      <DeleteAccountDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        locale={locale as AppLocale}
      />
    </>
  );
}
