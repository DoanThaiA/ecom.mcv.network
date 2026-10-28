import {
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { CommissionProduct } from './commission-product-table';
import { CommissionProductTable } from './commission-product-table';
import { BulkEditCommissionDialog } from './bulk-edit-commission-dialog';
import { EditCommissionDialog } from './edit-commission-dialog';
import { ProductSelectionDialog } from 'src/components/dialog/product-selection-dialog';
import type { Product } from 'src/types/gen/shared/shared/products/product';

// ----------------------------------------------------------------------

interface LocalProductsManagerProps {
  products: Array<{ productId: string; commissionRate: number }>;
  onProductsChange: (products: Array<{ productId: string; commissionRate: number }>) => void;
  defaultCommissionRate: number;
  onImportExcel?: () => void;
}

export function LocalProductsManager({
  products,
  onProductsChange,
  defaultCommissionRate,
  onImportExcel,
}: LocalProductsManagerProps) {
  const { t } = useTranslation();

  // Local state
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Dialog states
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingRate, setEditingRate] = useState(0);

  // Full product details for display
  const [displayProducts, setDisplayProducts] = useState<CommissionProduct[]>([]);

  // Store full product display data keyed by productId
  const [productCache, setProductCache] = useState<Map<string, CommissionProduct>>(new Map());

  // Derive display products from cache + current products list
  useEffect(() => {
    const derived = products
      .map((p) => {
        const cached = productCache.get(p.productId);
        if (!cached) return null;

        // Recalculate commission with current rate (may have been edited)
        const estimatedCommission = (cached.costPrice * p.commissionRate) / 100;

        return {
          ...cached,
          commissionRate: p.commissionRate,
          estimatedCommission,
        };
      })
      .filter((p): p is CommissionProduct => p !== null);

    setDisplayProducts(derived);
  }, [products, productCache]);

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery) {
      return displayProducts;
    }

    const query = searchQuery.toLowerCase();
    return displayProducts.filter(
      (p) =>
        p.productName.toLowerCase().includes(query) || p.productCode.toLowerCase().includes(query)
    );
  }, [displayProducts, searchQuery]);

  // Mock pagination for local state (since we have all products in memory)
  const pagination = useMemo(
    () => ({
      page: 1,
      limit: filteredProducts.length || 10,
      total: filteredProducts.length,
      totalPages: 1,
      hasNextPage: false,
    }),
    [filteredProducts.length]
  );

  // Handlers
  const handleAddProducts = useCallback(() => {
    setProductDialogOpen(true);
  }, []);

  const handleProductsSelected = useCallback(
    (selectedProducts: Product[]) => {
      // Transform Product[] to minimal format for parent component
      const newProducts = selectedProducts.map((p) => ({
        productId: p.id,
        commissionRate: defaultCommissionRate,
      }));

      // Add new products to existing ones (avoid duplicates)
      const existingIds = new Set(products.map((p) => p.productId));
      const uniqueNewProducts = newProducts.filter((p) => !existingIds.has(p.productId));

      // Transform Product[] to CommissionProduct[] for display
      const newDisplayProducts: CommissionProduct[] = selectedProducts
        .filter((p) => !existingIds.has(p.id))
        .map((product) => {
          const costPrice = product.prices?.import || product.prices?.avgCost || 0;
          const estimatedCommission = (costPrice * defaultCommissionRate) / 100;

          return {
            id: product.id,
            productId: product.id,
            productCode: product.code || '',
            productImage: product.images?.avatar || '',
            productName: product.name || '',
            costPrice,
            stock: product.inventory?.available || 0,
            commissionRate: defaultCommissionRate,
            estimatedCommission,
          };
        });

      // Update cache with new products
      setProductCache((prev) => {
        const updated = new Map(prev);
        newDisplayProducts.forEach((p) => {
          updated.set(p.productId, p);
        });
        return updated;
      });

      onProductsChange([...products, ...uniqueNewProducts]);
      setProductDialogOpen(false);
    },
    [products, onProductsChange, defaultCommissionRate]
  );

  const handleBulkEditClick = useCallback(() => {
    if (selectedIds.length > 0) {
      setBulkEditDialogOpen(true);
    }
  }, [selectedIds]);

  const handleApplyBulkEdit = useCallback(
    (rate: number) => {
      const updated = products.map((p) =>
        selectedIds.includes(p.productId) ? { ...p, commissionRate: rate } : p
      );

      onProductsChange(updated);
      setBulkEditDialogOpen(false);
      setRowSelection({});
      setSelectedIds([]);
    },
    [products, selectedIds, onProductsChange]
  );

  const handleEditProduct = useCallback((productId: string, currentRate: number) => {
    setEditingProductId(productId);
    setEditingRate(currentRate);
    setEditDialogOpen(true);
  }, []);

  const handleSaveEdit = useCallback(
    (productId: string, rate: number) => {
      const updated = products.map((p) =>
        p.productId === productId ? { ...p, commissionRate: rate } : p
      );

      onProductsChange(updated);
      setEditDialogOpen(false);
      setEditingProductId(null);
    },
    [products, onProductsChange]
  );

  const handleRemoveProduct = useCallback(
    (productId: string) => {
      const updated = products.filter((p) => p.productId !== productId);
      onProductsChange(updated);

      // Clean up cache for removed product
      setProductCache((prev) => {
        const updated = new Map(prev);
        updated.delete(productId);
        return updated;
      });
    },
    [products, onProductsChange]
  );

  const handleSearchChange = useCallback((search: string) => {
    setSearchQuery(search);
  }, []);

  const handleSearch = useCallback(() => {
    // Search is already applied via filteredProducts
    // This is just for the button click consistency
  }, []);

  return (
    <Box>
      {/* Product Table */}
      <CommissionProductTable
        products={filteredProducts}
        pagination={pagination}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        onSearchChange={handleSearchChange}
        onCategoryChange={() => {}}
        onRemoveProduct={handleRemoveProduct}
        onAddProducts={handleAddProducts}
        onBulkEdit={(selectedIds) => {
          setSelectedIds(selectedIds);
          setBulkEditDialogOpen(true);
        }}
        onEditProduct={handleEditProduct}
        onImportExcel={onImportExcel}
      />

      {/* Product Selection Dialog */}
      <ProductSelectionDialog
        open={productDialogOpen}
        onClose={() => setProductDialogOpen(false)}
        onConfirm={handleProductsSelected}
        existingProductIds={products.map((p) => p.productId)}
        title={t('selectProducts')}
      />

      {/* Bulk Edit Dialog */}
      <BulkEditCommissionDialog
        open={bulkEditDialogOpen}
        selectedCount={selectedIds.length}
        onClose={() => setBulkEditDialogOpen(false)}
        onApply={handleApplyBulkEdit}
      />

      {/* Edit Single Product Dialog */}
      <EditCommissionDialog
        open={editDialogOpen}
        productId={editingProductId}
        currentRate={editingRate}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingProductId(null);
        }}
        onSave={handleSaveEdit}
      />
    </Box>
  );
}
