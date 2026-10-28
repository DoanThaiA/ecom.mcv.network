import {
  Avatar,
  Box,
  Button,
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
import { productCategoryRepository } from 'src/repositories/product-category.repository';
import type { ProductCategory } from 'src/types/gen/shared/shared/product-categories/product-category';

// ----------------------------------------------------------------------

interface CategorySelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (categories: ProductCategory[]) => void;
  existingCategoryIds: string[];
  /** Dialog title - defaults to 'categoryList' */
  title?: string;
  /** Confirm button label - defaults to 'addCategory' */
  confirmLabel?: string;
  /** Whether to pre-select existing categories (show them as checked) */
  preSelectExisting?: boolean;
  /** Whether to filter out existing categories from the list */
  filterOutExisting?: boolean;
  /** Whether to allow only single selection - defaults to false */
  singleSelect?: boolean;
}

export function CategorySelectionDialog({
  open,
  onClose,
  onConfirm,
  existingCategoryIds,
  title = 'categoryList',
  confirmLabel = 'addCategory',
  preSelectExisting = true,
  filterOutExisting = false,
  singleSelect = false,
}: CategorySelectionDialogProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  // Cache selected categories across pages to prevent losing selections when navigating
  // Using ref for synchronous updates - state updates are async and may not be ready when confirm is clicked
  const selectedCategoriesCacheRef = useRef<Map<string, ProductCategory>>(new Map());

  // Use ref to store existingCategoryIds to avoid recreating fetchCategories
  const existingCategoryIdsRef = useRef(existingCategoryIds);

  // Update ref when existingCategoryIds changes (deep comparison)
  // Only update if dialog is closed to avoid unnecessary re-renders during dialog interaction
  useEffect(() => {
    if (!open) {
      const idsString = JSON.stringify([...existingCategoryIds].sort());
      const refIdsString = JSON.stringify([...existingCategoryIdsRef.current].sort());
      if (idsString !== refIdsString) {
        existingCategoryIdsRef.current = existingCategoryIds;
      }
    }
  }, [existingCategoryIds, open]);

  // Update ref immediately when dialog opens
  useEffect(() => {
    if (open) {
      existingCategoryIdsRef.current = existingCategoryIds;
    }
  }, [open, existingCategoryIds]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productCategoryRepository.getProductCategories({
        page: currentPage,
        limit: pageSize,
        filters: {
          search: searchQuery || undefined,
        },
      });

      let filteredData = data || [];

      // Filter out existing categories if configured (use ref to avoid dependency)
      if (filterOutExisting) {
        filteredData = filteredData.filter((c) => !existingCategoryIdsRef.current.includes(c.id));
      }

      setCategories(filteredData);
      // Note: API doesn't return total, so we estimate it
      setTotalItems(filteredData.length);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, filterOutExisting]);

  // Fetch categories when page/pageSize/search changes
  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open, currentPage, pageSize, searchQuery, fetchCategories]);

  // Reset state only when dialog opens
  useEffect(() => {
    if (open) {
      // Pre-select existing categories if configured (use ref to avoid dependency)
      const initialSelection: RowSelectionState = {};
      if (preSelectExisting) {
        existingCategoryIdsRef.current.forEach((id) => {
          initialSelection[id] = true;
        });
      }
      setRowSelection(initialSelection);
      setSearchQuery('');
      setCurrentPage(1);
      selectedCategoriesCacheRef.current = new Map();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, preSelectExisting]);

  // Update selected categories cache when selection or categories change
  // Using ref so updates are synchronous and available immediately in handleConfirm
  useEffect(() => {
    const cache = selectedCategoriesCacheRef.current;
    // Add newly selected categories from current page to cache
    categories.forEach((category) => {
      if (rowSelection[category.id]) {
        cache.set(category.id, category);
      }
    });
    // Remove deselected categories from cache
    Array.from(cache.keys()).forEach((id) => {
      if (!rowSelection[id]) {
        cache.delete(id);
      }
    });
  }, [rowSelection, categories]);

  // Define table columns
  const columns = useMemo<ColumnDef<ProductCategory>[]>(
    () => [
      createSelectionColumn<ProductCategory>(),
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
        id: 'categoryName',
        header: t('categoryName'),
        size: 250,
        cell: ({ row }) => (
          <Box>
            <Typography
              variant="body2"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 230,
                fontWeight: 500,
              }}
            >
              {row.original.name || '-'}
            </Typography>
            {row.original.slug && (
              <Typography variant="caption" color="text.secondary">
                {row.original.slug}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        id: 'categoryCode',
        header: t('categoryCode'),
        size: 120,
        cell: ({ row }) => <Typography variant="body2">{row.original.code || '-'}</Typography>,
      },
    ],
    [t]
  );

  // Handle row selection change with single select support
  const handleRowSelectionChange = useCallback(
    (updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;

      // Update cache synchronously when selection changes
      const cache = selectedCategoriesCacheRef.current;
      categories.forEach((category) => {
        if (newSelection[category.id]) {
          cache.set(category.id, category);
        } else if (cache.has(category.id)) {
          cache.delete(category.id);
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
          const selectedCategory = categories.find((c) => c.id === latestKey);
          if (selectedCategory) {
            cache.set(latestKey, selectedCategory);
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
    [singleSelect, rowSelection, categories]
  );

  const table = useReactTable({
    data: categories,
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
    // Only return newly selected categories (exclude existing ones) - use ref to avoid dependency
    const newCategoryIds = Object.keys(rowSelection).filter(
      (id) => !existingCategoryIdsRef.current.includes(id)
    );

    // Get categories from cache (includes categories from all pages)
    // Also check current page categories as fallback in case cache hasn't updated yet
    const selectedCategories = newCategoryIds
      .map(
        (id) => selectedCategoriesCacheRef.current.get(id) || categories.find((c) => c.id === id)
      )
      .filter((c): c is ProductCategory => !!c);

    onConfirm(selectedCategories);
  };

  // Count only newly selected categories (exclude existing ones) - use ref to avoid dependency
  const newSelectedCount = useMemo(() => {
    return Object.keys(rowSelection).filter((id) => !existingCategoryIdsRef.current.includes(id))
      .length;
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
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('searchCategories')}
            showSearchButton
            onSearch={() => setCurrentPage(1)}
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
          disabled={newSelectedCount === 0}
          sx={{
            bgcolor: '#0165FC',
            '&:hover': {
              bgcolor: '#0052CC',
            },
          }}
        >
          {t(confirmLabel)} {newSelectedCount > 0 && `(${newSelectedCount})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
