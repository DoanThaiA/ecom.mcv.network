import {
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type VisibilityState,
} from '@tanstack/react-table';

import { SearchBar, DataTable, TablePagination } from 'src/components/table';
import { ProductSelectionDialog } from 'src/components/dialog/product-selection-dialog';
import { ProductDiscountExcelImportDialog } from './product-discount-excel-import-dialog';
import { formatNumber } from 'src/utils/format';
import { parseDiscountType, DISCOUNT_TYPE_API } from 'src/utils/enum-converter';
import type { ProductDiscountProductForm, PromotionProductsPage } from 'src/types/promotion';
import type { Product } from 'src/types/gen/shared/shared/products/product';
import { DiscountType } from 'src/types/promotion';

// ----------------------------------------------------------------------

export interface ProductDiscountChanges {
  edited: ProductDiscountProductForm[];
  added: ProductDiscountProductForm[];
  deletedIds: string[];
}

interface ProductsTableSectionProps {
  products: ProductDiscountProductForm[];
  onProductsChange: (products: ProductDiscountProductForm[]) => void;
  onProductChanges?: (changes: ProductDiscountChanges) => void;
  onValidationChange?: (hasErrors: boolean) => void;
  disabled?: boolean;
  startTime?: Date;
  endTime?: Date;
  promotionId?: string;
  productsLoading?: boolean;
  productsPagination?: PromotionProductsPage;
  allProductIds?: string[];
  onProductPageChange?: (page: number) => void;
  onProductPageSizeChange?: (pageSize: number) => void;
  onProductSearch?: (search: string) => void;
  onRefreshProducts?: () => void;
  onExcelImportRequest?: () => void;
  autoOpenExcelImport?: boolean;
}

function calculateDiscountedPrice(
  originalPrice: number,
  discountType: DiscountType,
  discountValue: number
): number {
  let discountAmount: number;

  if (discountType === DiscountType.DISCOUNT_TYPE_PERCENTAGE) {
    discountAmount = Math.round((originalPrice * discountValue) / 100 / 1000) * 1000;
  } else {
    discountAmount = discountValue;
  }

  discountAmount = Math.min(discountAmount, originalPrice);
  return originalPrice - discountAmount;
}

// Per-product discount inline cell
const PerProductDiscountCell = React.memo(
  ({
    product,
    onUpdate,
    disabled,
  }: {
    product: ProductDiscountProductForm;
    onUpdate: (
      productId: string,
      data: { discountType?: DiscountType; discountValue?: number }
    ) => void;
    disabled: boolean;
  }) => {
    const { t } = useTranslation();
    const [localValue, setLocalValue] = useState(String(product.discountValue ?? 0));
    const [validationError, setValidationError] = useState<string>('');

    const validateDiscountValue = useCallback(
      (value: number, type: DiscountType, price: number): string => {
        if (type === DiscountType.DISCOUNT_TYPE_PERCENTAGE && value > 100) {
          return t('percentageValueMustBeLessThan100');
        }
        if (type === DiscountType.DISCOUNT_TYPE_FIXED && value > price) {
          return t('discountCannotExceedPrice');
        }
        return '';
      },
      [t]
    );

    useEffect(() => {
      setLocalValue(String(product.discountValue ?? 0));
    }, [product.discountValue]);

    // Re-validate when discountType or originalPrice changes
    useEffect(() => {
      const error = validateDiscountValue(
        Number(localValue) || 0,
        product.discountType,
        product.originalPrice
      );
      setValidationError(error);
    }, [product.discountType, product.originalPrice, localValue, validateDiscountValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      // Real-time validation
      const error = validateDiscountValue(
        Number(newValue) || 0,
        product.discountType,
        product.originalPrice
      );
      setValidationError(error);
      // Parent update removed - only happens on blur to prevent focus loss
    };

    const handleBlur = () => {
      // Validate
      const numValue = Number(localValue);
      const error = validateDiscountValue(numValue, product.discountType, product.originalPrice);
      setValidationError(error);

      // Update parent
      onUpdate(product.productId, { discountValue: numValue });
    };

    const handleTypeChange = (e: any) => {
      const newType = e.target.value as DiscountType;
      onUpdate(product.productId, {
        discountType: newType,
        discountValue: 0,
      });
      setLocalValue('0');
      setValidationError('');
    };

    return (
      <Stack direction="row" spacing={0.5} alignItems="center">
        <TextField
          key={product.productId}
          size="small"
          type="number"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          inputProps={{ min: 0 }}
          sx={{ width: 100 }}
          error={!!validationError}
          helperText={validationError}
        />
        <Select
          size="small"
          value={parseDiscountType(product.discountType)}
          onChange={handleTypeChange}
          disabled={disabled}
          sx={{ minWidth: 60 }}
        >
          <MenuItem value={DiscountType.DISCOUNT_TYPE_FIXED}>đ</MenuItem>
          <MenuItem value={DiscountType.DISCOUNT_TYPE_PERCENTAGE}>%</MenuItem>
        </Select>
      </Stack>
    );
  }
);

export function ProductsTableSection({
  products,
  onProductsChange,
  onProductChanges,
  onValidationChange,
  disabled = false,
  startTime,
  endTime,
  promotionId,
  productsLoading,
  productsPagination,
  allProductIds,
  onProductPageChange,
  onProductPageSizeChange,
  onProductSearch,
  onRefreshProducts,
  onExcelImportRequest,
  autoOpenExcelImport,
}: ProductsTableSectionProps) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [discountErrors, setDiscountErrors] = useState<Map<string, string>>(new Map());

  const isEditMode = !!promotionId;
  const isServerPagination = !!productsPagination && !!onProductPageChange;

  // Validation function for discount values
  const validateDiscountValue = useCallback(
    (value: number, type: DiscountType, price: number): string => {
      if (type === DiscountType.DISCOUNT_TYPE_PERCENTAGE && value > 100) {
        return t('percentageValueMustBeLessThan100');
      }
      if (type === DiscountType.DISCOUNT_TYPE_FIXED && value > price) {
        return t('discountCannotExceedPrice');
      }
      return '';
    },
    [t]
  );

  // Find all discount validation errors across products
  const findDiscountErrors = useCallback(
    (productsToValidate: ProductDiscountProductForm[]): Map<string, string> => {
      const errors = new Map<string, string>();

      productsToValidate.forEach((product) => {
        const originalPrice = product.originalPrice ?? 0;
        const discountValue = product.discountValue ?? 0;
        const discountType = product.discountType;

        const error = validateDiscountValue(discountValue, discountType, originalPrice);
        if (error) {
          errors.set(product.productId, error);
        }
      });

      return errors;
    },
    [validateDiscountValue]
  );

  // --- Deferred change tracking (edit mode only) ---
  const [editedProductsMap, setEditedProductsMap] = useState<
    Map<string, ProductDiscountProductForm>
  >(new Map());
  const [addedProductsMap, setAddedProductsMap] = useState<Map<string, ProductDiscountProductForm>>(
    new Map()
  );
  const [deletedProductIds, setDeletedProductIds] = useState<Set<string>>(new Set());

  // Reset tracking state when promotionId changes (different promotion loaded)
  useEffect(() => {
    setEditedProductsMap(new Map());
    setAddedProductsMap(new Map());
    setDeletedProductIds(new Set());
  }, [promotionId]);

  // Auto-open Excel import dialog when navigated from create page
  useEffect(() => {
    if (autoOpenExcelImport && promotionId) {
      setImportDialogOpen(true);
    }
  }, [autoOpenExcelImport, promotionId]);

  const currentPage = isServerPagination ? productsPagination?.page || 1 : 1;
  const pageSize = isServerPagination ? productsPagination?.limit || 10 : 10;
  const totalItems = isServerPagination ? productsPagination?.total || 0 : products.length;
  const totalPages = isServerPagination
    ? productsPagination?.totalPages || 1
    : Math.ceil(products.length / pageSize);

  // Use allProductIds if available (edit mode with fetched IDs), otherwise extract from current products
  const existingProductIds = useMemo(() => {
    if (Array.isArray(allProductIds) && allProductIds.length > 0) {
      return allProductIds;
    }
    return products.map((p) => p.productId);
  }, [allProductIds, products]);

  // Merge server products with local edits for display
  const displayProducts = useMemo(() => {
    const serverProducts = isServerPagination ? products : products;

    // Prepend added products (only on page 1 to avoid duplicates)
    const addedList =
      isEditMode && (!isServerPagination || currentPage === 1)
        ? Array.from(addedProductsMap.values()).filter(
            (p) => !serverProducts.some((s) => s.productId === p.productId)
          )
        : [];

    const merged = [...addedList, ...serverProducts];

    // Apply local edits on top
    return merged
      .filter((p) => !deletedProductIds.has(p.productId))
      .map((p) => editedProductsMap.get(p.productId) ?? p);
  }, [
    products,
    editedProductsMap,
    addedProductsMap,
    deletedProductIds,
    isEditMode,
    isServerPagination,
    currentPage,
  ]);

  // For client-side search in create mode
  const filteredProducts = useMemo(() => {
    if (isServerPagination) return displayProducts;
    if (!searchQuery.trim()) return displayProducts;
    const query = searchQuery.toLowerCase();
    return displayProducts.filter(
      (p) =>
        p.productId?.toLowerCase().includes(query) ||
        p.name?.toLowerCase().includes(query) ||
        p.code?.toLowerCase().includes(query)
    );
  }, [displayProducts, searchQuery, isServerPagination]);

  // Notify parent of pending changes whenever tracking state changes
  const notifyChanges = useCallback(
    (
      edited: Map<string, ProductDiscountProductForm>,
      added: Map<string, ProductDiscountProductForm>,
      deleted: Set<string>
    ) => {
      onProductChanges?.({
        edited: Array.from(edited.values()),
        added: Array.from(added.values()),
        deletedIds: Array.from(deleted),
      });
    },
    [onProductChanges]
  );

  // Validate all products and track errors (immediate)
  useEffect(() => {
    // Collect all products to validate
    const editedProducts = Array.from(editedProductsMap.values());
    const addedProducts = Array.from(addedProductsMap.values());
    const allProductsToCheck = [...displayProducts, ...editedProducts, ...addedProducts];

    // Remove duplicates
    const uniqueProducts = Array.from(
      new Map(allProductsToCheck.map((p) => [p.productId, p])).values()
    );

    const errors = findDiscountErrors(uniqueProducts);
    setDiscountErrors(errors);
  }, [displayProducts, editedProductsMap, addedProductsMap, findDiscountErrors]);

  // Notify parent of validation state
  useEffect(() => {
    const hasErrors = discountErrors.size > 0;
    onValidationChange?.(hasErrors);
  }, [discountErrors, onValidationChange]);

  const handleOpenDialog = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  const handleUpdateProduct = useCallback(
    (productId: string, data: { discountType?: DiscountType; discountValue?: number }) => {
      if (isEditMode) {
        // Update local state only — no API call
        const base =
          editedProductsMap.get(productId) ||
          addedProductsMap.get(productId) ||
          products.find((p) => p.productId === productId);

        if (!base) return;
        const updated = { ...base, ...data };

        if (addedProductsMap.has(productId)) {
          setAddedProductsMap((prev) => {
            const next = new Map(prev);
            next.set(productId, updated);
            notifyChanges(editedProductsMap, next, deletedProductIds);
            return next;
          });
        } else {
          setEditedProductsMap((prev) => {
            const next = new Map(prev);
            next.set(productId, updated);
            notifyChanges(next, addedProductsMap, deletedProductIds);
            return next;
          });
        }
      } else {
        onProductsChange(products.map((p) => (p.productId === productId ? { ...p, ...data } : p)));
      }
    },
    [isEditMode, products, deletedProductIds, onProductsChange, notifyChanges]
  );

  const handleAddProducts = useCallback(
    async (selectedProducts: Product[]) => {
      const newProducts: ProductDiscountProductForm[] = selectedProducts
        .filter((p) => !existingProductIds.includes(p.id))
        .map((p) => {
          const originalPrice = p.prices?.retail || 0;
          return {
            productId: p.id,
            name: p.name || '',
            image: p.images?.avatar || '',
            code: p.code || '',
            originalPrice,
            discountType: DiscountType.DISCOUNT_TYPE_FIXED,
            discountValue: 0,
            discountedPrice: originalPrice,
            soldCount: 0,
            isEnabled: true,
          };
        });

      if (isEditMode) {
        // Track as added — no immediate API call
        setAddedProductsMap((prev) => {
          const next = new Map(prev);
          newProducts.forEach((p) => next.set(p.productId, p));
          notifyChanges(editedProductsMap, next, deletedProductIds);
          return next;
        });
      } else {
        onProductsChange([...products, ...newProducts]);
      }

      setDialogOpen(false);
    },
    [
      products,
      existingProductIds,
      onProductsChange,
      isEditMode,
      editedProductsMap,
      deletedProductIds,
      notifyChanges,
    ]
  );

  const handleRemoveProduct = useCallback(
    (productId: string) => {
      if (isEditMode) {
        if (addedProductsMap.has(productId)) {
          // Never saved — just remove from added map
          setAddedProductsMap((prev) => {
            const next = new Map(prev);
            next.delete(productId);
            notifyChanges(editedProductsMap, next, deletedProductIds);
            return next;
          });
        } else {
          // Existing product — mark for deletion
          setDeletedProductIds((prev) => {
            const next = new Set(prev);
            next.add(productId);
            notifyChanges(editedProductsMap, addedProductsMap, next);
            return next;
          });
          setEditedProductsMap((prev) => {
            const next = new Map(prev);
            next.delete(productId);
            return next;
          });
        }
      } else {
        onProductsChange(products.filter((p) => p.productId !== productId));
      }
    },
    [
      products,
      onProductsChange,
      isEditMode,
      addedProductsMap,
      editedProductsMap,
      deletedProductIds,
      notifyChanges,
    ]
  );

  const handleToggleProduct = useCallback(
    (productId: string, isEnabled: boolean) => {
      if (isEditMode) {
        const base =
          editedProductsMap.get(productId) ||
          addedProductsMap.get(productId) ||
          products.find((p) => p.productId === productId);

        if (!base) return;
        const updated = { ...base, isEnabled };

        if (addedProductsMap.has(productId)) {
          setAddedProductsMap((prev) => {
            const next = new Map(prev);
            next.set(productId, updated);
            notifyChanges(editedProductsMap, next, deletedProductIds);
            return next;
          });
        } else {
          setEditedProductsMap((prev) => {
            const next = new Map(prev);
            next.set(productId, updated);
            notifyChanges(next, addedProductsMap, deletedProductIds);
            return next;
          });
        }
      } else {
        onProductsChange(
          products.map((p) => (p.productId === productId ? { ...p, isEnabled } : p))
        );
      }
    },
    [
      products,
      onProductsChange,
      isEditMode,
      editedProductsMap,
      addedProductsMap,
      deletedProductIds,
      notifyChanges,
    ]
  );

  const handleImportComplete = useCallback(() => {
    onRefreshProducts?.();
  }, [onRefreshProducts]);

  const columns = useMemo<ColumnDef<ProductDiscountProductForm>[]>(
    () => [
      {
        id: 'code',
        header: t('productCode'),
        size: 100,
        cell: ({ row }) => <Typography variant="body2">{row.original.code || '-'}</Typography>,
      },
      {
        id: 'image',
        header: t('image'),
        size: 80,
        cell: ({ row }) => (
          <Avatar src={row.original.image} variant="rounded" sx={{ width: 48, height: 48 }}>
            {row.original.name?.charAt(0)}
          </Avatar>
        ),
      },
      {
        id: 'name',
        header: t('productName'),
        size: 200,
        cell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {row.original.name}
          </Typography>
        ),
      },
      {
        id: 'originalPrice',
        header: t('originalPrice'),
        size: 130,
        cell: ({ row }) => (
          <Typography variant="body2">
            {formatNumber(row.original.originalPrice)} {t('currencyVND')}
          </Typography>
        ),
      },
      {
        id: 'discountAmount',
        header: t('discountAmount'),
        size: 180,
        cell: ({ row }) => (
          <PerProductDiscountCell
            product={row.original}
            onUpdate={handleUpdateProduct}
            disabled={disabled}
          />
        ),
      },
      {
        id: 'discountedPrice',
        header: t('discountedPrice'),
        size: 130,
        cell: ({ row }) => {
          const { originalPrice, discountType, discountValue } = row.original;
          const price = calculateDiscountedPrice(originalPrice, discountType, discountValue);
          return (
            <Typography variant="body2" sx={{ color: '#F44336', fontWeight: 500 }}>
              {formatNumber(price)} {t('currencyVND')}
            </Typography>
          );
        },
      },
      {
        id: 'soldCount',
        header: t('soldCount'),
        size: 100,
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            {row.original.soldCount}
          </Typography>
        ),
      },
      {
        id: 'isEnabled',
        header: t('enableDisable'),
        size: 80,
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Switch
              checked={row.original.isEnabled}
              onChange={(e) => handleToggleProduct(row.original.productId, e.target.checked)}
              disabled={disabled}
              color="primary"
            />
          </Box>
        ),
      },
      {
        id: 'actions',
        header: t('action'),
        size: 80,
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton
              size="small"
              onClick={() => handleRemoveProduct(row.original.productId)}
              disabled={disabled}
              sx={{ color: 'error.main' }}
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Box>
        ),
      },
    ],
    [t, handleUpdateProduct, handleToggleProduct, handleRemoveProduct, disabled]
  );

  const table = useReactTable({
    data: filteredProducts,
    columns,
    state: {
      columnVisibility,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
    },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater({ pageIndex: currentPage - 1, pageSize }) : updater;
      if (isServerPagination) {
        if (newPagination.pageSize !== pageSize) {
          onProductPageSizeChange?.(newPagination.pageSize);
        } else {
          onProductPageChange?.(newPagination.pageIndex + 1);
        }
      }
    },
    manualPagination: true,
    pageCount: totalPages,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card
      sx={{
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={'search'}
        showSearchButton={isServerPagination}
        onSearch={() => {
          if (isServerPagination) {
            onProductSearch?.(searchQuery);
          }
        }}
        renderFarRightActions={() => (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<UploadFileIcon />}
              onClick={() => {
                if (!promotionId) {
                  onExcelImportRequest?.();
                } else {
                  setImportDialogOpen(true);
                }
              }}
              disabled={disabled}
            >
              {t('importExcel')}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              disabled={disabled}
              sx={{
                bgcolor: '#0165FC',
                '&:hover': {
                  bgcolor: '#0052CC',
                },
              }}
            >
              {t('addProduct')}
            </Button>
          </Stack>
        )}
      />

      {/* Table */}
      {productsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : (
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <DataTable table={table} compact />
        </Box>
      )}

      {/* Pagination */}
      {totalItems > 0 && !productsLoading && (
        <TablePagination
          table={table}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => {
            if (isServerPagination) {
              onProductPageSizeChange?.(newPageSize);
            }
          }}
        />
      )}

      {/* Product Selection Dialog */}
      <ProductSelectionDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleAddProducts}
        existingProductIds={existingProductIds}
        title="productList"
        confirmLabel="addProduct"
        variant="simple"
        preSelectExisting={true}
        filterOutExisting={false}
      />

      {/* Excel Import Dialog (only available in edit mode with promotionId) */}
      {promotionId && (
        <ProductDiscountExcelImportDialog
          open={importDialogOpen}
          onClose={() => setImportDialogOpen(false)}
          onComplete={handleImportComplete}
          startTime={startTime}
          endTime={endTime}
          promotionId={promotionId}
        />
      )}
    </Card>
  );
}
