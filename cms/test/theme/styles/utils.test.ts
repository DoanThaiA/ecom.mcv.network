import { describe, it, expect } from 'vitest';
import {
  stylesMode,
  mediaQueries,
  setFont,
  remToPx,
  pxToRem,
  responsiveFontSizes,
  hexToRgbChannel,
  createPaletteChannel,
  varAlpha,
} from 'src/theme/styles/utils';

describe('theme/styles/utils', () => {
  describe('stylesMode', () => {
    it('exports stylesMode object', () => {
      expect(stylesMode).toBeDefined();
      expect(typeof stylesMode).toBe('object');
    });

    it('has light mode selector', () => {
      expect(stylesMode.light).toBe('[data-mui-color-scheme="light"] &');
    });

    it('has dark mode selector', () => {
      expect(stylesMode.dark).toBe('[data-mui-color-scheme="dark"] &');
    });
  });

  describe('mediaQueries', () => {
    it('exports mediaQueries object', () => {
      expect(mediaQueries).toBeDefined();
      expect(typeof mediaQueries).toBe('object');
    });

    it('has upXs breakpoint', () => {
      expect(mediaQueries.upXs).toBe('@media (min-width:0px)');
    });

    it('has upSm breakpoint', () => {
      expect(mediaQueries.upSm).toBe('@media (min-width:600px)');
    });

    it('has upMd breakpoint', () => {
      expect(mediaQueries.upMd).toBe('@media (min-width:900px)');
    });

    it('has upLg breakpoint', () => {
      expect(mediaQueries.upLg).toBe('@media (min-width:1200px)');
    });

    it('has upXl breakpoint', () => {
      expect(mediaQueries.upXl).toBe('@media (min-width:1536px)');
    });
  });

  describe('setFont', () => {
    it('exports setFont function', () => {
      expect(setFont).toBeDefined();
      expect(typeof setFont).toBe('function');
    });

    it('returns font family string with fallbacks', () => {
      const result = setFont('Roboto');
      expect(result).toContain('"Roboto"');
      expect(result).toContain('-apple-system');
      expect(result).toContain('BlinkMacSystemFont');
      expect(result).toContain('sans-serif');
    });

    it('wraps font name in quotes', () => {
      const result = setFont('Custom Font');
      expect(result).toMatch(/^"Custom Font"/);
    });

    it('includes system font fallbacks', () => {
      const result = setFont('MyFont');
      expect(result).toContain('Arial');
      expect(result).toContain('Segoe UI');
      expect(result).toContain('Helvetica Neue');
    });
  });

  describe('remToPx', () => {
    it('exports remToPx function', () => {
      expect(remToPx).toBeDefined();
      expect(typeof remToPx).toBe('function');
    });

    it('converts 1rem to 16px', () => {
      expect(remToPx('1rem')).toBe(16);
    });

    it('converts 2rem to 32px', () => {
      expect(remToPx('2rem')).toBe(32);
    });

    it('converts 0.5rem to 8px', () => {
      expect(remToPx('0.5rem')).toBe(8);
    });

    it('rounds to nearest integer', () => {
      expect(remToPx('1.5rem')).toBe(24);
    });

    it('returns number type', () => {
      const result = remToPx('1rem');
      expect(typeof result).toBe('number');
    });
  });

  describe('pxToRem', () => {
    it('exports pxToRem function', () => {
      expect(pxToRem).toBeDefined();
      expect(typeof pxToRem).toBe('function');
    });

    it('converts 16px to 1rem', () => {
      expect(pxToRem(16)).toBe('1rem');
    });

    it('converts 32px to 2rem', () => {
      expect(pxToRem(32)).toBe('2rem');
    });

    it('converts 8px to 0.5rem', () => {
      expect(pxToRem(8)).toBe('0.5rem');
    });

    it('handles decimal values', () => {
      expect(pxToRem(24)).toBe('1.5rem');
    });

    it('returns string with rem unit', () => {
      const result = pxToRem(16);
      expect(typeof result).toBe('string');
      expect(result).toContain('rem');
    });
  });

  describe('responsiveFontSizes', () => {
    it('exports responsiveFontSizes function', () => {
      expect(responsiveFontSizes).toBeDefined();
      expect(typeof responsiveFontSizes).toBe('function');
    });

    it('generates responsive font sizes object', () => {
      const result = responsiveFontSizes({ sm: 14, md: 16, lg: 18 });
      expect(result).toHaveProperty(mediaQueries.upSm);
      expect(result).toHaveProperty(mediaQueries.upMd);
      expect(result).toHaveProperty(mediaQueries.upLg);
    });

    it('converts px to rem for each breakpoint', () => {
      const result = responsiveFontSizes({ sm: 16, md: 20, lg: 24 });
      expect(result[mediaQueries.upSm]).toEqual({ fontSize: '1rem' });
      expect(result[mediaQueries.upMd]).toEqual({ fontSize: '1.25rem' });
      expect(result[mediaQueries.upLg]).toEqual({ fontSize: '1.5rem' });
    });
  });

  describe('hexToRgbChannel', () => {
    it('exports hexToRgbChannel function', () => {
      expect(hexToRgbChannel).toBeDefined();
      expect(typeof hexToRgbChannel).toBe('function');
    });

    it('converts hex to RGB channel format', () => {
      const result = hexToRgbChannel('#FF0000');
      expect(result).toBe('255 0 0');
    });

    it('handles lowercase hex', () => {
      const result = hexToRgbChannel('#00ff00');
      expect(result).toBe('0 255 0');
    });

    it('handles mixed case hex', () => {
      const result = hexToRgbChannel('#0000Ff');
      expect(result).toBe('0 0 255');
    });

    it('throws error for invalid hex (no hash)', () => {
      expect(() => hexToRgbChannel('FF0000')).toThrow('Invalid hex color');
    });

    it('throws error for invalid hex (too short)', () => {
      expect(() => hexToRgbChannel('#FFF')).toThrow('Invalid hex color');
    });

    it('throws error for invalid hex (too long)', () => {
      expect(() => hexToRgbChannel('#FF00000')).toThrow('Invalid hex color');
    });

    it('throws error for invalid hex characters', () => {
      expect(() => hexToRgbChannel('#GGGGGG')).toThrow('Invalid hex color');
    });

    it('handles black color', () => {
      const result = hexToRgbChannel('#000000');
      expect(result).toBe('0 0 0');
    });

    it('handles white color', () => {
      const result = hexToRgbChannel('#FFFFFF');
      expect(result).toBe('255 255 255');
    });
  });

  describe('createPaletteChannel', () => {
    it('exports createPaletteChannel function', () => {
      expect(createPaletteChannel).toBeDefined();
      expect(typeof createPaletteChannel).toBe('function');
    });

    it('creates channel variants for hex palette', () => {
      const palette = {
        main: '#FF0000',
        light: '#FF5555',
      };
      const result = createPaletteChannel(palette);
      
      expect(result).toHaveProperty('main', '#FF0000');
      expect(result).toHaveProperty('mainChannel', '255 0 0');
      expect(result).toHaveProperty('light', '#FF5555');
      expect(result).toHaveProperty('lightChannel', '255 85 85');
    });

    it('preserves original palette values', () => {
      const palette = { primary: '#00FF00' };
      const result = createPaletteChannel(palette);
      
      expect(result.primary).toBe('#00FF00');
    });

    it('adds Channel suffix to keys', () => {
      const palette = { dark: '#0000FF' };
      const result = createPaletteChannel(palette);
      
      expect(result).toHaveProperty('darkChannel');
    });

    it('handles empty palette', () => {
      const result = createPaletteChannel({});
      expect(result).toEqual({});
    });
  });

  describe('varAlpha', () => {
    it('exports varAlpha function', () => {
      expect(varAlpha).toBeDefined();
      expect(typeof varAlpha).toBe('function');
    });

    it('creates rgba with RGB channels', () => {
      const result = varAlpha('255 0 0', 0.5);
      expect(result).toBe('rgba(255 0 0 / 0.5)');
    });

    it('uses default opacity of 1', () => {
      const result = varAlpha('0 255 0');
      expect(result).toBe('rgba(0 255 0 / 1)');
    });

    it('handles CSS variables with Channel', () => {
      const result = varAlpha('var(--palette-primary-mainChannel)', 0.8);
      expect(result).toBe('rgba(var(--palette-primary-mainChannel) / 0.8)');
    });

    it('throws error for hex color', () => {
      expect(() => varAlpha('#FF0000')).toThrow('Unsupported color format');
    });

    it('throws error for rgb format', () => {
      expect(() => varAlpha('rgb(255, 0, 0)')).toThrow('Unsupported color format');
    });

    it('throws error for rgba format', () => {
      expect(() => varAlpha('rgba(255, 0, 0, 1)')).toThrow('Unsupported color format');
    });

    it('throws error for Channel without var', () => {
      expect(() => varAlpha('primaryChannel')).toThrow('Unsupported color format');
    });

    it('handles zero opacity', () => {
      const result = varAlpha('100 100 100', 0);
      expect(result).toBe('rgba(100 100 100 / 0)');
    });

    it('handles full opacity', () => {
      const result = varAlpha('50 50 50', 1);
      expect(result).toBe('rgba(50 50 50 / 1)');
    });
  });
});
