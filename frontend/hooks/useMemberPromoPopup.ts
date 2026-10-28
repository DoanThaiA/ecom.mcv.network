'use client';

import { storageService } from '@/lib/services/storage.service';

export function useMemberPromoPopup(
  _isAuthenticated: boolean,
  _isMounted: boolean
) {
  const handleClosePromoPopup = () => {
    storageService.setMemberPromoDismissed();
  };

  return { showPromoPopup: false, handleClosePromoPopup };
}
