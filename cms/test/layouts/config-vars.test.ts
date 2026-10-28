import { describe, it, expect, vi } from 'vitest';
import type { Theme } from '@mui/material/styles';
import { baseVars } from 'src/layouts/config-vars';

const mockTheme: Theme = {
  palette: {
    mode: 'light',
    common: {
      white: '#ffffff',
      black: '#000000',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    grey: {
      500: '#9e9e9e',
    },
    text: {
      primary: '#000000',
      secondary: '#757575',
    },
    primary: {
      main: '#1976d2',
    },
    action: {
      hover: 'rgba(0, 0, 0, 0.04)',
    },
  },
  vars: {
    palette: {
      grey: {
        '500Channel': '158 158 158',
      },
      text: {
        secondary: '#757575',
      },
      primary: {
        main: '#1976d2',
        mainChannel: '25 118 210',
      },
      action: {
        hover: 'rgba(0, 0, 0, 0.04)',
      },
    },
  },
} as any;

vi.mock('src/theme/styles', () => ({
  varAlpha: (channel: string, opacity: number) => `rgba(${channel}, ${opacity})`,
}));

describe('baseVars', () => {
  it('returns an object', () => {
    const vars = baseVars(mockTheme);
    expect(vars).toBeDefined();
    expect(typeof vars).toBe('object');
  });

  it('sets nav background color', () => {
    const vars = baseVars(mockTheme);
    expect(vars).toHaveProperty('--layout-nav-bg');
  });

  it('uses white background in light mode', () => {
    const vars = baseVars(mockTheme);
    expect(vars['--layout-nav-bg']).toBe('#ffffff');
  });

  it('uses default background in dark mode', () => {
    const darkTheme = { ...mockTheme, palette: { ...mockTheme.palette, mode: 'dark' } };
    const vars = baseVars(darkTheme);
    expect(vars['--layout-nav-bg']).toBe('#f5f5f5');
  });

  it('sets nav border color', () => {
    const vars = baseVars(mockTheme);
    expect(vars).toHaveProperty('--layout-nav-border-color');
  });

  it('sets nav zIndex', () => {
    const vars = baseVars(mockTheme);
    expect(vars['--layout-nav-zIndex']).toBe(1101);
  });

  it('sets nav mobile width', () => {
    const vars = baseVars(mockTheme);
    expect(vars['--layout-nav-mobile-width']).toBe('320px');
  });

  it('sets nav mini width', () => {
    const vars = baseVars(mockTheme);
    expect(vars['--layout-nav-mini-width']).toBe('88px');
  });

  it('sets nav item padding-x', () => {
    const vars = baseVars(mockTheme);
    expect(vars['--layout-nav-item-padding-x']).toBe('12px');
  });

  it('sets nav item icon size', () => {
    const vars = baseVars(mockTheme);
    expect(vars['--layout-nav-item-icon-size']).toBe('24px');
  });

  it('sets nav children line color for light mode', () => {
    const vars = baseVars(mockTheme);
    expect(vars['--layout-nav-children-line-color']).toBe('#EDEFF2');
  });

  it('sets nav children line color for dark mode', () => {
    const darkTheme = { ...mockTheme, palette: { ...mockTheme.palette, mode: 'dark' } };
    const vars = baseVars(darkTheme);
    expect(vars['--layout-nav-children-line-color']).toBe('#282F37');
  });

  it('sets nav item height', () => {
    const vars = baseVars(mockTheme);
    expect(vars['--layout-nav-item-height']).toBe('44px');
  });

  it('sets nav item color', () => {
    const vars = baseVars(mockTheme);
    expect(vars['--layout-nav-item-color']).toBe('#757575');
  });

  it('sets nav item active color', () => {
    const vars = baseVars(mockTheme);
    expect(vars['--layout-nav-item-active-color']).toBe('#1976d2');
  });

  it('sets nav item active bg with alpha', () => {
    const vars = baseVars(mockTheme);
    expect(vars['--layout-nav-item-active-bg']).toContain('rgba');
  });

  it('sets nav item active bg1', () => {
    const vars = baseVars(mockTheme);
    expect(vars['--layout-nav-item-active-bg1']).toBe('rgba(0, 0, 0, 0.04)');
  });

  it('sets nav item hover bg with alpha', () => {
    const vars = baseVars(mockTheme);
    expect(vars['--layout-nav-item-hover-bg']).toContain('rgba');
  });

  it('sets header blur', () => {
    const vars = baseVars(mockTheme);
    expect(vars['--layout-header-blur']).toBe('8px');
  });

  it('sets header zIndex', () => {
    const vars = baseVars(mockTheme);
    expect(vars['--layout-header-zIndex']).toBe(1100);
  });

  it('sets header mobile height', () => {
    const vars = baseVars(mockTheme);
    expect(vars['--layout-header-mobile-height']).toBe('50px');
  });

  it('sets header desktop height', () => {
    const vars = baseVars(mockTheme);
    expect(vars['--layout-header-desktop-height']).toBe('55px');
  });

  it('sets transition duration', () => {
    const vars = baseVars(mockTheme);
    expect(vars['--layout-transition-duration']).toBe('120ms');
  });

  it('sets transition easing', () => {
    const vars = baseVars(mockTheme);
    expect(vars['--layout-transition-easing']).toBe('linear');
  });

  it('exports baseVars function', () => {
    expect(baseVars).toBeDefined();
    expect(typeof baseVars).toBe('function');
  });

  it('accepts Theme parameter', () => {
    expect(() => baseVars(mockTheme)).not.toThrow();
  });

  it('returns all CSS custom properties', () => {
    const vars = baseVars(mockTheme);
    const keys = Object.keys(vars);
    expect(keys.length).toBeGreaterThan(0);
  });

  it('uses varAlpha for alpha colors', () => {
    const vars = baseVars(mockTheme);
    expect(vars['--layout-nav-border-color']).toContain('rgba');
  });

  it('uses theme palette colors', () => {
    const vars = baseVars(mockTheme);
    expect(vars['--layout-nav-item-color']).toBe(mockTheme.vars.palette.text.secondary);
  });

  it('uses theme vars for primary color', () => {
    const vars = baseVars(mockTheme);
    expect(vars['--layout-nav-item-active-color']).toBe(mockTheme.vars.palette.primary.main);
  });
});
