import { Box, Card, Typography, Chip, IconButton, Stack, Button, Switch } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useColumnVisibilityPersistence, useDialog } from 'src/hooks';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getShippingPromotionsRequest,
  deleteShippingPromotionRequest,
  toggleShippingPromotionRequest,
  selectShippingPromotions,
  selectShippingPromotionLoading,
  selectShippingPromotionPagination,
} from 'src/redux/store/shippingPromotionSlice';
import type { ShippingPromotionListItem } from 'src/types/gen/shared/shared/shipping/shipping-promotion';
import type { FilterShippingPromotion } from 'src/types/gen/cms/cms/shipping/shipping-promotion';
import {
  ShippingPromotionStatus,
  ShippingPromotionType,
} from 'src/types/gen/shared/shared/common/enums';
import {
  getShippingPromotionStatusColor,
  getShippingPromotionStatusKey,
  getShippingPromotionTypeKey,
} from 'src/types/shipping-promotion';
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
import { ShippingPromotionTabs } from './components';
import { formatDate, toISOString } from 'src/utils/format';

// ----------------------------------------------------------------------

export function ShippingPromotionListView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const promotions = useAppSelector(selectShippingPromotions);
  const loading = useAppSelector(selectShippingPromotionLoading);
  const pagination = useAppSelector(selectShippingPromotionPagination);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useColumnVisibilityPersistence(
    'shipping-promotion-table'
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    right: ['actions'],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<ShippingPromotionStatus | 'all'>('all');

  const deleteDialog = useDialog<ShippingPromotionListItem>();

  // Fetch promotions when filters change
  useEffect(() => {
    const requestFilters: FilterShippingPromotion = {};

    if (statusFilter !== 'all') {
      requestFilters.status = statusFilter;
    }
    if (searchQuery) {
      requestFilters.search = searchQuery;
    }

    dispatch(
      getShippingPromotionsRequest({
        page: currentPage,
        limit: pageSize,
        filters: Object.keys(requestFilters).length > 0 ? requestFilters : undefined,
      })
    );
  }, [dispatch, currentPage, pageSize, statusFilter, searchQuery]);

  const handleTabChange = useCallback((newStatus: ShippingPromotionStatus | 'all') => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  }, []);

  const handleToggle = useCallback(
    (id: string) => {
      dispatch(
        toggleShippingPromotionRequest({
          id,
        })
      );
    },
    [dispatch]
  );

  const handleDeleteConfirm = async () => {
    if (deleteDialog.data) {
      dispatch(
        deleteShippingPromotionRequest({
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

  const columns = useMemo<ColumnDef<ShippingPromotionListItem>[]>(
    () => [
      createSelectionColumn<ShippingPromotionListItem>(),
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
            onClick={() => navigate(`/shipping-promotion/edit/${row.original.id}`)}
          >
            {getValue() as string}
          </Typography>
        ),
      },
      {
        accessorKey: 'type',
        header: t('type'),
        size: 150,
        cell: ({ getValue }) => {
          const type = getValue() as ShippingPromotionType;
          return (
            <Chip
              label={t(getShippingPromotionTypeKey(type))}
              size="small"
              variant="outlined"
              sx={{
                fontWeight: 500,
                borderRadius: '6px',
              }}
            />
          );
        },
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
        accessorKey: 'tierCount',
        header: t('tierCount'),
        size: 100,
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
          const status = getValue() as ShippingPromotionStatus;
          const statusColor = getShippingPromotionStatusColor(status);
          const statusKey = getShippingPromotionStatusKey(status);
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
        size: 100,
        enableSorting: false,
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              sx={{ color: '#0165FC' }}
              onClick={() => navigate(`/shipping-promotion/edit/${row.original.id}`)}
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
    data: promotions,
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

    if (promotions.length === 0 && !searchQuery && statusFilter === 'all') {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('noData')}</Typography>
        </Box>
      );
    }

    if (promotions.length === 0 && (searchQuery || statusFilter !== 'all')) {
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
              onClick={() => navigate('/shipping-promotion/create')}
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
      <ShippingPromotionTabs activeTab={statusFilter} onChange={handleTabChange} />

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
        message={t('deleteShippingPromotionMessage')}
        onClose={deleteDialog.close}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}
