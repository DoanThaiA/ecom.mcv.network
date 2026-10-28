import { Tab, Tabs } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from 'src/redux/store/store';
import { selectNhanhUnsyncedOrderCount } from 'src/redux/store/nhanhSlice';
import type { OrderTab, OrderTabCounts } from 'src/types/orders';

interface OrderTabsProps {
  activeTab: OrderTab;
  tabCounts: OrderTabCounts;
  onChange: (tab: OrderTab) => void;
}

const TAB_CONFIG: { value: OrderTab; labelKey: string }[] = [
  { value: 'all', labelKey: 'all' },
  { value: 'pending', labelKey: 'orderStatusPending' },
  { value: 'confirmed', labelKey: 'orderStatusConfirmed' },
  { value: 'processing', labelKey: 'orderStatusProcessing' },
  { value: 'shipped', labelKey: 'orderStatusShipped' },
  { value: 'delivered', labelKey: 'orderStatusDelivered' },
  { value: 'cancelled', labelKey: 'orderStatusCancelled' },
  { value: 'nhanhUnsynced', labelKey: 'nhanhUnsyncedTab' },
];

export function OrderTabs({ activeTab, tabCounts, onChange }: OrderTabsProps) {
  const { t } = useTranslation();
  const nhanhUnsyncedCount = useAppSelector(selectNhanhUnsyncedOrderCount);

  const handleChange = (_event: React.SyntheticEvent, newValue: OrderTab) => {
    onChange(newValue);
  };

  const getTabLabel = (labelKey: string, tabValue: OrderTab) => {
    if (tabValue === 'nhanhUnsynced') {
      return nhanhUnsyncedCount > 0 ? `${t(labelKey)} (${nhanhUnsyncedCount})` : t(labelKey);
    }
    const count = tabCounts[tabValue as keyof OrderTabCounts];
    if (tabValue === 'all' || !count) {
      return t(labelKey);
    }
    return `${t(labelKey)} (${count})`;
  };

  return (
    <Tabs
      value={activeTab}
      onChange={handleChange}
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        '& .MuiTab-root': {
          textTransform: 'none',
          minWidth: 'auto',
          px: 2,
          fontSize: 14,
          fontWeight: 500,
          color: '#637381',
          '&.Mui-selected': {
            color: '#235AFF',
          },
        },
        '& .MuiTabs-indicator': {
          backgroundColor: '#235AFF',
        },
      }}
    >
      {TAB_CONFIG.map((tab) => {
        const isNhanhTab = tab.value === 'nhanhUnsynced';
        const isActive = activeTab === tab.value;
        const hasUnsynced = isNhanhTab && nhanhUnsyncedCount > 0;
        return (
          <Tab
            key={tab.value}
            value={tab.value}
            label={getTabLabel(tab.labelKey, tab.value)}
            sx={
              hasUnsynced && !isActive
                ? {
                    color: '#F62E2E !important',
                    fontWeight: 600,
                  }
                : undefined
            }
          />
        );
      })}
    </Tabs>
  );
}
