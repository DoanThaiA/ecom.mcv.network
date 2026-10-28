import { Box, Card, Typography, IconButton, Stack, Button, Switch } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useColumnVisibilityPersistence, useDialog } from 'src/hooks';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getNewsListRequest,
  deleteNewsRequest,
  toggleNewsStatusRequest,
  selectNewsList,
  selectNewsLoading,
  selectNewsPagination,
} from 'src/redux/store/newsSlice';
import type { News } from 'src/types/news';
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

// ----------------------------------------------------------------------

export function NewsView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const newsList = useAppSelector(selectNewsList);
  const loading = useAppSelector(selectNewsLoading);
  const pagination = useAppSelector(selectNewsPagination);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useColumnVisibilityPersistence('news-table');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    right: ['actions'],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const deleteDialog = useDialog<News>();

  // Fetch news when filters change
  useEffect(() => {
    dispatch(
      getNewsListRequest({
        page: currentPage,
        limit: pageSize,
        search: searchQuery || undefined,
      })
    );
  }, [dispatch, currentPage, pageSize, searchQuery]);

  const handleDeleteConfirm = async () => {
    if (deleteDialog.data) {
      dispatch(
        deleteNewsRequest({
          id: deleteDialog.data.id,
          onSuccess: () => {
            deleteDialog.close();
          },
        })
      );
    }
  };

  const handleToggleStatus = useCallback(
    (id: string, currentStatus: 'active' | 'inactive') => {
      dispatch(toggleNewsStatusRequest({ id, currentStatus }));
    },
    [dispatch]
  );

  const handleSearch = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const columns = useMemo<ColumnDef<News>[]>(
    () => [
      createSelectionColumn<News>(),
      {
        id: 'thumbnail',
        header: t('thumbnailImage'),
        size: 120,
        cell: ({ row }) => (
          <Box
            component="img"
            src={row.original.thumbnail || 'https://via.placeholder.com/80x50'}
            alt={row.original.title}
            sx={{
              width: 80,
              height: 50,
              objectFit: 'cover',
              borderRadius: '4px',
              backgroundColor: '#f5f5f5',
            }}
          />
        ),
      },
      {
        accessorKey: 'title',
        header: t('articleTitle'),
        size: 400,
        cell: ({ row, getValue }) => (
          <Typography
            variant="body2"
            sx={{
              cursor: 'pointer',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              '&:hover': {
                color: '#235AFF',
              },
            }}
            onClick={() => navigate(`/article/edit/${row.original.id}`)}
          >
            {getValue() as string}
          </Typography>
        ),
      },
      {
        accessorKey: 'publishedAt',
        header: t('publishDate'),
        size: 140,
        cell: ({ getValue }) => (
          <Typography variant="body2">{formatDate(getValue() as string)}</Typography>
        ),
      },
      {
        accessorKey: 'status',
        header: t('status'),
        size: 100,
        cell: ({ row }) => (
          <Switch
            checked={row.original.status === 'active'}
            onChange={() => handleToggleStatus(row.original.id, row.original.status)}
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
              onClick={() => navigate(`/article/edit/${row.original.id}`)}
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
    [t, navigate, deleteDialog, handleToggleStatus]
  );

  const table = useReactTable({
    data: newsList,
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

    if (newsList.length === 0 && !searchQuery) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('noData')}</Typography>
        </Box>
      );
    }

    if (newsList.length === 0 && searchQuery) {
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
              onClick={() => navigate('/article/create')}
              sx={{
                bgcolor: '#0165FC',
                '&:hover': {
                  bgcolor: '#0052CC',
                },
              }}
            >
              {t('addArticle')}
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
        message={t('deleteNewsMessage', { title: deleteDialog.data?.title || '' })}
        onClose={deleteDialog.close}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}
