import { Box, Card, Chip, IconButton, Stack, Button, Switch } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useColumnVisibilityPersistence, useDialog } from 'src/hooks';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getPopupAdsListRequest,
  deletePopupAdsRequest,
  updatePopupAdsRequest,
  selectPopupAdsList,
  selectPopupAdsLoading,
  selectPopupAdsPagination,
} from 'src/redux/store/popupAdsSlice';
import type { PopupAdsListItem } from 'src/types/gen/shared/shared/popup-ads/popup-ads';
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
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
import { PopupAdsForm } from './popup-ads-form';

export function PopupAdsView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const popupAdsList = useAppSelector(selectPopupAdsList);
  const loading = useAppSelector(selectPopupAdsLoading);
  const pagination = useAppSelector(selectPopupAdsPagination);

  const [columnVisibility, setColumnVisibility] = useColumnVisibilityPersistence('popup-ads-table');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    right: ['actions'],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchName, setSearchName] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const deleteDialog = useDialog<PopupAdsListItem>();
  const formDialog = useDialog<PopupAdsListItem>();

  const fetchList = useCallback(
    (page: number, limit: number, name?: string) => {
      dispatch(
        getPopupAdsListRequest({
          page,
          limit,
          filters: name ? { name } : undefined,
          sort: [
            { orderBy: 'order', order: 'asc' },
            { orderBy: 'createdAt', order: 'asc' },
          ],
        })
      );
    },
    [dispatch]
  );

  useEffect(() => {
    fetchList(currentPage, pageSize, appliedSearch || undefined);
  }, [currentPage, pageSize, appliedSearch, fetchList]);

  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    setAppliedSearch(searchName);
  }, [searchName]);

  const handleToggleActive = useCallback(
    (item: PopupAdsListItem) => {
      dispatch(
        updatePopupAdsRequest({
          popupAdsId: item.id,
          isActive: !item.isActive,
          onSuccess: () => fetchList(currentPage, pageSize, appliedSearch || undefined),
        })
      );
    },
    [dispatch, fetchList, currentPage, pageSize, appliedSearch]
  );

  const handleDelete = useCallback(() => {
    if (!deleteDialog.data) return;

    dispatch(
      deletePopupAdsRequest({
        id: deleteDialog.data.id,
        onSuccess: () => {
          deleteDialog.close();
          fetchList(currentPage, pageSize, appliedSearch || undefined);
        },
      })
    );
  }, [deleteDialog, dispatch, fetchList, currentPage, pageSize, appliedSearch]);

  const columns = useMemo<ColumnDef<PopupAdsListItem>[]>(
    () => [
      createSelectionColumn<PopupAdsListItem>(),
      {
        accessorKey: 'startAt',
        header: t('displayTime'),
        cell: ({ row }) => {
          const start = row.original.startAt
            ? format(new Date(row.original.startAt), 'dd/MM/yyyy')
            : '-';
          const end = row.original.endAt ? format(new Date(row.original.endAt), 'dd/MM/yyyy') : '-';
          return `${start} ~ ${end}`;
        },
      },
      {
        accessorKey: 'image',
        header: t('displayImage'),
        cell: ({ row }) =>
          row.original.image ? (
            <img
              src={row.original.image}
              alt={row.original.name}
              style={{
                width: 64,
                height: 38,
                objectFit: 'cover',
                borderRadius: 4,
                background: '#000',
              }}
            />
          ) : (
            <Box
              sx={{
                width: 64,
                height: 38,
                bgcolor: '#000',
                borderRadius: '4px',
              }}
            />
          ),
      },
      {
        accessorKey: 'name',
        header: t('popupName'),
        cell: ({ row }) => (
          <Box
            sx={{
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={row.original.name}
          >
            {row.original.name}
          </Box>
        ),
      },
      {
        accessorKey: 'link',
        header: t('link'),
        cell: ({ row }) => (
          <Box
            sx={{
              maxWidth: 180,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={row.original.link ?? ''}
          >
            {row.original.link || '-'}
          </Box>
        ),
      },
      {
        accessorKey: 'order',
        header: t('order'),
        cell: ({ row }) => row.original.order,
      },
      {
        accessorKey: 'isActive',
        header: t('status'),
        cell: ({ row }) => {
          const isExpired =
            row.original.isActive &&
            row.original.endAt &&
            new Date(row.original.endAt) < new Date();
          return (
            <Chip
              label={isExpired ? t('ended') : row.original.isActive ? t('active') : t('inactive')}
              color={isExpired ? 'warning' : row.original.isActive ? 'success' : 'default'}
              size="small"
              variant="outlined"
              sx={{ '& .MuiChip-label': { px: 1 } }}
            />
          );
        },
      },
      {
        id: 'toggle',
        header: t('onOff'),
        cell: ({ row }) => (
          <Switch
            checked={row.original.isActive}
            onChange={() => handleToggleActive(row.original)}
            size="small"
            color="primary"
          />
        ),
      },
      {
        id: 'actions',
        header: t('actions'),
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={() => formDialog.open(row.original)} color="primary">
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => deleteDialog.open(row.original)} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ),
      },
    ],
    [t, handleToggleActive, formDialog, deleteDialog]
  );

  const table = useReactTable({
    data: popupAdsList,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility,
      rowSelection,
      columnPinning,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onColumnPinningChange: setColumnPinning,
    enableRowSelection: true,
  });

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
      {/* Toolbar */}
      <Card sx={{ mb: 2, boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)', flexShrink: 0 }}>
        <SearchBar
          value={searchName}
          onChange={setSearchName}
          placeholder={t('searchByPopupName')}
          showSearchButton
          onSearch={handleSearch}
          renderActions={() => <ColumnVisibility table={table} />}
          renderFarRightActions={() => (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => formDialog.open(null)}
              sx={{
                bgcolor: '#0165FC',
                '&:hover': { bgcolor: '#0052CC' },
              }}
            >
              {t('addNew')}
            </Button>
          )}
        />
      </Card>

      {/* Table */}
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
          <DataTable table={table} />
        </Card>
      </Box>

      {/* Pagination */}
      <TablePagination
        table={table}
        totalItems={pagination.total}
        pageSize={pageSize}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize);
          setCurrentPage(1);
        }}
      />

      {/* Create / Edit Dialog */}
      <PopupAdsForm
        open={formDialog.isOpen}
        onClose={formDialog.close}
        editData={formDialog.data}
        onSuccess={() => fetchList(currentPage, pageSize, appliedSearch || undefined)}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        title={t('confirm')}
        message={t('deletePopupAdsConfirm')}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
