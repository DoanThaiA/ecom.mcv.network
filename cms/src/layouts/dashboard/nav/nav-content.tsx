import type { SxProps, Theme } from '@mui/material/styles';

import Box from '@mui/material/Box';

import { Logo } from 'src/components/logo';
import { Scrollbar } from 'src/components/scrollbar';

import type { NavItem } from '../../config-nav-dashboard';
import { NAV_COLORS } from './nav-colors';
import { NavContentItem } from './nav-content-item';

// Temporary stub for WorkspacesPopoverProps
export interface WorkspacesPopoverProps {
  data?: any[];
  sx?: any;
}

export type NavContentProps = {
  data: NavItem[];
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
  workspaces: WorkspacesPopoverProps['data'];
  sx?: SxProps<Theme>;
};

export function NavContent({
  data,
  slots,
  sx,
  isMiniWidth = false,
}: NavContentProps & { isMiniWidth?: boolean }) {
  return (
    <>
      {/* Logo Section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMiniWidth ? 'center' : 'flex-start',
          px: isMiniWidth ? 1.5 : 2.5,
          py: 2.5,
          borderBottom: `1px solid ${NAV_COLORS.border}`,
        }}
      >
        <Logo width={isMiniWidth ? 40 : 150} height={isMiniWidth ? 40 : 40} />
      </Box>

      {slots?.topArea}

      {/* Menu Items Scrollable Area */}
      <Scrollbar
        sx={{
          '& .simplebar-content': {
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box component="nav" display="flex" flex="1 1 auto" flexDirection="column" sx={sx}>
          <Box component="ul" display="flex" flexDirection="column">
            {data.map((item) => (
              <NavContentItem key={item.title} item={item} isMiniWidth={isMiniWidth} />
            ))}
          </Box>
        </Box>
      </Scrollbar>

      {slots?.bottomArea}
    </>
  );
}
