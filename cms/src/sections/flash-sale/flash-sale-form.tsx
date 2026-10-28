import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Button, Card, Stack, Tab } from '@mui/material';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { GeneralInfoTab, ProductListTab, toBulkUpdateItem } from './components';
import { parseDiscountType } from 'src/utils/enum-converter';
import { showWarning } from 'src/utils/toast';
import type {
  FlashSaleProductResponse,
  FlashSaleProductsPage,
} from 'src/types/gen/shared/shared/flash-sales/flash-sale';
import type { BulkUpdateFlashSaleProductItem } from 'src/types/gen/cms/cms/flash-sales/flash-sale';
import type { FlashSaleProductIdResponse } from 'src/repositories/flash-sale.repository';

// ----------------------------------------------------------------------

export interface FlashSaleFormData {
  name: string;
  startTime: Date | undefined;
  endTime: Date | undefined;
  isEnabled: boolean;
}

export interface FlashSaleProductChanges {
  editedProducts?: BulkUpdateFlashSaleProductItem[]; // For existing products (PATCH)
  addedProducts?: BulkUpdateFlashSaleProductItem[]; // For new products (POST)
  deletedProductIds?: string[];
}

interface FlashSaleFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<FlashSaleFormData>;
  initialProducts?: FlashSaleProductResponse[];
  flashSaleId?: string;
  onSubmit: (data: FlashSaleFormData, productChanges?: FlashSaleProductChanges) => void;
  onCancel: () => void;
  onExcelImportRequest?: (formData: FlashSaleFormData) => void;
  autoOpenExcelImport?: boolean;
  loading?: boolean;
  productsPagination?: FlashSaleProductsPage;
  onProductPageChange?: (page: number) => void;
  onProductPageSizeChange?: (pageSize: number) => void;
  onProductSearch?: (search: string) => void;
  paginationLoading?: boolean;
  flashSaleProductIds?: FlashSaleProductIdResponse[] | null;
  productIdsLoading?: boolean;
}

export function FlashSaleForm({
  mode,
  initialData = {},
  initialProducts = [],
  flashSaleId,
  onSubmit,
  onCancel,
  onExcelImportRequest,
  autoOpenExcelImport,
  loading = false,
  productsPagination,
  onProductPageChange,
  onProductPageSizeChange,
  onProductSearch,
  paginationLoading = false,
  flashSaleProductIds,
  productIdsLoading = false,
}: FlashSaleFormProps) {
  const { t } = useTranslation();
  // Form state
  const [formData, setFormData] = useState<FlashSaleFormData>({
    name: initialData.name || '',
    startTime: initialData.startTime,
    endTime: initialData.endTime,
    isEnabled: initialData.isEnabled ?? true, // Default to true (active)
  });

  // Products state - use FlashSaleProductResponse for UI display
  const [products, setProducts] = useState<FlashSaleProductResponse[]>(initialProducts);
  const originalProductsRef = useRef<FlashSaleProductResponse[]>(initialProducts);
  const initialProductsRef = useRef(initialProducts);
  const [hasProductErrors, setHasProductErrors] = useState(false);

  // Track all edited products across all pages (for pagination fix)
  const [editedProductsMap, setEditedProductsMap] = useState<Map<string, FlashSaleProductResponse>>(
    new Map()
  );

  // Track original values for comparison (needed for all pages, not just current)
  const [originalProductsMap, setOriginalProductsMap] = useState<
    Map<string, FlashSaleProductResponse>
  >(new Map());

  // Track explicitly deleted product IDs (for submission to DELETE API)
  const [deletedProductIds, setDeletedProductIds] = useState<Set<string>>(new Set());

  // Track newly added products (not yet saved to server)
  const [addedProductsMap, setAddedProductsMap] = useState<Map<string, FlashSaleProductResponse>>(
    new Map()
  );

  // Sync products when initialProducts changes (e.g., after fetch)
  // Normalize discountType from API (may be string) to enum
  useEffect(() => {
    // Deep comparison to avoid re-renders when array reference changes but content is the same
    const currentIds = initialProducts
      .map((p) => p.productId)
      .sort()
      .join(',');
    const prevIds = initialProductsRef.current
      .map((p) => p.productId)
      .sort()
      .join(',');

    // Only update if products actually changed
    if (currentIds !== prevIds || initialProducts.length !== initialProductsRef.current.length) {
      const normalizedProducts = initialProducts.map((p, index) => ({
        ...p,
        discountType: p.discountType
          ? parseDiscountType(p.discountType as any)
          : p.discountType || 0,
        order: p.order || index + 1,
      }));

      // FIXED: Merge with added products instead of overwriting
      // Added products appear at the top of the list
      // Only show added products on page 1 to avoid duplicates on other pages
      const currentPage = productsPagination?.page || 1;
      const addedProducts = currentPage === 1 ? Array.from(addedProductsMap.values()) : [];

      // Deduplicate: remove addedProducts that exist in normalizedProducts
      const normalizedIds = new Set(normalizedProducts.map((p) => p.productId));
      const uniqueAddedProducts = addedProducts.filter((p) => !normalizedIds.has(p.productId));

      const mergedProducts = [...uniqueAddedProducts, ...normalizedProducts];

      setProducts(mergedProducts);
      originalProductsRef.current = normalizedProducts; // Don't include added in ref
      initialProductsRef.current = initialProducts;

      // When new page of products loads, update original products map with fresh server data
      setOriginalProductsMap((prevMap) => {
        const newMap = new Map(prevMap);
        normalizedProducts.forEach((product) => {
          // Always update - ensures fresh data after refresh (no stale cache)
          newMap.set(product.productId, product);
        });
        return newMap;
      });
    }
  }, [initialProducts, addedProductsMap]);

  // Clear deleted and added products when form resets (new flash sale loaded)
  useEffect(() => {
    setDeletedProductIds(new Set());
    setAddedProductsMap(new Map());
  }, [flashSaleId]);

  // Compute display products: merge current page products with edited products
  // If product has been edited, use edited version for display
  const displayProducts = useMemo(() => {
    const result = products.map((product) => {
      const editedProduct = editedProductsMap.get(product.productId);
      return editedProduct || product;
    });

    return result;
  }, [products, editedProductsMap]);

  // Handle product changes (local state updates)
  const handleAddProduct = useCallback((product: FlashSaleProductResponse) => {
    setProducts((prev) => {
      // Check if product already exists
      if (prev.some((p) => p.productId === product.productId)) {
        return prev;
      }
      // Add new product and sort by order number
      const updated = [product, ...prev];
      return updated.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    });

    // Track in addedProductsMap for persistence across page changes
    setAddedProductsMap((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(product.productId, product);
      return newMap;
    });

    // Remove from deleted set if re-adding
    setDeletedProductIds((prevSet) => {
      const newSet = new Set(prevSet);
      newSet.delete(product.productId);
      return newSet;
    });
  }, []);

  // Batch add products (for Excel import - avoids multiple re-renders)
  const handleAddProducts = useCallback((newProducts: FlashSaleProductResponse[]) => {
    setProducts((prev) => {
      const existingIds = new Set(prev.map((p) => p.productId));
      const uniqueNewProducts = newProducts.filter((p) => !existingIds.has(p.productId));
      if (uniqueNewProducts.length === 0) return prev;
      // Add products and sort by order number
      const updated = [...uniqueNewProducts, ...prev];
      return updated.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    });

    // Track all new products in addedProductsMap
    setAddedProductsMap((prevMap) => {
      const newMap = new Map(prevMap);
      newProducts.forEach((p) => {
        newMap.set(p.productId, p);
      });
      return newMap;
    });

    // Remove from deleted set if re-adding
    setDeletedProductIds((prevSet) => {
      const newSet = new Set(prevSet);
      newProducts.forEach((p) => newSet.delete(p.productId));
      return newSet;
    });
  }, []);

  const handleUpdateProduct = useCallback(
    (
      productId: string,
      data: {
        discountType?: number;
        discountValue?: number;
        promotionalQuantity?: number;
        isEnabled?: boolean;
        order?: number;
      }
    ) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.productId === productId
            ? {
                ...p,
                ...data,
                // Ensure discountType is a number (enum)
                discountType: data.discountType !== undefined ? data.discountType : p.discountType,
              }
            : p
        )
      );

      // Check if this is a newly added product
      setAddedProductsMap((prevAdded) => {
        if (prevAdded.has(productId)) {
          // It's a new product - update in addedProductsMap
          const newMap = new Map(prevAdded);
          const product = prevAdded.get(productId);
          if (product) {
            newMap.set(productId, {
              ...product,
              ...data,
              discountType:
                data.discountType !== undefined ? data.discountType : product.discountType,
            });
          }
          return newMap;
        }
        return prevAdded; // No change if not in addedProductsMap
      });

      // Only update editedProductsMap if NOT in addedProductsMap
      setEditedProductsMap((prevEdited) => {
        // Check again if product is in addedProductsMap
        if (addedProductsMap.has(productId)) {
          return prevEdited; // Don't update editedProductsMap for new products
        }

        // It's an existing product - update in editedProductsMap
        const newMap = new Map(prevEdited);
        const existingProduct = prevEdited.get(productId);
        const currentProduct = existingProduct || products.find((p) => p.productId === productId);

        if (currentProduct) {
          newMap.set(productId, {
            ...currentProduct,
            ...data,
            discountType:
              data.discountType !== undefined ? data.discountType : currentProduct.discountType,
          });
        }
        return newMap;
      });
    },
    [products, addedProductsMap]
  );

  const handleRemoveProduct = useCallback(
    (productId: string) => {
      setProducts((prev) => prev.filter((p) => p.productId !== productId));

      // Check if this was a newly added product
      const wasNewlyAdded = addedProductsMap.has(productId);

      if (wasNewlyAdded) {
        // If it was newly added (not saved yet), just remove from addedProductsMap
        setAddedProductsMap((prevMap) => {
          const newMap = new Map(prevMap);
          newMap.delete(productId);
          return newMap;
        });
        // Don't add to deletedProductIds (it was never saved to server)
      } else {
        // If it was an existing product, track deletion for submission
        setDeletedProductIds((prevSet) => new Set(prevSet).add(productId));
      }

      // Remove from editedProductsMap and originalProductsMap regardless
      setEditedProductsMap((prevMap) => {
        const newMap = new Map(prevMap);
        newMap.delete(productId);
        return newMap;
      });
      setOriginalProductsMap((prevMap) => {
        const newMap = new Map(prevMap);
        newMap.delete(productId);
        return newMap;
      });
    },
    [addedProductsMap]
  );

  const handleToggleProduct = useCallback(
    (productId: string) => {
      setProducts((prev) =>
        prev.map((p) => (p.productId === productId ? { ...p, isEnabled: !p.isEnabled } : p))
      );

      // Check if this is a newly added product
      setAddedProductsMap((prevAdded) => {
        if (prevAdded.has(productId)) {
          // It's a new product - update in addedProductsMap
          const newMap = new Map(prevAdded);
          const product = prevAdded.get(productId);
          if (product) {
            newMap.set(productId, { ...product, isEnabled: !product.isEnabled });
          }
          return newMap;
        }
        return prevAdded;
      });

      // Only update editedProductsMap if NOT in addedProductsMap
      setEditedProductsMap((prevEdited) => {
        if (addedProductsMap.has(productId)) {
          return prevEdited;
        }

        const newMap = new Map(prevEdited);
        const existingProduct = prevEdited.get(productId);
        const currentProduct = existingProduct || products.find((p) => p.productId === productId);

        if (currentProduct) {
          newMap.set(productId, {
            ...currentProduct,
            isEnabled: !currentProduct.isEnabled,
          });
        }
        return newMap;
      });
    },
    [products, addedProductsMap]
  );

  const handleSubmit = () => {
    // Get edited products (existing products that were modified)
    const editedProducts = Array.from(editedProductsMap.values());

    // Get newly added products (new products not in original flash sale)
    const addedProducts = Array.from(addedProductsMap.values());

    // Convert edited products - include all fields (matches product-discount pattern)
    const convertedEditedProducts =
      editedProducts.length > 0
        ? editedProducts.map((product) => {
            // Don't pass original - ensures all fields are sent, not just changed ones
            return toBulkUpdateItem(product);
          })
        : [];

    // Convert added products - include all fields
    const convertedAddedProducts =
      addedProducts.length > 0
        ? addedProducts.map((product) => {
            return toBulkUpdateItem(product); // No original, so includes all defined fields
          })
        : [];

    const productChanges: FlashSaleProductChanges | undefined =
      convertedEditedProducts.length > 0 ||
      convertedAddedProducts.length > 0 ||
      deletedProductIds.size > 0
        ? {
            editedProducts: convertedEditedProducts, // Separate array for PATCH
            addedProducts: convertedAddedProducts, // Separate array for POST
            deletedProductIds: Array.from(deletedProductIds),
          }
        : undefined;

    onSubmit(formData, productChanges);
  };

  const handleExcelImportRequest = useCallback(() => {
    if (!formData.name || !formData.startTime || !formData.endTime) {
      showWarning(t('pleaseFillRequiredFieldsBeforeImport'));
      return;
    }
    onExcelImportRequest?.(formData);
  }, [formData, onExcelImportRequest, t]);

  const isValid = formData.name && formData.startTime && formData.endTime && !hasProductErrors;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      {/* Tabs Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: { xs: 2, sm: 3 },
        }}
      >
        <Card sx={{ boxShadow: 'none', border: 'none' }}>
          <GeneralInfoTab formData={formData} onChange={setFormData} loading={loading} />
          <ProductListTab
            products={displayProducts}
            editedProductsMap={editedProductsMap}
            flashSaleId={flashSaleId}
            onAddProduct={handleAddProduct}
            onAddProducts={handleAddProducts}
            onUpdateProduct={handleUpdateProduct}
            onRemoveProduct={handleRemoveProduct}
            onToggleProduct={handleToggleProduct}
            loading={paginationLoading}
            productsPagination={productsPagination}
            totalProductCount={
              (productsPagination?.total ?? displayProducts.length) +
              addedProductsMap.size -
              deletedProductIds.size
            }
            onProductPageChange={onProductPageChange}
            onProductPageSizeChange={onProductPageSizeChange}
            onProductSearch={onProductSearch}
            startTime={formData.startTime}
            endTime={formData.endTime}
            onExcelImportRequest={mode === 'create' ? handleExcelImportRequest : undefined}
            autoOpenExcelImport={autoOpenExcelImport}
            onValidationChange={setHasProductErrors}
            existingProductIds={
              Array.isArray(flashSaleProductIds)
                ? [
                    // FIXED v1.0.377: Filter out deleted products from pre-fill
                    ...flashSaleProductIds
                      .map((p) => p.productId)
                      .filter((id) => !deletedProductIds.has(id)),
                    ...Array.from(addedProductsMap.keys()),
                  ]
                : Array.from(addedProductsMap.keys())
            }
            hasLocalChanges={addedProductsMap.size > 0 || deletedProductIds.size > 0}
            flashSaleProductIds={flashSaleProductIds ?? undefined}
          />
        </Card>
      </Box>

      {/* Sticky Action Buttons */}
      <Box
        sx={{
          flexShrink: 0,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
          p: 2,
        }}
      >
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
            sx={{
              borderColor: '#E5E6EB',
              color: 'text.primary',
              '&:hover': {
                borderColor: '#C4C6CF',
                bgcolor: 'grey.50',
              },
            }}
          >
            {t('goBack')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !isValid}
            sx={{
              bgcolor: '#0165FC',
              '&:hover': {
                bgcolor: '#0052CC',
              },
            }}
          >
            {mode === 'create' ? t('addNew') : t('update')}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
