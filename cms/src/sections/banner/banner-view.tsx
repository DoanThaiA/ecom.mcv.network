import { Box, Card, Chip, IconButton, Stack, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import VideocamIcon from '@mui/icons-material/Videocam';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useColumnVisibilityPersistence, useDialog } from 'src/hooks';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getBannersRequest,
  deleteBannerRequest,
  setFilters,
  selectBanners,
  selectBannerLoading,
  selectBannerPagination,
  selectBannerFilters,
  BannerMediaType,
} from 'src/redux/store/bannerSlice';
import type { BannerListItem } from 'src/types/gen/shared/shared/banners/banner';
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type RowSelectionState,
  type ColumnPinningState,
} from '@tanstack/react-table';
import {
  ColumnVisibility,
  DataTable,
  TablePagination,
  createSelectionColumn,
} from 'src/components/table';
import { DeleteConfirmDialog } from 'src/components/dialog';

export function BannerView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const banners = useAppSelector(selectBanners);
  const loading = useAppSelector(selectBannerLoading);
  const pagination = useAppSelector(selectBannerPagination);
  const filters = useAppSelector(selectBannerFilters);

  const [columnVisibility, setColumnVisibility] = useColumnVisibilityPersistence('banner-table');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    right: ['actions'],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [positionFilter, setPositionFilter] = useState<number | 'all'>('all');

  const deleteDialog = useDialog<BannerListItem>();

  useEffect(() => {
    const requestFilters: any = {};

    if (positionFilter !== 'all') {
      requestFilters.position = positionFilter;
    }

    dispatch(setFilters(requestFilters));
    dispatch(
      getBannersRequest({
        page: currentPage,
        limit: pageSize,
        filters: requestFilters,
        sort: [{ orderBy: 'order', order: 'asc' }],
      })
    );
  }, [dispatch, currentPage, pageSize, positionFilter]);

  const handleDelete = useCallback(() => {
    if (!deleteDialog.data) return;

    dispatch(
      deleteBannerRequest({
        id: deleteDialog.data.id,
        onSuccess: () => {
          deleteDialog.close();
          dispatch(
            getBannersRequest({
              page: currentPage,
              limit: pageSize,
              filters,
            })
          );
        },
      })
    );
  }, [deleteDialog.data, dispatch, currentPage, pageSize, filters, deleteDialog]);

  const columns = useMemo<ColumnDef<BannerListItem>[]>(
    () => [
      createSelectionColumn<BannerListItem>(),
      {
        accessorKey: 'position',
        header: t('position'),
        cell: ({ row }) => (
          <Chip
            label={row.original.position === 1 ? t('heroSlider') : t('adSection')}
            variant="outlined"
            size="small"
          />
        ),
      },
      {
        accessorKey: 'mediaType',
        header: t('mediaType'),
        cell: ({ row }) => {
          const isVideo = row.original.mediaType === BannerMediaType.BANNER_MEDIA_TYPE_VIDEO;
          return (
            <Chip
              icon={isVideo ? <VideocamIcon /> : <ImageIcon />}
              label={isVideo ? t('videoType') : t('imageType')}
              variant="outlined"
              size="small"
            />
          );
        },
      },
      {
        accessorKey: 'media',
        header: t('media'),
        cell: ({ row }) => {
          const isVideo = row.original.mediaType === BannerMediaType.BANNER_MEDIA_TYPE_VIDEO;
          const media = row.original.media;
          if (!media) return '-';

          return (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {isVideo ? (
                <>
                  <video
                    src={media.mobile}
                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                    muted
                  />
                  <video
                    src={media.tablet}
                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                    muted
                  />
                  <video
                    src={media.desktop}
                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                    muted
                  />
                </>
              ) : (
                <>
                  <img
                    src={media.mobile}
                    alt="Mobile"
                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                  />
                  <img
                    src={media.tablet}
                    alt="Tablet"
                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                  />
                  <img
                    src={media.desktop}
                    alt="Desktop"
                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                  />
                </>
              )}
            </Box>
          );
        },
      },
      {
        accessorKey: 'link',
        header: t('link'),
        cell: ({ row }) => row.original.link || '-',
      },
      {
        accessorKey: 'order',
        header: t('order'),
        cell: ({ row }) => row.original.order,
      },
      {
        accessorKey: 'isActive',
        header: t('status'),
        cell: ({ row }) => (
          <Chip
            label={row.original.isActive ? t('active') : t('inactive')}
            color={row.original.isActive ? 'success' : 'default'}
            size="small"
          />
        ),
      },
      {
        id: 'actions',
        header: t('actions'),
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              onClick={() => navigate(`/banners/${row.original.id}/edit`)}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => deleteDialog.open(row.original)} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ),
      },
    ],
    [t, navigate, deleteDialog]
  );

  const table = useReactTable({
    data: banners,
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
      {/* Filters */}
      <Card sx={{ mb: 2, boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)', flexShrink: 0 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={t('all')}
              onClick={() => setPositionFilter('all')}
              color={positionFilter === 'all' ? 'primary' : 'default'}
              variant={positionFilter === 'all' ? 'filled' : 'outlined'}
            />
            <Chip
              label={t('heroSlider')}
              onClick={() => setPositionFilter(1)}
              color={positionFilter === 1 ? 'primary' : 'default'}
              variant={positionFilter === 1 ? 'filled' : 'outlined'}
            />
            <Chip
              label={t('adSection')}
              onClick={() => setPositionFilter(2)}
              color={positionFilter === 2 ? 'primary' : 'default'}
              variant={positionFilter === 2 ? 'filled' : 'outlined'}
            />
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <ColumnVisibility table={table} />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/banners/new')}
            sx={{
              bgcolor: '#0165FC',
              '&:hover': {
                bgcolor: '#0052CC',
              },
            }}
          >
            {t('addNew')}
          </Button>
        </Stack>
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        title={t('confirm')}
        message={t('deleteBannerConfirm')}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
