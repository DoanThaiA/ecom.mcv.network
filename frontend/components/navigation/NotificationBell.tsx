'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Box } from '@radix-ui/themes';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { NotificationDropdown } from './NotificationDropdown';
import {
  notificationRepository,
  type UserNotification,
} from '@/lib/repositories/notification.repository';
import { AppLocale } from '@/lib/locale';
import { storageService } from '@/lib/services/storage.service';
import { WebSocketEventType } from '@/types/websocket';
import type { Socket } from 'socket.io-client';

interface NotificationBellProps {
  locale: AppLocale;
  isAuthenticated: boolean;
}

export function NotificationBell({
  locale,
  isAuthenticated,
}: NotificationBellProps) {
  const t = useTranslations('notification');
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const pageRef = useRef(1);
  const loadingMoreRef = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const [mobileDropdownRight, setMobileDropdownRight] = useState<number>(0);

  // Fetch unread count on mount
  useEffect(() => {
    if (!isAuthenticated) return;
    notificationRepository.getUnreadCount().then(setUnreadCount).catch(() => {});
  }, [isAuthenticated]);

  // Listen for WebSocket notification events
  useEffect(() => {
    if (!isAuthenticated) return;

    const token = storageService.getToken();
    if (!token) return;

    // Try to get existing socket instance or listen on global
    const interval = setInterval(() => {
      // Access the singleton socket from useShopWebSocket module
      const socket = (globalThis as Record<string, unknown>).__shopSocket as
        | Socket
        | undefined;
      if (socket) {
        const onNewNotification = (data: {
          id: string;
          category: number;
          title: string;
          subtitle: string;
          url?: string;
          sentAt: string;
        }) => {
          setUnreadCount((prev) => prev + 1);
          const sentDate = new Date(data.sentAt);
          setNotifications((prev) => [
            {
              id: `temp-${Date.now()}`,
              notificationId: data.id,
              category: data.category,
              title: data.title,
              subtitle: data.subtitle,
              url: data.url,
              isRead: false,
              sentAt: sentDate,
              createdAt: sentDate,
            },
            ...prev,
          ]);
        };

        const onRecalled = (data: { id: string }) => {
          setNotifications((prev) =>
            prev.filter((n) => n.notificationId !== data.id),
          );
        };

        socket.on(WebSocketEventType.NOTIFICATION_NEW, onNewNotification);
        socket.on(
          WebSocketEventType.NOTIFICATION_RECALLED,
          onRecalled,
        );

        clearInterval(interval);

        return () => {
          socket.off(WebSocketEventType.NOTIFICATION_NEW, onNewNotification);
          socket.off(
            WebSocketEventType.NOTIFICATION_RECALLED,
            onRecalled,
          );
        };
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = useCallback(async () => {
    const newOpen = !isOpen;
    setIsOpen(newOpen);
    if (newOpen && bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      setMobileDropdownRight(window.innerWidth - rect.right);
    }
    if (newOpen && isAuthenticated) {
      setLoading(true);
      pageRef.current = 1;
      try {
        const result = await notificationRepository.getNotifications(1, 20);
        setNotifications(result.data);
        setHasNextPage(result.hasNextPage);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
  }, [isOpen, isAuthenticated]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasNextPage) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    const nextPage = pageRef.current + 1;
    try {
      const result = await notificationRepository.getNotifications(
        nextPage,
        20,
      );
      pageRef.current = nextPage;
      setNotifications((prev) => [...prev, ...result.data]);
      setHasNextPage(result.hasNextPage);
    } catch {
      // silent
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [hasNextPage]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await notificationRepository.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true })),
      );
    } catch {
      // silent
    }
  }, []);

  const handleNotificationClick = useCallback(
    async (notification: UserNotification) => {
      if (!notification.isRead) {
        try {
          await notificationRepository.markAsRead(notification.notificationId);
          setUnreadCount((prev) => Math.max(0, prev - 1));
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notification.id ? { ...n, isRead: true } : n,
            ),
          );
        } catch {
          // silent
        }
      }
      setIsOpen(false);
      if (notification.url) {
        try {
          const parsed = new URL(notification.url, window.location.origin);
          if (parsed.origin === window.location.origin) {
            router.push(parsed.pathname + parsed.search + parsed.hash);
          } else {
            window.open(notification.url, '_blank', 'noopener');
          }
        } catch {
          router.push(notification.url);
        }
      }
    },
    [router],
  );

  const getTimeAgo = useCallback(
    (dateValue: Date | string): string => {
      const now = new Date();
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return t('justNow');
      if (diffMins < 60) return t('minutesAgo', { count: diffMins });
      if (diffHours < 24) return t('hoursAgo', { count: diffHours });
      return t('daysAgo', { count: diffDays });
    },
    [t],
  );

  if (!isAuthenticated) return null;

  return (
    <Box ref={dropdownRef} className="relative" style={{ overflow: 'visible' }}>
      {/* Bell Icon */}
      <Box
        ref={bellRef}
        className="cursor-pointer relative w-6 h-6"
        style={{ overflow: 'visible' }}
        onClick={handleToggle}
      >
        <Image
          src="/assets/svg/bell.svg"
          alt="Notifications"
          width={24}
          height={24}
        />
        {unreadCount > 0 && (
          <Box className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none z-10">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Box>
        )}
      </Box>

      {/* Dropdown - Desktop: absolute from bell, Mobile: full-width overlay */}
      {isOpen && (
        <>
          {/* Mobile dropdown — use calculated right to span full viewport */}
          <Box
            className="sm:hidden absolute top-10 z-50"
            style={{
              right: -mobileDropdownRight,
              width: `calc(100vw - 24px)`,
              maxWidth: 420,
              marginRight: 12,
            }}
          >
            <NotificationDropdown
              notifications={notifications}
              onMarkAllAsRead={handleMarkAllAsRead}
              onNotificationClick={handleNotificationClick}
              onLoadMore={handleLoadMore}
              getTimeAgo={getTimeAgo}
              loading={loading}
              loadingMore={loadingMore}
              hasNextPage={hasNextPage}
            />
          </Box>
          {/* Desktop dropdown */}
          <Box className="hidden sm:block absolute right-0 top-10 z-50">
            <NotificationDropdown
              notifications={notifications}
              onMarkAllAsRead={handleMarkAllAsRead}
              onNotificationClick={handleNotificationClick}
              onLoadMore={handleLoadMore}
              getTimeAgo={getTimeAgo}
              loading={loading}
              loadingMore={loadingMore}
              hasNextPage={hasNextPage}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
