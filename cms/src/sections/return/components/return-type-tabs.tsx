import { Box, Tab, Tabs } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { ReturnType } from 'src/types/returns';

interface ReturnTypeTabsProps {
  activeType: ReturnType | 'all';
  onChange: (type: ReturnType | 'all') => void;
}

export function ReturnTypeTabs({ activeType, onChange }: ReturnTypeTabsProps) {
  const { t } = useTranslation();

  return (
    <Box sx={{ px: 2, pb: 1 }}>
      <Tabs
        value={activeType}
        onChange={(_, newValue) => onChange(newValue)}
        sx={{
          minHeight: 36,
          '& .MuiTab-root': {
            minWidth: 'auto',
            minHeight: 36,
            px: 2,
            py: 0.5,
            fontSize: 14,
            fontWeight: 500,
            textTransform: 'none',
            color: '#637381',
            '&.Mui-selected': {
              color: '#1C252E',
            },
          },
          '& .MuiTabs-indicator': {
            display: 'none',
          },
        }}
      >
        <Tab value="refund" label={t('returnTypeRefund')} />
        <Tab value="exchange" label={t('returnTypeExchange')} />
      </Tabs>
    </Box>
  );
}
