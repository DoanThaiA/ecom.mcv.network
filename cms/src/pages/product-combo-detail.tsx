import { Helmet } from 'react-helmet-async';
import { Box, Card, Typography, Chip, Button, CircularProgress } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getComboByIdRequest,
  selectCurrentCombo,
  selectCurrentComboLoading,
  clearCurrentCombo,
} from 'src/redux/store/comboSlice';
import { formatPrice } from 'src/utils/format';
import type { ComboResponse as Combo } from 'src/types/gen/shared/shared/combos/combo';
import {
  ComboStatus,
  comboStatusToJSON,
  DiscountType,
  discountTypeToJSON,
} from 'src/types/gen/shared/shared/common/enums';

// ----------------------------------------------------------------------

const getStatusColor = (status: ComboStatus) => {
  switch (status) {
    case ComboStatus.COMBO_STATUS_ACTIVE:
      return '#178B30';
    case ComboStatus.COMBO_STATUS_INACTIVE:
      return '#FF9500';
    default:
      return '#000000';
  }
};

const getStatusLabel = (status: ComboStatus, t: any) => {
  const statusJSON = comboStatusToJSON(status);
  const statusKey = statusJSON.replace('COMBO_STATUS_', '').toLowerCase();
  const translationMap: Record<string, string> = {
    active: 'comboActive',
    inactive: 'comboInactive',
    unspecified: 'comboInactive',
  };
  return t(translationMap[statusKey] || 'comboInactive');
};

export default function ProductDetailPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const combo = useAppSelector(selectCurrentCombo) as Combo | null;
  const loading = useAppSelector(selectCurrentComboLoading);

  // Fetch combo when component mounts
  useEffect(() => {
    if (id) {
      dispatch(getComboByIdRequest({ id }));
    }

    // Clean up on unmount
    return () => {
      dispatch(clearCurrentCombo());
    };
  }, [id, dispatch]);

  useEffect(() => {
    setTitle(t('comboDetail'));
  }, [t, setTitle]);

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

  // Show not found if no combo
  if (!combo) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          {t('back')}
        </Button>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" color="text.secondary">
            {t('comboNotFound')}
          </Typography>
        </Card>
      </Box>
    );
  }

  const InfoRow = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
    <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, color: '#000000', minWidth: 'fit-content' }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: '#000000' }}>
        {value}
      </Typography>
    </Box>
  );

  return (
    <>
      <Helmet>
        <title>{`${combo.name} - ${CONFIG.appName}`}</title>
        <meta name="description" content={combo.description || 'Combo Detail'} />
        <meta name="keywords" content="cchat,cms,combo,detail" />
      </Helmet>

      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ alignSelf: 'flex-start', mb: 1 }}
        >
          {t('back')}
        </Button>

        {/* Combo Information */}
        <Box>
          {/* Product Information Card */}
          <Card
            sx={{
              p: 3,
              border: '1px solid #E5E6EB',
              boxShadow: 'none',
            }}
          >
            <Box sx={{ display: 'flex', gap: 3 }}>
              {/* Left Column */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Column 1 */}
                <Box>
                  <InfoRow label={t('comboProductName') + ':'} value={combo.name} />
                  <InfoRow label={t('description') + ':'} value={combo.description || '--'} />
                </Box>
              </Box>

              {/* Right Column */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Column 2 */}
                <Box>
                  <InfoRow
                    label={t('status') + ':'}
                    value={
                      <Chip
                        label={getStatusLabel(combo.status, t)}
                        size="small"
                        sx={{
                          bgcolor: `${getStatusColor(combo.status)}15`,
                          color: getStatusColor(combo.status),
                          fontWeight: 500,
                          borderRadius: '16px',
                          border: `1px solid ${getStatusColor(combo.status)}`,
                          height: 'auto',
                          padding: '4px 10px',
                          '& .MuiChip-label': {
                            padding: 0,
                          },
                        }}
                      />
                    }
                  />
                  <InfoRow
                    label={t('discountType') + ':'}
                    value={
                      combo.discountType === DiscountType.DISCOUNT_TYPE_PERCENTAGE
                        ? t('percentageDiscount')
                        : t('fixedDiscount')
                    }
                  />
                  <InfoRow
                    label={t('discountValue') + ':'}
                    value={
                      combo.discountType === DiscountType.DISCOUNT_TYPE_PERCENTAGE
                        ? `${combo.discountValue}%`
                        : formatPrice(combo.discountValue)
                    }
                  />
                  {combo.validFrom && (
                    <InfoRow
                      label={t('validFrom') + ':'}
                      value={new Date(combo.validFrom).toLocaleString('vi-VN')}
                    />
                  )}
                  {combo.validTo && (
                    <InfoRow
                      label={t('validTo') + ':'}
                      value={new Date(combo.validTo).toLocaleString('vi-VN')}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Card>

          {/* Combo Items Card */}
          {combo.items && combo.items.length > 0 && (
            <Card
              sx={{
                p: 3,
                border: '1px solid #E5E6EB',
                boxShadow: 'none',
                mt: 2,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {t('comboItems')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {combo.items.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      border: '1px solid #E5E6EB',
                      borderRadius: 1,
                    }}
                  >
                    {item.productImage && (
                      <Box
                        component="img"
                        src={item.productImage}
                        alt={item.productName}
                        sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                      />
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {item.productName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('quantity')}: {item.quantity}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Card>
          )}
        </Box>
      </Box>
    </>
  );
}
