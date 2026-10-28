import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Card, CircularProgress, Tab, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  clearCurrentProduct,
  getProductByIdRequest,
  getProductInventoryRequest,
  selectCurrentProduct,
  selectCurrentProductLoading,
  selectInventoryLoading,
  selectProductInventory,
} from 'src/redux/store/productSlice';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';

import { ProductInfoTab } from './product-info-tab';
import { ProductInventoryTab } from './product-inventory-tab';
import { ProductWebsiteSettingsTab } from './product-website-settings-tab';

// ----------------------------------------------------------------------

export function ProductDetailView() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const [tabValue, setTabValue] = useState('1');

  // Redux state
  const product = useAppSelector(selectCurrentProduct);
  const loading = useAppSelector(selectCurrentProductLoading);
  const inventory = useAppSelector(selectProductInventory);
  const inventoryLoading = useAppSelector(selectInventoryLoading);

  // Fetch product when component mounts
  useEffect(() => {
    if (id) {
      dispatch(getProductByIdRequest({ id }));
    }

    // Clean up on unmount
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [id, dispatch]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);

    // Fetch inventory when switching to inventory tab
    if (newValue === '2' && id && !inventory) {
      dispatch(getProductInventoryRequest({ id }));
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show not found if no product
  if (!product) {
    return (
      <Box sx={{ p: 3 }}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" color="text.secondary">
            {t('product_not_found')}
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {/* White Card Container */}
      <Card sx={{ boxShadow: 'none', border: 'none' }}>
        <TabContext value={tabValue}>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: '#E5E6EB', px: 2 }}>
            <TabList
              onChange={handleTabChange}
              sx={{
                minHeight: 44,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 400,
                  minHeight: 44,
                  minWidth: 'auto',
                  padding: '12px 16px',
                  color: '#000000',
                  '&.Mui-selected': {
                    color: '#000000',
                    fontWeight: 500,
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#3D54A0',
                  height: 2,
                },
              }}
            >
              <Tab label={t('information')} value="1" />
              <Tab label={t('inventory')} value="2" />
              <Tab label={t('websiteDisplaySettings')} value="3" />
            </TabList>
          </Box>

          {/* Tab Panels */}
          <TabPanel value="1" sx={{ p: 0 }}>
            <ProductInfoTab product={product} />
          </TabPanel>

          <TabPanel value="2" sx={{ p: 0 }}>
            <ProductInventoryTab inventory={inventory} inventoryLoading={inventoryLoading} />
          </TabPanel>

          <TabPanel value="3" sx={{ p: 0 }}>
            <ProductWebsiteSettingsTab product={product} />
          </TabPanel>
        </TabContext>
      </Card>
    </Box>
  );
}
