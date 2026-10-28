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
  getCmsUsersRequest,
  deleteCmsUserRequest,
  selectCmsUsers,
  selectCmsUserLoading,
  selectCmsUserPagination,
} from 'src/redux/store/cmsUserSlice';
import {
  AccountTypeEnum,
  ModulePermission,
  type CmsUserData,
  type FilterCmsUserDto,
} from 'src/repositories/cms-user.repository';
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

// Status helpers
const getStatusLabel = (status: number, t: (key: string) => string) => {
  switch (status) {
    case 1:
      return t('active');
    case 2:
      return t('inactive');
    default:
      return '-';
  }
};

const getStatusColor = (status: number): 'success' | 'error' | 'default' => {
  switch (status) {
    case 1:
      return 'success';
    case 2:
      return 'error';
    default:
      return 'default';
  }
};

const getAccountTypeLabel = (accountType: number, t: (key: string) => string) => {
  switch (accountType) {
    case AccountTypeEnum.website_admin:
      return t('websiteAdmin');
    case AccountTypeEnum.affiliate:
      return t('affiliateAgent');
    default:
      return String(accountType);
  }
};

const getAccountTypeColor = (accountType: number): 'primary' | 'secondary' | 'default' => {
  switch (accountType) {
    case AccountTypeEnum.website_admin:
      return 'primary';
    case AccountTypeEnum.affiliate:
      return 'secondary';
    default:
      return 'default';
  }
};

// Permission label helper
const getPermissionLabel = (permission: number, t: (key: string) => string) => {
  const map: Record<number, string> = {
    [ModulePermission.product_management]: t('productManagementPermission'),
    [ModulePermission.order_management]: t('orderManagementPermission'),
    [ModulePermission.return_management]: t('returnManagementPermission'),
    [ModulePermission.flash_sale_management]: t('flashSaleManagementPermission'),
    [ModulePermission.promotion_management]: t('promotionManagementPermission'),
    [ModulePermission.news_management]: t('newsManagementPermission'),
    [ModulePermission.homepage_management]: t('homepageManagementPermission'),
    [ModulePermission.settings]: t('settingsPermission'),
    [ModulePermission.push_notification_management]: t('pushNotificationManagementPermission'),
    [ModulePermission.affiliate_management]: t('affiliateManagementPermission'),
    [ModulePermission.account_management]: t('accountManagementPermission'),
    [ModulePermission.shipping_management]: t('shippingManagementPermission'),
  };
  return map[permission] ?? String(permission);
};

// ----------------------------------------------------------------------

export function CmsUserListView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const cmsUsers = useAppSelector(selectCmsUsers);
  const loading = useAppSelector(selectCmsUserLoading);
  const pagination = useAppSelector(selectCmsUserPagination);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [committedSearchQuery, setCommittedSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useColumnVisibilityPersistence('cms-user-table');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    right: ['actions'],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const deleteDialog = useDialog<CmsUserData>();

  // Fetch on filter/page changes
  useEffect(() => {
    const requestFilters: FilterCmsUserDto = {};

    if (committedSearchQuery) {
      requestFilters.search = committedSearchQuery;
    }

    dispatch(
      getCmsUsersRequest({
        page: currentPage,
        limit: pageSize,
        filters: Object.keys(requestFilters).length > 0 ? requestFilters : undefined,
      })
    );
  }, [dispatch, currentPage, pageSize, committedSearchQuery]);

  const handleDeleteConfirm = async () => {
    if (deleteDialog.data) {
      dispatch(
        deleteCmsUserRequest({
          id: deleteDialog.data.id,
          onSuccess: () => {
            deleteDialog.close();
          },
        })
      );
    }
  };

  const handleSearch = useCallback(() => {
    setCommittedSearchQuery(searchQuery);
    setCurrentPage(1);
  }, [searchQuery]);

  const columns = useMemo<ColumnDef<CmsUserData>[]>(
    () => [
      createSelectionColumn<CmsUserData>(),
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
        accessorKey: 'accountType',
        header: t('accountType'),
        size: 160,
        cell: ({ getValue }) => {
          const accountType = getValue() as number;
          return (
            <Chip
              label={getAccountTypeLabel(accountType, t)}
              size="small"
              color={getAccountTypeColor(accountType)}
              sx={{ fontWeight: 500, borderRadius: '6px' }}
            />
          );
        },
      },
      {
        accessorKey: 'email',
        header: t('email'),
        size: 220,
        cell: ({ getValue }) => (
          <Typography variant="body2">{(getValue() as string) || '-'}</Typography>
        ),
      },
      {
        id: 'fullName',
        header: t('name'),
        size: 180,
        cell: ({ row }) => {
          const firstName = row.original.firstName ?? '';
          const lastName = row.original.lastName ?? '';
          const fullName = [firstName, lastName].filter(Boolean).join(' ');
          return <Typography variant="body2">{fullName || '-'}</Typography>;
        },
      },
      {
        accessorKey: 'phone',
        header: t('phone'),
        size: 140,
        cell: ({ getValue }) => (
          <Typography variant="body2">{(getValue() as string) || '-'}</Typography>
        ),
      },
      {
        accessorKey: 'permissions',
        header: t('cmsPermissions'),
        size: 280,
        cell: ({ getValue }) => {
          const permissions = (getValue() as ModulePermission[]) || [];
          if (!permissions.length) return <Typography variant="body2">-</Typography>;
          return (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {permissions.slice(0, 3).map((perm) => (
                <Chip
                  key={perm}
                  label={getPermissionLabel(perm, t)}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', borderRadius: '4px' }}
                />
              ))}
              {permissions.length > 3 && (
                <Chip
                  label={`+${permissions.length - 3}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', borderRadius: '4px' }}
                />
              )}
            </Stack>
          );
        },
      },
      {
        accessorKey: 'status',
        header: t('status'),
        size: 120,
        cell: ({ getValue }) => {
          const status = getValue() as number;
          return (
            <Chip
              label={getStatusLabel(status, t)}
              size="small"
              color={getStatusColor(status)}
              sx={{ fontWeight: 500, borderRadius: '6px' }}
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
              onClick={() => navigate(`/cms-users/edit/${row.original.id}`)}
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
    data: cmsUsers,
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

    if (cmsUsers.length === 0 && !searchQuery) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('noData')}</Typography>
        </Box>
      );
    }

    if (cmsUsers.length === 0 && searchQuery) {
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
              onClick={() => navigate('/cms-users/create')}
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
        message={t('deleteAccountMessage')}
        onClose={deleteDialog.close}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}
