import {
  Box,
  Button,
  Card,
  CircularProgress,
  Switch,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { FileDownloadOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnPinningState,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { FilterButton } from 'src/components/filter';
import {
  ColumnVisibility,
  DataTable,
  SearchBar,
  TablePagination,
  createSelectionColumn,
} from 'src/components/table';
import { TableImagePreview } from 'src/components/table-image-preview';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { useColumnVisibilityPersistence, useDialog } from 'src/hooks';
import {
  getProductsRequest,
  selectProductLoading,
  selectProductPagination,
  selectProducts,
  selectToggleStatusLoading,
  toggleProductStatusRequest,
} from 'src/redux/store/productSlice';
import { productRepository } from 'src/repositories';
import { showError } from 'src/utils/toast';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  defaultProductFilterValues,
  ProductFilterDrawer,
  type ProductFilterValues,
} from 'src/sections/product';
import type { Product } from 'src/types';
import { ProductStatus } from 'src/types/gen/shared/shared/common/enums';
import { formatPrice, formatNumber } from 'src/utils/format';

// ----------------------------------------------------------------------

// Status color mapping based on Figma design
const getStatusColor = (status: ProductStatus): string => {
  switch (status) {
    case ProductStatus.PRODUCT_STATUS_NEW:
      return '#0165FC';
    case ProductStatus.PRODUCT_STATUS_ACTIVE:
      return '#178B30';
    case ProductStatus.PRODUCT_STATUS_DISCONTINUED:
      return '#FF9500';
    case ProductStatus.PRODUCT_STATUS_OUT_OF_STOCK:
    default:
      return '#000000';
  }
};

// Status translation key mapping
const getStatusKey = (status: ProductStatus): string => {
  switch (status) {
    case ProductStatus.PRODUCT_STATUS_NEW:
      return 'new';
    case ProductStatus.PRODUCT_STATUS_ACTIVE:
      return 'selling';
    case ProductStatus.PRODUCT_STATUS_DISCONTINUED:
      return 'stopped';
    case ProductStatus.PRODUCT_STATUS_OUT_OF_STOCK:
      return 'outOfStock';
    default:
      return 'new';
  }
};

export default function ProductPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const products = useAppSelector(selectProducts);
  const loading = useAppSelector(selectProductLoading);
  const pagination = useAppSelector(selectProductPagination);
  const toggleStatusLoading = useAppSelector(selectToggleStatusLoading);

  // Local state
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useColumnVisibilityPersistence('product-table');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [columnPinning] = useState<ColumnPinningState>({ right: ['actions'] });

  // Filter state
  const filterDrawer = useDialog();
  const [productFilters, setProductFilters] = useState<ProductFilterValues>(
    defaultProductFilterValues
  );

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (productFilters.categoryIds.length > 0) count += 1;
    if (productFilters.priceType || productFilters.priceRange.from || productFilters.priceRange.to)
      count += 1;
    if (
      productFilters.stockType ||
      productFilters.stockByParent ||
      productFilters.stockRange.from ||
      productFilters.stockRange.to
    )
      count += 1;
    if (productFilters.inventoryStatus) count += 1;
    if (productFilters.sellingStatus) count += 1;
    return count;
  }, [productFilters]);

  // Filter handlers
  const handleApplyFilter = useCallback(() => {
    setCurrentPage(1);
    filterDrawer.close();
  }, [filterDrawer]);

  const handleClearFilter = useCallback(() => {
    setProductFilters(defaultProductFilterValues);
    setCurrentPage(1);
  }, []);

  // Selected products logic
  const selectedRowIds = Object.keys(rowSelection);
  const selectedCount = selectedRowIds.length;
  const selectedProducts = selectedRowIds.map((index) => products[parseInt(index)]).filter(Boolean);

  // Export handler – debounced via disabled state while loading
  const handleExport = useCallback(async () => {
    setExportLoading(true);
    try {
      const blob = await productRepository.exportProducts({
        search: searchQuery || undefined,
        status: productFilters.sellingStatus ? String(productFilters.sellingStatus) : undefined,
        categoryIds: productFilters.categoryIds.length > 0 ? productFilters.categoryIds : undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `san-pham-${dayjs().format('YYYY-MM-DD')}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showError(t('exportFailed'));
    } finally {
      setExportLoading(false);
    }
  }, [searchQuery, productFilters.sellingStatus, productFilters.categoryIds, t]);

  // Bulk hide/show handlers
  const handleBulkHide = useCallback(() => {
    if (selectedProducts.length === 0) return;
    const items = selectedProducts.map((product) => ({
      productId: product.id,
      hide: true,
    }));
    dispatch(toggleProductStatusRequest({ items }));
    setRowSelection({});
  }, [selectedProducts, dispatch]);

  const handleBulkShow = useCallback(() => {
    if (selectedProducts.length === 0) return;
    const items = selectedProducts.map((product) => ({
      productId: product.id,
      hide: false,
    }));
    dispatch(toggleProductStatusRequest({ items }));
    setRowSelection({});
  }, [selectedProducts, dispatch]);

  // Set page title
  useEffect(() => {
    setTitle(t('product_management'));
  }, [t, setTitle]);

  // Fetch products when filters change
  useEffect(() => {
    const filters: { search?: string; status?: ProductStatus; categoryIds?: string[] } = {};

    if (searchQuery) {
      filters.search = searchQuery;
    }

    // Map sellingStatus filter to API status field
    if (productFilters.sellingStatus) {
      filters.status = productFilters.sellingStatus as ProductStatus;
    }

    // Map category filter to API categoryIds field
    if (productFilters.categoryIds.length > 0) {
      filters.categoryIds = productFilters.categoryIds;
    }

    const sort =
      sorting.length > 0
        ? sorting.map((s) => ({
            orderBy: s.id,
            order: s.desc ? ('desc' as const) : ('asc' as const),
          }))
        : undefined;

    dispatch(
      getProductsRequest({
        page: currentPage,
        limit: pageSize,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        sort,
      })
    );
  }, [
    dispatch,
    currentPage,
    pageSize,
    searchQuery,
    sorting,
    productFilters.sellingStatus,
    productFilters.categoryIds,
  ]);

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      createSelectionColumn<Product>(),
      {
        accessorKey: 'images',
        header: t('image'),
        size: 85,
        enableSorting: false,
        cell: ({ row }) => (
          <TableImagePreview
            src={row.original.images?.avatar}
            alt={row.original.name}
            width={85}
            height={100}
            sx={{ borderRadius: '10px' }}
          />
        ),
      },
      {
        accessorKey: 'barcode',
        header: t('barcode'),
        size: 114,
        cell: ({ getValue }) => {
          const value = getValue() as string | null;
          return <Typography variant="body2">{value || '--'}</Typography>;
        },
      },
      {
        accessorKey: 'code',
        header: t('productCode'),
        size: 131,
      },
      {
        accessorKey: 'name',
        header: t('productName'),
        size: 249,
        cell: ({ row, getValue }) => (
          <Typography
            variant="body2"
            sx={{
              color: '#235AFF',
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
            onClick={() => navigate(`/product/${row.original.id}`)}
          >
            {getValue() as string}
          </Typography>
        ),
      },
      {
        accessorKey: 'prices.import',
        header: t('costPrice'),
        size: 109,
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ textAlign: 'right' }}>
            {formatPrice(row.original.prices?.import)}
          </Typography>
        ),
      },
      {
        accessorKey: 'prices.retail',
        header: t('sellingPrice'),
        size: 104,
        cell: ({ row }) => (
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2">{formatPrice(row.original.prices?.retail)}</Typography>
            {row.original.vat && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                VAT: {row.original.vat}%
              </Typography>
            )}
          </Box>
        ),
      },
      {
        accessorKey: 'stock',
        header: t('stock'),
        size: 88,
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ textAlign: 'right' }}>
            {formatNumber(row.original.inventory?.remain)}
          </Typography>
        ),
      },
      {
        id: 'inTransit',
        header: t('inTransit'),
        size: 121,
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ textAlign: 'right' }}>
            {formatNumber(row.original.inventory?.shipping)}
          </Typography>
        ),
      },
      {
        id: 'inWarehouse',
        header: t('inWarehouse'),
        size: 121,
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ textAlign: 'right' }}>
            {formatNumber(row.original.inventory?.remain)}
          </Typography>
        ),
      },
      {
        id: 'onHold',
        header: t('onHold'),
        size: 121,
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ textAlign: 'right' }}>
            {formatNumber(row.original.inventory?.holding)}
          </Typography>
        ),
      },
      {
        id: 'canSell',
        header: t('canSell'),
        size: 105,
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ textAlign: 'right' }}>
            {formatNumber(row.original.inventory?.available)}
          </Typography>
        ),
      },
      {
        accessorKey: 'status',
        header: t('sellingStatus'),
        size: 99,
        cell: ({ getValue }) => {
          const status = getValue() as ProductStatus;
          const statusKey = getStatusKey(status);
          const statusColor = getStatusColor(status);
          return (
            <Typography
              variant="body2"
              sx={{
                textAlign: 'right',
                color: statusColor,
              }}
            >
              {t(statusKey)}
            </Typography>
          );
        },
      },
      {
        id: 'actions',
        header: t('hidden'),
        size: 80,
        enableSorting: false,
        cell: ({ row }) => {
          const isHidden = row.original.hide ?? false;
          const isLoading = toggleStatusLoading[row.original.id] ?? false;
          return (
            <Switch
              checked={isHidden}
              onChange={() => {
                dispatch(
                  toggleProductStatusRequest({
                    items: [{ productId: row.original.id, hide: !isHidden }],
                  })
                );
              }}
              size="small"
              disabled={isLoading}
            />
          );
        },
      },
    ],
    [t, navigate, dispatch, toggleStatusLoading]
  );

  // Mock data for summary row - will be replaced with API data later
  const summaryData = useMemo(
    () => ({
      stock: 10000,
      inTransit: 10000,
      inWarehouse: 10000,
      onHold: 10000,
      canSell: 10000,
    }),
    []
  );

  // Summary row component - sticky positioned below header
  const summaryRow = useMemo(
    () => (
      <TableRow
        sx={{
          bgcolor: '#F7F8FA',
          position: 'sticky',
          top: 56, // Height of header row (single line with nowrap)
          zIndex: 4,
          '& td': {
            borderBottom: '2px solid #E5E6EB',
            borderRight: '1px solid #E5E6EB',
            py: 0.5,
            px: 2,
            fontWeight: 600,
            fontSize: 14,
            color: '#1C252E',
            bgcolor: '#F7F8FA',
          },
          '& td:last-child': {
            borderRight: 'none',
          },
        }}
      >
        {/* Merged cell for "Tổng" label - spans from selection to selling price (7 columns) */}
        <TableCell colSpan={7} sx={{ textAlign: 'right' }}>
          <Typography variant="body1" fontWeight={500} color={'#000'}>
            {t('total')}
          </Typography>
        </TableCell>
        {/* Stock */}
        <TableCell sx={{ textAlign: 'right' }}>
          <Typography variant="body1" fontWeight={500} color={'#000'}>
            {formatNumber(summaryData.stock)}
          </Typography>
        </TableCell>
        {/* In Transit */}
        <TableCell sx={{ textAlign: 'right' }}>
          <Typography variant="body1" fontWeight={500} color={'#000'}>
            {formatNumber(summaryData.inTransit)}
          </Typography>
        </TableCell>
        {/* In Warehouse */}
        <TableCell sx={{ textAlign: 'right' }}>
          <Typography variant="body1" fontWeight={500} color={'#000'}>
            {formatNumber(summaryData.inWarehouse)}
          </Typography>
        </TableCell>
        {/* On Hold */}
        <TableCell sx={{ textAlign: 'right' }}>
          <Typography variant="body1" fontWeight={500} color={'#000'}>
            {formatNumber(summaryData.onHold)}
          </Typography>
        </TableCell>
        {/* Can Sell */}
        <TableCell sx={{ textAlign: 'right' }}>
          <Typography variant="body1" fontWeight={500} color={'#000'}>
            {formatNumber(summaryData.canSell)}
          </Typography>
        </TableCell>
        {/* Status - empty */}
        <TableCell />
        {/* Actions - empty */}
        <TableCell />
      </TableRow>
    ),
    [t, summaryData]
  );

  const table = useReactTable({
    data: products,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnPinning,
      pagination: {
        pageIndex: currentPage - 1, // TanStack uses 0-based index
        pageSize: pageSize,
      },
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater({ pageIndex: currentPage - 1, pageSize }) : updater;
      setCurrentPage(newPagination.pageIndex + 1); // Convert back to 1-based
      setPageSize(newPagination.pageSize);
    },
    enableRowSelection: true,
    enableColumnPinning: true,
    manualPagination: true, // Server-side pagination
    manualSorting: true, // Server-side sorting
    manualFiltering: true, // Server-side filtering
    pageCount: pagination?.totalPages ?? 0,
    getCoreRowModel: getCoreRowModel(),
  });

  const renderEmptyState = () => {
    if (loading) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('loading')}...</Typography>
        </Box>
      );
    }

    if (products.length === 0 && !searchQuery && !productFilters.sellingStatus) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('noData')}</Typography>
        </Box>
      );
    }

    if (products.length === 0 && (searchQuery || productFilters.sellingStatus)) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('noSearchResults')}</Typography>
        </Box>
      );
    }

    return null;
  };

  return (
    <>
      <Helmet>
        <title>{`${t('product_management')} - ${CONFIG.appName}`}</title>
        <meta name="description" content="Product Management" />
        <meta name="keywords" content="cchat,cms,product" />
      </Helmet>

      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - var(--layout-header-desktop-height) - 16px)',
          overflow: 'hidden',
        }}
      >
        {/* Search Bar - Sticky */}
        <Card
          sx={{
            mb: 2,
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            zIndex: 10,
            bgcolor: 'background.paper',
          }}
        >
          <SearchBar
            value={inputValue}
            onChange={setInputValue}
            placeholder={t('searchByNameOrCode')}
            showSearchButton
            onSearch={() => {
              setSearchQuery(inputValue);
              setCurrentPage(1);
            }}
            renderActions={() => (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {selectedCount > 0 && (
                  <>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mr: 1 }}>
                      {t('selected')}: {selectedCount}
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={handleBulkHide}
                      startIcon={<VisibilityOff />}
                    >
                      {t('hideAll')}
                    </Button>
                    <Button
                      variant="outlined"
                      color="success"
                      size="small"
                      onClick={handleBulkShow}
                      startIcon={<Visibility />}
                    >
                      {t('showAll')}
                    </Button>
                  </>
                )}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleExport}
                  disabled={exportLoading}
                  startIcon={
                    exportLoading ? <CircularProgress size={16} /> : <FileDownloadOutlined />
                  }
                >
                  {t('exportExcel')}
                </Button>
                <FilterButton onClick={() => filterDrawer.open()} activeCount={activeFilterCount} />
                <ColumnVisibility table={table} />
              </Box>
            )}
          />
        </Card>

        {/* Table Container - Scrollable */}
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Card
            sx={{
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
            }}
          >
            {renderEmptyState() || <DataTable table={table} enableRowSelection />}
          </Card>
        </Box>

        {/* Pagination - Sticky */}
        <TablePagination
          table={table}
          totalItems={pagination?.total ?? 0}
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setCurrentPage(1); // Reset to first page when page size changes
          }}
        />
      </Box>

      {/* Filter Drawer */}
      <ProductFilterDrawer
        open={filterDrawer.isOpen}
        onClose={filterDrawer.close}
        filters={productFilters}
        onFiltersChange={setProductFilters}
        onApply={handleApplyFilter}
        onClear={handleClearFilter}
      />
    </>
  );
}
