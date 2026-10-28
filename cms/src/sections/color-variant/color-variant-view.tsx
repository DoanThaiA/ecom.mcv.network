import { Box, Card, Typography, Chip, IconButton, Stack, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useColumnVisibilityPersistence, useDialog } from 'src/hooks';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getColorVariantsRequest,
  deleteColorVariantRequest,
  selectColorVariants,
  selectColorVariantLoading,
  selectColorVariantPagination,
} from 'src/redux/store/colorVariantSlice';
import type { ColorVariant } from 'src/types/color-variant';
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnPinningState,
} from '@tanstack/react-table';
import { SearchBar, ColumnVisibility, DataTable, TablePagination } from 'src/components/table';
import { DeleteConfirmDialog } from 'src/components/dialog';
import { ColorVariantPreview } from './components/color-variant-preview';
import { getDisplayTypeLabelKey } from './utils/color-utils';

// ----------------------------------------------------------------------

export function ColorVariantView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const colorVariants = useAppSelector(selectColorVariants);
  const loading = useAppSelector(selectColorVariantLoading);
  const pagination = useAppSelector(selectColorVariantPagination);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    useColumnVisibilityPersistence('color-variant-table');
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    right: ['actions'],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const deleteDialog = useDialog<ColorVariant>();

  // Fetch color variants when filters change
  useEffect(() => {
    dispatch(
      getColorVariantsRequest({
        page: currentPage,
        limit: pageSize,
        search: searchQuery || undefined,
      })
    );
  }, [dispatch, currentPage, pageSize, searchQuery]);

  const handleDeleteConfirm = async () => {
    if (deleteDialog.data) {
      dispatch(
        deleteColorVariantRequest({
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

  const columns = useMemo<ColumnDef<ColorVariant>[]>(
    () => [
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
        id: 'preview',
        header: t('preview'),
        size: 80,
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <ColorVariantPreview
              displayType={row.original.displayType}
              colorValue={row.original.display?.colorValue}
              patternImage={row.original.display?.patternImage}
              size={40}
            />
          </Box>
        ),
      },
      {
        accessorKey: 'name',
        header: t('name'),
        size: 200,
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
            onClick={() => navigate(`/color-variant/edit/${row.original.id}`)}
          >
            {getValue() as string}
          </Typography>
        ),
      },
      {
        accessorKey: 'displayType',
        header: t('type'),
        size: 150,
        cell: ({ getValue }) => {
          const displayType = getValue() as number;
          const labelKey = getDisplayTypeLabelKey(displayType);
          return (
            <Chip
              label={t(labelKey)}
              size="small"
              sx={{
                fontWeight: 500,
                borderRadius: '6px',
              }}
            />
          );
        },
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
        id: 'actions',
        header: t('actions'),
        size: 120,
        enableSorting: false,
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              sx={{ color: '#0165FC' }}
              onClick={() => navigate(`/color-variant/edit/${row.original.id}`)}
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
    data: colorVariants,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnPinning,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: pageSize,
      },
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater({ pageIndex: currentPage - 1, pageSize }) : updater;
      setCurrentPage(newPagination.pageIndex + 1);
      setPageSize(newPagination.pageSize);
    },
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

    if (colorVariants.length === 0 && !searchQuery) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('noData')}</Typography>
        </Box>
      );
    }

    if (colorVariants.length === 0 && searchQuery) {
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
              onClick={() => navigate('/color-variant/create')}
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
          {renderEmptyState() || <DataTable table={table} compact />}
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
        message={t('deleteColorVariantMessage')}
        onClose={deleteDialog.close}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}
