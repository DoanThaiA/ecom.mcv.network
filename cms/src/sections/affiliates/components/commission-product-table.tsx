import {
  Card,
  Stack,
  Button,
  Typography,
  Avatar,
  IconButton,
  Autocomplete,
  TextField,
  Chip,
  Box,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as ContentCopyIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { productCategoryRepository } from 'src/repositories/product-category.repository';
import type { ProductCategory } from 'src/types/gen/shared/shared/product-categories/product-category';
import { useTranslation } from 'react-i18next';
import { useReactTable, getCoreRowModel, type ColumnDef } from '@tanstack/react-table';
import {
  SearchBar,
  DataTable,
  TablePagination,
  ColumnVisibility,
  createSelectionColumn,
} from 'src/components/table';
import { useColumnVisibilityPersistence } from 'src/hooks';
import { formatPrice } from 'src/utils/format';
import { getCurrentBaseUrl } from 'src/utils/environment';
import { showSuccess } from 'src/utils/toast';

export interface CommissionProduct {
  id: string;
  productId: string;
  productCode: string;
  productImage: string;
  productName: string;
  costPrice: number;
  stock: number;
  commissionRate: number;
  estimatedCommission: number;
}

interface PendingProductOperation {
  operation: 'add' | 'update' | 'delete';
  productId: string;
  commissionRate?: number;
}

interface CommissionProductTableProps {
  products: CommissionProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearchChange: (search: string) => void;
  onCategoryChange: (categoryNames: string[]) => void;
  onRemoveProduct: (productId: string) => void;
  onAddProducts: () => void;
  onBulkEdit: (selectedIds: string[]) => void;
  onEditProduct: (productId: string, currentRate: number) => void;
  onImportExcel?: () => void;
  pendingOperations?: Map<string, PendingProductOperation>;
  readOnly?: boolean;
  affiliateCode?: string;
}

export function CommissionProductTable({
  products,
  pagination,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onCategoryChange,
  onRemoveProduct,
  onAddProducts,
  onBulkEdit,
  onEditProduct,
  onImportExcel,
  pendingOperations,
  readOnly = false,
  affiliateCode,
}: CommissionProductTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>([]);

  // Helper function to generate affiliate link for a product
  const getAffiliateLinkForProduct = (productId: string): string => {
    return `${getCurrentBaseUrl()}/products/${productId}?ref=${affiliateCode}`;
  };

  // Handler to copy affiliate link
  const handleCopyLink = (productId: string) => {
    const link = getAffiliateLinkForProduct(productId);
    navigator.clipboard.writeText(link);
    showSuccess(t('linkCopied'));
  };

  // Ref to prevent duplicate category requests
  const categoriesPendingRef = useRef<Set<string>>(new Set());

  // Load categories with deduplication
  const loadCategories = useCallback(() => {
    const requestKey = 'product-categories-200';

    // Check if request is already pending
    if (categoriesPendingRef.current.has(requestKey)) {
      return;
    }

    // Mark request as pending
    categoriesPendingRef.current.add(requestKey);

    productCategoryRepository
      .getProductCategories({ page: 1, limit: 200 })
      .then(setCategories)
      .catch(() => {})
      .finally(() => {
        // Remove from pending after request completes
        setTimeout(() => {
          categoriesPendingRef.current.delete(requestKey);
        }, 100);
      });
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const [columnVisibility, setColumnVisibility] =
    useColumnVisibilityPersistence('agent-commission-table');

  const selectedIds = useMemo(() => {
    return Object.keys(rowSelection)
      .filter((key) => rowSelection[key])
      .map((index) => products[Number(index)]?.productId)
      .filter(Boolean);
  }, [rowSelection, products]);

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
  };

  const columns = useMemo<ColumnDef<CommissionProduct>[]>(
    () => [
      ...(readOnly ? [] : [createSelectionColumn<CommissionProduct>()]),
      {
        id: 'productCode',
        accessorKey: 'productCode',
        header: t('productCode'),
        size: 120,
      },
      {
        id: 'productImage',
        header: t('image'),
        size: 80,
        cell: ({ row }) => (
          <Avatar
            src={row.original.productImage}
            alt={row.original.productName}
            sx={{ width: 50, height: 50 }}
            variant="rounded"
          />
        ),
      },
      {
        id: 'productName',
        accessorKey: 'productName',
        header: t('name'),
        size: 250,
        cell: ({ row, getValue }) => (
          <Typography
            sx={{
              color: 'primary.main',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
            onClick={() => navigate(`/product/${row.original.productId}`)}
          >
            {getValue() as string}
          </Typography>
        ),
      },
      {
        id: 'costPrice',
        accessorKey: 'costPrice',
        header: t('sellingPrice'),
        size: 120,
        cell: ({ getValue }) => formatPrice(getValue() as number),
      },
      {
        id: 'stock',
        accessorKey: 'stock',
        header: t('stock'),
        size: 100,
      },
      {
        id: 'commissionRate',
        accessorKey: 'commissionRate',
        header: t('commissionRate'),
        size: 140,
        cell: ({ row }) => (
          <Typography sx={{ fontSize: 14 }}>{row.original.commissionRate}%</Typography>
        ),
      },
      {
        id: 'estimatedCommission',
        accessorKey: 'estimatedCommission',
        header: t('estimatedCommission'),
        size: 150,
        cell: ({ getValue }) => formatPrice(getValue() as number),
      },
      // Conditionally add affiliate link column only when affiliateCode is provided
      ...(affiliateCode
        ? [
            {
              id: 'affiliateLink',
              header: t('affiliateLink'),
              size: 80,
              cell: ({ row }: any) => (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Tooltip title={t('affiliateLink')} placement="top">
                    <IconButton
                      size="small"
                      onClick={() => handleCopyLink(row.original.productId)}
                      sx={{
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ),
            },
          ]
        : []),
      // Conditionally add actions column only when NOT in read-only mode
      ...(!readOnly
        ? [
            {
              id: 'actions',
              header: t('actions'),
              size: 100,
              cell: ({ row }: any) => (
                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    size="small"
                    onClick={() =>
                      onEditProduct(row.original.productId, row.original.commissionRate)
                    }
                  >
                    <EditIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => onRemoveProduct(row.original.productId)}>
                    <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
                  </IconButton>
                </Stack>
              ),
            },
          ]
        : []),
    ],
    [t, onRemoveProduct, onEditProduct, readOnly, handleCopyLink, affiliateCode]
  );

  const table = useReactTable({
    data: products,
    columns,
    state: {
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      },
    },
    pageCount: pagination.totalPages,
    enableRowSelection: !readOnly,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function'
          ? updater({ pageIndex: pagination.page - 1, pageSize: pagination.limit })
          : updater;

      const newPage = newPagination.pageIndex + 1;
      const newLimit = newPagination.pageSize;

      if (newPage !== pagination.page) {
        onPageChange(newPage);
      }
      if (newLimit !== pagination.limit) {
        onPageSizeChange(newLimit);
      }
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card sx={{ boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 2 }}>
      <Stack sx={{ p: 2 }} spacing={2}>
        {/* Title */}
        <Typography sx={{ fontSize: 18, fontWeight: 600 }}>{t('productList')}</Typography>

        {/* Search and Filters */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Autocomplete
            multiple
            size="small"
            options={categories}
            getOptionLabel={(opt) => opt.name}
            value={selectedCategories}
            onChange={(_, value) => {
              setSelectedCategories(value);
              // Immediately trigger category filter
              onCategoryChange(value.map((c) => c.name));
            }}
            renderInput={(params) => <TextField {...params} placeholder={t('category')} />}
            sx={{ minWidth: 250 }}
          />

          <SearchBar
            value={searchQuery}
            onChange={handleSearchInputChange}
            onSearch={() => onSearchChange(searchQuery)}
            placeholder={t('search')}
          />

          <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
            {t('selected')}: {selectedIds.length}
          </Typography>
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {!readOnly && (
            <>
              {onImportExcel && (
                <Button variant="outlined" startIcon={<UploadIcon />} onClick={onImportExcel}>
                  {t('importExcel')}
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={() => onBulkEdit(selectedIds)}
                disabled={selectedIds.length === 0}
              >
                {t('editCommissionRate')}
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onAddProducts}
                sx={{ bgcolor: '#0165FC' }}
              >
                {t('addProduct')}
              </Button>
            </>
          )}
          <ColumnVisibility table={table} />
        </Stack>
      </Stack>

      {/* Table */}
      <DataTable table={table} />

      {/* Pagination */}
      <TablePagination
        table={table}
        totalItems={pagination.total}
        pageSize={pagination.limit}
        onPageSizeChange={onPageSizeChange}
      />
    </Card>
  );
}
