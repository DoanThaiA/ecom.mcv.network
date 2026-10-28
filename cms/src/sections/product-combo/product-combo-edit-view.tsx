import { Box, CircularProgress } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getComboByIdRequest,
  updateComboRequest,
  selectCurrentCombo,
  selectCurrentComboLoading,
  selectUpdateComboLoading,
  clearCurrentCombo,
} from 'src/redux/store/comboSlice';
import type { ComboResponse as Combo } from 'src/types/gen/shared/shared/combos/combo';
import type { CreateComboRequest } from 'src/types/gen/cms/cms/combos/combo';
import { ProductComboForm } from './product-combo-form';

// ----------------------------------------------------------------------

export function ProductComboEditView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();

  const currentCombo = useAppSelector(selectCurrentCombo) as Combo | null;
  const fetchLoading = useAppSelector(selectCurrentComboLoading);
  const updateLoading = useAppSelector(selectUpdateComboLoading);

  // Fetch combo data on mount
  useEffect(() => {
    if (id) {
      dispatch(getComboByIdRequest({ id }));
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentCombo());
    };
  }, [dispatch, id]);

  const handleSubmit = (data: CreateComboRequest) => {
    if (id) {
      dispatch(
        updateComboRequest({
          id,
          data,
          onSuccess: () => {
            navigate('/product-combo');
          },
        })
      );
    }
  };

  const handleCancel = () => {
    navigate('/product-combo');
  };

  // Show loading state while fetching
  if (fetchLoading || !currentCombo) {
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

  // Transform Combo to form data format
  const formData: Partial<CreateComboRequest> = {
    name: currentCombo.name,
    description: currentCombo.description,
    image: currentCombo.image,
    items: currentCombo.items?.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      // Keep extra fields for display in the form
      productName: item.productName,
      productImage: item.productImage,
    })) as any,
    discountType: currentCombo.discountType,
    discountValue: currentCombo.discountValue,
    status: currentCombo.status,
    validFrom: currentCombo.validFrom,
    validTo: currentCombo.validTo,
    nameLocalization: currentCombo.nameLocalization,
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
        mode="edit"
        initialData={formData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={updateLoading}
      />
    </Box>
  );
}
