import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Avatar, Box, Button, Card, IconButton, Typography } from '@mui/material';
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type Row,
  flexRender,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
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
import type { TopicCategoryResponse } from 'src/types/gen/shared/shared/topics/topic';
import { CategorySelectionDialog } from 'src/components/dialog/category-selection-dialog';
import type { ProductCategory } from 'src/types/gen/shared/shared/product-categories/product-category';

// ----------------------------------------------------------------------

export interface TopicCategoryItem extends TopicCategoryResponse {}

interface TopicCategoriesTabProps {
  categories: TopicCategoryItem[];
  onAddCategories: (categories: TopicCategoryItem[]) => void;
  onRemoveCategory: (categoryId: string) => void;
  onReorderCategories: (categories: TopicCategoryItem[]) => void;
  loading?: boolean;
}

// Sortable Row Component
function SortableRow({
  row,
  children,
}: {
  row: Row<TopicCategoryItem>;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.original.categoryId,
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

export function TopicCategoriesTab({
  categories,
  onAddCategories,
  onRemoveCategory,
  onReorderCategories,
  loading = false,
}: TopicCategoriesTabProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    const query = searchQuery.toLowerCase();
    return categories.filter(
      (cat) =>
        cat.categoryName?.toLowerCase().includes(query) ||
        cat.categorySlug?.toLowerCase().includes(query) ||
        cat.categoryId.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  // Paginate categories
  const paginatedCategories = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredCategories.slice(start, start + rowsPerPage);
  }, [filteredCategories, page, rowsPerPage]);

  // Define table columns
  const columns = useMemo<ColumnDef<TopicCategoryItem>[]>(
    () => [
      {
        id: 'image',
        header: t('image'),
        size: 80,
        cell: ({ row }) => (
          <Avatar
            src={row.original.categoryImage}
            variant="rounded"
            sx={{ width: 56, height: 56 }}
          />
        ),
      },
      {
        id: 'name',
        header: t('categoryName'),
        accessorFn: (row) => row.categoryName || row.categoryId,
        cell: ({ row }) => (
          <Box>
            <Typography
              variant="body2"
              fontWeight={500}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {row.original.categoryName || row.original.categoryId}
            </Typography>
            {row.original.categorySlug && (
              <Typography variant="caption" color="text.secondary">
                {row.original.categorySlug}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        id: 'order',
        header: t('order'),
        size: 80,
        accessorFn: (row) => row.order,
      },
      {
        id: 'actions',
        header: t('actions'),
        size: 80,
        cell: ({ row }) => (
          <IconButton
            size="small"
            color="error"
            onClick={() => onRemoveCategory(row.original.categoryId)}
            disabled={loading}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        ),
      },
    ],
    [t, onRemoveCategory, loading]
  );

  const table = useReactTable({
    data: paginatedCategories,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((cat) => cat.categoryId === active.id);
      const newIndex = categories.findIndex((cat) => cat.categoryId === over.id);

      const reordered = arrayMove(categories, oldIndex, newIndex);
      // Update order values (starting from 1, not 0)
      const withUpdatedOrder = reordered.map((cat, index) => ({
        ...cat,
        order: index + 1,
      }));
      onReorderCategories(withUpdatedOrder);
    }
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(0); // Reset to first page on search
  };

  const handleCategoriesSelected = (selectedCategories: ProductCategory[]) => {
    // Convert selected categories to TopicCategoryItem format
    const categoryItems: TopicCategoryItem[] = selectedCategories.map((cat, index) => ({
      categoryId: cat.id,
      categoryName: cat.name,
      categoryImage: cat.image,
      categorySlug: cat.slug,
      order: categories.length + index,
    }));
    onAddCategories(categoryItems);
    setIsCategoryDialogOpen(false);
  };

  return (
    <Card sx={{ p: 2 }}>
      {/* Header with search and add button */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={t('searchCategories')}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsCategoryDialogOpen(true)}
          disabled={loading}
          sx={{
            bgcolor: '#0165FC',
            '&:hover': {
              bgcolor: '#0052CC',
            },
          }}
        >
          {t('addCategory')}
        </Button>
      </Box>

      {/* Table */}
      {categories.length === 0 ? (
        <Box
          sx={{
            py: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {t('noCategoriesAdded')}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setIsCategoryDialogOpen(true)}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {t('addCategory')}
          </Button>
        </Box>
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ width: 40 }} />
                    {table.getHeaderGroups()[0]?.headers.map((header) => (
                      <th
                        key={header.id}
                        style={{
                          textAlign: 'left',
                          padding: '12px 8px',
                          fontWeight: 500,
                          fontSize: 14,
                          color: '#6B7280',
                          borderBottom: '1px solid #E5E6EB',
                          width: header.column.getSize(),
                        }}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <SortableContext
                    items={paginatedCategories.map((cat) => cat.categoryId)}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <SortableRow key={row.original.categoryId} row={row}>
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            style={{
                              padding: '8px',
                              borderBottom: '1px solid #E5E6EB',
                              verticalAlign: 'middle',
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
            </Box>
          </DndContext>

          {/* Pagination */}
          <TablePagination
            totalItems={filteredCategories.length}
            currentPage={page + 1}
            pageSize={rowsPerPage}
            totalPages={Math.ceil(filteredCategories.length / rowsPerPage)}
            onPageChange={(newPage) => handleChangePage(newPage - 1)}
            onPageSizeChange={(size) => {
              setRowsPerPage(size);
              setPage(0);
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            sx={{ borderTop: '1px solid #E5E6EB', mt: 2 }}
          />
        </>
      )}

      {/* Category Selection Dialog */}
      <CategorySelectionDialog
        open={isCategoryDialogOpen}
        onClose={() => setIsCategoryDialogOpen(false)}
        onConfirm={handleCategoriesSelected}
        existingCategoryIds={categories.map((cat) => cat.categoryId)}
      />
    </Card>
  );
}
