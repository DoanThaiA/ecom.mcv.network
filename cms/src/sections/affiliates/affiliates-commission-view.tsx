import { Box, Stack } from '@mui/material';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { CommissionSettingsSection } from './components/commission-settings-section';
import {
  CommissionProductTable,
  type CommissionProduct,
} from './components/commission-product-table';
import { BulkEditCommissionDialog } from './components/bulk-edit-commission-dialog';
import { EditCommissionDialog } from './components/edit-commission-dialog';
import { EditDefaultCommissionRateDialog } from './components/edit-default-commission-rate-dialog';
import { AffiliateProductCommissionExcelImportDialog } from './components/affiliate-product-commission-excel-import-dialog';
import { ProductSelectionDialog } from 'src/components/dialog';
import { useDialog } from 'src/hooks';
import { showSuccess } from 'src/utils/toast';
import type { Product } from 'src/types/products';
import {
  getCommissionSettingsRequest,
  updateCommissionSettingsRequest,
  getProductCommissionsRequest,
  addProductCommissionsRequest,
  updateProductCommissionRequest,
  bulkUpdateProductCommissionsRequest,
  deleteProductCommissionRequest,
  selectCommissionSettings,
  selectCommissionProducts,
  selectPagination,
  selectUpdateSettingsLoading,
} from 'src/redux/store/commissionSlice';

export function AffiliatesCommissionView() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const bulkEditDialog = useDialog();
  const editDialog = useDialog();
  const productDialog = useDialog();
  const editDefaultRateDialog = useDialog();
  const importDialog = useDialog();

  // Redux state
  const settings = useSelector(selectCommissionSettings);
  const products = useSelector(selectCommissionProducts);
  const pagination = useSelector(selectPagination);
  const updateSettingsLoading = useSelector(selectUpdateSettingsLoading);

  // Local state for filters
  const [categoryNamesFilter, setCategoryNamesFilter] = useState<string[]>([]);

  // Local state for dialogs
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingProductRate, setEditingProductRate] = useState<number>(0);

  // Ref to track if initial data has been loaded
  const isInitialLoadRef = useRef(false);
  // Ref to prevent duplicate requests
  const pendingRequestsRef = useRef<Set<string>>(new Set());

  // Memoized function to load commission settings
  const loadCommissionSettings = useCallback(() => {
    const requestKey = 'commission-settings';

    // Check if request is already pending
    if (pendingRequestsRef.current.has(requestKey)) {
      return;
    }

    // Mark request as pending
    pendingRequestsRef.current.add(requestKey);

    dispatch(getCommissionSettingsRequest({}));

    // Remove from pending after a short delay (request started)
    setTimeout(() => {
      pendingRequestsRef.current.delete(requestKey);
    }, 100);
  }, [dispatch]);

  // Memoized function to load product commissions
  const loadProductCommissions = useCallback(
    (params: { page?: number; limit?: number; search?: string; categoryNames?: string[] } = {}) => {
      const page = params.page ?? pagination.page;
      const limit = params.limit ?? pagination.limit;
      const search = params.search ?? '';
      const categoryNames = params.categoryNames ?? categoryNamesFilter;

      const requestKey = `products-${page}-${limit}-${search}-${categoryNames.join(',')}`;

      // Check if request is already pending
      if (pendingRequestsRef.current.has(requestKey)) {
        return;
      }

      // Mark request as pending
      pendingRequestsRef.current.add(requestKey);

      dispatch(getProductCommissionsRequest({ page, limit, search, categoryNames }));

      // Remove from pending after a short delay (request started)
      setTimeout(() => {
        pendingRequestsRef.current.delete(requestKey);
      }, 100);
    },
    [dispatch, pagination.page, pagination.limit, categoryNamesFilter]
  );

  // Simple helper to reload settings (used after updates)
  const loadSettings = useCallback(() => {
    dispatch(getCommissionSettingsRequest({}));
  }, [dispatch]);

  // Load data on mount
  useEffect(() => {
    // Only load data once on initial mount
    if (!isInitialLoadRef.current) {
      isInitialLoadRef.current = true;
      loadCommissionSettings();
      loadProductCommissions({ page: 1, limit: 10 });
    }
  }, []); // Empty dependency array - only runs on mount

  // Transform ProductCommission to CommissionProduct for table
  const transformedProducts = useMemo<CommissionProduct[]>(() => {
    return products.map((pc) => ({
      id: pc.id,
      productId: pc.productId,
      productCode: pc.code,
      productImage: pc.images?.avatar || '',
      productName: pc.name,
      costPrice: pc.costPrice,
      stock: pc.stock,
      commissionRate: pc.commissionRate,
      estimatedCommission: pc.estimatedCommission,
    }));
  }, [products]);

  // Existing product IDs for dialog
  const existingProductIds = useMemo(() => products.map((p) => p.productId), [products]);

  // Handlers
  const handleDefaultRateChange = (rate: number) => {
    dispatch(
      updateCommissionSettingsRequest({
        data: { defaultCommissionRate: rate },
      })
    );
  };

  const handleAutoAddChange = (enabled: boolean) => {
    dispatch(
      updateCommissionSettingsRequest({
        data: {
          defaultCommissionRate: settings?.defaultCommissionRate || 0,
          autoUpdateProducts: enabled,
        },
      })
    );
  };

  const handleCommissionTriggerChange = (trigger: string) => {
    dispatch(
      updateCommissionSettingsRequest({
        data: { commissionTrigger: trigger },
      })
    );
  };

  const handleRemoveProduct = (productId: string) => {
    dispatch(deleteProductCommissionRequest({ productId }));
    // Reload products after delete
    loadProductCommissions();
  };

  const handlePageChange = useCallback(
    (page: number) => {
      loadProductCommissions({ page });
    },
    [loadProductCommissions]
  );

  const handlePageSizeChange = useCallback(
    (limit: number) => {
      loadProductCommissions({ page: 1, limit });
    },
    [loadProductCommissions]
  );

  const handleSearchChange = useCallback(
    (search: string) => {
      loadProductCommissions({ page: 1, search });
    },
    [loadProductCommissions]
  );

  const handleCategoryChange = useCallback(
    (categoryNames: string[]) => {
      setCategoryNamesFilter(categoryNames);
      loadProductCommissions({ page: 1, categoryNames });
    },
    [loadProductCommissions]
  );

  const handleAddProducts = () => {
    productDialog.open();
  };

  const handleConfirmProducts = (selectedProducts: Product[]) => {
    const products = selectedProducts.map((p) => ({
      productId: p.id,
    }));

    dispatch(
      addProductCommissionsRequest({
        products,
        onSuccess: () => {
          productDialog.close();
          showSuccess(t('productAdded'));
          // Reload products
          loadProductCommissions({ page: 1, limit: 10 });
        },
      })
    );
  };

  const handleEditDefaultRate = () => {
    editDefaultRateDialog.open();
  };

  const handleEditProduct = (productId: string, currentRate: number) => {
    setEditingProductId(productId);
    setEditingProductRate(currentRate);
    editDialog.open();
  };

  const handleSaveEditedRate = (productId: string, rate: number) => {
    dispatch(
      updateProductCommissionRequest({
        productId,
        rate,
        onSuccess: () => {
          editDialog.close();
          showSuccess(t('commissionRateUpdated'));
          // Reload products
          loadProductCommissions();
        },
      })
    );
  };

  const handleBulkEdit = (selectedIds: string[]) => {
    setSelectedProductIds(selectedIds);
    bulkEditDialog.open();
  };

  const handleApplyBulkRate = (rate: number) => {
    dispatch(
      bulkUpdateProductCommissionsRequest({
        productIds: selectedProductIds,
        rate,
        onSuccess: () => {
          bulkEditDialog.close();
          setSelectedProductIds([]);
          showSuccess(t('bulkUpdateSuccess'));
          // Reload products
          loadProductCommissions();
        },
      })
    );
  };

  const handleSaveDefaultRate = (rate: number) => {
    dispatch(
      updateCommissionSettingsRequest({
        data: {
          defaultCommissionRate: rate,
          autoUpdateProducts: settings?.autoUpdateProducts || false,
        },
        onSuccess: () => {
          editDefaultRateDialog.close();
          loadSettings(); // Reload settings to refresh displayed data
          loadProductCommissions(); // Reload products to refresh table data
          // Toast already shown by saga
        },
      })
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Commission Settings Section */}
        <CommissionSettingsSection
          defaultRate={settings?.defaultCommissionRate || 0}
          autoAddEnabled={settings?.autoUpdateProducts || false}
          commissionTrigger={settings?.commissionTrigger as unknown as string}
          onDefaultRateChange={handleDefaultRateChange}
          onAutoAddChange={handleAutoAddChange}
          onCommissionTriggerChange={handleCommissionTriggerChange}
          onEditDefaultRate={handleEditDefaultRate}
          disabled={updateSettingsLoading}
        />

        {/* Product Table */}
        <CommissionProductTable
          products={transformedProducts}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onRemoveProduct={handleRemoveProduct}
          onAddProducts={handleAddProducts}
          onBulkEdit={(selectedIds) => {
            setSelectedProductIds(selectedIds);
            bulkEditDialog.open();
          }}
          onEditProduct={handleEditProduct}
          onImportExcel={importDialog.open}
        />
      </Stack>

      {/* Bulk Edit Dialog */}
      <BulkEditCommissionDialog
        open={bulkEditDialog.isOpen}
        selectedCount={selectedProductIds.length}
        onClose={bulkEditDialog.close}
        onApply={handleApplyBulkRate}
      />

      {/* Edit Commission Dialog */}
      <EditCommissionDialog
        open={editDialog.isOpen}
        productId={editingProductId}
        currentRate={editingProductRate}
        onClose={editDialog.close}
        onSave={handleSaveEditedRate}
      />

      {/* Edit Default Commission Rate Dialog */}
      <EditDefaultCommissionRateDialog
        open={editDefaultRateDialog.isOpen}
        currentRate={settings?.defaultCommissionRate || 0}
        onClose={editDefaultRateDialog.close}
        onSave={handleSaveDefaultRate}
        disabled={updateSettingsLoading}
      />

      {/* Product Selection Dialog */}
      <ProductSelectionDialog
        open={productDialog.isOpen}
        onClose={productDialog.close}
        onConfirm={handleConfirmProducts}
        existingProductIds={existingProductIds}
        variant="simple"
        filterOutExisting={true}
        preSelectExisting={false}
        confirmLabel="addProduct"
        title="productList"
      />

      {/* Excel Import Dialog (global commission settings: affiliateId=null) */}
      <AffiliateProductCommissionExcelImportDialog
        open={importDialog.isOpen}
        onClose={importDialog.close}
        onComplete={() => {
          loadProductCommissions({ page: 1, limit: 10 });
        }}
        affiliateId={null}
      />
    </Box>
  );
}
