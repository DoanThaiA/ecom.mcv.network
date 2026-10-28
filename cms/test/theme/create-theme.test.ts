import { describe, it, expect, vi } from 'vitest';
import { createTheme } from 'src/theme/create-theme';

vi.mock('./core', () => ({
  colorSchemes: { light: {}, dark: {} },
  components: {},
  customShadows: vi.fn(() => ({ z1: 'shadow1' })),
  shadows: vi.fn(() => ['none', 'shadow1']),
  typography: { fontFamily: 'Arial' },
}));

vi.mock('@mui/material/styles', () => ({
  experimental_extendTheme: (config: any) => ({ ...config, isTheme: true }),
}));

describe('createTheme', () => {
  it('returns a theme object', () => {
    const theme = createTheme();
    expect(theme).toBeDefined();
    expect(typeof theme).toBe('object');
  });

  it('includes colorSchemes', () => {
    const theme = createTheme();
    expect(theme).toHaveProperty('colorSchemes');
  });

  it('includes shadows from shadows function', () => {
    const theme = createTheme();
    expect(theme).toHaveProperty('shadows');
  });

  it('includes customShadows from customShadows function', () => {
    const theme = createTheme();
    expect(theme).toHaveProperty('customShadows');
  });

  it('includes shape with borderRadius', () => {
    const theme = createTheme();
    expect(theme).toHaveProperty('shape');
    expect(theme.shape).toEqual({ borderRadius: 8 });
  });

  it('sets borderRadius to 8', () => {
    const theme = createTheme();
    expect(theme.shape.borderRadius).toBe(8);
  });

  it('includes components', () => {
    const theme = createTheme();
    expect(theme).toHaveProperty('components');
  });

  it('includes typography', () => {
    const theme = createTheme();
    expect(theme).toHaveProperty('typography');
  });

  it('sets cssVarPrefix to empty string', () => {
    const theme = createTheme();
    expect(theme).toHaveProperty('cssVarPrefix');
    expect(theme.cssVarPrefix).toBe('');
  });

  it('includes shouldSkipGeneratingVar function', () => {
    const theme = createTheme();
    expect(theme).toHaveProperty('shouldSkipGeneratingVar');
  });

  it('uses shadows from core module', () => {
    const theme = createTheme();
    expect(theme.shadows).toBeDefined();
  });

  it('uses customShadows from core module', () => {
    const theme = createTheme();
    expect(theme.customShadows).toBeDefined();
  });

  it('uses extendTheme from MUI', () => {
    const theme = createTheme();
    expect(theme.isTheme).toBe(true);
  });

  it('exports createTheme function', () => {
    expect(createTheme).toBeDefined();
    expect(typeof createTheme).toBe('function');
  });
});

describe('shouldSkipGeneratingVar', () => {
  it('skips mixins key', () => {
    const theme = createTheme();
    const result = theme.shouldSkipGeneratingVar(['mixins'], 'value');
    expect(result).toBe(true);
  });

  it('skips overlays key', () => {
    const theme = createTheme();
    const result = theme.shouldSkipGeneratingVar(['overlays'], 'value');
    expect(result).toBe(true);
  });

  it('skips direction key', () => {
    const theme = createTheme();
    const result = theme.shouldSkipGeneratingVar(['direction'], 'ltr');
    expect(result).toBe(true);
  });

  it('skips typography key', () => {
    const theme = createTheme();
    const result = theme.shouldSkipGeneratingVar(['typography'], 'value');
    expect(result).toBe(true);
  });

  it('skips breakpoints key', () => {
    const theme = createTheme();
    const result = theme.shouldSkipGeneratingVar(['breakpoints'], 'value');
    expect(result).toBe(true);
  });

  it('skips transitions key', () => {
    const theme = createTheme();
    const result = theme.shouldSkipGeneratingVar(['transitions'], 'value');
    expect(result).toBe(true);
  });

  it('skips cssVarPrefix key', () => {
    const theme = createTheme();
    const result = theme.shouldSkipGeneratingVar(['cssVarPrefix'], '');
    expect(result).toBe(true);
  });

  it('skips unstable_sxConfig key', () => {
    const theme = createTheme();
    const result = theme.shouldSkipGeneratingVar(['unstable_sxConfig'], 'value');
    expect(result).toBe(true);
  });

  it('skips palette tonalOffset', () => {
    const theme = createTheme();
    const result = theme.shouldSkipGeneratingVar(['palette', 'tonalOffset'], 0.2);
    expect(result).toBe(true);
  });

  it('skips palette dividerChannel', () => {
    const theme = createTheme();
    const result = theme.shouldSkipGeneratingVar(['palette', 'dividerChannel'], 'value');
    expect(result).toBe(true);
  });

  it('skips palette contrastThreshold', () => {
    const theme = createTheme();
    const result = theme.shouldSkipGeneratingVar(['palette', 'contrastThreshold'], 3);
    expect(result).toBe(true);
  });

  it('skips grey A100', () => {
    const theme = createTheme();
    const result = theme.shouldSkipGeneratingVar(['palette', 'grey', 'A100'], '#color');
    expect(result).toBe(true);
  });

  it('skips grey A200', () => {
    const theme = createTheme();
    const result = theme.shouldSkipGeneratingVar(['palette', 'grey', 'A200'], '#color');
    expect(result).toBe(true);
  });

  it('skips grey A400', () => {
    const theme = createTheme();
    const result = theme.shouldSkipGeneratingVar(['palette', 'grey', 'A400'], '#color');
    expect(result).toBe(true);
  });

  it('skips grey A700', () => {
    const theme = createTheme();
    const result = theme.shouldSkipGeneratingVar(['palette', 'grey', 'A700'], '#color');
    expect(result).toBe(true);
  });

  it('skips text icon', () => {
    const theme = createTheme();
    const result = theme.shouldSkipGeneratingVar(['palette', 'text', 'icon'], '#color');
    expect(result).toBe(true);
  });

  it('does not skip regular palette keys', () => {
    const theme = createTheme();
    const result = theme.shouldSkipGeneratingVar(['palette', 'primary', 'main'], '#color');
    expect(result).toBe(false);
  });

  it('does not skip non-global keys', () => {
    const theme = createTheme();
    const result = theme.shouldSkipGeneratingVar(['customKey'], 'value');
    expect(result).toBe(false);
  });

  it('handles palette keys correctly', () => {
    const theme = createTheme();
    const isPaletteSkipped = theme.shouldSkipGeneratingVar(['palette', 'tonalOffset'], 0.2);
    expect(isPaletteSkipped).toBe(true);
  });

  it('identifies palette keys', () => {
    const theme = createTheme();
    const result = theme.shouldSkipGeneratingVar(['palette', 'custom'], 'value');
    expect(result).toBe(false);
  });
});
