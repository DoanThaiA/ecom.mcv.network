import { Box, Tab, Tabs } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { ReturnTab, ReturnTabCounts } from 'src/types/returns';

interface ReturnTabsProps {
  activeTab: ReturnTab;
  tabCounts: ReturnTabCounts;
  onChange: (tab: ReturnTab) => void;
}

const TAB_CONFIG: { value: ReturnTab; labelKey: string }[] = [
  { value: 'all', labelKey: 'all' },
  { value: 'pending', labelKey: 'returnStatusPending' },
  { value: 'confirmed', labelKey: 'returnStatusConfirmed' },
  { value: 'refunded', labelKey: 'returnStatusRefunded' },
  { value: 'rejected', labelKey: 'returnStatusRejected' },
];

export function ReturnTabs({ activeTab, tabCounts, onChange }: ReturnTabsProps) {
  const { t } = useTranslation();

  const getTabLabel = (tab: ReturnTab, labelKey: string) => {
    const count = tabCounts[tab] || 0;
    return `${t(labelKey)} (${count})`;
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => onChange(newValue as ReturnTab)}
        sx={{
          px: 2,
          '& .MuiTab-root': {
            minWidth: 'auto',
            px: 2,
            py: 1.5,
            fontSize: 14,
            fontWeight: 500,
            textTransform: 'none',
            color: '#637381',
            '&.Mui-selected': {
              color: '#1C252E',
            },
          },
          '& .MuiTabs-indicator': {
            height: 2,
            bgcolor: '#1C252E',
          },
        }}
      >
        {TAB_CONFIG.map(({ value, labelKey }) => (
          <Tab key={value} value={value} label={getTabLabel(value, labelKey)} />
        ))}
      </Tabs>
    </Box>
  );
}
