import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  IconButton,
  Chip,
  Typography,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { DataTable, TablePagination, createSelectionColumn } from 'src/components/table';
import { DeleteConfirmDialog } from 'src/components/dialog';
import { useColumnVisibilityPersistence } from 'src/hooks';
import {
  queryAffiliatesRequest,
  deleteAffiliateRequest,
  selectAffiliates,
  selectPagination,
} from 'src/redux/store/affiliatesSlice';
import type { AffiliateListItem } from 'src/types/gen/shared/shared/affiliates/affiliate';
import type { SortAffiliate } from 'src/types/gen/cms/cms/affiliates/affiliate';
import { AffiliateType, AffiliateStatus } from 'src/types/gen/shared/shared/common/enums';

interface FilterState {
  status: AffiliateStatus | 'all';
  type: AffiliateType | 'all';
  search: string;
}

export function AffiliatesView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const affiliates = useSelector(selectAffiliates);
  const pagination = useSelector(selectPagination);

  // Local state
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    type: 'all',
    search: '',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [columnVisibility, setColumnVisibility] =
    useColumnVisibilityPersistence('affiliates-table');

  // Refs to always hold the latest state values (avoids stale closures)
  const filtersRef = useRef(filters);
  const sortingRef = useRef(sorting);
  const pageRef = useRef(page);
  const pageSizeRef = useRef(pageSize);
  filtersRef.current = filters;
  sortingRef.current = sorting;
  pageRef.current = page;
  pageSizeRef.current = pageSize;

  // Ref to track if initial data has been loaded
  const isInitialLoadRef = useRef(false);

  // Stable function to load affiliates — always reads latest state via refs
  const loadAffiliates = useCallback(
    (
      params: {
        page?: number;
        limit?: number;
        filters?: FilterState;
        sorting?: SortingState;
      } = {}
    ) => {
      const currentPage = params.page ?? pageRef.current;
      const currentLimit = params.limit ?? pageSizeRef.current;
      const currentFilters = params.filters ?? filtersRef.current;
      const currentSorting = params.sorting ?? sortingRef.current;

      // Convert TanStack sorting to API format
      const sort: SortAffiliate[] =
        currentSorting.length > 0
          ? currentSorting.map((s) => ({
              orderBy: s.id,
              order: s.desc ? 'desc' : 'asc',
            }))
          : [];

      const queryParams: any = {
        page: currentPage,
        limit: currentLimit,
        sort,
      };

      if (
        currentFilters.search ||
        currentFilters.status !== 'all' ||
        currentFilters.type !== 'all'
      ) {
        queryParams.filters = {
          search: currentFilters.search || undefined,
          statuses: currentFilters.status !== 'all' ? [currentFilters.status] : [],
          types: currentFilters.type !== 'all' ? [currentFilters.type] : [],
        };
      }

      dispatch(queryAffiliatesRequest(queryParams));
    },
    [dispatch]
  );

  // Load data on mount
  useEffect(() => {
    if (!isInitialLoadRef.current) {
      isInitialLoadRef.current = true;
      loadAffiliates({ page: 1, limit: 10 });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reload when sorting changes
  useEffect(() => {
    if (isInitialLoadRef.current) {
      loadAffiliates({ page: 1, sorting });
    }
  }, [sorting]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handlers
  const handleSearch = useCallback(() => {
    setPage(1);
    loadAffiliates({ page: 1 });
  }, [loadAffiliates]);

  const handleFilterChange = useCallback(
    (key: keyof FilterState, value: AffiliateStatus | AffiliateType | 'all') => {
      const newFilters = { ...filtersRef.current, [key]: value };
      setFilters(newFilters);
      setPage(1);
      loadAffiliates({ page: 1, filters: newFilters });
    },
    [loadAffiliates]
  );

  const handleSearchInputChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  }, []);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      loadAffiliates({ page: newPage });
    },
    [loadAffiliates]
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      setPageSize(newSize);
      setPage(1);
      loadAffiliates({ page: 1, limit: newSize });
    },
    [loadAffiliates]
  );

  const handleCreate = useCallback(() => {
    navigate('/affiliates/create');
  }, [navigate]);

  const handleView = useCallback(
    (id: string) => {
      navigate(`/affiliates/${id}`);
    },
    [navigate]
  );

  const handleEdit = useCallback(
    (id: string) => {
      navigate(`/affiliates/edit/${id}`);
    },
    [navigate]
  );

  const handleDeleteClick = useCallback((id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deletingId) {
      dispatch(
        deleteAffiliateRequest({
          affiliateId: deletingId,
          onSuccess: () => {
            setDeleteDialogOpen(false);
            setDeletingId(null);
            // Refresh list
            loadAffiliates();
          },
        })
      );
    }
  }, [dispatch, deletingId, loadAffiliates]);

  // Table columns
  const columns = useMemo<ColumnDef<AffiliateListItem>[]>(
    () => [
      createSelectionColumn<AffiliateListItem>(),
      {
        id: 'affiliateCode',
        accessorKey: 'affiliateCode',
        header: t('affiliateCode'),
        size: 120,
        enableSorting: false,
      },
      {
        id: 'name',
        accessorKey: 'name',
        header: t('affiliateName'),
        size: 200,
      },
      {
        id: 'email',
        accessorKey: 'email',
        header: t('email'),
        size: 220,
        enableSorting: false,
      },
      {
        id: 'phone',
        accessorKey: 'phone',
        header: t('phone'),
        size: 130,
        enableSorting: false,
      },
      {
        id: 'type',
        accessorKey: 'type',
        header: t('classification'),
        size: 120,
        cell: ({ getValue }) => {
          const type = getValue() as AffiliateType;
          const typeMap: Partial<Record<AffiliateType, string>> = {
            [AffiliateType.AFFILIATE_TYPE_KOL]: t('kol'),
            [AffiliateType.AFFILIATE_TYPE_CTV]: t('ctv'),
            [AffiliateType.AFFILIATE_TYPE_PUBLISHER]: t('publisher'),
            [AffiliateType.AFFILIATE_TYPE_UNSPECIFIED]: '-',
          };
          return typeMap[type] || '-';
        },
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: t('status'),
        size: 130,
        cell: ({ getValue }) => {
          const status = getValue() as AffiliateStatus;
          const isActive = status === AffiliateStatus.AFFILIATE_STATUS_ACTIVE;
          return (
            <Chip
              label={isActive ? t('active') : t('inactive')}
              size="small"
              sx={{
                bgcolor: isActive ? '#E6F7ED' : '#F5F5F5',
                color: isActive ? '#22C55E' : '#6B7280',
                fontWeight: 500,
              }}
            />
          );
        },
      },
      {
        id: 'actions',
        header: t('actions'),
        size: 120,
        enableSorting: false,
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={() => handleView(row.original.id)}>
              <ViewIcon fontSize="small" sx={{ color: '#0EA5E9' }} />
            </IconButton>
            <IconButton size="small" onClick={() => handleEdit(row.original.id)}>
              <EditIcon fontSize="small" sx={{ color: '#235AFF' }} />
            </IconButton>
            <IconButton size="small" onClick={() => handleDeleteClick(row.original.id)}>
              <DeleteIcon fontSize="small" sx={{ color: '#EF4444' }} />
            </IconButton>
          </Stack>
        ),
      },
    ],
    [t, handleView, handleEdit, handleDeleteClick]
  );

  // TanStack Table setup
  const table = useReactTable({
    data: affiliates,
    columns,
    state: {
      columnVisibility,
      rowSelection,
      sorting,
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
    },
    pageCount: pagination.totalPages,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    manualPagination: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    getRowId: (row) => row.id,
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{t('affiliatesList')}</Typography>
        <Button
          variant="contained"
          onClick={handleCreate}
          sx={{ bgcolor: '#235AFF', '&:hover': { bgcolor: '#1B4ACC' } }}
        >
          {t('addAffiliate')}
        </Button>
      </Stack>

      {/* Filters */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('status')}</InputLabel>
            <Select
              value={filters.status}
              label={t('status')}
              onChange={(e) =>
                handleFilterChange('status', e.target.value as AffiliateStatus | 'all')
              }
            >
              <MenuItem value="all">{t('all')}</MenuItem>
              <MenuItem value={AffiliateStatus.AFFILIATE_STATUS_ACTIVE}>{t('active')}</MenuItem>
              <MenuItem value={AffiliateStatus.AFFILIATE_STATUS_INACTIVE}>{t('inactive')}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('affiliateType')}</InputLabel>
            <Select
              value={filters.type}
              label={t('affiliateType')}
              onChange={(e) => handleFilterChange('type', e.target.value as AffiliateType | 'all')}
            >
              <MenuItem value="all">{t('all')}</MenuItem>
              <MenuItem value={AffiliateType.AFFILIATE_TYPE_KOL}>{t('kol')}</MenuItem>
              <MenuItem value={AffiliateType.AFFILIATE_TYPE_CTV}>{t('ctv')}</MenuItem>
              <MenuItem value={AffiliateType.AFFILIATE_TYPE_PUBLISHER}>{t('publisher')}</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            placeholder={t('searchAffiliateByCodeNamePhone')}
            value={filters.search}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            sx={{ flex: 1 }}
          />

          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{
              bgcolor: '#0165FC',
              '&:hover': {
                bgcolor: '#0052CC',
              },
            }}
          >
            {t('search')}
          </Button>
        </Stack>
      </Card>

      {/* Table */}
      <Card>
        <DataTable table={table} />
        <TablePagination
          table={table}
          totalItems={pagination.total}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('deleteAffiliate')}
        message={t('deleteAffiliateMessage')}
      />
    </Box>
  );
}
