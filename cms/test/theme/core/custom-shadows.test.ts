import { describe, it, expect, vi } from 'vitest';
import { createShadowColor, customShadows } from 'src/theme/core/custom-shadows';
import type { CustomShadows } from 'src/theme/core/custom-shadows';

vi.mock('../styles', () => ({
  varAlpha: vi.fn((channel: string, alpha: number) => `rgba(${channel}, ${alpha})`),
}));

vi.mock('./palette', () => ({
  grey: { '500Channel': '128, 128, 128' },
  primary: { mainChannel: '33, 150, 243' },
  secondary: { mainChannel: '156, 39, 176' },
  info: { mainChannel: '3, 169, 244' },
  success: { mainChannel: '76, 175, 80' },
  warning: { mainChannel: '255, 152, 0' },
  error: { mainChannel: '244, 67, 54' },
  common: { blackChannel: '0, 0, 0' },
}));

describe('custom-shadows', () => {
  describe('createShadowColor', () => {
    it('exports createShadowColor function', () => {
      expect(createShadowColor).toBeDefined();
      expect(typeof createShadowColor).toBe('function');
    });

    it('creates shadow with correct format', () => {
      const result = createShadowColor('255, 0, 0');
      expect(result).toContain('0 8px 16px 0');
      expect(result).toContain('rgba(255, 0, 0 / 0.24)');
    });

    it('returns string type', () => {
      const result = createShadowColor('0, 0, 0');
      expect(typeof result).toBe('string');
    });

    it('handles different color channels', () => {
      const result1 = createShadowColor('100, 200, 150');
      const result2 = createShadowColor('50, 75, 100');
      expect(result1).not.toBe(result2);
    });
  });

  describe('customShadows', () => {
    it('exports customShadows function', () => {
      expect(customShadows).toBeDefined();
      expect(typeof customShadows).toBe('function');
    });

    it('returns CustomShadows object', () => {
      const shadows = customShadows();
      expect(shadows).toBeDefined();
      expect(typeof shadows).toBe('object');
    });

    it('has z1 shadow', () => {
      const shadows = customShadows();
      expect(shadows).toHaveProperty('z1');
      expect(typeof shadows.z1).toBe('string');
    });

    it('has z4 shadow', () => {
      const shadows = customShadows();
      expect(shadows).toHaveProperty('z4');
      expect(typeof shadows.z4).toBe('string');
    });

    it('has z8 shadow', () => {
      const shadows = customShadows();
      expect(shadows).toHaveProperty('z8');
      expect(typeof shadows.z8).toBe('string');
    });

    it('has z12 shadow', () => {
      const shadows = customShadows();
      expect(shadows).toHaveProperty('z12');
      expect(typeof shadows.z12).toBe('string');
    });

    it('has z16 shadow', () => {
      const shadows = customShadows();
      expect(shadows).toHaveProperty('z16');
      expect(typeof shadows.z16).toBe('string');
    });

    it('has z20 shadow', () => {
      const shadows = customShadows();
      expect(shadows).toHaveProperty('z20');
      expect(typeof shadows.z20).toBe('string');
    });

    it('has z24 shadow', () => {
      const shadows = customShadows();
      expect(shadows).toHaveProperty('z24');
      expect(typeof shadows.z24).toBe('string');
    });

    it('has primary shadow', () => {
      const shadows = customShadows();
      expect(shadows).toHaveProperty('primary');
      expect(typeof shadows.primary).toBe('string');
    });

    it('has secondary shadow', () => {
      const shadows = customShadows();
      expect(shadows).toHaveProperty('secondary');
      expect(typeof shadows.secondary).toBe('string');
    });

    it('has info shadow', () => {
      const shadows = customShadows();
      expect(shadows).toHaveProperty('info');
      expect(typeof shadows.info).toBe('string');
    });

    it('has success shadow', () => {
      const shadows = customShadows();
      expect(shadows).toHaveProperty('success');
      expect(typeof shadows.success).toBe('string');
    });

    it('has warning shadow', () => {
      const shadows = customShadows();
      expect(shadows).toHaveProperty('warning');
      expect(typeof shadows.warning).toBe('string');
    });

    it('has error shadow', () => {
      const shadows = customShadows();
      expect(shadows).toHaveProperty('error');
      expect(typeof shadows.error).toBe('string');
    });

    it('has dialog shadow', () => {
      const shadows = customShadows();
      expect(shadows).toHaveProperty('dialog');
      expect(typeof shadows.dialog).toBe('string');
    });

    it('has card shadow', () => {
      const shadows = customShadows();
      expect(shadows).toHaveProperty('card');
      expect(typeof shadows.card).toBe('string');
    });

    it('has dropdown shadow', () => {
      const shadows = customShadows();
      expect(shadows).toHaveProperty('dropdown');
      expect(typeof shadows.dropdown).toBe('string');
    });

    it('all shadow values are strings', () => {
      const shadows = customShadows();
      Object.values(shadows).forEach((value) => {
        expect(typeof value).toBe('string');
      });
    });

    it('all shadow values are not empty', () => {
      const shadows = customShadows();
      Object.values(shadows).forEach((value) => {
        expect(value).not.toBe('');
      });
    });

    it('uses grey color channel for z shadows', () => {
      const shadows = customShadows();
      // Check it contains rgba format with grey channel (145 158 171 is grey 500)
      expect(shadows.z1).toContain('rgba(145 158 171 / 0.16)');
    });

    it('uses createShadowColor for primary', () => {
      const shadows = customShadows();
      expect(shadows.primary).toContain('0 8px 16px 0');
    });

    it('exports CustomShadows interface', () => {
      const shadows: CustomShadows = customShadows();
      expect(shadows).toBeDefined();
    });
  });
});
