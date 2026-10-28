import { Box, Card, Typography, Chip, IconButton, Stack, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FilterButton } from 'src/components/filter';
import { useColumnVisibilityPersistence, useDialog } from 'src/hooks';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getCombosRequest,
  selectCombos,
  selectComboLoading,
  selectComboPagination,
  deleteComboRequest,
} from 'src/redux/store/comboSlice';
import type { ComboResponse as Combo } from 'src/types/gen/shared/shared/combos/combo';
import type { FilterCombo } from 'src/types/gen/cms/cms/combos/combo';
import {
  ComboStatus,
  comboStatusToJSON,
  DiscountType,
  discountTypeToJSON,
} from 'src/types/gen/shared/shared/common/enums';
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  type ColumnPinningState,
} from '@tanstack/react-table';
import {
  SearchBar,
  ColumnVisibility,
  DataTable,
  TablePagination,
  createSelectionColumn,
} from 'src/components/table';
import { DeleteConfirmDialog } from 'src/components/dialog';
import { TableImagePreview } from 'src/components/table-image-preview';
import { formatPrice, formatNumber, formatDate } from 'src/utils/format';

// ----------------------------------------------------------------------

const getComboStatusColor = (status: ComboStatus): 'success' | 'warning' | 'default' => {
  switch (status) {
    case ComboStatus.COMBO_STATUS_ACTIVE:
      return 'success';
    case ComboStatus.COMBO_STATUS_INACTIVE:
      return 'warning';
    default:
      return 'default';
  }
};

const getDiscountTypeLabel = (type: DiscountType, t: (key: string) => string): string => {
  switch (type) {
    case DiscountType.DISCOUNT_TYPE_FIXED:
      return t('fixedDiscount');
    case DiscountType.DISCOUNT_TYPE_PERCENTAGE:
      return t('percentageDiscount');
    default:
      return '-';
  }
};

export function ProductComboView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const combos = useAppSelector(selectCombos);
  const loading = useAppSelector(selectComboLoading);
  const pagination = useAppSelector(selectComboPagination);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    useColumnVisibilityPersistence('product-combo-table');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    right: ['actions'],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<ComboStatus | undefined>(undefined);

  const deleteDialog = useDialog<Combo>();

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter) count += 1;
    return count;
  }, [statusFilter]);

  // Fetch combos when filters change
  useEffect(() => {
    const filters: FilterCombo = {};

    if (searchQuery) {
      filters.search = searchQuery;
    }

    if (statusFilter) {
      filters.status = statusFilter;
    }

    const sort =
      sorting.length > 0
        ? sorting.map((s) => ({
            orderBy: s.id,
            order: s.desc ? ('desc' as const) : ('asc' as const),
          }))
        : undefined;

    dispatch(
      getCombosRequest({
        page: currentPage,
        limit: pageSize,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        sort,
      })
    );
  }, [dispatch, currentPage, pageSize, searchQuery, sorting, statusFilter]);

  const handleDeleteConfirm = async () => {
    if (deleteDialog.data) {
      dispatch(
        deleteComboRequest({
          id: deleteDialog.data.id,
          onSuccess: () => {
            deleteDialog.close();
            // Refresh the list
            dispatch(
              getCombosRequest({
                page: currentPage,
                limit: pageSize,
              })
            );
          },
        })
      );
    }
  };

  const columns = useMemo<ColumnDef<Combo>[]>(
    () => [
      createSelectionColumn<Combo>(),
      {
        accessorKey: 'image',
        header: t('image'),
        size: 85,
        enableSorting: false,
        cell: ({ row }) => (
          <TableImagePreview
            src={row.original.image || ''}
            alt={row.original.name}
            width={85}
            height={100}
          />
        ),
      },
      {
        accessorKey: 'name',
        header: t('comboProductName'),
        size: 250,
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
            onClick={() => navigate(`/product-combo/${row.original.id}`)}
          >
            {getValue() as string}
          </Typography>
        ),
      },
      {
        accessorKey: 'originalPrice',
        header: t('originalPrice'),
        size: 130,
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ textAlign: 'right' }}>
            {formatPrice(row.original.originalPrice)}
          </Typography>
        ),
      },
      {
        accessorKey: 'discountType',
        header: t('discountType'),
        size: 130,
        cell: ({ row }) => (
          <Typography variant="body2">
            {getDiscountTypeLabel(row.original.discountType, t)}
          </Typography>
        ),
      },
      {
        accessorKey: 'discountValue',
        header: t('discountValue'),
        size: 120,
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ textAlign: 'right' }}>
            {row.original.discountType === DiscountType.DISCOUNT_TYPE_PERCENTAGE
              ? `${row.original.discountValue}%`
              : formatPrice(row.original.discountValue)}
          </Typography>
        ),
      },
      {
        accessorKey: 'discountAmount',
        header: t('discountAmount'),
        size: 130,
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ textAlign: 'right', color: 'error.main' }}>
            -{formatPrice(row.original.discountAmount)}
          </Typography>
        ),
      },
      {
        accessorKey: 'finalPrice',
        header: t('finalPrice'),
        size: 130,
        cell: ({ row }) => (
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
              {formatPrice(row.original.finalPrice)}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: 'items',
        header: t('comboItems'),
        size: 120,
        enableSorting: false,
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            {row.original.items?.length || 0} {t('product').toLowerCase()}
          </Typography>
        ),
      },
      {
        accessorKey: 'validFrom',
        header: t('validFrom'),
        size: 130,
        cell: ({ row }) => (
          <Typography variant="body2">
            {row.original.validFrom
              ? formatDate(String(row.original.validFrom), 'DD/MM/YYYY')
              : '-'}
          </Typography>
        ),
      },
      {
        accessorKey: 'validTo',
        header: t('validTo'),
        size: 130,
        cell: ({ row }) => (
          <Typography variant="body2">
            {row.original.validTo ? formatDate(String(row.original.validTo), 'DD/MM/YYYY') : '-'}
          </Typography>
        ),
      },
      {
        accessorKey: 'status',
        header: t('status'),
        size: 140,
        cell: ({ getValue }) => {
          const status = getValue() as ComboStatus;
          const statusColor = getComboStatusColor(status);
          const statusKey =
            status === ComboStatus.COMBO_STATUS_ACTIVE ? 'comboActive' : 'comboInactive';
          return (
            <Chip
              label={t(statusKey)}
              size="small"
              color={statusColor}
              sx={{
                fontWeight: 500,
                borderRadius: '6px',
              }}
            />
          );
        },
      },
      {
        id: 'actions',
        header: t('actions'),
        size: 100,
        enableSorting: false,
        cell: ({ row }) => (
          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              sx={{ color: '#0165FC' }}
              onClick={() => navigate(`/product-combo/edit/${row.original.id}`)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              sx={{ color: '#F62E2E' }}
              onClick={() => deleteDialog.open(row.original)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ),
      },
    ],
    [t, navigate, deleteDialog]
  );

  const table = useReactTable({
    data: combos,
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
    onColumnPinningChange: setColumnPinning,
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

    if (combos.length === 0 && !searchQuery && !statusFilter) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('noData')}</Typography>
        </Box>
      );
    }

    if (combos.length === 0 && (searchQuery || statusFilter)) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('noSearchResults')}</Typography>
        </Box>
      );
    }

    return null;
  };

  return (
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
          renderActions={() => (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <ColumnVisibility table={table} />
            </Box>
          )}
          renderFarRightActions={() => (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/product-combo/create')}
              sx={{
                bgcolor: '#0165FC',
                '&:hover': {
                  bgcolor: '#0052CC',
                },
              }}
            >
              {t('addNew')}
            </Button>
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
          {renderEmptyState() || <DataTable table={table} enableRowSelection compact />}
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialog.isOpen}
        title="confirm"
        message={t('deleteComboMessage')}
        onClose={deleteDialog.close}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}
