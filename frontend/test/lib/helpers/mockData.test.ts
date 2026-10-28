import { describe, it, expect } from 'vitest';
import { getMockNotifications } from '@/lib/helpers/mockData';
import type { AppNotification } from '@/types/notification';

describe('mockData', () => {
  describe('getMockNotifications', () => {
    it('returns array of notifications', () => {
      const result = getMockNotifications('vi');
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns notifications with Vietnamese locale', () => {
      const result = getMockNotifications('vi');

      result.forEach((notification: AppNotification) => {
        expect(notification.id).toBeDefined();
        expect(notification.title).toBeDefined();
        expect(notification.message).toBeDefined();
        expect(notification.timestamp).toBeDefined();
        expect(notification.type).toBeDefined();
        expect(typeof notification.isRead).toBe('boolean');
      });

      // Check that at least one notification has Vietnamese text
      const hasVietnamese = result.some((n) => n.title.includes('Đơn hàng'));
      expect(hasVietnamese).toBe(true);
    });

    it('returns notifications with English locale', () => {
      const result = getMockNotifications('en');

      result.forEach((notification: AppNotification) => {
        expect(notification.id).toBeDefined();
        expect(notification.title).toBeDefined();
        expect(notification.message).toBeDefined();
        expect(notification.timestamp).toBeDefined();
        expect(notification.type).toBeDefined();
        expect(typeof notification.isRead).toBe('boolean');
      });

      // Check that at least one notification has English text
      const hasEnglish = result.some((n) => n.title.includes('Order'));
      expect(hasEnglish).toBe(true);
    });

    it('returns different text for different locales', () => {
      const viNotifications = getMockNotifications('vi');
      const enNotifications = getMockNotifications('en');

      expect(viNotifications[0].title).not.toBe(enNotifications[0].title);
      expect(viNotifications[0].message).not.toBe(enNotifications[0].message);
      expect(viNotifications[0].timestamp).not.toBe(
        enNotifications[0].timestamp
      );
    });

    it('returns same number of notifications for both locales', () => {
      const viNotifications = getMockNotifications('vi');
      const enNotifications = getMockNotifications('en');

      expect(viNotifications.length).toBe(enNotifications.length);
    });

    it('includes both read and unread notifications', () => {
      const result = getMockNotifications('vi');

      const hasRead = result.some((n) => n.isRead === true);
      const hasUnread = result.some((n) => n.isRead === false);

      expect(hasRead).toBe(true);
      expect(hasUnread).toBe(true);
    });

    it('includes different notification types', () => {
      const result = getMockNotifications('vi');

      const types = new Set(result.map((n) => n.type));
      expect(types.size).toBeGreaterThan(1);
    });

    it('includes order type notifications', () => {
      const result = getMockNotifications('vi');
      const orderNotifications = result.filter((n) => n.type === 'order');
      expect(orderNotifications.length).toBeGreaterThan(0);
    });

    it('includes promotion type notifications', () => {
      const result = getMockNotifications('vi');
      const promotionNotifications = result.filter(
        (n) => n.type === 'promotion'
      );
      expect(promotionNotifications.length).toBeGreaterThan(0);
    });

    it('each notification has unique ID', () => {
      const result = getMockNotifications('vi');
      const ids = result.map((n) => n.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
