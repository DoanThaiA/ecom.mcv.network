import localFont from 'next/font/local';
import { Inter } from 'next/font/google';

/**
 * Google Sans Flex font loaded via next/font/local from @fontsource package.
 * This eliminates render-blocking CSS @imports and enables automatic font optimization.
 */
export const googleSansFlex = localFont({
  src: [
    {
      path: '../../node_modules/@fontsource/google-sans-flex/files/google-sans-flex-latin-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../node_modules/@fontsource/google-sans-flex/files/google-sans-flex-vietnamese-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-google-sans-flex',
  preload: true,
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'sans-serif',
  ],
});

/**
 * Inter font loaded via next/font/google.
 * Used as fallback on Windows for better font hinting.
 */
export const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'sans-serif',
  ],
});

/**
 * Combined font className for use in layout.
 * Includes both Google Sans Flex and Inter CSS variables.
 */
export const fontVariables = `${googleSansFlex.variable} ${inter.variable}`;

/**
 * Primary font className for body text.
 * Uses Google Sans Flex with fallbacks.
 */
export const primaryFontClassName = googleSansFlex.className;
