import { useTranslation } from 'react-i18next';

import { Box, Button } from '@mui/material';

import type { FilterActionsProps } from './types';

export function FilterActions({ onClear, onApply, loading = false }: FilterActionsProps) {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
      <Button variant="outlined" onClick={onClear} fullWidth disabled={loading}>
        {t('clearFilter')}
      </Button>
      <Button variant="contained" onClick={onApply} fullWidth disabled={loading}>
        {t('applyFilter')}
      </Button>
    </Box>
  );
}
