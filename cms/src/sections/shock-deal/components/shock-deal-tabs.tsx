import { Tab, Tabs } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { PromotionStatus } from 'src/types/promotion';

// ----------------------------------------------------------------------

interface ShockDealTabsProps {
  activeTab: PromotionStatus | 'all';
  onChange: (tab: PromotionStatus | 'all') => void;
}

const TAB_CONFIG: { value: PromotionStatus | 'all'; labelKey: string }[] = [
  { value: 'all', labelKey: 'all' },
  { value: PromotionStatus.PROMOTION_STATUS_ACTIVE, labelKey: 'ongoing' },
  { value: PromotionStatus.PROMOTION_STATUS_PAUSED, labelKey: 'paused' },
  { value: PromotionStatus.PROMOTION_STATUS_UPCOMING, labelKey: 'upcoming' },
  { value: PromotionStatus.PROMOTION_STATUS_ENDED, labelKey: 'ended' },
];

export function ShockDealTabs({ activeTab, onChange }: ShockDealTabsProps) {
  const { t } = useTranslation();

  const handleChange = (_event: React.SyntheticEvent, newValue: PromotionStatus | 'all') => {
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
