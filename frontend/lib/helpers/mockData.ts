/**
 * Mock Data Helpers
 * Functions to generate mock data for development and testing
 */

import { AppNotification } from "@/types/notification";
import { AppLocale } from "../locale";

/**
 * Generate mock notifications for testing
 */
export function getMockNotifications(locale: AppLocale): AppNotification[] {
  // In production, this would come from API/Redux state
  // For now, return mock data

  const mockData = [
    {
      id: '1',
      title: locale === 'vi' ? 'Đơn hàng đã được xác nhận' : 'Order confirmed',
      message: locale === 'vi'
        ? 'Đơn hàng #12345 của bạn đã được xác nhận và đang được xử lý.'
        : 'Your order #12345 has been confirmed and is being processed.',
      timestamp: locale === 'vi' ? '5 phút trước' : '5 minutes ago',
      isRead: false,
      type: 'order' as const,
    },
    {
      id: '2',
      title: locale === 'vi' ? 'Giảm giá đặc biệt' : 'Special discount',
      message: locale === 'vi'
        ? 'Giảm giá 30% cho tất cả sản phẩm áo sơ mi. Áp dụng đến hết tuần này!'
        : '30% off all shirts. Offer valid until end of this week!',
      timestamp: locale === 'vi' ? '1 giờ trước' : '1 hour ago',
      isRead: false,
      type: 'promotion' as const,
    },
    {
      id: '3',
      title: locale === 'vi' ? 'Đơn hàng đã giao' : 'Order delivered',
      message: locale === 'vi'
        ? 'Đơn hàng #12340 đã được giao thành công.'
        : 'Order #12340 has been delivered successfully.',
      timestamp: locale === 'vi' ? '1 ngày trước' : '1 day ago',
      isRead: true,
      type: 'order' as const,
    },
  ];

  return mockData;
}
