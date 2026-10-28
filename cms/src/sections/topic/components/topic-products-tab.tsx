import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Avatar, Box, Button, Card, Chip, IconButton, Stack, Typography } from '@mui/material';
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type VisibilityState,
  type Row,
  flexRender,
} from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { SearchBar, TablePagination } from 'src/components/table';
import { ProductSelectionDialog } from 'src/components/dialog';
import { TopicExcelImportDialog } from 'src/sections/topic/components/topic-excel-import-dialog';
import type { TopicProductResponse } from 'src/types/gen/shared/shared/topics/topic';
import type { Product } from 'src/types/gen/shared/shared/products/product';
import { formatNumber } from 'src/utils/format';
import { PRODUCT_STATUS_UI } from 'src/utils/enum-converter';

// ----------------------------------------------------------------------

export interface TopicProductItem extends TopicProductResponse {
  barcode?: string;
  costPrice?: number;
  sellingPrice?: number;
  stock?: number;
  warehouseStock?: number;
  sellingStatus?: string;
}

interface TopicProductsTabProps {
  products: TopicProductItem[];
  onAddProducts: (products: TopicProductItem[]) => void;
  onRemoveProduct: (productId: string) => void;
  onReorderProducts: (products: TopicProductItem[]) => void;
  loading?: boolean;
  topicId?: string;
  onImportComplete?: () => void;
  onExcelImportRequest?: () => void;
  autoOpenImport?: boolean;
  onAutoOpenImportConsumed?: () => void;
}

// Sortable Row Component
function SortableRow({ row, children }: { row: Row<TopicProductItem>; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.original.productId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? '#f5f5f5' : undefined,
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td
        style={{
          width: 40,
          padding: '8px',
          borderBottom: '1px solid #E5E6EB',
        }}
      >
        <IconButton
          size="small"
          {...attributes}
          {...listeners}
          sx={{
            cursor: 'grab',
            '&:active': { cursor: 'grabbing' },
            color: 'text.secondary',
          }}
        >
          <DragIndicatorIcon fontSize="small" />
        </IconButton>
      </td>
      {children}
    </tr>
  );
}

export function TopicProductsTab({
  products,
  onAddProducts,
  onRemoveProduct,
  onReorderProducts,
  loading = false,
  topicId,
  onImportComplete,
  onExcelImportRequest,
  autoOpenImport = false,
  onAutoOpenImportConsumed,
}: TopicProductsTabProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);

  // Auto-open import dialog when navigating from create flow with ?openExcelImport=true.
  // Notify parent so it resets the flag — otherwise the dialog reopens on subsequent
  // mounts (MUI TabPanel unmounts when not active, so revisiting the tab would re-fire).
  useEffect(() => {
    if (autoOpenImport && topicId) {
      setOpenImportDialog(true);
      onAutoOpenImportConsumed?.();
    }
  }, [autoOpenImport, topicId, onAutoOpenImportConsumed]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter products by search
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.productCode?.toLowerCase().includes(query) ||
        p.productName?.toLowerCase().includes(query) ||
        p.barcode?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = products.findIndex((p) => p.productId === active.id);
      const newIndex = products.findIndex((p) => p.productId === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(products, oldIndex, newIndex).map((p, idx) => ({
          ...p,
          order: idx + 1,
        }));
        onReorderProducts(reordered);
      }
    }
  };

  // Get selling status color
  const getSellingStatusColor = (
    status?: string
  ): 'success' | 'info' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'new':
        return 'info';
      case 'selling':
        return 'success';
      case 'stopped':
        return 'warning';
      case 'outOfStock':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns = useMemo<ColumnDef<TopicProductItem>[]>(
    () => [
      {
        id: 'image',
        header: t('image'),
        size: 80,
        cell: ({ row }) => (
          <Avatar src={row.original.productImage} variant="rounded" sx={{ width: 48, height: 48 }}>
            {row.original.productName?.charAt(0)}
          </Avatar>
        ),
      },
      {
        accessorKey: 'barcode',
        header: t('barcode'),
        size: 120,
        cell: ({ getValue }) => (
          <Typography variant="body2">{(getValue() as string) || '-'}</Typography>
        ),
      },
      {
        accessorKey: 'productCode',
        header: t('productCode'),
        size: 120,
        cell: ({ getValue }) => (
          <Typography variant="body2">{(getValue() as string) || '-'}</Typography>
        ),
      },
      {
        accessorKey: 'productName',
        header: t('productName'),
        size: 250,
        cell: ({ getValue }) => (
          <Typography
            variant="body2"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 230,
            }}
          >
            {(getValue() as string) || '-'}
          </Typography>
        ),
      },
      {
        accessorKey: 'costPrice',
        header: t('costPrice'),
        size: 120,
        cell: ({ getValue }) => {
          const value = getValue() as number | undefined;
          return (
            <Typography variant="body2">
              {value !== undefined ? `${formatNumber(value)}đ` : '-'}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'sellingPrice',
        header: t('sellingPrice'),
        size: 120,
        cell: ({ getValue }) => {
          const value = getValue() as number | undefined;
          return (
            <Typography variant="body2">
              {value !== undefined ? `${formatNumber(value)}đ` : '-'}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'stock',
        header: t('stock'),
        size: 80,
        cell: ({ getValue }) => {
          const value = getValue() as number | undefined;
          return (
            <Typography variant="body2" sx={{ textAlign: 'center' }}>
              {value !== undefined ? formatNumber(value) : '-'}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'warehouseStock',
        header: t('inWarehouse'),
        size: 100,
        cell: ({ getValue }) => {
          const value = getValue() as number | undefined;
          return (
            <Typography variant="body2" sx={{ textAlign: 'center' }}>
              {value !== undefined ? formatNumber(value) : '-'}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'sellingStatus',
        header: t('sellingStatus'),
        size: 120,
        cell: ({ getValue }) => {
          const status = getValue() as string | undefined;
          if (!status) return <Typography variant="body2">-</Typography>;
          return (
            <Chip
              label={t(status)}
              size="small"
              color={getSellingStatusColor(status)}
              variant="outlined"
            />
          );
        },
      },
      {
        id: 'actions',
        header: t('actions'),
        size: 80,
        cell: ({ row }) => (
          <IconButton
            size="small"
            sx={{ color: '#F62E2E' }}
            onClick={() => onRemoveProduct(row.original.productId)}
            disabled={loading}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        ),
      },
    ],
    [t, onRemoveProduct, loading]
  );

  const table = useReactTable({
    data: paginatedProducts,
    columns,
    state: {
      columnVisibility,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: pageSize,
      },
    },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater({ pageIndex: currentPage - 1, pageSize }) : updater;
      setCurrentPage(newPagination.pageIndex + 1);
      setPageSize(newPagination.pageSize);
    },
    manualPagination: true,
    pageCount: Math.ceil(filteredProducts.length / pageSize),
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.productId,
  });

  const handleAddProducts = (selectedProducts: Product[]) => {
    // Transform Product[] to TopicProductItem[]
    const newProducts: TopicProductItem[] = selectedProducts.map((p, index) => ({
      productId: p.id,
      order: products.length + index + 1,
      productCode: p.code,
      productName: p.name,
      productImage: p.images?.avatar,
      productPrice: p.prices?.retail,
      barcode: p.barcode,
      costPrice: p.prices?.avgCost || p.prices?.import,
      sellingPrice: p.prices?.retail,
      stock: p.inventory?.available,
      warehouseStock: p.inventory?.remain,
      sellingStatus: p.status ? PRODUCT_STATUS_UI[p.status] : undefined,
    }));
    onAddProducts(newProducts);
    setOpenDialog(false);
  };

  return (
    <Card
      sx={{
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t('searchProduct')}
        showSearchButton
        onSearch={() => setCurrentPage(1)}
        renderFarRightActions={() => (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<UploadFileIcon />}
              onClick={() => {
                if (!topicId) onExcelImportRequest?.();
                else setOpenImportDialog(true);
              }}
              disabled={loading}
            >
              {t('importExcel')}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              disabled={loading}
              sx={{
                bgcolor: '#0165FC',
                '&:hover': {
                  bgcolor: '#0052CC',
                },
              }}
            >
              {t('addProduct')}
            </Button>
          </Stack>
        )}
      />

      {/* Table with Drag & Drop */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              tableLayout: 'fixed',
            }}
          >
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  <th
                    style={{
                      width: 40,
                      padding: '12px 8px',
                      textAlign: 'left',
                      fontWeight: 500,
                      fontSize: '14px',
                      color: '#637381',
                      borderBottom: '1px solid #E5E6EB',
                      backgroundColor: '#F9FAFB',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                    }}
                  />
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{
                        width: header.getSize(),
                        padding: '12px 8px',
                        textAlign: 'left',
                        fontWeight: 500,
                        fontSize: '14px',
                        color: '#637381',
                        borderBottom: '1px solid #E5E6EB',
                        backgroundColor: '#F9FAFB',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              <SortableContext
                items={paginatedProducts.map((p) => p.productId)}
                strategy={verticalListSortingStrategy}
              >
                {table.getRowModel().rows.map((row) => (
                  <SortableRow key={row.id} row={row}>
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        style={{
                          width: cell.column.getSize(),
                          padding: '8px',
                          borderBottom: '1px solid #E5E6EB',
                          fontSize: '14px',
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </SortableRow>
                ))}
              </SortableContext>
            </tbody>
          </table>
          {paginatedProducts.length === 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 6,
                color: 'text.secondary',
              }}
            >
              <Typography variant="body2">{t('noProductsYet')}</Typography>
            </Box>
          )}
        </DndContext>
      </Box>

      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <TablePagination
          table={table}
          totalItems={filteredProducts.length}
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setCurrentPage(1);
          }}
        />
      )}

      {/* Product Selection Dialog */}
      <ProductSelectionDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={handleAddProducts}
        existingProductIds={products.map((p) => p.productId)}
        variant="detailed"
        confirmLabel="addToTopic"
        preSelectExisting
        filterOutExisting
      />

      {/* Excel Import Dialog (only available in edit mode when topicId exists) */}
      {topicId && (
        <TopicExcelImportDialog
          open={openImportDialog}
          onClose={() => setOpenImportDialog(false)}
          onComplete={() => {
            setOpenImportDialog(false);
            onImportComplete?.();
          }}
          topicId={topicId}
        />
      )}
    </Card>
  );
}
