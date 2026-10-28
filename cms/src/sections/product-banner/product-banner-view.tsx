import { useMemo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnPinningState,
} from '@tanstack/react-table';

import { useColumnVisibilityPersistence, useDialog } from 'src/hooks';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getProductBannersRequest,
  getProductBannerByIdRequest,
  deleteProductBannerRequest,
  selectProductBanners,
  selectProductBannerLoading,
  selectProductBannerPagination,
  selectCurrentProductBanner,
} from 'src/redux/store/productBannerSlice';
import type { ProductBannerListItem } from 'src/types/gen/shared/shared/product-banners/product-banner';
import {
  ProductBannerPosition,
  productBannerPositionToJSON,
} from 'src/types/gen/shared/shared/common/enums';
import { SearchBar, ColumnVisibility, DataTable, TablePagination } from 'src/components/table';
import { DeleteConfirmDialog } from 'src/components/dialog';
import { TableImagePreview } from 'src/components/table-image-preview';
import { CreateProductBannerDialog } from './components/create-product-banner-dialog';
import { EditProductBannerDialog } from './components/edit-product-banner-dialog';

// ----------------------------------------------------------------------

type IsActiveFilter = 'all' | 'active' | 'inactive';

// ----------------------------------------------------------------------

export function ProductBannerView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // Redux state
  const banners = useAppSelector(selectProductBanners);
  const loading = useAppSelector(selectProductBannerLoading);
  const pagination = useAppSelector(selectProductBannerPagination);
  const currentBanner = useAppSelector(selectCurrentProductBanner);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'updatedAt', desc: true }]);
  const [columnVisibility, setColumnVisibility] =
    useColumnVisibilityPersistence('product-banner-table');
  const [columnPinning] = useState<ColumnPinningState>({
    right: ['actions'],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isActiveFilter, setIsActiveFilter] = useState<IsActiveFilter>('all');

  // Dialog states
  const createDialog = useDialog();
  const editDialog = useDialog();
  const deleteDialog = useDialog<ProductBannerListItem>();

  // Fetch product banners when filters change
  useEffect(() => {
    const filters: any = {};

    if (isActiveFilter !== 'all') {
      filters.isActive = isActiveFilter === 'active';
    }

    // Add search filter
    if (searchQuery) {
      filters.search = searchQuery;
    }
    console.log('searchQuery', searchQuery);
    const sortConfig =
      sorting.length > 0
        ? sorting.map((s) => ({
            orderBy: s.id,
            order: s.desc ? 'desc' : 'asc',
          }))
        : [{ orderBy: 'updatedAt', order: 'desc' }];

    dispatch(
      getProductBannersRequest({
        page: currentPage,
        limit: pageSize,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        sort: sortConfig,
      })
    );
  }, [dispatch, currentPage, pageSize, isActiveFilter, sorting, searchQuery]);

  // Search handler
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  // Delete handler
  const handleDeleteConfirm = () => {
    if (deleteDialog.data) {
      dispatch(
        deleteProductBannerRequest({
          id: deleteDialog.data.id,
          onSuccess: () => {
            deleteDialog.close();
            // Refresh list
            dispatch(
              getProductBannersRequest({
                page: currentPage,
                limit: pageSize,
              })
            );
          },
        })
      );
    }
  };

  // Get position display key and color
  const getPositionDisplay = (position: ProductBannerPosition) => {
    const positionJSON = productBannerPositionToJSON(position);
    const positionKey = positionJSON.replace('PRODUCT_BANNER_POSITION_', '').toLowerCase();
    const color: 'info' | 'success' =
      position === ProductBannerPosition.PRODUCT_BANNER_POSITION_TOP ? 'info' : 'success';
    return { key: positionKey, color };
  };

  // Columns definition
  const columns = useMemo<ColumnDef<ProductBannerListItem>[]>(
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
        accessorKey: 'image',
        header: t('image'),
        size: 80,
        cell: ({ getValue }) => <TableImagePreview src={getValue() as string} alt="Banner" />,
      },
      {
        accessorKey: 'name',
        header: t('name'),
        size: 250,
        cell: ({ getValue, row }) => (
          <Typography
            variant="body2"
            sx={{
              color: '#235AFF',
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
            onClick={() => {
              // Fetch full banner data first
              dispatch(
                getProductBannerByIdRequest({
                  id: row.original.id,
                  onSuccess: () => {
                    // Open dialog after data is loaded
                    editDialog.open();
                  },
                })
              );
            }}
          >
            {getValue() as string}
          </Typography>
        ),
      },
      {
        accessorKey: 'position',
        header: t('position'),
        size: 120,
        cell: ({ getValue }) => {
          const position = getValue() as ProductBannerPosition;
          const { key, color } = getPositionDisplay(position);
          return <Chip label={t(key)} size="small" color={color} sx={{ minWidth: 70 }} />;
        },
      },
      {
        accessorKey: 'isActive',
        header: t('status'),
        size: 120,
        cell: ({ getValue }) => {
          const isActive = getValue() as boolean;
          return (
            <Chip
              label={t(isActive ? 'active' : 'inactive')}
              size="small"
              color={isActive ? 'success' : 'default'}
              sx={{ minWidth: 80 }}
            />
          );
        },
      },
      {
        accessorKey: 'productCount',
        header: t('productCount'),
        size: 120,
        cell: ({ getValue }) => {
          const count = getValue() as number | undefined;
          return (
            <Typography variant="body2" sx={{ textAlign: 'center' }}>
              {count ?? 0}
            </Typography>
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
              onClick={() => {
                // Fetch full banner data first
                dispatch(
                  getProductBannerByIdRequest({
                    id: row.original.id,
                    onSuccess: () => {
                      // Open dialog after data is loaded
                      editDialog.open();
                    },
                  })
                );
              }}
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
    [t, currentPage, pageSize, editDialog, deleteDialog]
  );

  // TanStack Table setup
  const table = useReactTable({
    data: banners,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnPinning,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
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

  // Empty state renderer
  const renderEmptyState = () => {
    if (loading) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('loading')}...</Typography>
        </Box>
      );
    }

    if (banners.length === 0 && searchQuery) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('noSearchResults')}</Typography>
        </Box>
      );
    }

    if (banners.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('noData')}</Typography>
        </Box>
      );
    }

    return null;
  };

  return (
    <Box>
      {/* Search Bar with Filters */}
      <Card sx={{ mb: 2, boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)' }}>
        <SearchBar
          value={searchQuery}
          onChange={handleSearch}
          placeholder={t('searchByName')}
          renderActions={() => (
            <Stack direction="row" spacing={1} alignItems="center">
              {/* Filter by Active Status */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>{t('status')}</InputLabel>
                <Select
                  value={isActiveFilter}
                  label={t('status')}
                  onChange={(e) => {
                    setIsActiveFilter(e.target.value as IsActiveFilter);
                    setCurrentPage(1);
                  }}
                >
                  <MenuItem value="all">{t('all')}</MenuItem>
                  <MenuItem value="active">{t('active')}</MenuItem>
                  <MenuItem value="inactive">{t('inactive')}</MenuItem>
                </Select>
              </FormControl>

              {/* Column Visibility */}
              <ColumnVisibility table={table} />

              {/* Create Button */}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={createDialog.open}
                sx={{
                  bgcolor: '#235AFF',
                  '&:hover': { bgcolor: '#1B4ACC' },
                }}
              >
                {t('create')}
              </Button>
            </Stack>
          )}
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
        {renderEmptyState() || <DataTable table={table} compact />}
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

      {/* Create Dialog */}
      <CreateProductBannerDialog open={createDialog.isOpen} onClose={createDialog.close} />

      {/* Edit Dialog */}
      <EditProductBannerDialog
        open={editDialog.isOpen}
        banner={currentBanner}
        onClose={editDialog.close}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialog.isOpen}
        title={t('confirm')}
        message={t('deleteProductBannerMessage')}
        onClose={deleteDialog.close}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}
