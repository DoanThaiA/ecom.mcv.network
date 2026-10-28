import {
  Box,
  Card,
  Typography,
  Chip,
  IconButton,
  Stack,
  Button,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useColumnVisibilityPersistence, useDialog } from 'src/hooks';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getTopicsRequest,
  deleteTopicRequest,
  setStatusFilter,
  selectTopics,
  selectTopicLoading,
  selectTopicPagination,
  selectTopicStatusFilter,
} from 'src/redux/store/topicSlice';
import type { Topic } from 'src/types/gen/shared/shared/topics/topic';
import { TopicStatus, TopicType } from 'src/types/gen/shared/shared/common/enums';
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

// ----------------------------------------------------------------------

const getTopicTypeLabel = (type: TopicType, t: (key: string) => string): string => {
  switch (type) {
    case TopicType.TOPIC_TYPE_PRODUCT:
      return t('productTopic');
    case TopicType.TOPIC_TYPE_CATEGORY:
      return t('categoryTopic');
    case TopicType.TOPIC_TYPE_BANNER:
      return t('bannerTopic');
    default:
      return '-';
  }
};

const getItemCount = (topic: Topic): number => {
  return (
    (topic.productCount ?? topic.products?.length ?? 0) +
    (topic.categoryCount ?? topic.categories?.length ?? 0) +
    ((topic as any).bannerCount ?? (topic as any).banners?.length ?? 0)
  );
};

const getStatusColor = (status: TopicStatus | string): 'success' | 'default' => {
  if (status === TopicStatus.TOPIC_STATUS_ACTIVE || status === 'active') {
    return 'success';
  }
  return 'default';
};

const getStatusLabel = (status: TopicStatus | string, t: (key: string) => string): string => {
  if (status === TopicStatus.TOPIC_STATUS_ACTIVE || status === 'active') {
    return t('active');
  }
  if (status === TopicStatus.TOPIC_STATUS_INACTIVE || status === 'inactive') {
    return t('inactive');
  }
  return '-';
};

export function TopicView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const topics = useAppSelector(selectTopics);
  const loading = useAppSelector(selectTopicLoading);
  const pagination = useAppSelector(selectTopicPagination);
  const statusFilter = useAppSelector(selectTopicStatusFilter);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useColumnVisibilityPersistence('topic-table');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    right: ['actions'],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const deleteDialog = useDialog<Topic>();

  // Fetch topics when filters change
  useEffect(() => {
    dispatch(
      getTopicsRequest({
        page: currentPage,
        limit: pageSize,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery || undefined,
      })
    );
  }, [dispatch, currentPage, pageSize, statusFilter, searchQuery]);

  const handleDeleteConfirm = async () => {
    if (deleteDialog.data) {
      dispatch(
        deleteTopicRequest({
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

  const columns = useMemo<ColumnDef<Topic>[]>(
    () => [
      createSelectionColumn<Topic>(),
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
        accessorKey: 'order',
        header: t('order'),
        size: 100,
        cell: ({ getValue }) => (
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            {getValue() as number}
          </Typography>
        ),
      },
      {
        accessorKey: 'name',
        header: t('topicTitle'),
        size: 300,
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
            onClick={() => navigate(`/topic/edit/${row.original.id}`)}
          >
            {getValue() as string}
          </Typography>
        ),
      },
      {
        accessorKey: 'type',
        header: t('topicType'),
        size: 140,
        cell: ({ getValue }) => {
          const type = getValue() as TopicType;
          return (
            <Chip
              label={getTopicTypeLabel(type, t)}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 500, borderRadius: '6px' }}
            />
          );
        },
      },
      {
        id: 'itemCount',
        header: t('totalItems'),
        size: 130,
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            {getItemCount(row.original)}
          </Typography>
        ),
      },
      {
        accessorKey: 'status',
        header: t('status'),
        size: 140,
        cell: ({ getValue }) => {
          const status = getValue() as TopicStatus | string;
          const statusColor = getStatusColor(status);
          return (
            <Chip
              label={getStatusLabel(status, t)}
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
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              sx={{ color: '#0165FC' }}
              onClick={() => navigate(`/topic/edit/${row.original.id}`)}
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
    [t, navigate, deleteDialog, currentPage, pageSize]
  );

  const table = useReactTable({
    data: topics,
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

    if (topics.length === 0 && !searchQuery && statusFilter === 'all') {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('noData')}</Typography>
        </Box>
      );
    }

    if (topics.length === 0 && (searchQuery || statusFilter !== 'all')) {
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
          renderActions={() => (
            <>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    dispatch(setStatusFilter(e.target.value as 'all' | 'active' | 'inactive'));
                    setCurrentPage(1);
                  }}
                  displayEmpty
                  sx={{
                    '& .MuiSelect-select': {
                      py: 1,
                    },
                  }}
                >
                  <MenuItem value="all">{t('all')}</MenuItem>
                  <MenuItem value="active">{t('active')}</MenuItem>
                  <MenuItem value="inactive">{t('inactive')}</MenuItem>
                </Select>
              </FormControl>
              <ColumnVisibility table={table} />
            </>
          )}
          renderFarRightActions={() => (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/topic/create')}
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
        message={t('deleteTopicMessage')}
        onClose={deleteDialog.close}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}
