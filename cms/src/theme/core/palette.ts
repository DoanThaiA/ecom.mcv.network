import type { ColorSystemOptions } from '@mui/material/styles';

import COLORS from './colors.json';
import { varAlpha, createPaletteChannel } from '../styles';

// ----------------------------------------------------------------------

declare module '@mui/material/styles/createPalette' {
  interface CommonColors {
    whiteChannel: string;
    blackChannel: string;
  }
  interface TypeText {
    disabledChannel: string;
  }
  interface TypeBackground {
    neutral: string;
    neutralChannel: string;
  }
  interface SimplePaletteColorOptions {
    lighter: string;
    darker: string;
    lighterChannel: string;
    darkerChannel: string;
  }
  interface PaletteColor {
    lighter: string;
    darker: string;
    lighterChannel: string;
    darkerChannel: string;
  }
  interface Palette {
    border: {
      main: string;
      light: string;
    };
  }
  interface PaletteOptions {
    border?: {
      main: string;
      light: string;
    };
  }
}

declare module '@mui/material/styles' {
  interface ThemeVars {
    transitions: Theme['transitions'];
  }
}

declare module '@mui/material' {
  interface Color {
    ['50Channel']: string;
    ['100Channel']: string;
    ['200Channel']: string;
    ['300Channel']: string;
    ['400Channel']: string;
    ['500Channel']: string;
    ['600Channel']: string;
    ['700Channel']: string;
    ['800Channel']: string;
    ['900Channel']: string;
  }
}

export type ColorType = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

// ----------------------------------------------------------------------

// Grey
export const grey = createPaletteChannel(COLORS.grey);

// Primary
export const primary = createPaletteChannel(COLORS.primary);

// Secondary
export const secondary = createPaletteChannel(COLORS.secondary);

// Info
export const info = createPaletteChannel(COLORS.info);

// Success
export const success = createPaletteChannel(COLORS.success);

// Warning
export const warning = createPaletteChannel(COLORS.warning);

// Error
export const error = createPaletteChannel(COLORS.error);

// Common
export const common = createPaletteChannel(COLORS.common);

export const whiteText = createPaletteChannel(COLORS.whiteText);

// Text
export const text = {
  light: createPaletteChannel({
    primary: grey[800],
    secondary: grey[600],
    disabled: grey[500],
  }),
  dark: createPaletteChannel({
    primary: whiteText.primary,
    secondary: whiteText.secondary,
    disabled: whiteText.disabled,
  }),
};

// Background
export const background = {
  light: createPaletteChannel({
    paper: '#FFFFFF',
    default: grey[100],
    neutral: grey[200],
  }),
  dark: createPaletteChannel({
    paper: '#1C252E',
    default: '#141A21',
    neutral: '#141A21',
  }),
};

// Action
export const baseAction = {
  hover: varAlpha(grey['500Channel'], 0.08),
  selected: varAlpha(grey['500Channel'], 0.16),
  focus: varAlpha(grey['500Channel'], 0.24),
  disabled: varAlpha(grey['500Channel'], 0.8),
  disabledBackground: varAlpha(grey['500Channel'], 0.24),
  hoverOpacity: 0.08,
  disabledOpacity: 0.48,
};

export const action = {
  light: { ...baseAction, active: grey[600] },
};

/*
 * Base palette
 */
export const basePalette = {
  primary,
  secondary,
  info,
  success,
  warning,
  error,
  grey,
  common,
  divider: varAlpha(grey['500Channel'], 0.2),
  action,
};

export const lightPalette = {
  ...basePalette,
  primary: createPaletteChannel({
    lighter: '#D0ECFE',
    light: '#73BAFB',
    main: '#0165FC', // Updated for auth form button & primary actions
    dark: '#0052CC',
    darker: '#042174',
    contrastText: '#FFFFFF',
  }),
  info: createPaletteChannel({
    lighter: '#CAFDF5',
    light: '#61F3F3',
    main: '#235AFF', // Updated for links (forgot password) & product names
    dark: '#006C9C',
    darker: '#003768',
    contrastText: '#FFFFFF',
  }),
  success: createPaletteChannel({
    lighter: '#D8F5DD',
    light: '#86E89A',
    main: '#178B30', // For 'selling' status
    dark: '#0F6322',
    darker: '#0A4419',
    contrastText: '#FFFFFF',
  }),
  warning: createPaletteChannel({
    lighter: '#FFF4E5',
    light: '#FFD699',
    main: '#FF9500', // For 'stopped' status
    dark: '#CC7700',
    darker: '#995A00',
    contrastText: '#FFFFFF',
  }),
  text: text.light,
  background: {
    ...background.light,
    paper: '#FFFFFF',
    default: '#F8F9FB', // Updated page background
    neutral: '#F7F8FA', // For table headers and rows
  },
  action: action.light,
  divider: '#E5E6EB', // Updated for table borders
  border: {
    main: '#A9ACB1', // For input fields and select borders
    light: '#E5E6EB', // For table cell borders
  },
};

export const darkPalette = {
  ...basePalette,
  text: text.dark,
  background: background.dark,
  action: action.light,
};

// ----------------------------------------------------------------------

export const colorSchemes: Partial<Record<'light' | 'dark', ColorSystemOptions>> = {
  light: { palette: lightPalette },
  dark: { palette: darkPalette },
};
