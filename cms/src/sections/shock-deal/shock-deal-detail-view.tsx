import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getPromotionByIdRequest,
  selectCurrentPromotion,
  selectCurrentPromotionLoading,
  selectPausePromotionLoading,
  clearCurrentPromotion,
  pausePromotionRequest,
  resumePromotionRequest,
} from 'src/redux/store/promotionSlice';
import { PromotionDetailHeader } from 'src/sections/promotion/components/promotion-detail-header';
import { ShockDealInfoSection } from './components/shock-deal-info-section';
import { ShockDealOrdersTab } from './components/shock-deal-orders-tab';
import { ShockDealProductsTab } from './components/shock-deal-products-tab';

// ----------------------------------------------------------------------

export function ShockDealDetailView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();

  const promotion = useAppSelector(selectCurrentPromotion);
  const loading = useAppSelector(selectCurrentPromotionLoading);
  const pauseLoading = useAppSelector(selectPausePromotionLoading);

  const [tabValue, setTabValue] = useState('info');

  useEffect(() => {
    if (id) dispatch(getPromotionByIdRequest({ id }));
    return () => {
      dispatch(clearCurrentPromotion());
    };
  }, [dispatch, id]);

  const handleBack = useCallback(() => navigate('/promotion'), [navigate]);

  const handlePauseResume = useCallback(() => {
    if (!id) return;
    if (promotion?.isEnabled) {
      dispatch(pausePromotionRequest({ id }));
    } else {
      dispatch(resumePromotionRequest({ id }));
    }
  }, [dispatch, id, promotion?.isEnabled]);

  const handleDuplicate = useCallback(() => {
    if (!promotion) return;
    navigate('/shock-deal/create', { state: { duplicateFrom: promotion } });
  }, [navigate, promotion]);

  if (loading || !promotion) {
    return (
      <Box
        sx={{
          height: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 10, px: 2, pt: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {t('promotionDetail')} {promotion.name}
      </Typography>

      <PromotionDetailHeader
        promotion={promotion}
        onBack={handleBack}
        onPauseResume={handlePauseResume}
        onDuplicate={handleDuplicate}
        pauseLoading={pauseLoading}
      />

      <Tabs
        value={tabValue}
        onChange={(_, v) => setTabValue(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab value="info" label={t('information')} />
        <Tab value="orders" label={t('orderList')} />
        <Tab value="products" label={t('giftedProducts')} />
      </Tabs>

      {tabValue === 'info' && <ShockDealInfoSection promotion={promotion} />}
      {tabValue === 'orders' && <ShockDealOrdersTab promotionId={id!} />}
      {tabValue === 'products' && <ShockDealProductsTab promotionId={id!} />}
    </Box>
  );
}
