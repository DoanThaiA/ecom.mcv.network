import { Tab, Tabs } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { FlashSaleStatus } from 'src/types/gen/shared/shared/common/enums';

// ----------------------------------------------------------------------

interface FlashSaleTabsProps {
  activeTab: FlashSaleStatus | 'all';
  onChange: (tab: FlashSaleStatus | 'all') => void;
}

const TAB_CONFIG: { value: FlashSaleStatus | 'all'; labelKey: string }[] = [
  { value: 'all', labelKey: 'all' },
  { value: FlashSaleStatus.FLASH_SALE_STATUS_ACTIVE, labelKey: 'active' },
  { value: FlashSaleStatus.FLASH_SALE_STATUS_UPCOMING, labelKey: 'upcoming' },
  { value: FlashSaleStatus.FLASH_SALE_STATUS_ENDED, labelKey: 'ended' },
  { value: FlashSaleStatus.FLASH_SALE_STATUS_DISABLED, labelKey: 'disabled' },
];

export function FlashSaleTabs({ activeTab, onChange }: FlashSaleTabsProps) {
  const { t } = useTranslation();

  const handleChange = (_event: React.SyntheticEvent, newValue: FlashSaleStatus | 'all') => {
    onChange(newValue);
  };

  return (
    <Tabs
      value={activeTab}
      onChange={handleChange}
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        mb: 2,
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
      {TAB_CONFIG.map((tab) => (
        <Tab key={String(tab.value)} value={tab.value} label={t(tab.labelKey)} />
      ))}
    </Tabs>
  );
}
