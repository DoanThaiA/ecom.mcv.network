import { Box, Tab, Tabs } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ShippingPromotionStatus } from 'src/types/gen/shared/shared/common/enums';

// ----------------------------------------------------------------------

interface ShippingPromotionTabsProps {
  activeTab: ShippingPromotionStatus | 'all';
  onChange: (newStatus: ShippingPromotionStatus | 'all') => void;
}

export function ShippingPromotionTabs({ activeTab, onChange }: ShippingPromotionTabsProps) {
  const { t } = useTranslation();

  const tabs = [
    { value: 'all', label: t('all') },
    { value: ShippingPromotionStatus.SHIPPING_PROMOTION_STATUS_ACTIVE, label: t('active') },
    { value: ShippingPromotionStatus.SHIPPING_PROMOTION_STATUS_UPCOMING, label: t('upcoming') },
    { value: ShippingPromotionStatus.SHIPPING_PROMOTION_STATUS_ENDED, label: t('ended') },
    { value: ShippingPromotionStatus.SHIPPING_PROMOTION_STATUS_DISABLED, label: t('disabled') },
  ];

  return (
    <Box sx={{ mb: 2 }}>
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => onChange(newValue as ShippingPromotionStatus | 'all')}
        sx={{
          '& .MuiTab-root': {
            minWidth: 'auto',
            px: 2,
            py: 1,
            fontWeight: 500,
            color: 'text.secondary',
            '&.Mui-selected': {
              color: '#0165FC',
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#0165FC',
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab key={String(tab.value)} value={tab.value} label={tab.label} />
        ))}
      </Tabs>
    </Box>
  );
}
