import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type RowSelectionState,
} from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchBar, DataTable, TablePagination, createSelectionColumn } from 'src/components/table';
import { productRepository } from 'src/repositories/product.repository';
import type { Product } from 'src/types/gen/shared/shared/products/product';
import { ProductStatus } from 'src/types/gen/shared/shared/common/enums';
import { formatNumber } from 'src/utils/format';

// ----------------------------------------------------------------------

export type ProductSelectionVariant = 'simple' | 'detailed';

interface ProductSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (products: Product[]) => void;
  existingProductIds: string[];
  /** Dialog title - defaults to 'productList' */
  title?: string;
  /** Confirm button label - defaults to 'addProduct' */
  confirmLabel?: string;
  /** Variant: 'simple' shows basic columns, 'detailed' shows all columns */
  variant?: ProductSelectionVariant;
  /** Whether to pre-select existing products (show them as checked) */
  preSelectExisting?: boolean;
  /** Whether to filter out existing products from the list */
  filterOutExisting?: boolean;
  /** Whether to allow only single selection - defaults to false */
  singleSelect?: boolean;
}

export function ProductSelectionDialog({
  open,
  onClose,
  onConfirm,
  existingProductIds,
  title = 'productList',
  confirmLabel = 'addProduct',
  variant = 'detailed',
  preSelectExisting = true,
  filterOutExisting = false,
  singleSelect = false,
}: ProductSelectionDialogProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  // Cache selected products across pages to prevent losing selections when navigating
  // Using ref for synchronous updates - state updates are async and may not be ready when confirm is clicked
  const selectedProductsCacheRef = useRef<Map<string, Product>>(new Map());

  // Use ref to store existingProductIds to avoid recreating fetchProducts
  const existingProductIdsRef = useRef(existingProductIds);

  // Update ref when existingProductIds changes (deep comparison)
  // Only update if dialog is closed to avoid unnecessary re-renders during dialog interaction
  useEffect(() => {
    if (!open) {
      const idsString = JSON.stringify([...existingProductIds].sort());
      const refIdsString = JSON.stringify([...existingProductIdsRef.current].sort());
      if (idsString !== refIdsString) {
        existingProductIdsRef.current = existingProductIds;
      }
    }
  }, [existingProductIds, open]);

  // Update ref immediately when dialog opens
  useEffect(() => {
    if (open) {
      existingProductIdsRef.current = existingProductIds;
    }
  }, [open, existingProductIds]);

  // Get status color
  const getStatusColor = (
    status?: ProductStatus
  ): 'success' | 'info' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case ProductStatus.PRODUCT_STATUS_ACTIVE:
        return 'success';
      case ProductStatus.PRODUCT_STATUS_INACTIVE:
        return 'warning';
      default:
        return 'default';
    }
  };

  // Get status label
  const getStatusLabel = (status?: ProductStatus): string => {
    switch (status) {
      case ProductStatus.PRODUCT_STATUS_ACTIVE:
        return t('active');
      case ProductStatus.PRODUCT_STATUS_INACTIVE:
        return t('inactive');
      default:
        return '-';
    }
  };

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productRepository.getProducts({
        page: currentPage,
        limit: pageSize,
        filters: {
          search: searchQuery || undefined,
          categoryIds: [],
          productIds: [],
        },
      });

      let data = response.data || [];

      // Filter out existing products if configured (use ref to avoid dependency)
      if (filterOutExisting) {
        data = data.filter((p) => !existingProductIdsRef.current.includes(p.id));
      }

      setProducts(data);
      setTotalItems(response.total || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, filterOutExisting]);

  // Fetch products when page/pageSize/search changes
  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open, currentPage, pageSize, searchQuery, fetchProducts]);

  // Reset state only when dialog opens
  useEffect(() => {
    if (open) {
      // Pre-select existing products if configured (use ref to avoid dependency)
      const initialSelection: RowSelectionState = {};
      if (preSelectExisting) {
        existingProductIdsRef.current.forEach((id) => {
          initialSelection[id] = true;
        });
      }
      setRowSelection(initialSelection);
      setInputValue('');
      setSearchQuery('');
      setCurrentPage(1);
      selectedProductsCacheRef.current = new Map();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, preSelectExisting]);

  // Update selected products cache when selection or products change
  // Using ref so updates are synchronous and available immediately in handleConfirm
  useEffect(() => {
    const cache = selectedProductsCacheRef.current;
    // Add newly selected products from current page to cache
    products.forEach((product) => {
      if (rowSelection[product.id]) {
        cache.set(product.id, product);
      }
    });
    // Remove deselected products from cache
    Array.from(cache.keys()).forEach((id) => {
      if (!rowSelection[id]) {
        cache.delete(id);
      }
    });
  }, [rowSelection, products]);

  // Simple columns (for flash sale)
  const simpleColumns = useMemo<ColumnDef<Product>[]>(
    () => [
      createSelectionColumn<Product>(),
      {
        id: 'index',
        header: '#',
        size: 50,
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            {(currentPage - 1) * pageSize + row.index + 1}
          </Typography>
        ),
      },
      {
        id: 'product',
        header: t('product'),
        size: 300,
        cell: ({ row }) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              src={row.original.images?.avatar}
              variant="rounded"
              sx={{ width: 40, height: 40 }}
            >
              {row.original.name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {row.original.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.original.code}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        id: 'price',
        header: t('price'),
        size: 150,
        cell: ({ row }) => (
          <Typography variant="body2">{formatNumber(row.original.prices?.retail || 0)}đ</Typography>
        ),
      },
      {
        id: 'stock',
        header: t('stockQuantity'),
        size: 100,
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            {row.original.inventory?.available || 0}
          </Typography>
        ),
      },
    ],
    [t, currentPage, pageSize]
  );

  // Detailed columns (for topic)
  const detailedColumns = useMemo<ColumnDef<Product>[]>(
    () => [
      createSelectionColumn<Product>(),
      {
        id: 'image',
        header: t('image'),
        size: 80,
        cell: ({ row }) => (
          <Avatar
            src={row.original.images?.avatar}
            variant="rounded"
            sx={{ width: 48, height: 48 }}
          >
            {row.original.name?.charAt(0)}
          </Avatar>
        ),
      },
      {
        id: 'barcode',
        header: t('barcode'),
        size: 120,
        cell: ({ row }) => <Typography variant="body2">{row.original.barcode || '-'}</Typography>,
      },
      {
        id: 'productCode',
        header: t('productCode'),
        size: 120,
        cell: ({ row }) => <Typography variant="body2">{row.original.code || '-'}</Typography>,
      },
      {
        id: 'productName',
        header: t('productName'),
        size: 250,
        cell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 230,
            }}
          >
            {row.original.name || '-'}
          </Typography>
        ),
      },
      {
        id: 'stock',
        header: t('stock'),
        size: 80,
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            {row.original.inventory?.available ?? '-'}
          </Typography>
        ),
      },
      {
        id: 'warehouseStock',
        header: t('inWarehouse'),
        size: 100,
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            {row.original.inventory?.remain ?? '-'}
          </Typography>
        ),
      },
      {
        id: 'status',
        header: t('status'),
        size: 120,
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Chip
              label={getStatusLabel(status)}
              size="small"
              color={getStatusColor(status)}
              variant="outlined"
            />
          );
        },
      },
    ],
    [t]
  );

  const columns = variant === 'simple' ? simpleColumns : detailedColumns;

  // Handle row selection change with single select support
  const handleRowSelectionChange = useCallback(
    (updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;

      // Update cache synchronously when selection changes
      const cache = selectedProductsCacheRef.current;
      products.forEach((product) => {
        if (newSelection[product.id]) {
          cache.set(product.id, product);
        } else if (cache.has(product.id)) {
          cache.delete(product.id);
        }
      });

      if (singleSelect) {
        // Find newly selected keys (not in previous selection)
        const newKeys = Object.keys(newSelection).filter(
          (key) => newSelection[key] && !rowSelection[key]
        );

        // If there's a new selection, keep only the latest one
        if (newKeys.length > 0) {
          const latestKey = newKeys[newKeys.length - 1];
          // Clear cache and keep only the latest selection
          cache.clear();
          const selectedProduct = products.find((p) => p.id === latestKey);
          if (selectedProduct) {
            cache.set(latestKey, selectedProduct);
          }
          setRowSelection({ [latestKey]: true });
        } else {
          // If deselecting, allow it
          setRowSelection(newSelection);
        }
      } else {
        setRowSelection(newSelection);
      }
    },
    [singleSelect, rowSelection, products]
  );

  const table = useReactTable({
    data: products,
    columns,
    state: {
      rowSelection,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: pageSize,
      },
    },
    onRowSelectionChange: handleRowSelectionChange,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater({ pageIndex: currentPage - 1, pageSize }) : updater;
      setCurrentPage(newPagination.pageIndex + 1);
      setPageSize(newPagination.pageSize);
    },
    enableRowSelection: true,
    manualPagination: true,
    pageCount: Math.ceil(totalItems / pageSize),
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  const handleConfirm = () => {
    // Get ALL selected IDs from rowSelection (includes pre-selected + newly selected)
    const allSelectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);

    // Try to get full Product objects from cache
    // For pre-selected products not in cache, create minimal Product object with just ID
    const selectedProducts = allSelectedIds.map((id) => {
      const cachedProduct = selectedProductsCacheRef.current.get(id);
      if (cachedProduct) {
        return cachedProduct; // Full product data
      }
      // Pre-selected product not in cache - return minimal object
      return { id } as Product;
    });

    onConfirm(selectedProducts);
  };

  // Count ALL selected products (including pre-existing ones)
  const totalSelectedCount = useMemo(() => {
    return Object.keys(rowSelection).filter((id) => rowSelection[id]).length;
  }, [rowSelection]);

  // Calculate if selection has changed from initial state
  const hasSelectionChanged = useMemo(() => {
    const currentSelectedIds = new Set(Object.keys(rowSelection));
    const existingIds = new Set(existingProductIdsRef.current);

    // Check if any product was added
    const hasNewProducts = Array.from(currentSelectedIds).some((id) => !existingIds.has(id));

    // Check if any existing product was removed
    const hasRemovedProducts = Array.from(existingIds).some((id) => !currentSelectedIds.has(id));

    return hasNewProducts || hasRemovedProducts;
  }, [rowSelection]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center' }}>
        <Typography sx={{ flex: 1, fontSize: 24 }}>{t(title)}</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {/* Search Bar */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <SearchBar
            value={inputValue}
            onChange={setInputValue}
            placeholder={t('searchProduct')}
            showSearchButton
            onSearch={() => {
              setSearchQuery(inputValue);
              setCurrentPage(1);
            }}
          />
        </Box>

        {/* Table */}
        <Box sx={{ height: 400, overflow: 'auto' }}>
          <DataTable table={table} enableRowSelection compact />
        </Box>

        {/* Pagination */}
        <TablePagination
          table={table}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setCurrentPage(1);
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          {t('close')}
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!hasSelectionChanged}
          sx={{
            bgcolor: '#0165FC',
            '&:hover': {
              bgcolor: '#0052CC',
            },
          }}
        >
          {t(confirmLabel)} {totalSelectedCount > 0 && `(${totalSelectedCount})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
