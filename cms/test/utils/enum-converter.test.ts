import { describe, it, expect } from 'vitest';
import { ComboStatus, DiscountType, ProductStatus } from 'src/types/gen/shared/shared/common/enums';
import {
  COMBO_STATUS_API,
  API_COMBO_STATUS,
  DISCOUNT_TYPE_API,
  API_DISCOUNT_TYPE,
  parseDiscountType,
  PRODUCT_STATUS_UI,
  UI_PRODUCT_STATUS,
} from 'src/utils/enum-converter';

describe('enum-converter utils', () => {
  describe('COMBO_STATUS_API', () => {
    it('maps COMBO_STATUS_ACTIVE to active', () => expect(COMBO_STATUS_API[ComboStatus.COMBO_STATUS_ACTIVE]).toBe('active'));
    it('maps COMBO_STATUS_INACTIVE to inactive', () => expect(COMBO_STATUS_API[ComboStatus.COMBO_STATUS_INACTIVE]).toBe('inactive'));
    it('maps COMBO_STATUS_UNSPECIFIED to active', () => expect(COMBO_STATUS_API[ComboStatus.COMBO_STATUS_UNSPECIFIED]).toBe('active'));
    it('maps UNRECOGNIZED to active', () => expect(COMBO_STATUS_API[ComboStatus.UNRECOGNIZED]).toBe('active'));
  });

  describe('API_COMBO_STATUS', () => {
    it('maps active to COMBO_STATUS_ACTIVE', () => expect(API_COMBO_STATUS.active).toBe(ComboStatus.COMBO_STATUS_ACTIVE));
    it('maps inactive to COMBO_STATUS_INACTIVE', () => expect(API_COMBO_STATUS.inactive).toBe(ComboStatus.COMBO_STATUS_INACTIVE));
  });

  describe('DISCOUNT_TYPE_API', () => {
    it('maps DISCOUNT_TYPE_FIXED to fixed', () => expect(DISCOUNT_TYPE_API[DiscountType.DISCOUNT_TYPE_FIXED]).toBe('fixed'));
    it('maps DISCOUNT_TYPE_PERCENTAGE to percentage', () => expect(DISCOUNT_TYPE_API[DiscountType.DISCOUNT_TYPE_PERCENTAGE]).toBe('percentage'));
    it('maps DISCOUNT_TYPE_UNSPECIFIED to fixed', () => expect(DISCOUNT_TYPE_API[DiscountType.DISCOUNT_TYPE_UNSPECIFIED]).toBe('fixed'));
    it('maps UNRECOGNIZED to fixed', () => expect(DISCOUNT_TYPE_API[DiscountType.UNRECOGNIZED]).toBe('fixed'));
  });

  describe('API_DISCOUNT_TYPE', () => {
    it('maps fixed to DISCOUNT_TYPE_FIXED', () => expect(API_DISCOUNT_TYPE.fixed).toBe(DiscountType.DISCOUNT_TYPE_FIXED));
    it('maps percentage to DISCOUNT_TYPE_PERCENTAGE', () => expect(API_DISCOUNT_TYPE.percentage).toBe(DiscountType.DISCOUNT_TYPE_PERCENTAGE));
  });

  describe('parseDiscountType', () => {
    it('returns FIXED for undefined', () => expect(parseDiscountType(undefined)).toBe(DiscountType.DISCOUNT_TYPE_FIXED));
    it('returns FIXED for null', () => expect(parseDiscountType(null as any)).toBe(DiscountType.DISCOUNT_TYPE_FIXED));
    it('returns same enum if already DiscountType', () => expect(parseDiscountType(DiscountType.DISCOUNT_TYPE_PERCENTAGE)).toBe(DiscountType.DISCOUNT_TYPE_PERCENTAGE));
    it('parses fixed string', () => expect(parseDiscountType('fixed')).toBe(DiscountType.DISCOUNT_TYPE_FIXED));
    it('parses percentage string', () => expect(parseDiscountType('percentage')).toBe(DiscountType.DISCOUNT_TYPE_PERCENTAGE));
    it('parses FIXED uppercase', () => expect(parseDiscountType('FIXED')).toBe(DiscountType.DISCOUNT_TYPE_FIXED));
    it('parses discount_type_fixed', () => expect(parseDiscountType('discount_type_fixed')).toBe(DiscountType.DISCOUNT_TYPE_FIXED));
    it('parses discount_type_percentage', () => expect(parseDiscountType('discount_type_percentage')).toBe(DiscountType.DISCOUNT_TYPE_PERCENTAGE));
    it('returns FIXED for unknown string', () => expect(parseDiscountType('unknown')).toBe(DiscountType.DISCOUNT_TYPE_FIXED));
    it('returns FIXED for invalid number', () => expect(parseDiscountType(999)).toBe(DiscountType.DISCOUNT_TYPE_FIXED));
  });

  describe('PRODUCT_STATUS_UI', () => {
    it('maps PRODUCT_STATUS_NEW to new', () => expect(PRODUCT_STATUS_UI[ProductStatus.PRODUCT_STATUS_NEW]).toBe('new'));
    it('maps PRODUCT_STATUS_ACTIVE to active', () => expect(PRODUCT_STATUS_UI[ProductStatus.PRODUCT_STATUS_ACTIVE]).toBe('active'));
    it('maps PRODUCT_STATUS_DISCONTINUED to discontinued', () => expect(PRODUCT_STATUS_UI[ProductStatus.PRODUCT_STATUS_DISCONTINUED]).toBe('discontinued'));
    it('maps PRODUCT_STATUS_OUT_OF_STOCK to outOfStock', () => expect(PRODUCT_STATUS_UI[ProductStatus.PRODUCT_STATUS_OUT_OF_STOCK]).toBe('outOfStock'));
    it('maps PRODUCT_STATUS_INACTIVE to inactive', () => expect(PRODUCT_STATUS_UI[ProductStatus.PRODUCT_STATUS_INACTIVE]).toBe('inactive'));
    it('maps PRODUCT_STATUS_UNSPECIFIED to undefined', () => expect(PRODUCT_STATUS_UI[ProductStatus.PRODUCT_STATUS_UNSPECIFIED]).toBeUndefined());
    it('maps UNRECOGNIZED to undefined', () => expect(PRODUCT_STATUS_UI[ProductStatus.UNRECOGNIZED]).toBeUndefined());
  });

  describe('UI_PRODUCT_STATUS', () => {
    it('maps new to PRODUCT_STATUS_NEW', () => expect(UI_PRODUCT_STATUS.new).toBe(ProductStatus.PRODUCT_STATUS_NEW));
    it('maps active to PRODUCT_STATUS_ACTIVE', () => expect(UI_PRODUCT_STATUS.active).toBe(ProductStatus.PRODUCT_STATUS_ACTIVE));
    it('maps discontinued to PRODUCT_STATUS_DISCONTINUED', () => expect(UI_PRODUCT_STATUS.discontinued).toBe(ProductStatus.PRODUCT_STATUS_DISCONTINUED));
    it('maps outOfStock to PRODUCT_STATUS_OUT_OF_STOCK', () => expect(UI_PRODUCT_STATUS.outOfStock).toBe(ProductStatus.PRODUCT_STATUS_OUT_OF_STOCK));
    it('maps inactive to PRODUCT_STATUS_INACTIVE', () => expect(UI_PRODUCT_STATUS.inactive).toBe(ProductStatus.PRODUCT_STATUS_INACTIVE));
  });
});
