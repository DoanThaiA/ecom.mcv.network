import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { decodeHtmlEntities } from '@/lib/utils/html';

describe('decodeHtmlEntities', () => {
  describe('client-side (browser environment)', () => {
    it('decodes HTML entities using textarea trick', () => {
      const input = '&lt;p&gt;Hello &amp; goodbye&lt;/p&gt;';
      const expected = '<p>Hello & goodbye</p>';
      expect(decodeHtmlEntities(input)).toBe(expected);
    });

    it('handles all common HTML entities', () => {
      expect(decodeHtmlEntities('&lt;')).toBe('<');
      expect(decodeHtmlEntities('&gt;')).toBe('>');
      expect(decodeHtmlEntities('&amp;')).toBe('&');
      expect(decodeHtmlEntities('&quot;')).toBe('"');
      expect(decodeHtmlEntities('&#39;')).toBe("'");
      expect(decodeHtmlEntities('&nbsp;')).toBe('\u00A0');
    });

    it('handles mixed encoded entities', () => {
      const input = '&lt;div&gt;Text &amp; &quot;quoted&quot; &#39;text&#39;&lt;/div&gt;';
      const expected = '<div>Text & "quoted" \'text\'</div>';
      expect(decodeHtmlEntities(input)).toBe(expected);
    });

    it('returns already decoded HTML as-is', () => {
      const input = '<p>Hello world</p>';
      expect(decodeHtmlEntities(input)).toBe(input);
    });

    it('returns plain text as-is', () => {
      const input = 'Just plain text';
      expect(decodeHtmlEntities(input)).toBe(input);
    });

    it('handles empty string', () => {
      expect(decodeHtmlEntities('')).toBe('');
    });

    it('preserves HTML structure when decoded', () => {
      const input = '&lt;div class=&quot;test&quot;&gt;Content&lt;/div&gt;';
      const expected = '<div class="test">Content</div>';
      expect(decodeHtmlEntities(input)).toBe(expected);
    });

    it('handles strings without encoded entities', () => {
      const input = 'Normal text without entities';
      expect(decodeHtmlEntities(input)).toBe(input);
    });

    it('handles numeric character references', () => {
      const input = 'Test&#39;s';
      const expected = "Test's";
      expect(decodeHtmlEntities(input)).toBe(expected);
    });
  });

  describe('server-side (no window object)', () => {
    let windowSpy: any;

    beforeEach(() => {
      // Mock server environment by making window undefined
      windowSpy = vi.spyOn(global, 'window', 'get');
      windowSpy.mockReturnValue(undefined);
    });

    afterEach(() => {
      windowSpy.mockRestore();
    });

    it('decodes common HTML entities using replace', () => {
      const input = '&lt;p&gt;Hello &amp; goodbye&lt;/p&gt;';
      const expected = '<p>Hello & goodbye</p>';
      expect(decodeHtmlEntities(input)).toBe(expected);
    });

    it('handles all common HTML entities on server', () => {
      expect(decodeHtmlEntities('&lt;')).toBe('<');
      expect(decodeHtmlEntities('&gt;')).toBe('>');
      expect(decodeHtmlEntities('&amp;')).toBe('&');
      expect(decodeHtmlEntities('&quot;')).toBe('"');
      expect(decodeHtmlEntities('&#39;')).toBe("'");
      expect(decodeHtmlEntities('&nbsp;')).toBe(' ');
    });

    it('handles mixed encoded entities on server', () => {
      const input = '&lt;div&gt;Text &amp; &quot;quoted&quot; &#39;text&#39;&lt;/div&gt;';
      const expected = '<div>Text & "quoted" \'text\'</div>';
      expect(decodeHtmlEntities(input)).toBe(expected);
    });

    it('returns already decoded HTML as-is on server', () => {
      const input = '<p>Hello world</p>';
      expect(decodeHtmlEntities(input)).toBe(input);
    });

    it('returns plain text as-is on server', () => {
      const input = 'Just plain text';
      expect(decodeHtmlEntities(input)).toBe(input);
    });

    it('handles empty string on server', () => {
      expect(decodeHtmlEntities('')).toBe('');
    });

    it('handles complex HTML with multiple entities on server', () => {
      const input = '&lt;div&gt;&nbsp;Test&amp;Test&nbsp;&lt;/div&gt;';
      const expected = '<div> Test&Test </div>';
      expect(decodeHtmlEntities(input)).toBe(expected);
    });
  });

  describe('entity detection', () => {
    it('correctly identifies strings with encoded entities', () => {
      expect(decodeHtmlEntities('&lt;test&gt;')).toBe('<test>');
      expect(decodeHtmlEntities('test &amp; test')).toBe('test & test');
    });

    it('correctly identifies strings without encoded entities', () => {
      const plainText = 'No entities here';
      expect(decodeHtmlEntities(plainText)).toBe(plainText);

      const alreadyDecoded = '<div>Already decoded</div>';
      expect(decodeHtmlEntities(alreadyDecoded)).toBe(alreadyDecoded);
    });

    it('detects encoded entities case-insensitively', () => {
      // The regex uses /i flag for case-insensitive matching for detection
      // JSDOM's textarea.innerHTML handles some uppercase entities (like &LT;) but not all (like &Amp;)
      // Standard HTML entities should be lowercase anyway
      expect(decodeHtmlEntities('&LT;test&GT;')).toBe('<test>');
      expect(decodeHtmlEntities('&lt;test&gt;')).toBe('<test>');
      expect(decodeHtmlEntities('&amp;')).toBe('&');
    });
  });
});
