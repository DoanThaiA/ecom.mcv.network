import { Box, Card, Typography, Chip, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useColumnVisibilityPersistence } from 'src/hooks';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getProductCategoriesRequest,
  selectProductCategories,
  selectProductCategoryLoading,
} from 'src/redux/store/productCategorySlice';
import type { ProductCategory } from 'src/types/gen/shared/shared/product-categories/product-category';
import { ProductCategoryStatus } from 'src/types/gen/shared/shared/common/enums';
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { SearchBar, ColumnVisibility, DataTable } from 'src/components/table';
import { CategoryLocalizationDialog } from './components/category-localization-dialog';

// ----------------------------------------------------------------------

// Helper function to calculate category level from parentId
const getCategoryLevel = (category: ProductCategory, allCategories: ProductCategory[]): number => {
  if (!category.parentId) return 0;
  const parent = allCategories.find((c) => c.id === category.parentId);
  if (!parent) return 0;
  return 1 + getCategoryLevel(parent, allCategories);
};

// Helper function to get display name with hierarchical prefix
const getDisplayName = (name: string, level: number): string => {
  if (level === 0) return name;
  const prefix = '---'.repeat(level);
  return `${prefix}${name}`;
};

// Helper function to get status translation key
const getStatusKey = (status: ProductCategoryStatus): string => {
  if (status === ProductCategoryStatus.PRODUCT_CATEGORY_STATUS_ACTIVE) return 'active';
  return 'hidden';
};

// Helper function to get status chip color
const getStatusColor = (status: ProductCategoryStatus): 'success' | 'default' => {
  return status === ProductCategoryStatus.PRODUCT_CATEGORY_STATUS_ACTIVE ? 'success' : 'default';
};

export function ProductCategoryView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // Redux state
  const productCategories = useAppSelector(selectProductCategories);
  const loading = useAppSelector(selectProductCategoryLoading);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [columnVisibility, setColumnVisibility] =
    useColumnVisibilityPersistence('product-category-table');

  // Fetch product categories when filters change
  useEffect(() => {
    const filters: { search?: string } = {};

    if (searchQuery) {
      filters.search = searchQuery;
    }

    const sort =
      sorting.length > 0
        ? sorting.map((s) => ({
            orderBy: s.id,
            order: s.desc ? ('desc' as const) : ('asc' as const),
          }))
        : undefined;

    dispatch(
      getProductCategoriesRequest({
        page: 1,
        limit: 1000, // Get all categories since we need to display hierarchy
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        sort,
      })
    );
  }, [dispatch, searchQuery, sorting]);

  // Filter categories based on search query (client-side filtering for display)
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return productCategories;
    const lowerQuery = searchQuery.toLowerCase();
    return productCategories.filter(
      (category) =>
        category.name.toLowerCase().includes(lowerQuery) ||
        category.code.toLowerCase().includes(lowerQuery)
    );
  }, [productCategories, searchQuery]);

  const handleEditClick = (category: ProductCategory) => {
    setSelectedCategory(category);
    setEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleEditSuccess = () => {
    dispatch(
      getProductCategoriesRequest({
        page: 1,
        limit: 1000,
      })
    );
  };

  const columns = useMemo<ColumnDef<ProductCategory>[]>(
    () => [
      {
        id: 'index',
        header: '#',
        size: 60,
        enableSorting: false,
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            {row.index + 1}
          </Typography>
        ),
      },
      {
        accessorKey: 'name',
        header: t('name'),
        size: 300,
        cell: ({ row }) => {
          const level = getCategoryLevel(row.original, productCategories);
          const displayName = getDisplayName(row.original.name, level);
          return <Typography variant="body2">{displayName}</Typography>;
        },
      },
      {
        accessorKey: 'code',
        header: t('code'),
        size: 150,
      },
      {
        accessorKey: 'status',
        header: t('status'),
        size: 120,
        cell: ({ getValue }) => {
          const status = getValue() as ProductCategoryStatus;
          const statusKey = getStatusKey(status);
          const statusColor = getStatusColor(status);
          return (
            <Chip
              label={t(statusKey)}
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
        accessorKey: 'order',
        header: t('order'),
        size: 100,
        cell: ({ getValue }) => (
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            {(getValue() as number) ?? '--'}
          </Typography>
        ),
      },
      {
        id: 'productCount',
        header: t('productCount'),
        size: 120,
        enableSorting: false,
        cell: () => (
          <Typography variant="body2" sx={{ textAlign: 'right' }}>
            0
          </Typography>
        ),
      },
      {
        id: 'actions',
        header: t('actions'),
        size: 100,
        enableSorting: false,
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <IconButton
              size="small"
              onClick={() => handleEditClick(row.original)}
              sx={{ color: 'primary.main' }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [t, productCategories]
  );

  const table = useReactTable({
    data: filteredCategories,
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });

  // Render empty state or no search results
  const renderEmptyState = () => {
    if (loading) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('loading')}...</Typography>
        </Box>
      );
    }

    if (productCategories.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('noData')}</Typography>
        </Box>
      );
    }

    if (filteredCategories.length === 0 && searchQuery) {
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
      {/* Search Bar - Sticky */}
      <Card
        sx={{
          mb: 2,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: 'background.paper',
        }}
      >
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('searchProductCategory')}
          renderActions={() => <ColumnVisibility table={table} />}
        />
      </Card>

      {/* Table Container - Scrollable */}
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
          {renderEmptyState() || <DataTable table={table} />}
        </Card>
      </Box>

      {/* Edit Localization Dialog */}
      <CategoryLocalizationDialog
        open={editDialogOpen}
        category={selectedCategory}
        onClose={handleDialogClose}
        onSuccess={handleEditSuccess}
      />
    </Box>
  );
}
