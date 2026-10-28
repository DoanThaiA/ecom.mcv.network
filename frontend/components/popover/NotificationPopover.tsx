'use client';

import { Flex, Text, Box, ScrollArea } from '@radix-ui/themes';
import { BellIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import { AppNotification } from '@/types/notification';
import { AppLocale } from '@/lib/locale';

interface NotificationPopoverProps {
  notifications: AppNotification[];
  locale: AppLocale;
}

export function NotificationPopover({ notifications, locale: _locale }: NotificationPopoverProps) {
  const t = useTranslations('notifications');

  // Empty state
  if (notifications.length === 0) {
    return (
      <Box
        style={{
          width: '400px',
          minHeight: '300px',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Flex direction="column" align="center" gap="4" style={{ padding: '60px 40px' }}>
          {/* Bell icon from Radix Icons */}
          <Box
            style={{
              width: '120px',
              height: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <BellIcon
              width="80"
              height="80"
              style={{
                color: '#D1D5DB',
                opacity: 0.5,
              }}
            />
            {/* Slash line overlay */}
            <Box
              style={{
                position: 'absolute',
                width: '100px',
                height: '2px',
                backgroundColor: '#9CA3AF',
                transform: 'rotate(-45deg)',
                top: '50%',
                left: '50%',
                marginLeft: '-50px',
                marginTop: '-1px',
              }}
            />
          </Box>

          {/* Empty text */}
          <Text
            size="4"
            className="text-gray-400 text-center font-normal"
          >
            {t('noNotifications')}
          </Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      style={{
        width: '400px',
        maxHeight: '500px',
        backgroundColor: 'white',
      }}
    >
      <ScrollArea
        type="auto"
        scrollbars="vertical"
        style={{
          maxHeight: '500px',
        }}
      >
        <Flex direction="column" gap="0">
          {notifications.map((notification, index) => (
            <Box
              key={notification.id}
              style={{
                padding: '16px 20px',
                borderBottom:
                  index < notifications.length - 1 ? '1px solid #F3F4F6' : 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Flex gap="3" align="start">
                {/* Red dot indicator for unread */}
                <Box
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: notification.isRead ? 'transparent' : '#EF4444',
                    marginTop: '6px',
                    flexShrink: 0,
                  }}
                />

                {/* Avatar placeholder */}
                <Box
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    backgroundColor: '#E5E7EB',
                    flexShrink: 0,
                  }}
                />

                {/* Content */}
                <Flex direction="column" gap="1" style={{ flex: 1 }}>
                  <Text
                    size="2"
                    weight="medium"
                    style={{
                      color: '#111827',
                      lineHeight: '1.5',
                    }}
                  >
                    {notification.message}
                  </Text>
                  <Text
                    size="2"
                    style={{
                      color: '#9CA3AF',
                      fontSize: '13px',
                    }}
                  >
                    {notification.timestamp}
                  </Text>
                </Flex>
              </Flex>
            </Box>
          ))}
        </Flex>
      </ScrollArea>
    </Box>
  );
}
