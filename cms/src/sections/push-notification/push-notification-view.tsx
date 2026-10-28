import { Box, Card, Typography, IconButton, Stack, Button, Chip } from '@mui/material';
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
  getPushNotificationListRequest,
  deletePushNotificationRequest,
  selectPushNotificationList,
  selectPushNotificationLoading,
  selectPushNotificationPagination,
} from 'src/redux/store/pushNotificationSlice';
import type { PushNotification } from 'src/types/gen/shared/shared/push-notifications/push-notification';
import {
  PushNotificationStatus,
  PushNotificationCategory,
} from 'src/types/gen/shared/shared/common/enums';
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
import { formatDate } from 'src/utils/format';

const STATUS_COLOR: Record<number, 'default' | 'warning' | 'success' | 'error'> = {
  [PushNotificationStatus.PUSH_NOTIFICATION_STATUS_DRAFT]: 'default',
  [PushNotificationStatus.PUSH_NOTIFICATION_STATUS_PENDING]: 'warning',
  [PushNotificationStatus.PUSH_NOTIFICATION_STATUS_SENT]: 'success',
  [PushNotificationStatus.PUSH_NOTIFICATION_STATUS_RECALLED]: 'error',
};

export function PushNotificationView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const list = useAppSelector(selectPushNotificationList);
  const loading = useAppSelector(selectPushNotificationLoading);
  const pagination = useAppSelector(selectPushNotificationPagination);

  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    useColumnVisibilityPersistence('push-notification-table');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({ right: ['actions'] });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const deleteDialog = useDialog<PushNotification>();

  useEffect(() => {
    dispatch(
      getPushNotificationListRequest({
        page: currentPage,
        limit: pageSize,
        search: searchQuery || undefined,
      })
    );
  }, [dispatch, currentPage, pageSize, searchQuery]);

  const handleDeleteConfirm = async () => {
    if (deleteDialog.data) {
      dispatch(
        deletePushNotificationRequest({
          id: deleteDialog.data.id,
          onSuccess: () => deleteDialog.close(),
        })
      );
    }
  };

  const handleSearch = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const getStatusLabel = (status: PushNotificationStatus): string => {
    const labels: Record<number, string> = {
      [PushNotificationStatus.PUSH_NOTIFICATION_STATUS_DRAFT]: t('pushNotificationStatusDraft'),
      [PushNotificationStatus.PUSH_NOTIFICATION_STATUS_PENDING]: t('pushNotificationStatusPending'),
      [PushNotificationStatus.PUSH_NOTIFICATION_STATUS_SENT]: t('pushNotificationStatusSent'),
      [PushNotificationStatus.PUSH_NOTIFICATION_STATUS_RECALLED]: t(
        'pushNotificationStatusRecalled'
      ),
    };
    return labels[status] || '';
  };

  const getCategoryLabel = (category: PushNotificationCategory): string => {
    const labels: Record<number, string> = {
      [PushNotificationCategory.PUSH_NOTIFICATION_CATEGORY_NEWS]: t('pushNotificationCategoryNews'),
      [PushNotificationCategory.PUSH_NOTIFICATION_CATEGORY_PROMOTION]: t(
        'pushNotificationCategoryPromotion'
      ),
    };
    return labels[category] || '';
  };

  const columns = useMemo<ColumnDef<PushNotification>[]>(
    () => [
      createSelectionColumn<PushNotification>(),
      {
        id: 'index',
        header: '#',
        size: 60,
        cell: ({ row }) => (
          <Typography variant="body2">{(currentPage - 1) * pageSize + row.index + 1}</Typography>
        ),
      },
      {
        accessorKey: 'category',
        header: t('pushNotificationCategory'),
        size: 120,
        cell: ({ row }) => (
          <Chip label={getCategoryLabel(row.original.category)} size="small" variant="outlined" />
        ),
      },
      {
        accessorKey: 'title',
        header: t('pushNotificationTitle'),
        size: 250,
        cell: ({ getValue }) => (
          <Typography
            variant="body2"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {getValue() as string}
          </Typography>
        ),
      },
      {
        accessorKey: 'subtitle',
        header: t('pushNotificationSubtitle'),
        size: 300,
        cell: ({ getValue }) => (
          <Typography
            variant="body2"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {getValue() as string}
          </Typography>
        ),
      },
      {
        accessorKey: 'readersCount',
        header: t('pushNotificationReadersCount'),
        size: 120,
        cell: ({ getValue }) => <Typography variant="body2">{getValue() as number}</Typography>,
      },
      {
        id: 'sendTime',
        header: t('pushNotificationSendTime'),
        size: 160,
        cell: ({ row }) => {
          const time = row.original.sentAt || row.original.scheduledAt;
          return <Typography variant="body2">{time ? formatDate(time) : '-'}</Typography>;
        },
      },
      {
        accessorKey: 'status',
        header: t('pushNotificationStatus'),
        size: 120,
        cell: ({ row }) => (
          <Chip
            label={getStatusLabel(row.original.status)}
            color={STATUS_COLOR[row.original.status]}
            size="small"
          />
        ),
      },
      {
        id: 'actions',
        header: t('actions'),
        size: 120,
        enableSorting: false,
        cell: ({ row }) => {
          const { status } = row.original;
          return (
            <Stack direction="row" spacing={0.5}>
              {(status === PushNotificationStatus.PUSH_NOTIFICATION_STATUS_SENT ||
                status === PushNotificationStatus.PUSH_NOTIFICATION_STATUS_RECALLED) && (
                <IconButton
                  size="small"
                  sx={{ color: '#4CAF50' }}
                  onClick={() => navigate(`/push-notification/${row.original.id}`)}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              )}
              {(status === PushNotificationStatus.PUSH_NOTIFICATION_STATUS_DRAFT ||
                status === PushNotificationStatus.PUSH_NOTIFICATION_STATUS_PENDING) && (
                <IconButton
                  size="small"
                  sx={{ color: '#0165FC' }}
                  onClick={() => navigate(`/push-notification/edit/${row.original.id}`)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton
                size="small"
                sx={{ color: '#F62E2E' }}
                onClick={() => deleteDialog.open(row.original)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, navigate, deleteDialog, currentPage, pageSize]
  );

  const table = useReactTable({
    data: list,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnPinning,
      pagination: { pageIndex: currentPage - 1, pageSize },
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
    if (list.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {searchQuery ? t('noSearchResults') : t('noData')}
          </Typography>
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
      <Card sx={{ mb: 2, boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)', flexShrink: 0 }}>
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
              onClick={() => navigate('/push-notification/create')}
              sx={{ bgcolor: '#0165FC', '&:hover': { bgcolor: '#0052CC' } }}
            >
              {t('addPushNotification')}
            </Button>
          )}
        />
      </Card>

      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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

      <TablePagination
        table={table}
        totalItems={pagination?.total ?? 0}
        pageSize={pageSize}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize);
          setCurrentPage(1);
        }}
      />

      <DeleteConfirmDialog
        open={deleteDialog.isOpen}
        title="confirm"
        message={t('deletePushNotificationMessage')}
        onClose={deleteDialog.close}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}
