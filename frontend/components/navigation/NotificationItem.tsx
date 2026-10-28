'use client';

import { Box, Flex, Text, Tooltip } from '@radix-ui/themes';
import type { UserNotification } from '@/lib/repositories/notification.repository';

interface NotificationItemProps {
  notification: UserNotification;
  timeAgo: string;
  onClick: () => void;
}

export function NotificationItem({
  notification,
  timeAgo,
  onClick,
}: NotificationItemProps) {
  return (
    <Flex
      onClick={onClick}
      className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
        !notification.isRead ? 'bg-blue-50/50' : ''
      }`}
      gap="3"
      align="start"
    >
      {/* Unread indicator */}
      <Box className="flex-shrink-0 mt-2">
        {!notification.isRead ? (
          <Box className="w-2 h-2 rounded-full bg-red-500" />
        ) : (
          <Box className="w-2 h-2" />
        )}
      </Box>

      {/* Content */}
      <Box className="flex-1 min-w-0">
        <Tooltip content={notification.title}>
          <Text
            size="2"
            weight="medium"
            className="block truncate text-gray-900"
          >
            {notification.title}
          </Text>
        </Tooltip>
        <Tooltip content={notification.subtitle}>
          <Text
            size="1"
            className="block text-gray-600 mt-0.5"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {notification.subtitle}
          </Text>
        </Tooltip>
        <Text size="1" className="block text-gray-400 mt-1">
          {timeAgo}
        </Text>
      </Box>
    </Flex>
  );
}
