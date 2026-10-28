// 🎨 FONT CONFIGURATION
// Fonts are now loaded via next/font for better performance.
// See lib/config/fonts.ts for the actual font definitions.

// Re-export from new location for backward compatibility
export {
  googleSansFlex,
  inter,
  fontVariables,
  primaryFontClassName,
} from '@/lib/config/fonts';

// Legacy exports for backward compatibility
export const primaryFont = {
  variable: '--font-google-sans-flex',
  className: '',
};

export const monoFont = {
  variable: '--font-mono',
  family: 'source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace',
};

// Fallback fonts for better compatibility
export const fallbackFonts =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';
