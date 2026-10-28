import { Box, Card } from '@mui/material';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { BasicInfoSection, ProductsTableSection, FormActionButtons } from './components';
import type { ProductDiscountChanges } from './components/products-table-section';
import {
  ProductDiscountSubType,
  type ProductDiscountProductForm,
  type PromotionProductsPage,
} from 'src/types/promotion';
import { showWarning } from 'src/utils/toast';

// ----------------------------------------------------------------------

export interface ProductDiscountFormData {
  name: string;
  subType: ProductDiscountSubType;
  startTime: Date | undefined;
  endTime: Date | undefined;
  isEnabled: boolean;
  voucherCode: string | undefined;
  minimumOrderValue: number;
  products: ProductDiscountProductForm[];
  totalUsageLimit: number | undefined;
  maxUsagePerCustomer: number | undefined;
  notApplicableWithOtherPromotions: boolean;
}

interface ProductDiscountFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<ProductDiscountFormData>;
  onSubmit: (data: ProductDiscountFormData, productChanges?: ProductDiscountChanges) => void;
  onCancel: () => void;
  onExcelImportRequest?: (formData: ProductDiscountFormData) => void;
  autoOpenExcelImport?: boolean;
  loading?: boolean;
  promotionId?: string;
  productsLoading?: boolean;
  productsPagination?: PromotionProductsPage;
  allProductIds?: string[];
  onProductPageChange?: (page: number) => void;
  onProductPageSizeChange?: (pageSize: number) => void;
  onProductSearch?: (search: string) => void;
  onRefreshProducts?: () => void;
}

const defaultFormData: ProductDiscountFormData = {
  name: '',
  subType: ProductDiscountSubType.PRODUCT_DISCOUNT_SUB_TYPE_AUTO_APPLY,
  startTime: undefined,
  endTime: undefined,
  isEnabled: true,
  voucherCode: undefined,
  minimumOrderValue: 0,
  products: [],
  totalUsageLimit: undefined,
  maxUsagePerCustomer: undefined,
  notApplicableWithOtherPromotions: false,
};

export function ProductDiscountForm({
  mode,
  initialData = {},
  onSubmit,
  onCancel,
  onExcelImportRequest,
  autoOpenExcelImport,
  loading = false,
  promotionId,
  productsLoading,
  productsPagination,
  allProductIds,
  onProductPageChange,
  onProductPageSizeChange,
  onProductSearch,
  onRefreshProducts,
}: ProductDiscountFormProps) {
  const { t } = useTranslation();
  const isInitializedRef = useRef(false);
  const pendingProductChangesRef = useRef<ProductDiscountChanges | undefined>(undefined);

  const [formData, setFormData] = useState<ProductDiscountFormData>({
    ...defaultFormData,
    ...initialData,
  });
  const [hasProductErrors, setHasProductErrors] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && initialData.name && !isInitializedRef.current) {
      isInitializedRef.current = true;
      setFormData({
        ...defaultFormData,
        ...initialData,
      });
    }
  }, [mode, initialData]);

  // Keep products in sync with parent (for server-side pagination in edit mode)
  useEffect(() => {
    if (mode === 'edit' && initialData.products) {
      setFormData((prev) => ({ ...prev, products: initialData.products! }));
    }
  }, [mode, initialData.products]);

  const handleSubTypeChange = useCallback((value: ProductDiscountSubType) => {
    setFormData((prev) => ({
      ...prev,
      subType: value,
      voucherCode:
        value === ProductDiscountSubType.PRODUCT_DISCOUNT_SUB_TYPE_VOUCHER
          ? prev.voucherCode
          : undefined,
    }));
  }, []);

  const handleNameChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, name: value }));
  }, []);

  const handleStartTimeChange = useCallback((value: Date | undefined) => {
    setFormData((prev) => ({ ...prev, startTime: value }));
  }, []);

  const handleEndTimeChange = useCallback((value: Date | undefined) => {
    setFormData((prev) => ({ ...prev, endTime: value }));
  }, []);

  const handleStatusChange = useCallback((value: boolean) => {
    setFormData((prev) => ({ ...prev, isEnabled: value }));
  }, []);

  const handleMinimumOrderValueChange = useCallback((value: number) => {
    setFormData((prev) => ({ ...prev, minimumOrderValue: value }));
  }, []);

  const handleVoucherCodeChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, voucherCode: value }));
  }, []);

  const handleProductsChange = useCallback((products: ProductDiscountProductForm[]) => {
    setFormData((prev) => ({ ...prev, products }));
  }, []);

  const handleTotalUsageLimitChange = useCallback((value: number | undefined) => {
    setFormData((prev) => ({ ...prev, totalUsageLimit: value }));
  }, []);

  const handleMaxUsagePerCustomerChange = useCallback((value: number | undefined) => {
    setFormData((prev) => ({ ...prev, maxUsagePerCustomer: value }));
  }, []);

  const handleNotApplicableWithOtherChange = useCallback((value: boolean) => {
    setFormData((prev) => ({ ...prev, notApplicableWithOtherPromotions: value }));
  }, []);

  const handleProductChanges = useCallback((changes: ProductDiscountChanges) => {
    pendingProductChangesRef.current = changes;
  }, []);

  const handleSubmit = useCallback(() => {
    onSubmit(formData, pendingProductChangesRef.current);
  }, [formData, onSubmit]);

  // Validation
  const isVoucherSubType =
    formData.subType === ProductDiscountSubType.PRODUCT_DISCOUNT_SUB_TYPE_VOUCHER;

  // In edit mode, products are managed via separate API - don't require products in form state
  const isValid =
    formData.name.trim() !== '' &&
    formData.startTime !== undefined &&
    formData.endTime !== undefined &&
    !hasProductErrors &&
    (!isVoucherSubType || (formData.voucherCode && formData.voucherCode.trim() !== ''));

  const handleExcelImportRequest = useCallback(() => {
    if (!isValid) {
      showWarning(t('pleaseFillRequiredFieldsBeforeImportPromotion'));
      return;
    }
    onExcelImportRequest?.(formData);
  }, [isValid, formData, onExcelImportRequest, t]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      {/* Form Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: { xs: 2, sm: 3 },
        }}
      >
        <Card sx={{ boxShadow: 'none', border: 'none' }}>
          <BasicInfoSection
            name={formData.name}
            startTime={formData.startTime}
            endTime={formData.endTime}
            isEnabled={formData.isEnabled}
            onNameChange={handleNameChange}
            onStartTimeChange={handleStartTimeChange}
            onEndTimeChange={handleEndTimeChange}
            onEnabledChange={handleStatusChange}
            disabled={loading}
            isEditMode={mode === 'edit'}
          />

          <ProductsTableSection
            products={formData.products}
            onProductsChange={handleProductsChange}
            onProductChanges={mode === 'edit' ? handleProductChanges : undefined}
            onValidationChange={setHasProductErrors}
            disabled={loading}
            startTime={formData.startTime}
            endTime={formData.endTime}
            promotionId={promotionId}
            productsLoading={productsLoading}
            productsPagination={productsPagination}
            allProductIds={allProductIds}
            onProductPageChange={onProductPageChange}
            onProductPageSizeChange={onProductPageSizeChange}
            onProductSearch={onProductSearch}
            onRefreshProducts={onRefreshProducts}
            onExcelImportRequest={mode === 'create' ? handleExcelImportRequest : undefined}
            autoOpenExcelImport={autoOpenExcelImport}
          />
        </Card>
      </Box>

      {/* Sticky Action Buttons */}
      <FormActionButtons
        mode={mode}
        loading={loading}
        isValid={isValid}
        onSubmit={handleSubmit}
        onCancel={onCancel}
      />
    </Box>
  );
}
