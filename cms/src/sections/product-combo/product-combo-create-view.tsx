import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import { createComboRequest, selectCreateComboLoading } from 'src/redux/store/comboSlice';
import type { CreateComboRequest } from 'src/types/gen/cms/cms/combos/combo';
import { ProductComboForm } from './product-combo-form';

// ----------------------------------------------------------------------

export function ProductComboCreateView() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectCreateComboLoading);

  const handleSubmit = (data: CreateComboRequest) => {
    dispatch(
      createComboRequest({
        data,
        onSuccess: () => {
          navigate('/product-combo');
        },
      })
    );
  };

  const handleCancel = () => {
    navigate('/product-combo');
  };

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ProductComboForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </Box>
  );
}
