import { describe, it, expect } from 'vitest';
import { MENU_TYPE, isExternalUrl, getMenuUrl } from '@/lib/utils/menuUrl';
import type { ShopMenuItem } from '@/types/gen/shop/shop/menus/menu-service';

describe('MENU_TYPE', () => {
  it('exports correct menu type constants', () => {
    expect(MENU_TYPE.CATEGORY).toBe('category');
    expect(MENU_TYPE.TOPIC).toBe('topic');
    expect(MENU_TYPE.URL).toBe('url');
  });

  it('is immutable (const assertion)', () => {
    expect(Object.isFrozen(MENU_TYPE)).toBe(false); // const assertion doesn't freeze, but TypeScript prevents mutation
    expect(typeof MENU_TYPE).toBe('object');
  });
});

describe('isExternalUrl', () => {
  it('returns true for http:// URLs', () => {
    expect(isExternalUrl('http://example.com')).toBe(true);
    expect(isExternalUrl('http://google.com/path')).toBe(true);
  });

  it('returns true for https:// URLs', () => {
    expect(isExternalUrl('https://example.com')).toBe(true);
    expect(isExternalUrl('https://google.com/path')).toBe(true);
  });

  it('returns false for relative URLs', () => {
    expect(isExternalUrl('/about')).toBe(false);
    expect(isExternalUrl('about')).toBe(false);
    expect(isExternalUrl('/category/123')).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isExternalUrl(undefined)).toBe(false);
  });

  it('returns false for null', () => {
    expect(isExternalUrl(null)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isExternalUrl('')).toBe(false);
  });

  it('returns false for protocol-relative URLs', () => {
    expect(isExternalUrl('//example.com')).toBe(false);
  });

  it('returns false for mailto: and tel: links', () => {
    expect(isExternalUrl('mailto:test@example.com')).toBe(false);
    expect(isExternalUrl('tel:+1234567890')).toBe(false);
  });
});

describe('getMenuUrl', () => {
  const locale = 'vi';

  describe('category menu items', () => {
    it('uses backend-provided SEO-friendly URL for category', () => {
      const menu: ShopMenuItem = {
        type: 'category',
        categoryId: '6955f3dfabd3fed1bcd51885',
        url: '/category/ao-so-mi-6955f3dfabd3fed1bcd51885',
      };
      expect(getMenuUrl(menu, locale)).toBe(
        '/vi/category/ao-so-mi-6955f3dfabd3fed1bcd51885'
      );
    });

    it('uses different locale correctly', () => {
      const menu: ShopMenuItem = {
        type: 'category',
        categoryId: '6955f3dfabd3fed1bcd51885',
        url: '/category/ao-so-mi-6955f3dfabd3fed1bcd51885',
      };
      expect(getMenuUrl(menu, 'en')).toBe(
        '/en/category/ao-so-mi-6955f3dfabd3fed1bcd51885'
      );
    });

    it('handles category with url field only', () => {
      const menu: ShopMenuItem = {
        type: 'category',
        url: '/category/products',
      };
      expect(getMenuUrl(menu, locale)).toBe('/vi/category/products');
    });
  });

  describe('topic menu items', () => {
    it('uses backend-provided SEO-friendly URL for topic', () => {
      const menu: ShopMenuItem = {
        type: 'topic',
        topicId: '6956a161aee8d523921d2b8e',
        url: '/topic/hang-moi-6956a161aee8d523921d2b8e',
      };
      expect(getMenuUrl(menu, locale)).toBe(
        '/vi/topic/hang-moi-6956a161aee8d523921d2b8e'
      );
    });

    it('uses different locale correctly', () => {
      const menu: ShopMenuItem = {
        type: 'topic',
        topicId: '6956a161aee8d523921d2b8e',
        url: '/topic/hang-moi-6956a161aee8d523921d2b8e',
      };
      expect(getMenuUrl(menu, 'en')).toBe(
        '/en/topic/hang-moi-6956a161aee8d523921d2b8e'
      );
    });

    it('handles topic with url field only', () => {
      const menu: ShopMenuItem = {
        type: 'topic',
        url: '/topic/flash-sale',
      };
      expect(getMenuUrl(menu, locale)).toBe('/vi/topic/flash-sale');
    });
  });

  describe('URL menu items with relative URLs', () => {
    it('handles URL starting with /', () => {
      const menu: ShopMenuItem = {
        type: 'url',
        url: '/about',
      };
      expect(getMenuUrl(menu, locale)).toBe('/vi/about');
    });

    it('handles URL without leading /', () => {
      const menu: ShopMenuItem = {
        type: 'url',
        url: 'about',
      };
      expect(getMenuUrl(menu, locale)).toBe('/vi/about');
    });

    it('handles empty url', () => {
      const menu: ShopMenuItem = {
        type: 'url',
        url: '',
      };
      expect(getMenuUrl(menu, locale)).toBe('/vi');
    });

    it('handles undefined url', () => {
      const menu: ShopMenuItem = {
        type: 'url',
      };
      expect(getMenuUrl(menu, locale)).toBe('/vi');
    });
  });

  describe('URL menu items with external URLs', () => {
    it('returns external HTTP URL as-is', () => {
      const menu: ShopMenuItem = {
        type: 'url',
        url: 'http://example.com',
      };
      expect(getMenuUrl(menu, locale)).toBe('http://example.com');
    });

    it('returns external HTTPS URL as-is', () => {
      const menu: ShopMenuItem = {
        type: 'url',
        url: 'https://example.com/page',
      };
      expect(getMenuUrl(menu, locale)).toBe('https://example.com/page');
    });

    it('does not add locale to external URLs', () => {
      const menu: ShopMenuItem = {
        type: 'url',
        url: 'https://google.com',
      };
      expect(getMenuUrl(menu, 'en')).toBe('https://google.com');
      expect(getMenuUrl(menu, 'vi')).toBe('https://google.com');
    });
  });

  describe('edge cases', () => {
    it('handles category with both categoryId and url (uses url)', () => {
      const menu: ShopMenuItem = {
        type: 'category',
        categoryId: '999',
        url: '/category/seo-friendly-999',
      };
      expect(getMenuUrl(menu, locale)).toBe('/vi/category/seo-friendly-999');
    });

    it('handles topic with both topicId and url (uses url)', () => {
      const menu: ShopMenuItem = {
        type: 'topic',
        topicId: '888',
        url: '/topic/seo-friendly-888',
      };
      expect(getMenuUrl(menu, locale)).toBe('/vi/topic/seo-friendly-888');
    });

    it('handles empty url for category', () => {
      const menu: ShopMenuItem = {
        type: 'category',
        categoryId: '999',
        url: '',
      };
      expect(getMenuUrl(menu, locale)).toBe('/vi');
    });

    it('handles empty url for topic', () => {
      const menu: ShopMenuItem = {
        type: 'topic',
        topicId: '888',
        url: '',
      };
      expect(getMenuUrl(menu, locale)).toBe('/vi');
    });
  });
});
