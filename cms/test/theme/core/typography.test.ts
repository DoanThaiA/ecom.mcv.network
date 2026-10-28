import { describe, it, expect } from 'vitest';
import { defaultFont, primaryFont, secondaryFont, typography } from 'src/theme/core/typography';

describe('theme/core/typography', () => {
  describe('Font Constants', () => {
    it('exports defaultFont', () => {
      expect(defaultFont).toBe('Public Sans Variable');
    });

    it('exports primaryFont with font-family format', () => {
      expect(primaryFont).toBeDefined();
      expect(typeof primaryFont).toBe('string');
      expect(primaryFont).toContain('Public Sans Variable');
    });

    it('exports secondaryFont with font-family format', () => {
      expect(secondaryFont).toBeDefined();
      expect(typeof secondaryFont).toBe('string');
      expect(secondaryFont).toContain('Barlow');
    });
  });

  describe('Typography Object', () => {
    it('exports typography object', () => {
      expect(typography).toBeDefined();
      expect(typeof typography).toBe('object');
    });

    it('has fontFamily property', () => {
      expect(typography.fontFamily).toBe(primaryFont);
    });

    it('has fontSecondaryFamily property', () => {
      expect(typography.fontSecondaryFamily).toBe(secondaryFont);
    });

    it('has font weight properties', () => {
      expect(typography.fontWeightLight).toBe('300');
      expect(typography.fontWeightRegular).toBe('400');
      expect(typography.fontWeightMedium).toBe('500');
      expect(typography.fontWeightSemiBold).toBe('600');
      expect(typography.fontWeightBold).toBe('700');
    });

    it('has h1 variant', () => {
      expect(typography.h1).toBeDefined();
      expect(typography.h1?.fontWeight).toBe(800);
      expect(typography.h1?.fontFamily).toBe(secondaryFont);
    });

    it('has h2 variant', () => {
      expect(typography.h2).toBeDefined();
      expect(typography.h2?.fontWeight).toBe(800);
      expect(typography.h2?.fontFamily).toBe(secondaryFont);
    });

    it('has h3 variant', () => {
      expect(typography.h3).toBeDefined();
      expect(typography.h3?.fontWeight).toBe(700);
      expect(typography.h3?.fontFamily).toBe(secondaryFont);
    });

    it('has h4 variant', () => {
      expect(typography.h4).toBeDefined();
      expect(typography.h4?.fontWeight).toBe(700);
      expect(typography.h4?.fontFamily).toBe(secondaryFont);
    });

    it('has h5 variant', () => {
      expect(typography.h5).toBeDefined();
      expect(typography.h5?.fontWeight).toBe(700);
    });

    it('has h6 variant', () => {
      expect(typography.h6).toBeDefined();
      expect(typography.h6?.fontWeight).toBe(600);
    });

    it('has subtitle1 variant', () => {
      expect(typography.subtitle1).toBeDefined();
      expect(typography.subtitle1?.fontWeight).toBe(600);
    });

    it('has subtitle2 variant', () => {
      expect(typography.subtitle2).toBeDefined();
      expect(typography.subtitle2?.fontWeight).toBe(600);
    });

    it('has body1 variant', () => {
      expect(typography.body1).toBeDefined();
      expect(typography.body1?.lineHeight).toBe(1.5);
    });

    it('has body2 variant', () => {
      expect(typography.body2).toBeDefined();
    });

    it('has caption variant', () => {
      expect(typography.caption).toBeDefined();
      expect(typography.caption?.lineHeight).toBe(1.5);
    });

    it('has overline variant', () => {
      expect(typography.overline).toBeDefined();
      expect(typography.overline?.fontWeight).toBe(700);
      expect(typography.overline?.textTransform).toBe('uppercase');
    });

    it('has button variant', () => {
      expect(typography.button).toBeDefined();
      expect(typography.button?.fontWeight).toBe(700);
      expect(typography.button?.textTransform).toBe('unset');
    });

    it('all heading variants use secondaryFont', () => {
      expect(typography.h1?.fontFamily).toBe(secondaryFont);
      expect(typography.h2?.fontFamily).toBe(secondaryFont);
      expect(typography.h3?.fontFamily).toBe(secondaryFont);
      expect(typography.h4?.fontFamily).toBe(secondaryFont);
    });

    it('has all required typography variants', () => {
      const variants = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2', 'caption', 'overline', 'button'];
      variants.forEach(variant => {
        expect(typography).toHaveProperty(variant);
      });
    });
  });
});
