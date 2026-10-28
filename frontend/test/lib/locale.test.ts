import { describe, it, expect } from 'vitest';
import {
  isValidLocale,
  getValidLocale,
  getLocaleLabel,
  getLocaleFlag,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  LOCALE_LABELS,
  LOCALE_FLAGS,
  type AppLocale,
} from '@/lib/locale';

describe('locale', () => {
  describe('constants', () => {
    it('DEFAULT_LOCALE is vi', () => {
      expect(DEFAULT_LOCALE).toBe('vi');
    });

    it('SUPPORTED_LOCALES includes vi and en', () => {
      expect(SUPPORTED_LOCALES).toContain('vi');
      expect(SUPPORTED_LOCALES).toContain('en');
      expect(SUPPORTED_LOCALES).toHaveLength(2);
    });

    it('LOCALE_LABELS has entries for all supported locales', () => {
      SUPPORTED_LOCALES.forEach((locale: AppLocale) => {
        expect(LOCALE_LABELS[locale]).toBeDefined();
        expect(typeof LOCALE_LABELS[locale]).toBe('string');
      });
    });

    it('LOCALE_FLAGS has entries for all supported locales', () => {
      SUPPORTED_LOCALES.forEach((locale: AppLocale) => {
        expect(LOCALE_FLAGS[locale]).toBeDefined();
        expect(typeof LOCALE_FLAGS[locale]).toBe('string');
      });
    });
  });

  describe('isValidLocale', () => {
    it('returns true for vi', () => {
      expect(isValidLocale('vi')).toBe(true);
    });

    it('returns true for en', () => {
      expect(isValidLocale('en')).toBe(true);
    });

    it('returns false for invalid locale', () => {
      expect(isValidLocale('fr')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isValidLocale('')).toBe(false);
    });

    it('returns false for random string', () => {
      expect(isValidLocale('invalid')).toBe(false);
    });

    it('returns false for uppercase locale', () => {
      expect(isValidLocale('EN')).toBe(false);
    });

    it('returns false for partial match', () => {
      expect(isValidLocale('v')).toBe(false);
    });
  });

  describe('getValidLocale', () => {
    it('returns vi when passed vi', () => {
      expect(getValidLocale('vi')).toBe('vi');
    });

    it('returns en when passed en', () => {
      expect(getValidLocale('en')).toBe('en');
    });

    it('returns DEFAULT_LOCALE for invalid locale', () => {
      expect(getValidLocale('fr')).toBe(DEFAULT_LOCALE);
    });

    it('returns DEFAULT_LOCALE for undefined', () => {
      expect(getValidLocale(undefined)).toBe(DEFAULT_LOCALE);
    });

    it('returns DEFAULT_LOCALE for empty string', () => {
      expect(getValidLocale('')).toBe(DEFAULT_LOCALE);
    });

    it('returns DEFAULT_LOCALE for random string', () => {
      expect(getValidLocale('invalid')).toBe(DEFAULT_LOCALE);
    });

    it('returns DEFAULT_LOCALE for uppercase locale', () => {
      expect(getValidLocale('EN')).toBe(DEFAULT_LOCALE);
    });
  });

  describe('getLocaleLabel', () => {
    it('returns Tiếng Việt for vi', () => {
      expect(getLocaleLabel('vi')).toBe('Tiếng Việt');
    });

    it('returns English for en', () => {
      expect(getLocaleLabel('en')).toBe('English');
    });

    it('returns input string for invalid locale', () => {
      expect(getLocaleLabel('fr')).toBe('fr');
    });

    it('returns input string for empty string', () => {
      expect(getLocaleLabel('')).toBe('');
    });

    it('returns input string for random string', () => {
      const input = 'random';
      expect(getLocaleLabel(input)).toBe(input);
    });
  });

  describe('getLocaleFlag', () => {
    it('returns Vietnamese flag for vi', () => {
      expect(getLocaleFlag('vi')).toBe('🇻🇳');
    });

    it('returns US flag for en', () => {
      expect(getLocaleFlag('en')).toBe('🇺🇸');
    });

    it('returns globe emoji for invalid locale', () => {
      expect(getLocaleFlag('fr')).toBe('🌐');
    });

    it('returns globe emoji for empty string', () => {
      expect(getLocaleFlag('')).toBe('🌐');
    });

    it('returns globe emoji for random string', () => {
      expect(getLocaleFlag('random')).toBe('🌐');
    });
  });
});
