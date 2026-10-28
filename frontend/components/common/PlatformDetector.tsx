'use client';

import { useEffect } from 'react';

/**
 * Component phát hiện platform và thêm class tương ứng vào document.
 * Dùng để fallback font cho Windows (Inter thay vì Google Sans Flex)
 * vì Google Sans Flex thiếu font hinting trên Windows.
 */
export function PlatformDetector() {
  useEffect(() => {
    const isWindows =
      navigator.platform.indexOf('Win') > -1 ||
      navigator.userAgent.indexOf('Windows') > -1;

    if (isWindows) {
      document.documentElement.classList.add('windows-platform');
    }
  }, []);

  return null;
}
