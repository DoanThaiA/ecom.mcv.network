import { describe, it, expect } from 'vitest';
import {
  PromotionStatus,
  PromotionType,
  promotionStatusToKey,
  getPromotionStatusColor,
  promotionTypeToKey,
} from 'src/types/promotion/promotion';

describe('types/promotion/promotion', () => {
  describe('promotionStatusToKey', () => {
    it('should return "ongoing" for ACTIVE status', () => {
      expect(promotionStatusToKey(PromotionStatus.PROMOTION_STATUS_ACTIVE)).toBe('ongoing');
    });

    it('should return "upcoming" for UPCOMING status', () => {
      expect(promotionStatusToKey(PromotionStatus.PROMOTION_STATUS_UPCOMING)).toBe('upcoming');
    });

    it('should return "paused" for PAUSED status', () => {
      expect(promotionStatusToKey(PromotionStatus.PROMOTION_STATUS_PAUSED)).toBe('paused');
    });

    it('should return "ended" for ENDED status', () => {
      expect(promotionStatusToKey(PromotionStatus.PROMOTION_STATUS_ENDED)).toBe('ended');
    });

    it('should return "unknown" for unspecified status', () => {
      expect(promotionStatusToKey(PromotionStatus.PROMOTION_STATUS_UNSPECIFIED)).toBe('unknown');
    });
  });

  describe('getPromotionStatusColor', () => {
    it('should return "success" for ACTIVE status', () => {
      expect(getPromotionStatusColor(PromotionStatus.PROMOTION_STATUS_ACTIVE)).toBe('success');
    });

    it('should return "info" for UPCOMING status', () => {
      expect(getPromotionStatusColor(PromotionStatus.PROMOTION_STATUS_UPCOMING)).toBe('info');
    });

    it('should return "warning" for PAUSED status', () => {
      expect(getPromotionStatusColor(PromotionStatus.PROMOTION_STATUS_PAUSED)).toBe('warning');
    });

    it('should return "error" for ENDED status', () => {
      expect(getPromotionStatusColor(PromotionStatus.PROMOTION_STATUS_ENDED)).toBe('error');
    });

    it('should return "default" for unspecified status', () => {
      expect(getPromotionStatusColor(PromotionStatus.PROMOTION_STATUS_UNSPECIFIED)).toBe('default');
    });
  });

  describe('promotionTypeToKey', () => {
    it('should return "shockDeal" for BUNDLE_DEAL type', () => {
      expect(promotionTypeToKey(PromotionType.PROMOTION_TYPE_BUNDLE_DEAL)).toBe('shockDeal');
    });

    it('should return "invoiceDiscount" for ORDER_DISCOUNT type', () => {
      expect(promotionTypeToKey(PromotionType.PROMOTION_TYPE_ORDER_DISCOUNT)).toBe('invoiceDiscount');
    });

    it('should return "comboPromotion" for PRODUCT_COMBO type', () => {
      expect(promotionTypeToKey(PromotionType.PROMOTION_TYPE_PRODUCT_COMBO)).toBe('comboPromotion');
    });

    it('should return "unknown" for unspecified type', () => {
      expect(promotionTypeToKey(PromotionType.PROMOTION_TYPE_UNSPECIFIED)).toBe('unknown');
    });
  });

  describe('exports', () => {
    it('should export PromotionStatus enum', () => {
      expect(PromotionStatus).toBeDefined();
    });

    it('should export PromotionType enum', () => {
      expect(PromotionType).toBeDefined();
    });
  });
});
