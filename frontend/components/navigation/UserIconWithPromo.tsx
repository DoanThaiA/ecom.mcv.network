'use client';

import { AppLocale } from '@/lib/locale';
import { Box } from '@radix-ui/themes';
import Image from 'next/image';
import { MemberPromoPopup } from '../common/MemberPromoPopup';
import { UserAvatarMenu } from './UserAvatarMenu';

interface UserIconWithPromoProps {
  locale: AppLocale;
  isMounted: boolean;
  isAuthenticated: boolean;
  showPromoPopup: boolean;
  onSignInClick: () => void;
  onClosePromoPopup: () => void;
}

export function UserIconWithPromo({
  locale,
  isMounted,
  isAuthenticated,
  showPromoPopup,
  onSignInClick,
  onClosePromoPopup,
}: UserIconWithPromoProps) {
  return (
    <Box className="relative">
      {!isMounted ? (
        <Box className="cursor-pointer w-6 h-6 opacity-50">
          <Image
            src="/assets/svg/user.svg"
            alt="User"
            width={24}
            height={24}
          />
        </Box>
      ) : isAuthenticated ? (
        <UserAvatarMenu locale={locale} />
      ) : (
        <Box
          className="cursor-pointer w-6 h-6"
          onClick={onSignInClick}
        >
          <Image
            src="/assets/svg/user.svg"
            alt="User"
            width={24}
            height={24}
          />
        </Box>
      )}
      {showPromoPopup && !isAuthenticated && (
        <MemberPromoPopup onClose={onClosePromoPopup} />
      )}
    </Box>
  );
}
