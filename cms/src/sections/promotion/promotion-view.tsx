import Box from '@mui/material/Box';

import { DashboardContent } from 'src/layouts/dashboard';

import { PromotionTypeCards, PromotionListTable } from './components';

// ----------------------------------------------------------------------

export function PromotionView() {
  return (
    <DashboardContent>
      <Box sx={{ p: 2 }}>
        {/* Promotion Type Cards */}
        <PromotionTypeCards />

        {/* Promotion List Table */}
        <PromotionListTable />
      </Box>
    </DashboardContent>
  );
}
