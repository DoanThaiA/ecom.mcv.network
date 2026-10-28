import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import { createAffiliateRequest, selectCreateLoading } from 'src/redux/store/affiliatesSlice';
import { addAffiliateProductCommissionsRequest } from 'src/redux/store/commissionSlice';
import { AffiliatesForm, type AffiliateFormData } from './affiliates-form';

// ----------------------------------------------------------------------

export function AffiliatesCreateView() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const loading = useAppSelector(selectCreateLoading);

  const [showCreateConfirmDialog, setShowCreateConfirmDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<AffiliateFormData | null>(null);

  const handleSubmit = useCallback(
    (
      data: AffiliateFormData,
      pendingProducts?: Array<{ productId: string; commissionRate: number }>
    ) => {
      dispatch(
        createAffiliateRequest({
          data: {
            name: data.name,
            type: data.type,
            email: data.email,
            phone: data.phone,
            bankAccountHolder: data.bankAccountHolder || undefined,
            bankName: data.bankName || undefined,
            bankAccountNumber: data.bankAccountNumber || undefined,
            citizenId: data.citizenId || undefined,
            notes: data.notes || undefined,
            defaultCommissionRate:
              typeof data.defaultCommissionRate === 'number' ? data.defaultCommissionRate : null,
            autoUpdateProducts: data.autoUpdateProducts,
          },
          onSuccess: (createdAffiliate) => {
            // If there are pending products, add them before navigating
            if (pendingProducts && pendingProducts.length > 0) {
              dispatch(
                addAffiliateProductCommissionsRequest({
                  affiliateId: createdAffiliate.id,
                  products: pendingProducts,
                  onSuccess: () => {
                    navigate('/affiliates');
                  },
                })
              );
            } else {
              navigate('/affiliates');
            }
          },
        })
      );
    },
    [dispatch, navigate]
  );

  const handleCancel = useCallback(() => {
    navigate('/affiliates');
  }, [navigate]);

  const handleExcelImportRequest = useCallback((formData: AffiliateFormData) => {
    setPendingFormData(formData);
    setShowCreateConfirmDialog(true);
  }, []);

  const handleConfirmCreateForExcel = useCallback(() => {
    if (!pendingFormData) return;
    setShowCreateConfirmDialog(false);

    dispatch(
      createAffiliateRequest({
        data: {
          name: pendingFormData.name,
          type: pendingFormData.type,
          email: pendingFormData.email,
          phone: pendingFormData.phone,
          bankAccountHolder: pendingFormData.bankAccountHolder || undefined,
          bankName: pendingFormData.bankName || undefined,
          bankAccountNumber: pendingFormData.bankAccountNumber || undefined,
          citizenId: pendingFormData.citizenId || undefined,
          notes: pendingFormData.notes || undefined,
          defaultCommissionRate:
            typeof pendingFormData.defaultCommissionRate === 'number'
              ? pendingFormData.defaultCommissionRate
              : null,
          autoUpdateProducts: pendingFormData.autoUpdateProducts,
        },
        onSuccess: (createdAffiliate) => {
          navigate(`/affiliates/edit/${createdAffiliate.id}?openExcelImport=true`);
        },
      })
    );
    setPendingFormData(null);
  }, [dispatch, navigate, pendingFormData]);

  return (
    <>
      <AffiliatesForm
        isEditMode={false}
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onExcelImportRequest={handleExcelImportRequest}
      />

      <Dialog open={showCreateConfirmDialog} onClose={() => setShowCreateConfirmDialog(false)}>
        <DialogTitle>{t('importExcel')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('affiliateWillBeCreatedImmediately')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateConfirmDialog(false)} color="inherit">
            {t('cancel')}
          </Button>
          <Button onClick={handleConfirmCreateForExcel} variant="contained" disabled={loading}>
            {t('confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
