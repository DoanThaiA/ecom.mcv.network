import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  IconButton,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ProductSelectionDialog } from 'src/components/dialog';
import { SearchBar, TablePagination } from 'src/components/table';
import { DiscountType } from 'src/types/gen/shared/shared/common/enums';
import type {
  FlashSaleProductResponse,
  FlashSaleProductsPage,
} from 'src/types/gen/shared/shared/flash-sales/flash-sale';
import type { BulkUpdateFlashSaleProductItem } from 'src/types/gen/cms/cms/flash-sales/flash-sale';
import type { Product } from 'src/types/gen/shared/shared/products/product';
import type { FlashSaleProductIdResponse } from 'src/repositories/flash-sale.repository';
import { parseDiscountType } from 'src/utils/enum-converter';
import { formatPrice } from 'src/utils/format';
import { ExcelImportDialog } from './excel-import-dialog';

// Helper function to convert FlashSaleProductResponse to BulkUpdateFlashSaleProductItem
// If original is provided, only include changed fields. Otherwise, include all defined fields.
export function toBulkUpdateItem(
  product: FlashSaleProductResponse,
  original?: FlashSaleProductResponse
): BulkUpdateFlashSaleProductItem {
  const item: BulkUpdateFlashSaleProductItem = {
    productId: product.productId,
    order: product.order ?? 0,
  };

  // If no original provided, include all defined fields (legacy behavior)
  if (!original) {
    if (product.discountType !== undefined) {
      item.discountType = product.discountType;
    }
    if (product.discountValue !== undefined) {
      item.discountValue = product.discountValue;
    }
    if (product.promotionalQuantity !== undefined) {
      item.promotionalQuantity = product.promotionalQuantity;
    }
    if (product.isEnabled !== undefined) {
      item.isEnabled = product.isEnabled;
    }
    return item;
  }

  // With original: only include changed fields
  if (original.discountType !== product.discountType) {
    item.discountType = product.discountType;
  }
  if (original.discountValue !== product.discountValue) {
    item.discountValue = product.discountValue;
  }
  if (original.promotionalQuantity !== product.promotionalQuantity) {
    item.promotionalQuantity = product.promotionalQuantity;
  }
  if (original.isEnabled !== product.isEnabled) {
    item.isEnabled = product.isEnabled;
  }

  return item;
}

// ----------------------------------------------------------------------

const HEADER_COLUMNS = [
  { id: 'select', label: '', width: 50 },
  { id: 'order', label: 'order', width: 120 },
  { id: 'productCode', label: 'productCode', width: 100 },
  { id: 'productImage', label: 'image', width: 80 },
  { id: 'product', label: 'product', width: 200 },
  { id: 'originalPrice', label: 'originalPrice', width: 130 },
  { id: 'discountValue', label: 'discountAmount', width: 180 },
  { id: 'priceAfterDiscount', label: 'priceAfterDiscount', width: 130 },
  { id: 'promotionalQuantity', label: 'promotionalQuantity', width: 140 },
  { id: 'soldCount', label: 'soldCount', width: 100 },
  { id: 'isEnabled', label: 'onOff', width: 80 },
  { id: 'actions', label: 'actions', width: 80 },
];

// ----------------------------------------------------------------------

interface ProductListTabProps {
  products: FlashSaleProductResponse[];
  editedProductsMap?: Map<string, FlashSaleProductResponse>;
  flashSaleId?: string;
  onAddProduct?: (product: FlashSaleProductResponse) => void;
  onAddProducts?: (products: FlashSaleProductResponse[]) => void;
  onUpdateProduct?: (
    productId: string,
    data: {
      discountType?: number;
      discountValue?: number;
      promotionalQuantity?: number;
      isEnabled?: boolean;
      order?: number;
    }
  ) => void;
  onRemoveProduct?: (productId: string) => void;
  onToggleProduct?: (productId: string) => void;
  loading?: boolean;
  productsPagination?: FlashSaleProductsPage;
  totalProductCount?: number;
  onProductPageChange?: (page: number) => void;
  onProductPageSizeChange?: (pageSize: number) => void;
  onProductSearch?: (search: string) => void;
  startTime?: Date;
  endTime?: Date;
  onExcelImportRequest?: () => void;
  autoOpenExcelImport?: boolean;
  onValidationChange?: (hasErrors: boolean) => void;
  existingProductIds?: string[];
  hasLocalChanges?: boolean;
  flashSaleProductIds?: FlashSaleProductIdResponse[];
}

export function ProductListTab({
  products,
  editedProductsMap = new Map(),
  flashSaleId,
  onAddProduct,
  onAddProducts,
  onUpdateProduct,
  onRemoveProduct,
  onToggleProduct,
  loading = false,
  productsPagination,
  totalProductCount,
  onProductPageChange,
  onProductPageSizeChange,
  onProductSearch,
  startTime,
  endTime,
  onExcelImportRequest,
  autoOpenExcelImport,
  onValidationChange,
  existingProductIds,
  hasLocalChanges = false,
  flashSaleProductIds,
}: ProductListTabProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [orderErrors, setOrderErrors] = useState<Map<string, string>>(new Map());
  const [discountErrors, setDiscountErrors] = useState<Map<string, string>>(new Map());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Client-side pagination state for create mode
  const [clientPage, setClientPage] = useState(1);
  const [clientPageSize, setClientPageSize] = useState(10);

  // Function to find duplicate order numbers
  const findDuplicateOrders = useCallback(
    (products: FlashSaleProductResponse[]): Map<string, string> => {
      const errors = new Map<string, string>();
      const orderCounts = new Map<number, string[]>();

      products.forEach((p) => {
        if (p.order !== undefined && p.order !== null) {
          // Normalize to number to handle string/number mismatch
          const orderKey = typeof p.order === 'string' ? Number(p.order) : p.order;

          if (!orderCounts.has(orderKey)) {
            orderCounts.set(orderKey, []);
          }
          orderCounts.get(orderKey)!.push(p.productId);
        }
      });

      orderCounts.forEach((productIds) => {
        if (productIds.length > 1) {
          productIds.forEach((productId) => {
            errors.set(productId, t('duplicateOrderNumber'));
          });
        }
      });

      return errors;
    },
    [t]
  );

  // Function to collect discount validation errors from all products
  const findDiscountErrors = useCallback(
    (products: FlashSaleProductResponse[]): Map<string, string> => {
      const errors = new Map<string, string>();

      products.forEach((product) => {
        // Use product discount price if available (after product-discount program)
        // Otherwise fall back to original price
        const basePrice = product.productDiscountPrice ?? product.originalPrice ?? 0;
        const discountValue = product.discountValue ?? 0;
        const discountType = product.discountType;
        // Validate percentage discount
        if (
          discountType === DiscountType.DISCOUNT_TYPE_PERCENTAGE ||
          discountType.toString() === 'percentage'
        ) {
          if (discountValue > 100) {
            errors.set(product.productId, t('percentageValueMustBeLessThan100'));
          }
        }
        // Validate fixed discount
        else if (
          discountType === DiscountType.DISCOUNT_TYPE_FIXED ||
          discountType.toString() === 'fixed'
        ) {
          if (discountValue > basePrice) {
            errors.set(product.productId, t('discountCannotExceedPrice'));
          }
        }
      });

      return errors;
    },
    [t]
  );

  useEffect(() => {
    const editedProducts = Array.from(editedProductsMap.values());
    const serverProducts = (flashSaleProductIds || []).map((p) => ({
      productId: p.productId,
      order: p.order,
    })) as FlashSaleProductResponse[];

    // IMPORTANT: Order matters! Map deduplication keeps LAST occurrence of each productId.
    // Priority: serverProducts (lowest) < products (current page) < editedProducts (highest)
    const allProductsToCheck = [...serverProducts, ...products, ...editedProducts];

    const uniqueProducts = Array.from(
      new Map(allProductsToCheck.map((p) => [p.productId, p])).values()
    );

    // Group by order to see duplicates
    const orderGroups = new Map<number, string[]>();
    uniqueProducts.forEach((p) => {
      if (p.order !== undefined && p.order !== null) {
        const orderKey = typeof p.order === 'string' ? Number(p.order) : p.order;
        if (!orderGroups.has(orderKey)) {
          orderGroups.set(orderKey, []);
        }
        orderGroups.get(orderKey)!.push(p.productId?.substring(0, 8) || 'unknown');
      }
    });

    const errors = findDuplicateOrders(uniqueProducts);

    setOrderErrors(errors);
  }, [products, editedProductsMap, flashSaleProductIds, findDuplicateOrders]);

  // Validate discount values with 300ms debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const editedProducts = Array.from(editedProductsMap.values());
      const allProductsToCheck = [...products, ...editedProducts];

      const uniqueProducts = Array.from(
        new Map(allProductsToCheck.map((p) => [p.productId, p])).values()
      );

      const errors = findDiscountErrors(uniqueProducts);
      setDiscountErrors(errors);
    }, 300); // 300ms debounce

    // Cleanup: clear timeout if dependencies change before 300ms
    return () => clearTimeout(timeoutId);
  }, [products, editedProductsMap, findDiscountErrors]);

  // Propagate validation errors to parent
  useEffect(() => {
    const hasErrors = orderErrors.size > 0 || discountErrors.size > 0;
    onValidationChange?.(hasErrors);
  }, [orderErrors, discountErrors, onValidationChange]);

  useEffect(() => {
    if (autoOpenExcelImport && flashSaleId) {
      setOpenImportDialog(true);
    }
  }, [autoOpenExcelImport, flashSaleId]);

  const isServerPagination = !!productsPagination && !!onProductPageChange;

  // FIXED v1.0.380: Always use server page number when server pagination is enabled
  const currentPage = isServerPagination ? productsPagination?.page || 1 : clientPage;
  const pageSize = isServerPagination ? productsPagination?.limit || 10 : clientPageSize;

  // FIXED v1.0.379: Always use totalProductCount (correctly calculated by parent)
  // Parent calculates: backend total + added - deleted
  const totalItems = totalProductCount ?? products.length;
  const totalPages = Math.ceil((totalProductCount ?? products.length) / pageSize);

  // Use prop if provided (global product IDs), otherwise use current page products
  const effectExistingProductIds = useMemo(
    () => existingProductIds ?? products.map((p) => p.productId),
    [existingProductIds, products]
  );

  const displayProducts = useMemo(() => {
    // FIXED v1.0.380: Always use server pagination when enabled
    // Client-side pagination doesn't work because products array only contains current page
    // Added products are shown via merge logic in flash-sale-form.tsx (page 1 only)
    if (isServerPagination) {
      return products; // Server already paginated this
    }

    // Client-side pagination only for non-server-paginated scenarios
    let filtered = products;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = products.filter(
        (p) =>
          p.productId?.toLowerCase().includes(q) ||
          p.productName?.toLowerCase().includes(q) ||
          p.productCode?.toLowerCase().includes(q)
      );
    }

    // Slice for pagination (respect pageSize)
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [products, searchQuery, isServerPagination, currentPage, pageSize]);

  const allSelected =
    displayProducts.length > 0 && displayProducts.every((p) => selectedIds.has(p.productId));
  const someSelected = displayProducts.some((p) => selectedIds.has(p.productId));

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        displayProducts.forEach((p) => next.delete(p.productId));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        displayProducts.forEach((p) => next.add(p.productId));
        return next;
      });
    }
  };

  const handleToggleSelect = (productId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const handleAddProducts = (selectedProducts: Product[]) => {
    // FIXED v1.0.376: Handle both additions AND removals
    const currentFlashSaleIds = new Set(effectExistingProductIds);

    // Get IDs of all selected products (both full data and minimal {id} objects)
    const selectedProductIds = new Set(selectedProducts.map((p) => p.id));

    // 1. Find REMOVED products: in flash sale but NOT selected
    const removedProductIds = Array.from(currentFlashSaleIds).filter(
      (id) => !selectedProductIds.has(id)
    );

    // 2. Find ADDED products: selected with full data AND not in flash sale
    const newProducts = selectedProducts.filter((p) => {
      // Must have full data (not just minimal {id} object)
      const hasFullData = p.name !== undefined && p.code !== undefined;
      if (!hasFullData) {
        return false;
      }
      // Must not already exist in flash sale
      return !currentFlashSaleIds.has(p.id);
    });

    // Exit if no changes
    if (removedProductIds.length === 0 && newProducts.length === 0) {
      setOpenDialog(false);
      return;
    }

    // Remove unselected products
    removedProductIds.forEach((productId) => {
      onRemoveProduct?.(productId);
    });

    // Add new products
    if (newProducts.length > 0) {
      const maxOrder =
        displayProducts.length > 0 ? Math.max(...displayProducts.map((p) => p.order ?? 0)) : 0;
      const baseOrder = maxOrder;

      newProducts.forEach((p, index) => {
        const newProduct: FlashSaleProductResponse = {
          productId: p.id,
          productName: p.name,
          productCode: p.code,
          productImage: p.images?.avatar ?? undefined,
          originalPrice: p.prices?.retail,
          discountType: DiscountType.DISCOUNT_TYPE_FIXED,
          discountValue: 0,
          promotionalQuantity: 1,
          soldCount: 0,
          isEnabled: true,
          order: baseOrder + index + 1,
        };
        onAddProduct?.(newProduct);
      });
    }

    setOpenDialog(false);
  };

  const handleImportComplete = () => {
    setOpenImportDialog(false);
    // Refresh current page to sync imported products (don't navigate to page 1)
    if (onProductPageChange) {
      onProductPageChange(currentPage);
    }
  };

  // Fake table object for TablePagination compatibility
  const fakeTable = {
    getState: () => ({ pagination: { pageIndex: currentPage - 1, pageSize } }),
    setPageIndex: (idx: number) => {
      // FIXED v1.0.380: Always use server pagination when enabled
      if (isServerPagination) onProductPageChange?.(idx + 1);
      else setClientPage(idx + 1);
    },
    setPageSize: (size: number) => {
      // FIXED v1.0.380: Always use server pagination when enabled
      if (isServerPagination) onProductPageSizeChange?.(size);
      else {
        setClientPageSize(size);
        setClientPage(1);
      }
    },
    getPageCount: () => totalPages,
    getCanPreviousPage: () => currentPage > 1,
    getCanNextPage: () => currentPage < totalPages,
    previousPage: () => {
      // FIXED v1.0.380: Always use server pagination when enabled
      if (isServerPagination) onProductPageChange?.(currentPage - 1);
      else setClientPage((p) => Math.max(1, p - 1));
    },
    nextPage: () => {
      // FIXED v1.0.380: Always use server pagination when enabled
      if (isServerPagination) onProductPageChange?.(currentPage + 1);
      else setClientPage((p) => Math.min(totalPages, p + 1));
    },
  } as any;

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
        onChange={(value) => {
          setSearchQuery(value);
          if (!isServerPagination) setClientPage(1);
        }}
        placeholder={'search'}
        showSearchButton
        onSearch={() => {
          if (isServerPagination) onProductSearch?.(searchQuery);
        }}
        renderFarRightActions={() => (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<UploadFileIcon />}
              onClick={() => {
                if (!flashSaleId) onExcelImportRequest?.();
                else setOpenImportDialog(true);
              }}
              disabled={loading}
            >
              {t('importExcel')}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              disabled={loading}
              sx={{ bgcolor: '#0165FC', '&:hover': { bgcolor: '#0052CC' } }}
            >
              {t('addProduct')}
            </Button>
          </Stack>
        )}
      />

      {loading && <LinearProgress />}

      {/* Table */}
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          opacity: loading ? 0.5 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
          <Table sx={{ minWidth: 900 }} stickyHeader>
            <TableHead>
              <TableRow>
                {HEADER_COLUMNS.map((col) => (
                  <TableCell
                    key={col.id}
                    sx={{
                      bgcolor: '#F7F8FA',
                      fontWeight: 600,
                      fontSize: 14,
                      color: '#1C252E',
                      borderBottom: '2px solid #E5E6EB',
                      borderRight: '1px solid #E5E6EB',
                      py: 1,
                      px: col.id === 'select' ? 0 : 2,
                      width: col.width,
                      whiteSpace: 'nowrap',
                      textAlign: col.id === 'select' ? 'center' : 'left',
                      position: 'sticky',
                      top: 0,
                      zIndex: 5,
                      '&:last-child': { borderRight: 'none' },
                    }}
                  >
                    {col.id === 'select' ? (
                      <Box display="flex" justifyContent="center">
                        <Checkbox
                          checked={allSelected}
                          indeterminate={!allSelected && someSelected}
                          onChange={handleToggleSelectAll}
                          size="small"
                        />
                      </Box>
                    ) : (
                      t(col.label)
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {displayProducts.map((product, index) => (
                <ProductRow
                  key={product.productId}
                  product={product}
                  index={index}
                  selected={selectedIds.has(product.productId)}
                  editedProductsMap={editedProductsMap}
                  onToggleSelect={handleToggleSelect}
                  onUpdateProduct={onUpdateProduct}
                  onRemoveProduct={onRemoveProduct}
                  onToggleProduct={onToggleProduct}
                  loading={loading}
                  hasOrderError={orderErrors.has(product.productId)}
                  orderErrorMessage={orderErrors.get(product.productId)}
                  hasDiscountError={discountErrors.has(product.productId)}
                  discountErrorMessage={discountErrors.get(product.productId)}
                  navigate={navigate}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {totalItems > 0 && (
        <TablePagination
          table={fakeTable}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => {
            if (isServerPagination) onProductPageSizeChange?.(newPageSize);
            else {
              setClientPageSize(newPageSize);
              setClientPage(1);
            }
          }}
        />
      )}

      <ProductSelectionDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={handleAddProducts}
        existingProductIds={effectExistingProductIds}
        variant="simple"
        confirmLabel="addToFlashSale"
        preSelectExisting={true}
      />

      <ExcelImportDialog
        open={openImportDialog}
        onClose={() => setOpenImportDialog(false)}
        onComplete={handleImportComplete}
        startTime={startTime}
        endTime={endTime}
        flashSaleId={flashSaleId ?? ''}
      />
    </Card>
  );
}

// ----------------------------------------------------------------------

interface ProductRowProps {
  product: FlashSaleProductResponse;
  index: number;
  selected: boolean;
  editedProductsMap?: Map<string, FlashSaleProductResponse>;
  onToggleSelect: (productId: string) => void;
  onUpdateProduct?: (
    productId: string,
    data: {
      discountType?: number;
      discountValue?: number;
      promotionalQuantity?: number;
      isEnabled?: boolean;
      order?: number;
    }
  ) => void;
  onRemoveProduct?: (productId: string) => void;
  onToggleProduct?: (productId: string) => void;
  loading?: boolean;
  hasOrderError?: boolean;
  orderErrorMessage?: string;
  hasDiscountError?: boolean;
  discountErrorMessage?: string;
  navigate: (path: string) => void;
}

function ProductRow({
  product,
  index,
  selected,
  editedProductsMap = new Map(),
  onToggleSelect,
  onUpdateProduct,
  onRemoveProduct,
  onToggleProduct,
  loading,
  hasOrderError,
  orderErrorMessage,
  hasDiscountError,
  discountErrorMessage,
  navigate,
}: ProductRowProps) {
  const { t } = useTranslation();
  const [discountValue, setDiscountValue] = useState(String(product.discountValue ?? 0));
  const [promotionalQuantity, setPromotionalQuantity] = useState(
    String(product.promotionalQuantity ?? 0)
  );
  const [orderValue, setOrderValue] = useState(String(product.order ?? ''));

  // Sync local state with prop changes
  useEffect(() => {
    setDiscountValue(String(product.discountValue ?? 0));
  }, [product.discountValue]);

  useEffect(() => {
    setPromotionalQuantity(String(product.promotionalQuantity ?? 0));
  }, [product.promotionalQuantity]);

  // Check if this product has been edited
  const isEdited = editedProductsMap.has(product.productId);

  // Background color: light blue for edited, alternating white/gray for normal
  const bgColor = isEdited
    ? 'rgba(25, 118, 210, 0.08)' // Light blue for edited
    : index % 2 === 0
      ? 'white'
      : '#FAFBFC';

  const cellSx = {
    py: 1,
    px: 2,
    borderBottom: '1px solid #E5E6EB',
    borderRight: '1px solid #E5E6EB',
    bgcolor: bgColor,
    '&:last-child': { borderRight: 'none' },
  };

  return (
    <TableRow
      sx={{
        bgcolor: bgColor,
        '&:hover': {
          bgcolor: isEdited ? 'rgba(25, 118, 210, 0.12)' : '#F7F8FA',
        },
      }}
    >
      {/* Select */}
      <TableCell sx={{ ...cellSx, px: 0, textAlign: 'center' }}>
        <Box display="flex" justifyContent="center">
          <Checkbox
            checked={selected}
            onChange={() => onToggleSelect(product.productId)}
            size="small"
          />
        </Box>
      </TableCell>

      {/* Order */}
      <TableCell sx={cellSx}>
        <TextField
          size="small"
          type="number"
          value={orderValue}
          onChange={(e) => setOrderValue(e.target.value)}
          onBlur={() => {
            const n = orderValue === '' ? undefined : Number(orderValue);
            onUpdateProduct?.(product.productId, { order: n });
          }}
          disabled={loading}
          sx={{ width: 90 }}
          inputProps={{ min: 1 }}
          error={hasOrderError}
          helperText={hasOrderError ? orderErrorMessage : undefined}
          FormHelperTextProps={{
            sx: {
              position: 'absolute',
              bottom: -20,
              left: 0,
              fontSize: '0.7rem',
              whiteSpace: 'nowrap',
            },
          }}
        />
      </TableCell>

      {/* Product Code */}
      <TableCell sx={cellSx}>
        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          {product.productCode}
        </Typography>
      </TableCell>

      {/* Image */}
      <TableCell sx={cellSx}>
        <Avatar
          src={product.productImage}
          alt={product.productName}
          sx={{ width: 50, height: 50 }}
          variant="rounded"
        />
      </TableCell>

      {/* Product name */}
      <TableCell sx={cellSx}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            cursor: 'pointer',
            color: 'primary.main',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => navigate(`/product/${product.productId}`)}
        >
          {product.productName || product.productId}
        </Typography>
      </TableCell>

      {/* Original price */}
      <TableCell sx={cellSx}>
        {product.productDiscountPrice != null &&
        product.productDiscountPrice !== product.originalPrice ? (
          <>
            <Typography
              variant="body2"
              sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
            >
              {formatPrice(product.originalPrice || 0)}
            </Typography>
            <Typography variant="body2">{formatPrice(product.productDiscountPrice)}</Typography>
          </>
        ) : (
          <Typography variant="body2">{formatPrice(product.originalPrice || 0)}</Typography>
        )}
      </TableCell>

      {/* Discount value */}
      <TableCell sx={cellSx}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            type="number"
            value={discountValue}
            onChange={(e) => {
              const newValue = e.target.value;
              setDiscountValue(newValue);

              // Trigger validation while typing (with 300ms debounce in parent effect)
              onUpdateProduct?.(product.productId, { discountValue: Number(newValue) });
            }}
            disabled={loading}
            sx={{ width: 100 }}
            inputProps={{ min: 0 }}
            error={!!hasDiscountError}
            helperText={discountErrorMessage}
            FormHelperTextProps={{
              sx: {
                position: 'absolute',
                bottom: -20,
                left: 0,
                fontSize: '0.7rem',
                whiteSpace: 'nowrap',
              },
            }}
          />
          <Select
            size="small"
            value={parseDiscountType(product.discountType)}
            onChange={(e) => {
              onUpdateProduct?.(product.productId, {
                discountType: e.target.value as DiscountType,
                discountValue: 0,
              });
            }}
            disabled={loading}
            sx={{ minWidth: 60 }}
          >
            <MenuItem value={DiscountType.DISCOUNT_TYPE_FIXED}>đ</MenuItem>
            <MenuItem value={DiscountType.DISCOUNT_TYPE_PERCENTAGE}>%</MenuItem>
          </Select>
        </Stack>
      </TableCell>

      {/* Price after discount */}
      <TableCell sx={cellSx}>
        <Typography variant="body2">{formatPrice(product.discountPrice || 0)}</Typography>
      </TableCell>

      {/* Promotional quantity */}
      <TableCell sx={cellSx}>
        <TextField
          size="small"
          type="number"
          value={promotionalQuantity}
          onChange={(e) => setPromotionalQuantity(e.target.value)}
          onBlur={() =>
            onUpdateProduct?.(product.productId, {
              promotionalQuantity: Number(promotionalQuantity),
            })
          }
          disabled={loading}
          sx={{ width: 100 }}
          inputProps={{ min: 0 }}
        />
      </TableCell>

      {/* Sold count */}
      <TableCell sx={cellSx}>
        <Typography variant="body2">{product.soldCount || 0}</Typography>
      </TableCell>

      {/* On/Off */}
      <TableCell sx={cellSx}>
        <Switch
          checked={product.isEnabled}
          onChange={() => onToggleProduct?.(product.productId)}
          size="small"
          disabled={loading}
        />
      </TableCell>

      {/* Actions */}
      <TableCell sx={cellSx}>
        <IconButton
          size="small"
          sx={{ color: '#F62E2E' }}
          onClick={() => onRemoveProduct?.(product.productId)}
          disabled={loading}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
