import type { Breakpoint } from '@mui/material/styles';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import KeyboardTabIcon from '@mui/icons-material/KeyboardTab';
import { IconButton, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import versionJson from '../../../../version.json';

import { NAV_COLORS } from './nav-colors';
import { NavContent, type NavContentProps } from './nav-content';

export function NavDesktop({
  sx,
  data,
  slots,
  workspaces,
  layoutQuery,
  widthNavDesktop,
  onClickExpand,
}: NavContentProps & {
  layoutQuery: Breakpoint;
  widthNavDesktop: string;
  onClickExpand: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();

  const isMiniWidth = useCallback(
    () => widthNavDesktop === 'var(--layout-nav-mini-width)',
    [widthNavDesktop]
  );

  return (
    <Box
      sx={{
        pt: 0,
        px: 0,
        top: 0,
        left: 0,
        height: 1,
        display: 'none',
        position: 'fixed',
        flexDirection: 'column',
        bgcolor: NAV_COLORS.bg,
        zIndex: 'var(--layout-nav-zIndex)',
        width: widthNavDesktop,
        borderRight: `1px solid ${NAV_COLORS.border}`,
        transition: 'width var(--layout-transition-duration) var(--layout-transition-easing) 0ms',
        [theme.breakpoints.up(layoutQuery)]: {
          display: 'flex',
        },
        ...sx,
      }}
    >
      <NavContent data={data} slots={slots} workspaces={workspaces} isMiniWidth={isMiniWidth()} />

      {/* Version text - only show in expanded mode */}
      {!isMiniWidth() && (
        <Typography
          sx={{
            px: 3,
            py: 1,
            fontSize: 11,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.35)',
            textAlign: 'center',
            letterSpacing: '0.5px',
          }}
        >
          v{versionJson.version}
        </Typography>
      )}

      {/* Compact toggle button */}
      <Box sx={{ px: 2, pb: 2, pt: 1 }}>
        <IconButton
          onClick={onClickExpand}
          sx={{
            width: '100%',
            borderRadius: '8px',
            py: 1,
            color: NAV_COLORS.text,
            bgcolor: 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${NAV_COLORS.border}`,
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              color: NAV_COLORS.textActive,
            },
            transition: 'all 0.2s ease',
          }}
        >
          {isMiniWidth() ? (
            <KeyboardTabIcon fontSize="small" />
          ) : (
            <Stack direction="row" alignItems="center" spacing={1}>
              <KeyboardTabIcon fontSize="small" sx={{ transform: 'rotate(180deg)' }} />
              <Typography variant="body2" sx={{ fontSize: 12, fontWeight: 500 }}>
                {t('compact')}
              </Typography>
            </Stack>
          )}
        </IconButton>
      </Box>
    </Box>
  );
}
