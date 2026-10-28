import { Alert, Box, CircularProgress, LinearProgress, Typography, Stack } from '@mui/material';
import { useEffect, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getFlashSaleByIdRequest,
  updateFlashSaleRequest,
  upsertFlashSaleProductsRequest,
  bulkRemoveFlashSaleProductsRequest,
  getFlashSaleProductIdsRequest,
  selectCurrentFlashSale,
  selectCurrentFlashSaleLoading,
  selectUpdateFlashSaleLoading,
  selectAddProductLoading,
  selectUpdateProductLoading,
  selectRemoveProductLoading,
  selectToggleProductLoading,
  selectBulkAddProgress,
  selectBulkAddResult,
  selectFlashSaleProductIds,
  selectProductIdsLoading,
  setBulkAddResult,
  clearCurrentFlashSale,
  clearFlashSaleProductIds,
} from 'src/redux/store/flashSaleSlice';
import { BulkAddResultDialog } from 'src/components/dialog';
import {
  FlashSaleForm,
  type FlashSaleFormData,
  type FlashSaleProductChanges,
} from './flash-sale-form';
import type {
  BulkAddFlashSaleProductItem,
  BulkUpdateFlashSaleProductItem,
  FilterFlashSaleProduct,
  SortFlashSaleProduct,
} from 'src/types/gen/cms/cms/flash-sales/flash-sale';
import { parseDiscountType } from 'src/utils/enum-converter';

// ----------------------------------------------------------------------

export function FlashSaleEditView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();
  const [autoOpenExcelImport] = useState(() => searchParams.get('openExcelImport') === 'true');

  const currentFlashSale = useAppSelector(selectCurrentFlashSale);
  const fetchLoading = useAppSelector(selectCurrentFlashSaleLoading);
  const updateLoading = useAppSelector(selectUpdateFlashSaleLoading);
  const addProductLoading = useAppSelector(selectAddProductLoading);
  const updateProductLoading = useAppSelector(selectUpdateProductLoading);
  const removeProductLoading = useAppSelector(selectRemoveProductLoading);
  const toggleProductLoading = useAppSelector(selectToggleProductLoading);
  const bulkAddProgress = useAppSelector(selectBulkAddProgress);
  const bulkAddResult = useAppSelector(selectBulkAddResult);
  const flashSaleProductIds = useAppSelector(selectFlashSaleProductIds);
  const productIdsLoading = useAppSelector(selectProductIdsLoading);

  const handleCloseResultDialog = useCallback(() => {
    dispatch(setBulkAddResult(null));
    navigate('/flash-sale');
  }, [dispatch, navigate]);

  const isLoading =
    updateLoading ||
    addProductLoading ||
    updateProductLoading ||
    removeProductLoading ||
    toggleProductLoading;

  const [productPage, setProductPage] = useState(1);
  const [productPageSize, setProductPageSize] = useState(10);
  const [productFilters, setProductFilters] = useState<FilterFlashSaleProduct | undefined>(
    undefined
  );
  const [productSort, setProductSort] = useState<SortFlashSaleProduct[] | undefined>(undefined);

  const fetchFlashSale = useCallback(
    (
      page?: number,
      limit?: number,
      filters?: FilterFlashSaleProduct,
      sort?: SortFlashSaleProduct[]
    ) => {
      if (!id) return;
      dispatch(
        getFlashSaleByIdRequest({
          id,
          page: page ?? productPage,
          limit: limit ?? productPageSize,
          filters: filters !== undefined ? filters : productFilters,
          sort: sort !== undefined ? sort : productSort,
        })
      );
    },
    [dispatch, id, productPage, productPageSize, productFilters, productSort]
  );

  // Clear openExcelImport query param after reading
  useEffect(() => {
    if (searchParams.get('openExcelImport')) {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Fetch flash sale data on mount
  useEffect(() => {
    if (id) {
      dispatch(getFlashSaleByIdRequest({ id, page: 1, limit: 10 }));
      // Fetch all product IDs for global order validation
      dispatch(getFlashSaleProductIdsRequest({ flashSaleId: id }));
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentFlashSale());
      dispatch(clearFlashSaleProductIds());
    };
  }, [dispatch, id]);

  const handleProductPageChange = useCallback(
    (page: number) => {
      setProductPage(page);
      fetchFlashSale(page, productPageSize, productFilters, productSort);
    },
    [fetchFlashSale, productPageSize, productFilters, productSort]
  );

  const handleProductPageSizeChange = useCallback(
    (pageSize: number) => {
      setProductPageSize(pageSize);
      setProductPage(1);
      fetchFlashSale(1, pageSize, productFilters, productSort);
    },
    [fetchFlashSale, productFilters, productSort]
  );

  const handleProductSearch = useCallback(
    (search: string) => {
      const filters: FilterFlashSaleProduct = {
        ...(productFilters || {}),
        search: search || undefined,
        categoryIds: productFilters?.categoryIds ?? [],
        topicProductIds: productFilters?.topicProductIds ?? [],
      };
      setProductFilters(filters);
      setProductPage(1);
      fetchFlashSale(1, productPageSize, filters, productSort);
    },
    [fetchFlashSale, productPageSize, productFilters, productSort]
  );
  const handleSubmit = useCallback(
    (data: FlashSaleFormData, productChanges?: FlashSaleProductChanges) => {
      if (!id) return;

      // Combine edited and added products for upsert
      const productsToUpsert: BulkUpdateFlashSaleProductItem[] = [
        ...(productChanges?.editedProducts || []),
        ...(productChanges?.addedProducts || []),
      ];

      const toRemove = productChanges?.deletedProductIds || [];

      // Update flash sale metadata first
      dispatch(
        updateFlashSaleRequest({
          flashSaleId: id,
          name: data.name,
          startTime: data.startTime,
          endTime: data.endTime,
          isEnabled: data.isEnabled,
          onSuccess: () => {
            // Handle deletions first if needed
            if (toRemove.length > 0) {
              dispatch(
                bulkRemoveFlashSaleProductsRequest({
                  flashSaleId: id,
                  productIds: toRemove,
                  onSuccess: () => {
                    // After deletion, upsert products if needed
                    if (productsToUpsert.length > 0) {
                      dispatch(
                        upsertFlashSaleProductsRequest({
                          flashSaleId: id,
                          data: { products: productsToUpsert },
                        })
                      );
                    } else {
                      navigate('/flash-sale');
                    }
                  },
                })
              );
            } else if (productsToUpsert.length > 0) {
              // No deletions, just upsert
              dispatch(
                upsertFlashSaleProductsRequest({
                  flashSaleId: id,
                  data: { products: productsToUpsert },
                })
              );
            } else {
              // No changes
              navigate('/flash-sale');
            }
          },
        })
      );
    },
    [dispatch, id, navigate]
  );

  const handleCancel = useCallback(() => {
    navigate('/flash-sale');
  }, [navigate]);

  // Show full-page loading only on initial fetch (no data yet)
  if (!currentFlashSale) {
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

  // Transform FlashSale to form data format
  const formData: FlashSaleFormData = {
    name: currentFlashSale.name,
    startTime: currentFlashSale.startTime ? new Date(currentFlashSale.startTime) : undefined,
    endTime: currentFlashSale.endTime ? new Date(currentFlashSale.endTime) : undefined,
    isEnabled: currentFlashSale.isEnabled,
  };

  // Extract products data from paginated response
  const initialProducts = currentFlashSale.products?.data || [];
  const productsPagination = currentFlashSale.products;

  const progressPercent =
    bulkAddProgress && bulkAddProgress.total > 0
      ? Math.round((bulkAddProgress.current / bulkAddProgress.total) * 100)
      : 0;

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {bulkAddProgress && (
        <Stack spacing={1} sx={{ px: 3, py: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            {t('bulkAddProgressLabel', {
              current: bulkAddProgress.current,
              total: bulkAddProgress.total,
            })}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{ height: 6, borderRadius: 1 }}
          />
          <Alert severity="warning" sx={{ mt: 1 }}>
            {t('doNotCloseWhileBulkProcessing')}
          </Alert>
        </Stack>
      )}
      <FlashSaleForm
        mode="edit"
        initialData={formData}
        initialProducts={initialProducts}
        flashSaleId={id}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        autoOpenExcelImport={autoOpenExcelImport}
        loading={isLoading}
        productsPagination={productsPagination}
        onProductPageChange={handleProductPageChange}
        onProductPageSizeChange={handleProductPageSizeChange}
        onProductSearch={handleProductSearch}
        paginationLoading={fetchLoading}
        flashSaleProductIds={flashSaleProductIds}
        productIdsLoading={productIdsLoading}
      />

      {bulkAddResult && (
        <BulkAddResultDialog
          open
          onClose={handleCloseResultDialog}
          addedCount={bulkAddResult.addedCount}
          failedCount={bulkAddResult.failedCount}
          failedProducts={bulkAddResult.failedProducts}
        />
      )}
    </Box>
  );
}
