import {
  Box,
  Card,
  Typography,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  Button,
  Stack,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  selectIsEditMode,
  selectSettings,
  selectSettingsLoading,
  setEditMode,
  cancelEdit,
  setSettings,
  setSettingsLoading,
  saveSettingsSuccess,
} from 'src/redux/store/shippingFeeConfigSlice';
import {
  SimplifiedShippingMethod,
  type ShippingFeeSettingsData,
  type DistanceTier,
  getDefaultDistanceTiers,
  validateDistanceTiers,
  isMethodSupportedByApi,
  apiSettingsToLocal,
  settingsToApiPayload,
} from 'src/types/shipping-settings';
import { DistanceTiersSection } from './components';
import { showSuccess, showError } from 'src/utils/toast';
import { shippingSettingsRepository } from 'src/repositories/shipping-settings.repository';

// ----------------------------------------------------------------------

const methodDescriptions: Record<SimplifiedShippingMethod, string> = {
  [SimplifiedShippingMethod.CARRIER_API]: 'calculateByCarrierDesc',
  [SimplifiedShippingMethod.FIXED_PER_ORDER]: 'fixedPerOrderDesc',
  [SimplifiedShippingMethod.DISTANCE_BASED]: 'calculateByDistanceDesc',
};

const methodLabels: Record<SimplifiedShippingMethod, string> = {
  [SimplifiedShippingMethod.CARRIER_API]: 'calculateByCarrier',
  [SimplifiedShippingMethod.FIXED_PER_ORDER]: 'fixedPerOrder',
  [SimplifiedShippingMethod.DISTANCE_BASED]: 'calculateByDistance',
};

export function ShippingFeeConfigView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // Redux state
  const isEditMode = useAppSelector(selectIsEditMode);
  const settings = useAppSelector(selectSettings);
  const loading = useAppSelector(selectSettingsLoading);

  // Local state for form values (for immediate UI feedback)
  const [localSettings, setLocalSettings] = useState<ShippingFeeSettingsData>(settings);
  const [tierError, setTierError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch shipping settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setInitialLoading(true);
        const apiSettings = await shippingSettingsRepository.getShippingSettings();
        const convertedSettings = apiSettingsToLocal(apiSettings);
        dispatch(setSettings(convertedSettings));
        setLocalSettings(convertedSettings);
      } catch (error) {
        console.error('Failed to fetch shipping settings:', error);
        // Keep default settings on error
      } finally {
        setInitialLoading(false);
      }
    };

    fetchSettings();
  }, [dispatch]);

  // Sync local state with redux when settings change (e.g., on cancel)
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleEdit = useCallback(() => {
    dispatch(setEditMode(true));
  }, [dispatch]);

  const handleCancel = useCallback(() => {
    dispatch(cancelEdit());
    setTierError(null);
  }, [dispatch]);

  const handleUpdate = useCallback(async () => {
    // Validate distance tiers if using distance-based method
    if (localSettings.method === SimplifiedShippingMethod.DISTANCE_BASED) {
      const tiers = localSettings.distanceTiers || [];
      if (tiers.length === 0) {
        setTierError('atLeastOneTierRequired');
        return;
      }
      const errors = validateDistanceTiers(tiers);
      if (errors.length > 0) {
        setTierError(errors[0]);
        return;
      }
    }

    setTierError(null);
    dispatch(setSettingsLoading(true));

    try {
      // Check if method is supported by API
      if (isMethodSupportedByApi(localSettings.method)) {
        const payload = settingsToApiPayload(localSettings);
        if (payload) {
          // Update shipping settings via API (singleton - always PATCH)
          await shippingSettingsRepository.updateShippingSettings(payload);
        }
      }
      // For DISTANCE_BASED, just save locally (not supported by API yet)

      dispatch(setSettings(localSettings));
      dispatch(saveSettingsSuccess());
      showSuccess(t('updateShippingFeeConfigSuccess'));
    } catch (error) {
      console.error('Failed to update shipping settings:', error);
      showError(t('updateShippingFeeConfigError'));
      dispatch(setSettingsLoading(false));
    }
  }, [dispatch, localSettings, t]);

  const handleMethodChange = useCallback((method: SimplifiedShippingMethod) => {
    setLocalSettings((prev) => ({
      ...prev,
      method,
      // Initialize defaults if needed
      distanceTiers:
        method === SimplifiedShippingMethod.DISTANCE_BASED
          ? prev.distanceTiers || getDefaultDistanceTiers()
          : prev.distanceTiers,
    }));
    setTierError(null);
  }, []);

  const handleFixedFeeChange = useCallback((fee: number) => {
    setLocalSettings((prev) => ({ ...prev, fixedFee: fee }));
  }, []);

  const handleDistanceTiersChange = useCallback((tiers: DistanceTier[]) => {
    setLocalSettings((prev) => ({ ...prev, distanceTiers: tiers }));
    setTierError(null);
  }, []);

  const renderMethodOption = (method: SimplifiedShippingMethod) => {
    const isSelected = localSettings.method === method;

    return (
      <Box
        key={method}
        sx={{
          p: 2,
          border: '1px solid',
          borderColor: isSelected ? '#0165FC' : '#E0E0E0',
          borderRadius: 2,
          bgcolor: isSelected ? 'rgba(1, 101, 252, 0.04)' : 'transparent',
          cursor: isEditMode ? 'pointer' : 'default',
          transition: 'all 0.2s',
          opacity: isEditMode ? 1 : 0.9,
          '&:hover': isEditMode
            ? {
                borderColor: '#0165FC',
              }
            : {},
        }}
        onClick={() => isEditMode && handleMethodChange(method)}
      >
        <FormControlLabel
          value={method}
          control={<Radio disabled={!isEditMode} />}
          label={
            <Typography variant="subtitle2" sx={{ fontWeight: isSelected ? 600 : 400 }}>
              {t(methodLabels[method])}
            </Typography>
          }
          sx={{ m: 0 }}
        />
      </Box>
    );
  };

  const renderDescription = () => {
    const descKey = methodDescriptions[localSettings.method];
    const description = t(descKey);

    return (
      <Box sx={{ mt: 3, minHeight: 120 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          {t('description')}:
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}
        >
          {description}
        </Typography>
      </Box>
    );
  };

  const renderMethodConfig = () => {
    // Wrapper with min-height to prevent layout jumping
    const ConfigWrapper = ({ children }: { children: ReactNode }) => (
      <Box sx={{ mt: 3, minHeight: 80 }}>{children}</Box>
    );

    switch (localSettings.method) {
      case SimplifiedShippingMethod.FIXED_PER_ORDER:
        return (
          <ConfigWrapper>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              {t('feeLevel')}:
            </Typography>
            <TextField
              type="number"
              value={localSettings.fixedFee || 0}
              onChange={(e) => handleFixedFeeChange(Number(e.target.value))}
              disabled={!isEditMode}
              InputProps={{
                endAdornment: <InputAdornment position="end">VND</InputAdornment>,
              }}
              inputProps={{ min: 0 }}
              sx={{
                width: 200,
                '& .Mui-disabled': {
                  bgcolor: '#F9FAFB',
                },
              }}
            />
          </ConfigWrapper>
        );

      case SimplifiedShippingMethod.DISTANCE_BASED:
        return (
          <ConfigWrapper>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              {t('feeLevel')}:
            </Typography>
            <DistanceTiersSection
              tiers={localSettings.distanceTiers || getDefaultDistanceTiers()}
              onChange={handleDistanceTiersChange}
              disabled={!isEditMode}
              error={tierError || undefined}
            />
          </ConfigWrapper>
        );

      case SimplifiedShippingMethod.CARRIER_API:
      default:
        // Empty wrapper to maintain consistent spacing
        return <ConfigWrapper>{null}</ConfigWrapper>;
    }
  };

  // Show loading state while fetching initial config
  if (initialLoading) {
    return (
      <Box
        sx={{
          p: 3,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        width: '100%',
      }}
    >
      <Card
        sx={{
          p: 3,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          borderRadius: 2,
          width: '100%',
        }}
      >
        <Typography variant="h6" sx={{ mb: 3 }}>
          {t('shippingFeeSettings')}
        </Typography>

        {/* Info alert for DISTANCE_BASED method */}
        {localSettings.method === SimplifiedShippingMethod.DISTANCE_BASED && (
          <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
            {t('distanceBasedNotSyncedNote')}
          </Alert>
        )}

        {/* Calculation Method Section */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            {t('calculationMethod')}
          </Typography>

          <RadioGroup
            value={localSettings.method}
            onChange={(e) => handleMethodChange(e.target.value as SimplifiedShippingMethod)}
          >
            <Stack spacing={1.5}>
              {renderMethodOption(SimplifiedShippingMethod.CARRIER_API)}
              {renderMethodOption(SimplifiedShippingMethod.FIXED_PER_ORDER)}
              {/* DISTANCE_BASED temporarily hidden - not supported by API */}
              {/* {renderMethodOption(SimplifiedShippingMethod.DISTANCE_BASED)} */}
            </Stack>
          </RadioGroup>
        </Box>

        {/* Description Section */}
        {renderDescription()}

        {/* Method-specific Config */}
        {renderMethodConfig()}

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
          {!isEditMode ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{
                bgcolor: '#0165FC',
                '&:hover': {
                  bgcolor: '#0052CC',
                },
              }}
            >
              {t('edit')}
            </Button>
          ) : (
            <>
              <Button variant="outlined" onClick={handleCancel} disabled={loading}>
                {t('cancel')}
              </Button>
              <Button
                variant="contained"
                onClick={handleUpdate}
                disabled={loading}
                sx={{
                  bgcolor: '#0165FC',
                  '&:hover': {
                    bgcolor: '#0052CC',
                  },
                }}
              >
                {loading ? t('saving') : t('update')}
              </Button>
            </>
          )}
        </Stack>
      </Card>
    </Box>
  );
}
