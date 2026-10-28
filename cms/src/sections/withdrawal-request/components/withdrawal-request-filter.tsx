import { Box, TextField, InputAdornment, Tab, Tabs } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import type { WithdrawalRequestTab } from 'src/types/withdrawal-request';

interface WithdrawalRequestFilterProps {
  search: string;
  activeTab: WithdrawalRequestTab;
  onSearchChange: (value: string) => void;
  onTabChange: (tab: WithdrawalRequestTab) => void;
}

const TAB_CONFIG: { value: WithdrawalRequestTab; labelKey: string }[] = [
  { value: 'all', labelKey: 'all' },
  { value: 'pending', labelKey: 'withdrawalStatusPending' },
  { value: 'approved', labelKey: 'withdrawalStatusApproved' },
  { value: 'paid', labelKey: 'withdrawalStatusPaid' },
  { value: 'rejected', labelKey: 'withdrawalStatusRejected' },
];

export function WithdrawalRequestFilter({
  search,
  activeTab,
  onSearchChange,
  onTabChange,
}: WithdrawalRequestFilterProps) {
  const { t } = useTranslation();

  const handleTabChange = (_event: React.SyntheticEvent, newTab: WithdrawalRequestTab) => {
    onTabChange(newTab);
  };

  return (
    <Box>
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
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
        {TAB_CONFIG.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={t(tab.labelKey)} />
        ))}
      </Tabs>

      {/* Search Input */}
      <Box sx={{ p: 2 }}>
        <TextField
          size="small"
          placeholder={t('searchByAgentName')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ width: 280 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Box>
  );
}
