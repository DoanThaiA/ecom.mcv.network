import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  createColorVariantRequest,
  selectCreateColorVariantLoading,
} from 'src/redux/store/colorVariantSlice';
import type { CreateColorVariantRequest, UpdateColorVariantRequest } from 'src/types/color-variant';
import { ColorVariantForm } from './color-variant-form';

// ----------------------------------------------------------------------

export function ColorVariantCreateView() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectCreateColorVariantLoading);

  const handleSubmit = (data: CreateColorVariantRequest | UpdateColorVariantRequest) => {
    dispatch(
      createColorVariantRequest({
        data: data as CreateColorVariantRequest,
        onSuccess: () => {
          navigate('/color-variant');
        },
      })
    );
  };

  const handleCancel = () => {
    navigate('/color-variant');
  };

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
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </Box>
  );
}
