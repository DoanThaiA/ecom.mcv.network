import { Box, Card, Typography, Chip, IconButton, Stack, Button, Switch } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useColumnVisibilityPersistence, useDialog } from 'src/hooks';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getFlashSalesRequest,
  deleteFlashSaleRequest,
  toggleFlashSaleRequest,
  setFilters,
  selectFlashSales,
  selectFlashSaleLoading,
  selectFlashSalePagination,
  selectFlashSaleFilters,
} from 'src/redux/store/flashSaleSlice';
import type { FlashSaleListItem } from 'src/types/gen/shared/shared/flash-sales/flash-sale';
import type { FilterFlashSale } from 'src/types/gen/cms/cms/flash-sales/flash-sale';
import { FlashSaleStatus, flashSaleStatusToJSON } from 'src/types/gen/shared/shared/common/enums';
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type SortingState,
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
import { FlashSaleTabs } from './components';
import { formatDate, toISOString } from 'src/utils/format';

// ----------------------------------------------------------------------

/**
 * Get status color from API string format or enum number
 * API returns: "active", "upcoming", "ended", "disabled"
 * Enum: FlashSaleStatus (number)
 */
const getStatusColor = (
  status: FlashSaleStatus | string
): 'success' | 'warning' | 'error' | 'default' | 'info' => {
  // Handle string from API (suffix format: "active", "upcoming", "ended", "disabled")
  if (typeof status === 'string') {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'active':
        return 'success';
      case 'upcoming':
        return 'warning';
      case 'ended':
        return 'default';
      case 'disabled':
        return 'error';
      default:
        return 'default';
    }
  }

  // Handle enum number (backward compatible)
  switch (status) {
    case FlashSaleStatus.FLASH_SALE_STATUS_ACTIVE:
      return 'success';
    case FlashSaleStatus.FLASH_SALE_STATUS_UPCOMING:
      return 'warning';
    case FlashSaleStatus.FLASH_SALE_STATUS_ENDED:
      return 'default';
    case FlashSaleStatus.FLASH_SALE_STATUS_DISABLED:
      return 'error';
    default:
      return 'default';
  }
};

export function FlashSaleView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const flashSales = useAppSelector(selectFlashSales);
  const loading = useAppSelector(selectFlashSaleLoading);
  const pagination = useAppSelector(selectFlashSalePagination);
  const filters = useAppSelector(selectFlashSaleFilters);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    useColumnVisibilityPersistence('flash-sale-table');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    right: ['actions'],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<FlashSaleStatus | 'all'>('all');

  const deleteDialog = useDialog<FlashSaleListItem>();

  // Fetch flash sales when filters change
  useEffect(() => {
    const requestFilters: FilterFlashSale = {};

    if (statusFilter !== 'all') {
      requestFilters.status = statusFilter;
    }
    if (searchQuery) {
      requestFilters.search = searchQuery;
    }

    dispatch(
      getFlashSalesRequest({
        page: currentPage,
        limit: pageSize,
        filters: Object.keys(requestFilters).length > 0 ? requestFilters : undefined,
      })
    );
  }, [dispatch, currentPage, pageSize, statusFilter, searchQuery]);

  const handleTabChange = useCallback((newStatus: FlashSaleStatus | 'all') => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  }, []);

  const handleToggle = useCallback(
    (id: string) => {
      dispatch(
        toggleFlashSaleRequest({
          id,
        })
      );
    },
    [dispatch]
  );

  const handleDeleteConfirm = async () => {
    if (deleteDialog.data) {
      dispatch(
        deleteFlashSaleRequest({
          id: deleteDialog.data.id,
          onSuccess: () => {
            deleteDialog.close();
          },
        })
      );
    }
  };

  const handleSearch = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const columns = useMemo<ColumnDef<FlashSaleListItem>[]>(
    () => [
      createSelectionColumn<FlashSaleListItem>(),
      {
        id: 'index',
        header: '#',
        size: 60,
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            {(currentPage - 1) * pageSize + row.index + 1}
          </Typography>
        ),
      },
      {
        id: 'timeRange',
        header: t('programTime'),
        size: 280,
        cell: ({ row }) => {
          const startTimeStr = toISOString(row.original.startTime);
          const endTimeStr = toISOString(row.original.endTime);

          return (
            <Typography variant="body2">
              {startTimeStr ? formatDate(startTimeStr) : '-'} -{' '}
              {endTimeStr ? formatDate(endTimeStr) : '-'}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'name',
        header: t('programName'),
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
            onClick={() => navigate(`/flash-sale/edit/${row.original.id}`)}
          >
            {getValue() as string}
          </Typography>
        ),
      },
      {
        accessorKey: 'productCount',
        header: t('totalProducts'),
        size: 130,
        cell: ({ getValue }) => (
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            {getValue() as number}
          </Typography>
        ),
      },
      {
        accessorKey: 'status',
        header: t('status'),
        size: 140,
        cell: ({ getValue }) => {
          const status = getValue() as FlashSaleStatus | string;
          const statusColor = getStatusColor(status);
          // Normalize status for translation key (handle both string and enum)
          // API returns: "active", "upcoming", "ended", "disabled"
          // Enum: FlashSaleStatus (number)
          const statusKey =
            typeof status === 'string'
              ? status
              : flashSaleStatusToJSON(status).replace('FLASH_SALE_STATUS_', '').toLowerCase();
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
        accessorKey: 'isEnabled',
        header: t('onOff'),
        size: 100,
        cell: ({ row }) => (
          <Switch
            checked={row.original.isEnabled}
            onChange={() => handleToggle(row.original.id)}
            size="small"
          />
        ),
      },
      {
        id: 'actions',
        header: t('actions'),
        size: 130,
        enableSorting: false,
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              sx={{ color: '#0165FC' }}
              onClick={() => navigate(`/flash-sale/edit/${row.original.id}`)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              sx={{ color: '#0165FC' }}
              onClick={() => navigate(`/flash-sale/edit/${row.original.id}`)}
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
    [t, navigate, deleteDialog, handleToggle, currentPage, pageSize]
  );

  const table = useReactTable({
    data: flashSales,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnPinning,
      pagination: {
        pageIndex: currentPage - 1,
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
      setCurrentPage(newPagination.pageIndex + 1);
      setPageSize(newPagination.pageSize);
    },
    enableRowSelection: true,
    enableColumnPinning: true,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
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

    if (flashSales.length === 0 && !searchQuery && statusFilter === 'all') {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('noData')}</Typography>
        </Box>
      );
    }

    if (flashSales.length === 0 && (searchQuery || statusFilter !== 'all')) {
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
      {/* Search Bar */}
      <Card
        sx={{
          mb: 2,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          flexShrink: 0,
        }}
      >
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('search')}
          showSearchButton
          onSearch={handleSearch}
          renderActions={() => <ColumnVisibility table={table} />}
          renderFarRightActions={() => (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/flash-sale/create')}
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

      {/* Tabs */}
      <FlashSaleTabs activeTab={statusFilter} onChange={handleTabChange} />

      {/* Table Container */}
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

      {/* Pagination */}
      <TablePagination
        table={table}
        totalItems={pagination?.total ?? 0}
        pageSize={pageSize}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize);
          setCurrentPage(1);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialog.isOpen}
        title="confirm"
        message={t('deleteFlashSaleMessage')}
        onClose={deleteDialog.close}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}
