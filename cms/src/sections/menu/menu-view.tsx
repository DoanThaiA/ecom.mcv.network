import _ from 'lodash';
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
  MenuItem as MuiMenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useColumnVisibilityPersistence, useDialog } from 'src/hooks';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getAllMenusRequest,
  deleteMenuRequest,
  setStatusFilter,
  selectAllMenus,
  selectAllMenusLoading,
  selectMenuStatusFilter,
} from 'src/redux/store/menuSlice';
import type { Menu } from 'src/types/gen/shared/shared/menus/menu';
import { MenuStatus, MenuType } from 'src/types/gen/shared/shared/common/enums';
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
  createSelectionColumn,
} from 'src/components/table';
import { DeleteConfirmDialog } from 'src/components/dialog';
import { MenuDialog } from './components/menu-dialog';

// ----------------------------------------------------------------------

const getStatusColor = (status: MenuStatus | number | string): 'success' | 'default' => {
  if (
    status === MenuStatus.MENU_STATUS_ACTIVE ||
    status === 1 ||
    status === 'MENU_STATUS_ACTIVE' ||
    status === 'active'
  ) {
    return 'success';
  }
  return 'default';
};

const getStatusLabel = (
  status: MenuStatus | number | string,
  t: (key: string) => string
): string => {
  if (
    status === MenuStatus.MENU_STATUS_ACTIVE ||
    status === 1 ||
    status === 'MENU_STATUS_ACTIVE' ||
    status === 'active'
  ) {
    return t('active');
  }
  if (
    status === MenuStatus.MENU_STATUS_INACTIVE ||
    status === 2 ||
    status === 'MENU_STATUS_INACTIVE' ||
    status === 'inactive'
  ) {
    return t('inactive');
  }
  return '-';
};

const getTypeLabel = (type: MenuType | number | string, t: (key: string) => string): string => {
  if (
    type === MenuType.MENU_TYPE_CATEGORY ||
    type === 1 ||
    type === 'MENU_TYPE_CATEGORY' ||
    type === 'category'
  ) {
    return t('menuTypeCategory');
  }
  if (
    type === MenuType.MENU_TYPE_TOPIC ||
    type === 2 ||
    type === 'MENU_TYPE_TOPIC' ||
    type === 'topic'
  ) {
    return t('menuTypeTopic');
  }
  if (type === MenuType.MENU_TYPE_URL || type === 3 || type === 'MENU_TYPE_URL' || type === 'url') {
    return t('menuTypeUrl');
  }
  return '-';
};

export function MenuView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // Redux state
  const allMenus = useAppSelector(selectAllMenus);
  const loading = useAppSelector(selectAllMenusLoading);
  const statusFilter = useAppSelector(selectMenuStatusFilter);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useColumnVisibilityPersistence('menu-table');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    right: ['actions'],
  });

  const deleteDialog = useDialog<Menu>();
  const menuDialog = useDialog<Menu | null>();

  // Fetch all menus
  useEffect(() => {
    dispatch(getAllMenusRequest({}));
  }, [dispatch]);

  const handleDeleteConfirm = async () => {
    if (deleteDialog.data) {
      dispatch(
        deleteMenuRequest({
          id: deleteDialog.data.id,
          onSuccess: () => {
            deleteDialog.close();
          },
        })
      );
    }
  };

  const handleCreateMenu = () => {
    menuDialog.open(null);
  };

  const handleEditMenu = (menu: Menu) => {
    menuDialog.open(menu);
  };

  const handleMenuDialogSuccess = () => {
    menuDialog.close();
    // Refresh all menus
    dispatch(getAllMenusRequest({}));
  };

  // Get parent menu name - use lodash for null safety
  const getParentName = (parentId?: string): string => {
    if (!parentId) return '-';
    const parent = _.find(allMenus, (m) => m.id === parentId);
    return parent?.name || '-';
  };

  // Calculate menu level (depth) by traversing parent chain - use lodash for null safety
  const getMenuLevel = (menu: Menu, menuList: Menu[]): number => {
    let level = 0;
    let currentMenu = menu;
    while (currentMenu.parentId) {
      level += 1;
      const parent = _.find(menuList, (m) => m.id === currentMenu.parentId);
      if (!parent) break;
      currentMenu = parent;
    }
    return level;
  };

  // Build tree-structured menu list (parents followed by their children)
  const buildTreeMenuList = (menuList: Menu[]): Menu[] => {
    const result: Menu[] = [];
    const processed = new Set<string>();

    // Recursive function to add menu and its children
    const addMenuWithChildren = (menu: Menu) => {
      if (processed.has(menu.id)) return;
      processed.add(menu.id);
      result.push(menu);

      // Find and add all direct children - use lodash for null safety
      const children = _.filter(menuList, (m) => m.parentId === menu.id);
      children.sort((a, b) => (a.order || 0) - (b.order || 0));
      children.forEach((child) => addMenuWithChildren(child));
    };

    // Start with root menus (no parent) - use lodash for null safety
    const rootMenus = _.filter(menuList, (m) => !m.parentId);
    rootMenus.sort((a, b) => (a.order || 0) - (b.order || 0));
    rootMenus.forEach((menu) => addMenuWithChildren(menu));

    // Add any remaining menus (orphans with invalid parentId) - use lodash for null safety
    _.forEach(menuList, (menu) => {
      if (!processed.has(menu.id)) {
        result.push(menu);
      }
    });

    return result;
  };

  // Filter menus by status and search query
  const filteredMenus = useMemo(() => {
    let result = allMenus;

    // Filter by status
    if (statusFilter !== 'all') {
      result = _.filter(result, (menu) => {
        const status = menu.status as MenuStatus | number | string;
        if (statusFilter === 'active') {
          return (
            status === MenuStatus.MENU_STATUS_ACTIVE ||
            status === 1 ||
            status === 'MENU_STATUS_ACTIVE' ||
            status === 'active'
          );
        }
        return (
          status === MenuStatus.MENU_STATUS_INACTIVE ||
          status === 2 ||
          status === 'MENU_STATUS_INACTIVE' ||
          status === 'inactive'
        );
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = _.filter(result, (menu) => menu.name?.toLowerCase().includes(query));
    }

    return result;
  }, [allMenus, statusFilter, searchQuery]);

  // Get tree-structured menus for display
  const treeMenus = useMemo(() => buildTreeMenuList(filteredMenus), [filteredMenus]);

  // Format menu name with indentation based on level
  const formatMenuName = (menu: Menu): string => {
    const level = getMenuLevel(menu, treeMenus);
    if (level === 0) return menu.name;
    const dashes = '—'.repeat(level); // Use em-dash for better visibility
    return `${dashes} ${menu.name}`;
  };

  const columns = useMemo<ColumnDef<Menu>[]>(
    () => [
      createSelectionColumn<Menu>(),
      {
        id: 'index',
        header: () => <Box sx={{ textAlign: 'center', width: '100%' }}>#</Box>,
        meta: { title: '#' },
        size: 60,
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            {row.index + 1}
          </Typography>
        ),
      },
      {
        accessorKey: 'name',
        header: t('menuName'),
        meta: { title: t('menuName') },
        size: 300,
        cell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{
              color: '#235AFF',
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
            onClick={() => handleEditMenu(row.original)}
          >
            {formatMenuName(row.original)}
          </Typography>
        ),
      },
      {
        accessorKey: 'type',
        header: () => <Box sx={{ textAlign: 'center', width: '100%' }}>{t('menuType')}</Box>,
        meta: { title: t('menuType') },
        size: 140,
        cell: ({ getValue }) => (
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            {getTypeLabel(getValue() as MenuType, t)}
          </Typography>
        ),
      },
      {
        accessorKey: 'status',
        header: () => <Box sx={{ textAlign: 'center', width: '100%' }}>{t('status')}</Box>,
        meta: { title: t('status') },
        size: 140,
        cell: ({ getValue }) => {
          const status = getValue() as MenuStatus;
          const statusColor = getStatusColor(status);
          return (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Chip
                label={getStatusLabel(status, t)}
                size="small"
                color={statusColor}
                sx={{
                  fontWeight: 500,
                  borderRadius: '6px',
                }}
              />
            </Box>
          );
        },
      },
      {
        accessorKey: 'order',
        header: () => <Box sx={{ textAlign: 'center', width: '100%' }}>{t('order')}</Box>,
        meta: { title: t('order') },
        size: 100,
        cell: ({ getValue }) => (
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            {getValue() as number}
          </Typography>
        ),
      },
      {
        id: 'actions',
        header: () => <Box sx={{ textAlign: 'center', width: '100%' }}>{t('actions')}</Box>,
        meta: { title: t('actions') },
        size: 100,
        enableSorting: false,
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5} justifyContent="center">
            <IconButton
              size="small"
              sx={{ color: '#0165FC' }}
              onClick={() => handleEditMenu(row.original)}
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
    [t, deleteDialog, allMenus]
  );

  const table = useReactTable({
    data: treeMenus,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnPinning,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onColumnPinningChange: setColumnPinning,
    enableRowSelection: true,
    enableColumnPinning: true,
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

    if (_.size(allMenus) === 0 && !searchQuery && statusFilter === 'all') {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('noData')}</Typography>
        </Box>
      );
    }

    if (_.size(filteredMenus) === 0 && (searchQuery || statusFilter !== 'all')) {
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
          renderActions={() => (
            <>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    dispatch(setStatusFilter(e.target.value as 'all' | 'active' | 'inactive'));
                  }}
                  displayEmpty
                  sx={{
                    '& .MuiSelect-select': {
                      py: 1,
                    },
                  }}
                >
                  <MuiMenuItem value="all">{t('all')}</MuiMenuItem>
                  <MuiMenuItem value="active">{t('active')}</MuiMenuItem>
                  <MuiMenuItem value="inactive">{t('inactive')}</MuiMenuItem>
                </Select>
              </FormControl>
              <ColumnVisibility table={table} />
            </>
          )}
          renderFarRightActions={() => (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateMenu}
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialog.isOpen}
        title="confirm"
        message={t('deleteMenuMessage')}
        onClose={deleteDialog.close}
        onConfirm={handleDeleteConfirm}
      />

      {/* Create/Edit Menu Dialog */}
      <MenuDialog
        open={menuDialog.isOpen}
        menu={menuDialog.data}
        allMenus={allMenus}
        onClose={menuDialog.close}
        onSuccess={handleMenuDialogSuccess}
      />
    </Box>
  );
}
