import type { Theme } from '@mui/material/styles';

import { varAlpha } from 'src/theme/styles';

// ----------------------------------------------------------------------

export const baseVars = (theme: Theme) => ({
  // nav
  '--layout-nav-bg':
    theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.common.white,
  '--layout-nav-border-color': varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
  '--layout-nav-zIndex': 1101,
  '--layout-nav-mobile-width': '320px',
  '--layout-nav-mini-width': '88px',
  '--layout-nav-item-padding-x': '12px',
  '--layout-nav-item-icon-size': '24px',
  '--layout-nav-children-line-color': theme.palette.mode === 'dark' ? '#282F37' : '#EDEFF2',
  // nav item
  '--layout-nav-item-height': '44px',
  '--layout-nav-item-color': theme.vars.palette.text.secondary,
  '--layout-nav-item-active-color': theme.vars.palette.primary.main,
  '--layout-nav-item-active-bg': varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
  '--layout-nav-item-active-bg1': theme.vars.palette.action.hover,
  '--layout-nav-item-hover-bg': varAlpha(theme.vars.palette.primary.mainChannel, 0.16),
  // header
  '--layout-header-blur': '8px',
  '--layout-header-zIndex': 1100,
  '--layout-header-mobile-height': '50px',
  '--layout-header-desktop-height': '55px',
  '--layout-transition-duration': '120ms',
  '--layout-transition-easing': 'linear',
  // sub item nav
});
