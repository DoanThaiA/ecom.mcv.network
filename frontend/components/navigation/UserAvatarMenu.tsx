'use client';

import { UserMenuPopover } from '@/components/popover/UserMenuPopover';
import { getUserFullName } from '@/lib/helpers/userHelper';
import { AppLocale } from '@/lib/locale';
import { RootState } from '@/lib/store';
import { useAppSelector } from '@/lib/store/hooks';
import { Avatar, Box, Popover } from '@radix-ui/themes';
import { useState } from 'react';

interface UserAvatarMenuProps {
  locale: AppLocale;
}

export function UserAvatarMenu({ locale }: UserAvatarMenuProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const user = useAppSelector((state:RootState) => state.account.user);

  return (
    <Popover.Root open={userMenuOpen} onOpenChange={setUserMenuOpen}>
      <Popover.Trigger>
        <Box className="cursor-pointer">
          <Avatar
            size="2"
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
            className="ring-2 ring-blue-500 ring-offset-2"
          />
        </Box>
      </Popover.Trigger>
      <Popover.Content align="end">
        <UserMenuPopover
          locale={locale}
          onClose={() => setUserMenuOpen(false)}
        />
      </Popover.Content>
    </Popover.Root>
  );
}
