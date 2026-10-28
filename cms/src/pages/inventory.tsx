import { Helmet } from 'react-helmet-async';
import { Box, Card, Typography } from '@mui/material';
import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { useColumnVisibilityPersistence } from 'src/hooks';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getInventoriesRequest,
  selectInventories,
  selectInventoryLoading,
  selectInventoryPagination,
} from 'src/redux/store/inventorySlice';
import type { ProductInventory } from 'src/types';
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table';
import {
  SearchBar,
  ColumnVisibility,
  DataTable,
  TablePagination,
  createSelectionColumn,
} from 'src/components/table';
import { TableImagePreview } from 'src/components/table-image-preview';
import { formatPrice } from 'src/utils/format';

// ----------------------------------------------------------------------

export default function InventoryPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();
  const dispatch = useAppDispatch();

  // Redux state
  const inventories = useAppSelector(selectInventories);
  const loading = useAppSelector(selectInventoryLoading);
  const pagination = useAppSelector(selectInventoryPagination);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useColumnVisibilityPersistence('inventory-table');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Set page title
  useEffect(() => {
    setTitle(t('inventory_management'));
  }, [t, setTitle]);

  // Fetch inventories when filters change
  useEffect(() => {
    const filters = searchQuery ? { search: searchQuery } : undefined;
    const sort =
      sorting.length > 0
        ? sorting.map((s) => ({
            orderBy: s.id,
            order: s.desc ? ('desc' as const) : ('asc' as const),
          }))
        : undefined;

    dispatch(
      getInventoriesRequest({
        page: currentPage,
        limit: pageSize,
        filters,
        sort,
      })
    );
  }, [dispatch, currentPage, pageSize, searchQuery, sorting]);

  const columns = useMemo<ColumnDef<ProductInventory>[]>(
    () => [
      createSelectionColumn<ProductInventory>(),
      {
        id: 'image',
        header: t('image'),
        size: 96,
        enableSorting: false,
        cell: ({ row }) => {
          // API may return images even if not in ProductInventory type
          const images = (row.original as any).images;
          const imageSrc = images?.avatar || '';

          if (imageSrc) {
            return (
              <TableImagePreview
                src={imageSrc}
                alt={row.original.productName || ''}
                width={80}
                height={80}
              />
            );
          }

          // Placeholder when no image available
          return (
            <Box
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'grey.200',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          );
        },
      },
      {
        accessorKey: 'sourceProductId',
        header: t('productCode'),
        size: 198,
      },
      {
        accessorKey: 'productName',
        header: t('productName'),
        size: 560,
        cell: ({ getValue }) => (
          <Typography variant="body2" sx={{ color: '#235AFF' }}>
            {getValue() as string}
          </Typography>
        ),
      },
      {
        id: 'prices',
        header: t('sellingPrice'),
        size: 417,
        enableSorting: false,
        cell: ({ row }) => (
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2">
              {t('sellingPrice')}: {formatPrice(row.original.prices?.retail ?? 0)}
            </Typography>
            <Typography variant="body2">
              {t('wholesalePrice')}: {formatPrice(row.original.prices?.wholesale ?? 0)}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: 'totalRemain',
        header: t('stockQuantity'),
        size: 165,
        cell: ({ getValue }) => (
          <Typography variant="body2" sx={{ textAlign: 'right' }}>
            {(getValue() as number).toLocaleString()}
          </Typography>
        ),
      },
    ],
    [t]
  );

  const table = useReactTable({
    data: inventories,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
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

    if (inventories.length === 0 && !searchQuery) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('noData')}</Typography>
        </Box>
      );
    }

    if (inventories.length === 0 && searchQuery) {
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
        <title>{`${t('inventory_management')} - ${CONFIG.appName}`}</title>
        <meta name="description" content="Inventory Management" />
        <meta name="keywords" content="cchat,cms,inventory" />
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
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('searchByNameOrCode')}
            showSearchButton
            renderActions={() => <ColumnVisibility table={table} />}
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
    </>
  );
}
