import {
  Box,
  Card,
  Typography,
  Stack,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getShippingPromotionByIdRequest,
  createShippingPromotionRequest,
  updateShippingPromotionRequest,
  selectCurrentShippingPromotion,
  selectCurrentShippingPromotionLoading,
  selectCreateShippingPromotionLoading,
  selectUpdateShippingPromotionLoading,
  clearCurrentShippingPromotion,
} from 'src/redux/store/shippingPromotionSlice';
import { ShippingPromotionType, DiscountType } from 'src/types/gen/shared/shared/common/enums';
import type {
  FreeshippingConfig,
  ShippingDiscountTier,
  ShippingDiscountConfig,
} from 'src/types/gen/shared/shared/shipping/shipping-promotion';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

// ----------------------------------------------------------------------

interface ShippingPromotionFormViewProps {
  id?: string;
}

interface FormData {
  name: string;
  type: ShippingPromotionType;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  freeshippingConfig: FreeshippingConfig;
  shippingDiscountConfig: ShippingDiscountConfig;
}

const defaultTier: ShippingDiscountTier = {
  minimumOrderValue: 0,
  discountType: DiscountType.DISCOUNT_TYPE_PERCENTAGE,
  discountValue: 10,
};

const defaultFormData: FormData = {
  name: '',
  type: ShippingPromotionType.SHIPPING_PROMOTION_TYPE_FREESHIP,
  startTime: null,
  endTime: null,
  freeshippingConfig: { minimumOrderValue: 500000 },
  shippingDiscountConfig: { tiers: [{ ...defaultTier }] },
};

export function ShippingPromotionFormView({ id }: ShippingPromotionFormViewProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const isEditMode = Boolean(id);
  const currentPromotion = useAppSelector(selectCurrentShippingPromotion);
  const currentLoading = useAppSelector(selectCurrentShippingPromotionLoading);
  const createLoading = useAppSelector(selectCreateShippingPromotionLoading);
  const updateLoading = useAppSelector(selectUpdateShippingPromotionLoading);

  const loading = createLoading || updateLoading;

  const [formData, setFormData] = useState<FormData>(defaultFormData);

  // Fetch promotion data in edit mode
  useEffect(() => {
    if (id) {
      dispatch(getShippingPromotionByIdRequest({ id }));
    }
    return () => {
      dispatch(clearCurrentShippingPromotion());
    };
  }, [dispatch, id]);

  // Populate form data when promotion is loaded
  useEffect(() => {
    if (currentPromotion && isEditMode) {
      setFormData({
        name: currentPromotion.name,
        type: currentPromotion.type,
        startTime: currentPromotion.startTime ? dayjs(currentPromotion.startTime) : null,
        endTime: currentPromotion.endTime ? dayjs(currentPromotion.endTime) : null,
        freeshippingConfig: currentPromotion.freeshippingConfig || { minimumOrderValue: 500000 },
        shippingDiscountConfig: currentPromotion.shippingDiscountConfig || {
          tiers: [{ ...defaultTier }],
        },
      });
    }
  }, [currentPromotion, isEditMode]);

  const handleChange = useCallback((field: keyof FormData, value: FormData[keyof FormData]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleFreeshippingConfigChange = useCallback((minimumOrderValue: number) => {
    setFormData((prev) => ({
      ...prev,
      freeshippingConfig: { minimumOrderValue },
    }));
  }, []);

  const handleTierChange = useCallback(
    (index: number, field: keyof ShippingDiscountTier, value: number) => {
      setFormData((prev) => ({
        ...prev,
        shippingDiscountConfig: {
          tiers: prev.shippingDiscountConfig.tiers.map((tier, i) =>
            i === index ? { ...tier, [field]: value } : tier
          ),
        },
      }));
    },
    []
  );

  const handleAddTier = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      shippingDiscountConfig: {
        tiers: [...prev.shippingDiscountConfig.tiers, { ...defaultTier }],
      },
    }));
  }, []);

  const handleRemoveTier = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      shippingDiscountConfig: {
        tiers: prev.shippingDiscountConfig.tiers.filter((_, i) => i !== index),
      },
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!formData.name || !formData.startTime || !formData.endTime) {
      return;
    }

    if (isEditMode && id) {
      dispatch(
        updateShippingPromotionRequest({
          id,
          data: {
            name: formData.name,
            startTime: formData.startTime.toDate(),
            endTime: formData.endTime.toDate(),
            ...(formData.type === ShippingPromotionType.SHIPPING_PROMOTION_TYPE_FREESHIP
              ? { freeshippingConfig: formData.freeshippingConfig }
              : { shippingDiscountConfig: formData.shippingDiscountConfig }),
          },
          onSuccess: () => {
            navigate('/shipping-promotion');
          },
        })
      );
    } else {
      dispatch(
        createShippingPromotionRequest({
          data: {
            type: formData.type,
            name: formData.name,
            startTime: formData.startTime.toDate(),
            endTime: formData.endTime.toDate(),
            ...(formData.type === ShippingPromotionType.SHIPPING_PROMOTION_TYPE_FREESHIP
              ? { freeshippingConfig: formData.freeshippingConfig }
              : { shippingDiscountConfig: formData.shippingDiscountConfig }),
          },
          onSuccess: () => {
            navigate('/shipping-promotion');
          },
        })
      );
    }
  }, [dispatch, navigate, formData, isEditMode, id]);

  const handleCancel = useCallback(() => {
    navigate('/shipping-promotion');
  }, [navigate]);

  if (currentLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>{t('loading')}...</Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        {/* Basic Info */}
        <Card sx={{ p: 3, boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            {t('basicInfo')}
          </Typography>

          <Stack spacing={3}>
            <TextField
              label={t('programName')}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              fullWidth
              required
            />

            {!isEditMode && (
              <FormControl fullWidth>
                <InputLabel>{t('type')}</InputLabel>
                <Select
                  value={formData.type}
                  label={t('type')}
                  onChange={(e) => handleChange('type', e.target.value as ShippingPromotionType)}
                >
                  <MenuItem value={ShippingPromotionType.SHIPPING_PROMOTION_TYPE_FREESHIP}>
                    {t('freeship')}
                  </MenuItem>
                  <MenuItem value={ShippingPromotionType.SHIPPING_PROMOTION_TYPE_SHIPPING_DISCOUNT}>
                    {t('shippingDiscount')}
                  </MenuItem>
                </Select>
              </FormControl>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <DateTimePicker
                label={t('startTime')}
                value={formData.startTime}
                onChange={(newValue) => handleChange('startTime', newValue as Dayjs | null)}
                format="DD/MM/YYYY HH:mm"
                slotProps={{
                  textField: { fullWidth: true, required: true },
                }}
              />
              <DateTimePicker
                label={t('endTime')}
                value={formData.endTime}
                onChange={(newValue) => handleChange('endTime', newValue as Dayjs | null)}
                format="DD/MM/YYYY HH:mm"
                slotProps={{
                  textField: { fullWidth: true, required: true },
                }}
              />
            </Stack>
          </Stack>
        </Card>

        {/* Config Section */}
        <Card sx={{ p: 3, boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            {formData.type === ShippingPromotionType.SHIPPING_PROMOTION_TYPE_FREESHIP
              ? t('freeshippingConfig')
              : t('shippingDiscountConfig')}
          </Typography>

          {formData.type === ShippingPromotionType.SHIPPING_PROMOTION_TYPE_FREESHIP ? (
            <TextField
              label={t('minimumOrderValue')}
              type="number"
              value={formData.freeshippingConfig.minimumOrderValue}
              onChange={(e) => handleFreeshippingConfigChange(Number(e.target.value))}
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">VND</InputAdornment>,
              }}
            />
          ) : (
            <Stack spacing={2}>
              {formData.shippingDiscountConfig.tiers.map((tier, index) => (
                <Card key={index} variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography variant="subtitle2" sx={{ minWidth: 60 }}>
                      {t('tier')} {index + 1}
                    </Typography>

                    <TextField
                      label={t('minimumOrderValue')}
                      type="number"
                      value={tier.minimumOrderValue}
                      onChange={(e) =>
                        handleTierChange(index, 'minimumOrderValue', Number(e.target.value))
                      }
                      size="small"
                      sx={{ width: 180 }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">VND</InputAdornment>,
                      }}
                    />

                    <FormControl size="small" sx={{ width: 150 }}>
                      <InputLabel>{t('discountType')}</InputLabel>
                      <Select
                        value={tier.discountType}
                        label={t('discountType')}
                        onChange={(e) =>
                          handleTierChange(index, 'discountType', Number(e.target.value))
                        }
                      >
                        <MenuItem value={DiscountType.DISCOUNT_TYPE_FIXED}>{t('fixed')}</MenuItem>
                        <MenuItem value={DiscountType.DISCOUNT_TYPE_PERCENTAGE}>
                          {t('percentage')}
                        </MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      label={t('discountValue')}
                      type="number"
                      value={tier.discountValue}
                      onChange={(e) =>
                        handleTierChange(index, 'discountValue', Number(e.target.value))
                      }
                      size="small"
                      sx={{ width: 150 }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {tier.discountType === DiscountType.DISCOUNT_TYPE_PERCENTAGE
                              ? '%'
                              : 'VND'}
                          </InputAdornment>
                        ),
                      }}
                    />

                    {formData.shippingDiscountConfig.tiers.length > 1 && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveTier(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                </Card>
              ))}

              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddTier}
                sx={{ alignSelf: 'flex-start' }}
              >
                {t('addTier')}
              </Button>
            </Stack>
          )}
        </Card>

        {/* Actions */}
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button variant="outlined" onClick={handleCancel} disabled={loading}>
            {t('cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !formData.name || !formData.startTime || !formData.endTime}
            sx={{
              bgcolor: '#0165FC',
              '&:hover': {
                bgcolor: '#0052CC',
              },
            }}
          >
            {loading ? t('saving') : isEditMode ? t('save') : t('create')}
          </Button>
        </Stack>
      </Box>
    </LocalizationProvider>
  );
}
