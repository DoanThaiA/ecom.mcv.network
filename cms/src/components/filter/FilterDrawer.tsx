import { useTranslation } from 'react-i18next';

import CloseIcon from '@mui/icons-material/Close';
import { Box, Drawer, IconButton, Typography } from '@mui/material';

import { FilterActions } from './FilterActions';
import type { FilterDrawerProps } from './types';

export function FilterDrawer({
  open,
  onClose,
  title = 'filterTitle',
  width = 350,
  children,
  onApply,
  onClear,
  loading = false,
}: FilterDrawerProps) {
  const { t } = useTranslation();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          {t(title)}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Body - Scrollable */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
        }}
      >
        {children}
      </Box>

      {/* Footer - Fixed */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <FilterActions onClear={onClear} onApply={onApply} loading={loading} />
      </Box>
    </Drawer>
  );
}
