import { useMemo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  type ColumnPinningState,
} from '@tanstack/react-table';

import { useColumnVisibilityPersistence, useDialog } from 'src/hooks';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getPromotionsRequest,
  deletePromotionRequest,
  pausePromotionRequest,
  resumePromotionRequest,
  selectPromotions,
  selectPromotionLoading,
  selectPromotionPagination,
} from 'src/redux/store/promotionSlice';
import type { PromotionListItem, FilterPromotion } from 'src/types/promotion';
import {
  PromotionStatus,
  PromotionType,
  promotionTypeToKey,
  promotionStatusToKey,
  promotionSubTypeToKey,
} from 'src/types/promotion';
import {
  SearchBar,
  ColumnVisibility,
  DataTable,
  TablePagination,
  createSelectionColumn,
} from 'src/components/table';
import { DeleteConfirmDialog } from 'src/components/dialog';
import { formatDate, toISOString } from 'src/utils/format';

// ----------------------------------------------------------------------

const TAB_CONFIG: { value: PromotionStatus | 'all'; labelKey: string }[] = [
  { value: 'all', labelKey: 'all' },
  { value: PromotionStatus.PROMOTION_STATUS_ACTIVE, labelKey: 'ongoing' },
  { value: PromotionStatus.PROMOTION_STATUS_PAUSED, labelKey: 'paused' },
  { value: PromotionStatus.PROMOTION_STATUS_UPCOMING, labelKey: 'upcoming' },
  { value: PromotionStatus.PROMOTION_STATUS_ENDED, labelKey: 'ended' },
];

/**
 * Get edit route path based on promotion type
 */
function getEditPath(type: PromotionType, id: string): string {
  switch (type) {
    case PromotionType.PROMOTION_TYPE_BUNDLE_DEAL:
      return `/shock-deal/edit/${id}`;
    case PromotionType.PROMOTION_TYPE_ORDER_DISCOUNT:
      return `/order-discount/edit/${id}`;
    case PromotionType.PROMOTION_TYPE_PRODUCT_DISCOUNT:
      return `/product-discount/edit/${id}`;
    default:
      return `/promotion`;
  }
}

/**
 * Get detail route path based on promotion type
 */
function getDetailPath(type: PromotionType, id: string): string {
  switch (type) {
    case PromotionType.PROMOTION_TYPE_BUNDLE_DEAL:
      return `/shock-deal/${id}`;
    case PromotionType.PROMOTION_TYPE_ORDER_DISCOUNT:
      return `/order-discount/${id}`;
    case PromotionType.PROMOTION_TYPE_PRODUCT_DISCOUNT:
      return `/product-discount/${id}`;
    default:
      return `/promotion`;
  }
}

// ----------------------------------------------------------------------

export function PromotionListTable() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const promotions = useAppSelector(selectPromotions);
  const loading = useAppSelector(selectPromotionLoading);
  const pagination = useAppSelector(selectPromotionPagination);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    useColumnVisibilityPersistence('promotion-list-table');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    right: ['toggle', 'actions'],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<PromotionStatus | 'all'>('all');

  const deleteDialog = useDialog<PromotionListItem>();

  // Fetch promotions when filters change
  useEffect(() => {
    const requestFilters: FilterPromotion = {};

    if (statusFilter !== 'all') {
      requestFilters.status = statusFilter;
    }
    if (searchQuery) {
      requestFilters.keyword = searchQuery;
    }

    dispatch(
      getPromotionsRequest({
        page: currentPage,
        limit: pageSize,
        filters: requestFilters,
      })
    );
  }, [dispatch, currentPage, pageSize, statusFilter, searchQuery]);

  const handleTabChange = useCallback(
    (_event: React.SyntheticEvent, newStatus: PromotionStatus | 'all') => {
      setStatusFilter(newStatus);
      setCurrentPage(1);
    },
    []
  );

  const handleDeleteConfirm = async () => {
    if (deleteDialog.data) {
      dispatch(
        deletePromotionRequest({
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

  const handleToggle = useCallback(
    (promotion: PromotionListItem) => {
      if (promotion.isEnabled) {
        dispatch(pausePromotionRequest({ id: promotion.id }));
      } else {
        dispatch(resumePromotionRequest({ id: promotion.id }));
      }
    },
    [dispatch]
  );

  const columns = useMemo<ColumnDef<PromotionListItem>[]>(
    () => [
      createSelectionColumn<PromotionListItem>(),
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
        header: t('promotionTime'),
        size: 180,
        cell: ({ row }) => {
          const startTimeStr = toISOString(row.original.startTime);
          const endTimeStr = toISOString(row.original.endTime);

          return (
            <Box>
              <Typography variant="body2">
                {startTimeStr ? formatDate(startTimeStr) : '-'}
              </Typography>
              <Typography variant="body2">{endTimeStr ? formatDate(endTimeStr) : '-'}</Typography>
            </Box>
          );
        },
      },
      {
        accessorKey: 'type',
        header: t('promotionType'),
        size: 150,
        cell: ({ row }) => (
          <Typography variant="body2">{t(promotionTypeToKey(row.original.type))}</Typography>
        ),
      },
      {
        id: 'subType',
        header: t('classification'),
        size: 150,
        cell: ({ row }) => {
          if (row.original.type === PromotionType.PROMOTION_TYPE_PRODUCT_DISCOUNT) {
            return (
              <Typography variant="body2" color="text.disabled">
                -
              </Typography>
            );
          }
          const key = promotionSubTypeToKey(row.original.type, row.original.subType);
          return <Typography variant="body2">{key !== '-' ? t(key) : '-'}</Typography>;
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
            onClick={() => navigate(getEditPath(row.original.type, row.original.id))}
          >
            {getValue() as string}
          </Typography>
        ),
      },
      {
        id: 'status',
        header: t('status'),
        size: 120,
        cell: ({ row }) => {
          const status = row.original.status;
          const getStatusColor = () => {
            switch (status) {
              case PromotionStatus.PROMOTION_STATUS_ACTIVE:
                return '#178b30';
              case PromotionStatus.PROMOTION_STATUS_UPCOMING:
                return '#ce8218';
              case PromotionStatus.PROMOTION_STATUS_PAUSED:
                return '#637381';
              default:
                return 'inherit';
            }
          };
          return (
            <Typography variant="body2" sx={{ color: getStatusColor(), textAlign: 'center' }}>
              {t(promotionStatusToKey(status))}
            </Typography>
          );
        },
      },
      {
        id: 'toggle',
        header: t('onOff'),
        size: 80,
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Switch
              checked={row.original.isEnabled}
              onChange={() => handleToggle(row.original)}
              size="small"
            />
          </Box>
        ),
      },
      {
        id: 'actions',
        header: t('actions'),
        size: 120,
        enableSorting: false,
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5} justifyContent="center">
            <IconButton
              size="small"
              sx={{
                bgcolor: '#178b30',
                borderRadius: '5px',
                width: 24,
                height: 24,
                '&:hover': { bgcolor: '#117526' },
              }}
              onClick={() => navigate(getDetailPath(row.original.type, row.original.id))}
            >
              <VisibilityIcon sx={{ fontSize: 14, color: 'white' }} />
            </IconButton>
            <IconButton
              size="small"
              sx={{
                bgcolor: '#0386f6',
                borderRadius: '5px',
                width: 24,
                height: 24,
                '&:hover': { bgcolor: '#0165fc' },
              }}
              onClick={() => navigate(getEditPath(row.original.type, row.original.id))}
            >
              <EditIcon sx={{ fontSize: 14, color: 'white' }} />
            </IconButton>
            <IconButton
              size="small"
              sx={{
                bgcolor: '#f62e2e',
                borderRadius: '5px',
                width: 24,
                height: 24,
                '&:hover': { bgcolor: '#d92525' },
              }}
              onClick={() => deleteDialog.open(row.original)}
            >
              <DeleteIcon sx={{ fontSize: 14, color: 'white' }} />
            </IconButton>
          </Stack>
        ),
      },
    ],
    [t, navigate, deleteDialog, currentPage, pageSize, handleToggle]
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
        pageSize,
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
    <Box>
      {/* Section Title */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t('promotionList')}
      </Typography>

      {/* Tabs */}
      <Tabs
        value={statusFilter}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': {
            textTransform: 'none',
            minWidth: 'auto',
            px: 2,
            fontSize: 14,
            fontWeight: 500,
            color: '#637381',
            '&.Mui-selected': {
              color: '#235AFF',
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#235AFF',
          },
        }}
      >
        {TAB_CONFIG.map((tab) => (
          <Tab key={String(tab.value)} value={tab.value} label={t(tab.labelKey)} />
        ))}
      </Tabs>

      {/* Search Bar */}
      <Card
        sx={{
          mb: 2,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        }}
      >
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('search')}
          showSearchButton
          onSearch={handleSearch}
          renderActions={() => <ColumnVisibility table={table} />}
        />
      </Card>

      {/* Table */}
      <Card
        sx={{
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        {renderEmptyState() || <DataTable table={table} enableRowSelection compact />}
      </Card>

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
        message={t('deletePromotionMessage')}
        onClose={deleteDialog.close}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}
