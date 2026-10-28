import type { ReactNode } from 'react';
import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

export type SimpleLayoutProps = {
  children: ReactNode;
  content?: {
    compact?: boolean;
  };
};

export function SimpleLayout({ children, content }: SimpleLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        ...(content?.compact && {
          maxWidth: 'sm',
          mx: 'auto',
          py: 5,
        }),
      }}
    >
      {children}
    </Box>
  );
}
