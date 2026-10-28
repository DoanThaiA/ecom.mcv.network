'use client';

import { useCallback, useRef } from 'react';
import { Box, Flex, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { NotificationItem } from './NotificationItem';
import type { UserNotification } from '@/lib/repositories/notification.repository';

interface NotificationDropdownProps {
  notifications: UserNotification[];
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: UserNotification) => void;
  onLoadMore: () => void;
  getTimeAgo: (dateValue: Date | string) => string;
  loading: boolean;
  loadingMore: boolean;
  hasNextPage: boolean;
}

export function NotificationDropdown({
  notifications,
  onMarkAllAsRead,
  onNotificationClick,
  onLoadMore,
  getTimeAgo,
  loading,
  loadingMore,
  hasNextPage,
}: NotificationDropdownProps) {
  const t = useTranslations('notification');
  const listRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || loadingMore || !hasNextPage) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      onLoadMore();
    }
  }, [loadingMore, hasNextPage, onLoadMore]);

  return (
    <Box className="w-full sm:w-[360px] bg-white rounded-lg shadow-xl border border-gray-200">
      {/* Header */}
      <Flex
        justify="between"
        align="center"
        className="px-4 py-3 border-b border-gray-100"
      >
        <Text size="3" weight="bold" className="text-gray-900">
          {t('title')}
        </Text>
        <Text
          size="1"
          className="text-blue-600 cursor-pointer hover:underline"
          onClick={onMarkAllAsRead}
        >
          {t('markAllAsRead')}
        </Text>
      </Flex>

      {/* Notification List */}
      <Box
        ref={listRef}
        className="max-h-[calc(100vh-140px)] sm:max-h-[400px] overflow-y-auto"
        onScroll={handleScroll}
      >
        {loading && notifications.length === 0 && (
          <Box className="p-8 text-center">
            <Text size="2" className="text-gray-400">
              ...
            </Text>
          </Box>
        )}
        {!loading && notifications.length === 0 && (
          <Box className="p-8 text-center">
            <Text size="2" className="text-gray-400">
              {t('noNotifications')}
            </Text>
          </Box>
        )}
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            timeAgo={notification.sentAt ? getTimeAgo(notification.sentAt) : ''}
            onClick={() => onNotificationClick(notification)}
          />
        ))}
        {loadingMore && (
          <Box className="py-3 text-center">
            <Text size="1" className="text-gray-400">
              ...
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
