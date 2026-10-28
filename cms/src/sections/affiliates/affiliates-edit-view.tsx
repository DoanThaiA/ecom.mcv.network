import { Box, CircularProgress, Alert } from '@mui/material';
import { useEffect, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getAffiliateRequest,
  updateAffiliateRequest,
  selectCurrentAffiliate,
  selectLoading,
  selectUpdateLoading,
  setCurrentAffiliate,
} from 'src/redux/store/affiliatesSlice';
import { AffiliatesForm, type AffiliateFormData } from './affiliates-form';

// ----------------------------------------------------------------------

export function AffiliatesEditView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const currentAffiliate = useAppSelector(selectCurrentAffiliate);
  const fetchLoading = useAppSelector(selectLoading);
  const updateLoading = useAppSelector(selectUpdateLoading);

  // Auto-open import dialog when arriving from the create → edit redirect trick.
  // Captured once on mount via lazy useState so it stays true even after we
  // clear the query param below (mirrors the flash-sale / topic patterns).
  const [autoOpenImport] = useState(() => searchParams.get('openExcelImport') === 'true');

  // Clear the openExcelImport query param after reading so a page refresh
  // doesn't reopen the dialog.
  useEffect(() => {
    if (searchParams.get('openExcelImport')) {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Ref to prevent duplicate requests
  const pendingRequestsRef = useRef<Set<string>>(new Set());

  // Load affiliate with deduplication
  const loadAffiliate = useCallback(() => {
    if (!id) return;

    const requestKey = `affiliate-${id}`;

    // Check if request is already pending
    if (pendingRequestsRef.current.has(requestKey)) {
      return;
    }

    // Mark request as pending
    pendingRequestsRef.current.add(requestKey);

    dispatch(
      getAffiliateRequest({
        affiliateId: id,
      })
    );

    // Remove from pending after request started
    setTimeout(() => {
      pendingRequestsRef.current.delete(requestKey);
    }, 100);
  }, [dispatch, id]);

  // Fetch affiliate data on mount
  useEffect(() => {
    loadAffiliate();

    // Cleanup on unmount
    return () => {
      dispatch(setCurrentAffiliate(null));
    };
  }, [loadAffiliate, dispatch]);

  const handleSubmit = useCallback(
    (
      data: AffiliateFormData,
      _pendingProducts?: Array<{ productId: string; commissionRate: number }>
    ) => {
      // Ignore _pendingProducts in edit mode - products are managed separately
      if (!id) return;

      dispatch(
        updateAffiliateRequest({
          data: {
            affiliateId: id,
            name: data.name,
            type: data.type,
            email: data.email,
            phone: data.phone,
            status: data.status,
            bankAccountHolder: data.bankAccountHolder || undefined,
            bankName: data.bankName || undefined,
            bankAccountNumber: data.bankAccountNumber || undefined,
            citizenId: data.citizenId || undefined,
            notes: data.notes || undefined,
            defaultCommissionRate:
              typeof data.defaultCommissionRate === 'number' ? data.defaultCommissionRate : null,
            autoUpdateProducts:
              data.autoUpdateProducts !== undefined ? data.autoUpdateProducts : false,
          },
          onSuccess: () => {
            navigate('/affiliates');
          },
        })
      );
    },
    [dispatch, navigate, id]
  );

  const handleCancel = useCallback(() => {
    navigate('/affiliates');
  }, [navigate]);

  // Show loading state while fetching
  if (fetchLoading) {
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

  // Show error if no affiliate found
  if (!currentAffiliate) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{t('affiliateNotFound')}</Alert>
      </Box>
    );
  }

  return (
    <AffiliatesForm
      isEditMode
      initialData={currentAffiliate}
      loading={updateLoading}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      autoOpenImport={autoOpenImport}
    />
  );
}
