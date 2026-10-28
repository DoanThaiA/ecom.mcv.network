import { describe, it, expect } from 'vitest';
import {
  grey,
  primary,
  secondary,
  info,
  success,
  warning,
  error,
  common,
  whiteText,
  text,
  background,
  baseAction,
  action,
  basePalette,
  lightPalette,
  darkPalette,
  colorSchemes,
} from 'src/theme/core/palette';

describe('palette', () => {
  describe('Color exports', () => {
    it('should export grey palette', () => {
      expect(grey).toBeDefined();
      expect(typeof grey).toBe('object');
    });

    it('should export primary palette', () => {
      expect(primary).toBeDefined();
      expect(typeof primary).toBe('object');
    });

    it('should export secondary palette', () => {
      expect(secondary).toBeDefined();
      expect(typeof secondary).toBe('object');
    });

    it('should export info palette', () => {
      expect(info).toBeDefined();
      expect(typeof info).toBe('object');
    });

    it('should export success palette', () => {
      expect(success).toBeDefined();
      expect(typeof success).toBe('object');
    });

    it('should export warning palette', () => {
      expect(warning).toBeDefined();
      expect(typeof warning).toBe('object');
    });

    it('should export error palette', () => {
      expect(error).toBeDefined();
      expect(typeof error).toBe('object');
    });

    it('should export common palette', () => {
      expect(common).toBeDefined();
      expect(typeof common).toBe('object');
    });

    it('should export whiteText palette', () => {
      expect(whiteText).toBeDefined();
      expect(typeof whiteText).toBe('object');
    });
  });

  describe('text', () => {
    it('should export text object with light and dark modes', () => {
      expect(text).toBeDefined();
      expect(text.light).toBeDefined();
      expect(text.dark).toBeDefined();
    });

    it('should have primary, secondary, and disabled in light mode', () => {
      expect(text.light.primary).toBeDefined();
      expect(text.light.secondary).toBeDefined();
      expect(text.light.disabled).toBeDefined();
    });

    it('should have primary, secondary, and disabled in dark mode', () => {
      expect(text.dark.primary).toBeDefined();
      expect(text.dark.secondary).toBeDefined();
      expect(text.dark.disabled).toBeDefined();
    });
  });

  describe('background', () => {
    it('should export background object with light and dark modes', () => {
      expect(background).toBeDefined();
      expect(background.light).toBeDefined();
      expect(background.dark).toBeDefined();
    });

    it('should have paper, default, and neutral in light mode', () => {
      expect(background.light.paper).toBe('#FFFFFF');
      expect(background.light.default).toBeDefined();
      expect(background.light.neutral).toBeDefined();
    });

    it('should have paper, default, and neutral in dark mode', () => {
      expect(background.dark.paper).toBe('#1C252E');
      expect(background.dark.default).toBe('#141A21');
      expect(background.dark.neutral).toBe('#141A21');
    });
  });

  describe('action', () => {
    it('should export baseAction object', () => {
      expect(baseAction).toBeDefined();
      expect(baseAction.hover).toBeDefined();
      expect(baseAction.selected).toBeDefined();
      expect(baseAction.focus).toBeDefined();
      expect(baseAction.disabled).toBeDefined();
      expect(baseAction.disabledBackground).toBeDefined();
    });

    it('should have hover opacity as number', () => {
      expect(baseAction.hoverOpacity).toBe(0.08);
    });

    it('should have disabled opacity as number', () => {
      expect(baseAction.disabledOpacity).toBe(0.48);
    });

    it('should export action object with light mode', () => {
      expect(action).toBeDefined();
      expect(action.light).toBeDefined();
      expect(action.light.active).toBeDefined();
    });

    it('should include baseAction properties in light mode', () => {
      expect(action.light.hover).toBeDefined();
      expect(action.light.selected).toBeDefined();
      expect(action.light.focus).toBeDefined();
    });
  });

  describe('basePalette', () => {
    it('should export basePalette with all color palettes', () => {
      expect(basePalette).toBeDefined();
      expect(basePalette.primary).toBeDefined();
      expect(basePalette.secondary).toBeDefined();
      expect(basePalette.info).toBeDefined();
      expect(basePalette.success).toBeDefined();
      expect(basePalette.warning).toBeDefined();
      expect(basePalette.error).toBeDefined();
      expect(basePalette.grey).toBeDefined();
      expect(basePalette.common).toBeDefined();
    });

    it('should have divider property', () => {
      expect(basePalette.divider).toBeDefined();
      expect(typeof basePalette.divider).toBe('string');
    });

    it('should have action property', () => {
      expect(basePalette.action).toBeDefined();
    });
  });

  describe('lightPalette', () => {
    it('should extend basePalette', () => {
      expect(lightPalette.primary).toBeDefined();
      expect(lightPalette.secondary).toBeDefined();
      expect(lightPalette.info).toBeDefined();
      expect(lightPalette.success).toBeDefined();
      expect(lightPalette.warning).toBeDefined();
      expect(lightPalette.error).toBeDefined();
    });

    it('should have custom primary color for auth button', () => {
      expect(lightPalette.primary.main).toBe('#0165FC');
    });

    it('should have custom info color for links', () => {
      expect(lightPalette.info.main).toBe('#235AFF');
    });

    it('should have custom success color for selling status', () => {
      expect(lightPalette.success.main).toBe('#178B30');
    });

    it('should have custom warning color for stopped status', () => {
      expect(lightPalette.warning.main).toBe('#FF9500');
    });

    it('should have text property', () => {
      expect(lightPalette.text).toBeDefined();
    });

    it('should have background with custom colors', () => {
      expect(lightPalette.background.paper).toBe('#FFFFFF');
      expect(lightPalette.background.default).toBe('#F8F9FB');
      expect(lightPalette.background.neutral).toBe('#F7F8FA');
    });

    it('should have action property', () => {
      expect(lightPalette.action).toBeDefined();
    });

    it('should have custom divider color', () => {
      expect(lightPalette.divider).toBe('#E5E6EB');
    });

    it('should have border with main and light colors', () => {
      expect(lightPalette.border).toBeDefined();
      expect(lightPalette.border.main).toBe('#A9ACB1');
      expect(lightPalette.border.light).toBe('#E5E6EB');
    });
  });

  describe('darkPalette', () => {
    it('should extend basePalette', () => {
      expect(darkPalette.primary).toBeDefined();
      expect(darkPalette.secondary).toBeDefined();
      expect(darkPalette.info).toBeDefined();
      expect(darkPalette.success).toBeDefined();
      expect(darkPalette.warning).toBeDefined();
      expect(darkPalette.error).toBeDefined();
    });

    it('should have text property', () => {
      expect(darkPalette.text).toBeDefined();
    });

    it('should have background property', () => {
      expect(darkPalette.background).toBeDefined();
    });

    it('should have action property', () => {
      expect(darkPalette.action).toBeDefined();
    });
  });

  describe('colorSchemes', () => {
    it('should export colorSchemes with light and dark', () => {
      expect(colorSchemes).toBeDefined();
      expect(colorSchemes.light).toBeDefined();
      expect(colorSchemes.dark).toBeDefined();
    });

    it('should have palette in light scheme', () => {
      expect(colorSchemes.light?.palette).toBeDefined();
      expect(colorSchemes.light?.palette).toBe(lightPalette);
    });

    it('should have palette in dark scheme', () => {
      expect(colorSchemes.dark?.palette).toBeDefined();
      expect(colorSchemes.dark?.palette).toBe(darkPalette);
    });
  });
});
