import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getColorVariantByIdRequest,
  updateColorVariantRequest,
  clearCurrentColorVariant,
  selectCurrentColorVariant,
  selectCurrentColorVariantLoading,
  selectUpdateColorVariantLoading,
} from 'src/redux/store/colorVariantSlice';
import type { UpdateColorVariantRequest } from 'src/types/color-variant';
import { ColorVariantForm, type ColorVariantFormData } from './color-variant-form';

// ----------------------------------------------------------------------

export function ColorVariantEditView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();

  const currentColorVariant = useAppSelector(selectCurrentColorVariant);
  const currentLoading = useAppSelector(selectCurrentColorVariantLoading);
  const updateLoading = useAppSelector(selectUpdateColorVariantLoading);

  // Fetch color variant on mount
  useEffect(() => {
    if (id) {
      dispatch(getColorVariantByIdRequest({ id }));
    }

    // Clear on unmount
    return () => {
      dispatch(clearCurrentColorVariant());
    };
  }, [dispatch, id]);

  const handleSubmit = (data: UpdateColorVariantRequest) => {
    if (id) {
      dispatch(
        updateColorVariantRequest({
          id,
          data,
          onSuccess: () => {
            navigate('/color-variant');
          },
        })
      );
    }
  };

  const handleCancel = () => {
    navigate('/color-variant');
  };

  // Show loading while fetching
  if (currentLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - var(--layout-header-desktop-height))',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show error if not found
  if (!currentColorVariant && !currentLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - var(--layout-header-desktop-height))',
        }}
      >
        <Typography color="text.secondary">{t('noData')}</Typography>
      </Box>
    );
  }

  // Map current color variant to form data
  const initialData: Partial<ColorVariantFormData> = currentColorVariant
    ? {
        name: currentColorVariant.name,
        displayType: currentColorVariant.displayType,
        colorValue: currentColorVariant.display?.colorValue || '',
        patternImage: currentColorVariant.display?.patternImage || '',
        order: currentColorVariant.order,
      }
    : {};

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - var(--layout-header-desktop-height))',
        overflow: 'hidden',
      }}
    >
      <ColorVariantForm
        mode="edit"
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={updateLoading}
      />
    </Box>
  );
}
