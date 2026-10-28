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
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAffiliateProductCommissionsRequest,
  addAffiliateProductCommissionsRequest,
  updateAffiliateProductCommissionRequest,
  bulkUpdateAffiliateProductCommissionsRequest,
  deleteAffiliateProductCommissionRequest,
  getAffiliateProductIdsRequest,
  selectAffiliateProducts,
  selectAffiliatePagination,
  selectAffiliateProductsLoading,
  selectAffiliateAllProductIds,
} from 'src/redux/store/commissionSlice';
import type { CommissionProduct } from './commission-product-table';
import { CommissionProductTable } from './commission-product-table';
import { BulkEditCommissionDialog } from './bulk-edit-commission-dialog';
import { EditCommissionDialog } from './edit-commission-dialog';
import { AffiliateProductCommissionExcelImportDialog } from './affiliate-product-commission-excel-import-dialog';
import { ProductSelectionDialog } from 'src/components/dialog/product-selection-dialog';
import type { Product } from 'src/types/gen/shared/shared/products/product';

// ----------------------------------------------------------------------

interface PendingProductOperation {
  operation: 'add' | 'update' | 'delete';
  productId: string;
  commissionRate?: number;
  displayData?: CommissionProduct;
}

export interface ProductsTableSectionRef {
  commitChanges: () => Promise<void>;
}

interface ProductsTableSectionProps {
  affiliateId: string;
  affiliateCode?: string;
  defaultCommissionRate?: number;
  onProductsStateChange?: (hasChanges: boolean) => void;
  /** When true, the Excel import dialog opens automatically once on mount. */
  autoOpenImport?: boolean;
}

export const ProductsTableSection = forwardRef<ProductsTableSectionRef, ProductsTableSectionProps>(
  (
    {
      affiliateId,
      affiliateCode,
      defaultCommissionRate = 10,
      onProductsStateChange,
      autoOpenImport = false,
    },
    ref
  ) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    // Redux state
    const products = useSelector(selectAffiliateProducts);
    const pagination = useSelector(selectAffiliatePagination);
    const loading = useSelector(selectAffiliateProductsLoading);
    const affiliateAllProductIds = useSelector(selectAffiliateAllProductIds);

    // Local state for pending operations
    const [pendingOperations, setPendingOperations] = useState<
      Map<string, PendingProductOperation>
    >(new Map());
    const [productCache, setProductCache] = useState<Map<string, CommissionProduct>>(new Map());

    // Local state (existing)
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // Dialog states
    const [productDialogOpen, setProductDialogOpen] = useState(false);
    const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [editingRate, setEditingRate] = useState(0);

    // Ref to prevent duplicate requests
    const pendingRequestsRef = useRef<Set<string>>(new Set());

    // Load products with deduplication
    const loadProductCommissions = useCallback(() => {
      const requestKey = `product-commissions-${affiliateId}-${page}-${limit}-${searchQuery}`;

      // Check if request is already pending
      if (pendingRequestsRef.current.has(requestKey)) {
        return;
      }

      // Mark request as pending
      pendingRequestsRef.current.add(requestKey);

      dispatch(
        getAffiliateProductCommissionsRequest({
          affiliateId,
          page,
          limit,
          search: searchQuery,
        })
      );

      // Remove from pending after request started
      setTimeout(() => {
        pendingRequestsRef.current.delete(requestKey);
      }, 100);
    }, [dispatch, affiliateId, page, limit, searchQuery]);

    // Load products on mount and when filters change
    useEffect(() => {
      loadProductCommissions();
    }, [loadProductCommissions]);

    // Auto-open the import dialog when the parent signals it (used by the
    // create → edit redirect trick). Only fires once on first mount.
    const hasAutoOpenedImportRef = useRef(false);
    useEffect(() => {
      if (autoOpenImport && !hasAutoOpenedImportRef.current) {
        hasAutoOpenedImportRef.current = true;
        setImportDialogOpen(true);
      }
    }, [autoOpenImport]);

    // Notify parent of dirty state changes
    useEffect(() => {
      const hasPendingChanges = pendingOperations.size > 0;
      onProductsStateChange?.(hasPendingChanges);
    }, [pendingOperations, onProductsStateChange]);

    // Transform API products to table format
    const transformedProducts = useMemo<CommissionProduct[]>(() => {
      return products.map((pc) => ({
        id: pc.id,
        productId: pc.productId,
        productCode: pc.code,
        productImage: pc.images?.avatar || '',
        productName: pc.name,
        costPrice: pc.costPrice,
        stock: pc.stock,
        commissionRate: pc.commissionRate,
        estimatedCommission: pc.estimatedCommission,
      }));
    }, [products]);

    // Merge backend products with pending operations for display
    const displayProducts = useMemo<CommissionProduct[]>(() => {
      const backendMap = new Map(transformedProducts.map((p) => [p.productId, p]));
      const newProducts: CommissionProduct[] = [];

      // Apply pending operations
      pendingOperations.forEach((op, productId) => {
        if (op.operation === 'add') {
          // Collect new products separately to display at top
          if (op.displayData) {
            newProducts.push(op.displayData);
            backendMap.delete(productId); // Remove if somehow present
          }
        } else if (op.operation === 'update') {
          // Update existing product rate
          const existing = backendMap.get(productId);
          if (existing) {
            backendMap.set(productId, {
              ...existing,
              commissionRate: op.commissionRate!,
              estimatedCommission: (existing.costPrice * op.commissionRate!) / 100,
            });
          }
        } else if (op.operation === 'delete') {
          // Remove deleted product
          backendMap.delete(productId);
        }
      });

      // Return new products first, then existing backend products
      return [...newProducts, ...Array.from(backendMap.values())];
    }, [transformedProducts, pendingOperations]);

    // Compute effective existing IDs for dialog pre-selection:
    // Start from all server-side IDs, apply pending deletes/adds
    const effectiveExistingIds = useMemo(() => {
      const ids = new Set(affiliateAllProductIds);
      pendingOperations.forEach((op, productId) => {
        if (op.operation === 'delete') ids.delete(productId);
        if (op.operation === 'add') ids.add(productId);
      });
      return Array.from(ids);
    }, [affiliateAllProductIds, pendingOperations]);

    // Handlers
    const handleAddProducts = useCallback(() => {
      dispatch(
        getAffiliateProductIdsRequest({
          affiliateId,
          onSuccess: () => setProductDialogOpen(true),
        })
      );
    }, [dispatch, affiliateId]);

    const handleProductsSelected = useCallback(
      (selectedProducts: Product[]) => {
        const newOperations = new Map(pendingOperations);
        const newCache = new Map(productCache);

        // Get current product IDs in the table
        const currentProductIds = new Set(displayProducts.map((p) => p.productId));

        // ADD new products (in selected but NOT in current)
        selectedProducts.forEach((product) => {
          if (!currentProductIds.has(product.id)) {
            // Product is newly selected → mark as 'add'
            const costPrice = product.prices?.retail || 0;
            const stock = product.inventory?.remain || 0;

            const displayData: CommissionProduct = {
              id: product.id,
              productId: product.id,
              productCode: product.code,
              productImage: product.images?.avatar || '',
              productName: product.name,
              costPrice,
              stock,
              commissionRate: defaultCommissionRate,
              estimatedCommission: (costPrice * defaultCommissionRate) / 100,
            };

            newOperations.set(product.id, {
              operation: 'add',
              productId: product.id,
              commissionRate: defaultCommissionRate,
              displayData,
            });

            newCache.set(product.id, displayData);
          }
        });

        setPendingOperations(newOperations);
        setProductCache(newCache);
        setProductDialogOpen(false);
      },
      [pendingOperations, productCache, defaultCommissionRate, displayProducts]
    );

    const handleBulkEditClick = useCallback(() => {
      if (selectedIds.length > 0) {
        setBulkEditDialogOpen(true);
      }
    }, [selectedIds]);

    const handleApplyBulkEdit = useCallback(
      (rate: number) => {
        // Update pending operations for selected products
        const newOperations = new Map(pendingOperations);

        selectedIds.forEach((productId) => {
          const existingOp = newOperations.get(productId);

          if (existingOp?.operation === 'add') {
            // Newly added product - preserve 'add' operation
            newOperations.set(productId, {
              ...existingOp,
              commissionRate: rate,
              displayData: existingOp.displayData
                ? {
                    ...existingOp.displayData,
                    commissionRate: rate,
                    estimatedCommission: (existingOp.displayData.costPrice * rate) / 100,
                  }
                : existingOp.displayData,
            });
          } else {
            // Backend product - create 'update' operation
            newOperations.set(productId, {
              operation: 'update',
              productId,
              commissionRate: rate,
            });
          }
        });

        setPendingOperations(newOperations);
        setBulkEditDialogOpen(false);
        setRowSelection({});
        setSelectedIds([]);
      },
      [pendingOperations, selectedIds]
    );

    const handleEditProduct = useCallback((productId: string, currentRate: number) => {
      setEditingProductId(productId);
      setEditingRate(currentRate);
      setEditDialogOpen(true);
    }, []);

    const handleSaveEdit = useCallback(
      (productId: string, rate: number) => {
        // Update pending operations
        const newOperations = new Map(pendingOperations);
        const existingOp = newOperations.get(productId);

        if (existingOp?.operation === 'add') {
          // Product is newly added - preserve 'add' operation
          newOperations.set(productId, {
            ...existingOp,
            commissionRate: rate,
            displayData: existingOp.displayData
              ? {
                  ...existingOp.displayData,
                  commissionRate: rate,
                  estimatedCommission: (existingOp.displayData.costPrice * rate) / 100,
                }
              : existingOp.displayData,
          });
        } else {
          // Product is from backend - create 'update' operation
          newOperations.set(productId, {
            operation: 'update',
            productId,
            commissionRate: rate,
          });
        }

        setPendingOperations(newOperations);
        setEditDialogOpen(false);
        setEditingProductId(null);
      },
      [pendingOperations]
    );

    const handleRemoveProduct = useCallback(
      (productId: string) => {
        // Mark as deleted in pending operations
        const newOperations = new Map(pendingOperations);

        newOperations.set(productId, {
          operation: 'delete',
          productId,
        });

        setPendingOperations(newOperations);
      },
      [pendingOperations]
    );

    const handlePageChange = useCallback((newPage: number) => {
      setPage(newPage);
    }, []);

    const handlePageSizeChange = useCallback((newLimit: number) => {
      setLimit(newLimit);
      setPage(1);
    }, []);

    const handleSearchChange = useCallback((search: string) => {
      setSearchQuery(search);
      setPage(1);
    }, []);

    const handleSearch = useCallback(() => {
      handleSearchChange(searchQuery);
    }, [searchQuery, handleSearchChange]);

    // Commit all pending changes to backend
    const commitChanges = useCallback(async () => {
      if (pendingOperations.size === 0) {
        return;
      }

      const operations = Array.from(pendingOperations.values());

      // Group by operation type
      const toAdd = operations.filter((op) => op.operation === 'add');
      const toUpdate = operations.filter((op) => op.operation === 'update');
      const toDelete = operations.filter((op) => op.operation === 'delete');

      // Optimize: remove products that were added then deleted
      const addedIds = new Set(toAdd.map((op) => op.productId));
      const deletedIds = new Set(toDelete.map((op) => op.productId));

      const finalToAdd = toAdd.filter((op) => !deletedIds.has(op.productId));
      const finalToDelete = toDelete.filter((op) => !addedIds.has(op.productId));
      const finalToUpdate = toUpdate.filter((op) => !addedIds.has(op.productId));

      try {
        // 1. Delete first
        if (finalToDelete.length > 0) {
          for (const op of finalToDelete) {
            await new Promise<void>((resolve, reject) => {
              dispatch(
                deleteAffiliateProductCommissionRequest({
                  affiliateId,
                  productId: op.productId,
                  onSuccess: () => resolve(),
                })
              );
              // Note: Error handling relies on Redux saga's showError
              setTimeout(resolve, 100); // Allow saga to run
            });
          }
        }

        // 2. Add new products
        if (finalToAdd.length > 0) {
          await new Promise<void>((resolve, reject) => {
            dispatch(
              addAffiliateProductCommissionsRequest({
                affiliateId,
                products: finalToAdd.map((op) => ({
                  productId: op.productId,
                  commissionRate: op.commissionRate!,
                })),
                onSuccess: () => resolve(),
              })
            );
            setTimeout(resolve, 100);
          });
        }

        // 3. Update existing products using bulk API
        if (finalToUpdate.length > 0) {
          // Group products by commission rate
          const productsByRate = new Map<number, string[]>();

          finalToUpdate.forEach((op) => {
            const rate = op.commissionRate!;
            if (!productsByRate.has(rate)) {
              productsByRate.set(rate, []);
            }
            productsByRate.get(rate)!.push(op.productId);
          });

          // Dispatch one bulk update per commission rate
          const bulkUpdatePromises = Array.from(productsByRate.entries()).map(
            ([rate, productIds]) =>
              new Promise<void>((resolve, reject) => {
                dispatch(
                  bulkUpdateAffiliateProductCommissionsRequest({
                    affiliateId,
                    productIds,
                    rate,
                    onSuccess: () => resolve(),
                  })
                );
              })
          );

          // Wait for all bulk updates to complete
          await Promise.all(bulkUpdatePromises);
        }

        // Success - clear pending operations and reload
        setPendingOperations(new Map());
        setProductCache(new Map());
        loadProductCommissions();
      } catch (error) {
        // Keep pending operations for retry
        throw error;
      }
    }, [pendingOperations, dispatch, affiliateId, loadProductCommissions]);

    // Expose commitChanges via ref
    useImperativeHandle(
      ref,
      () => ({
        commitChanges,
      }),
      [commitChanges]
    );

    return (
      <Box>
        {/* Product Table */}
        <CommissionProductTable
          products={displayProducts}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSearchChange={handleSearchChange}
          onCategoryChange={() => {}}
          onRemoveProduct={handleRemoveProduct}
          onAddProducts={handleAddProducts}
          onBulkEdit={(selectedIds) => {
            setSelectedIds(selectedIds);
            setBulkEditDialogOpen(true);
          }}
          onEditProduct={handleEditProduct}
          onImportExcel={() => setImportDialogOpen(true)}
          pendingOperations={pendingOperations}
          affiliateCode={affiliateCode}
        />

        {/* Product Selection Dialog */}
        <ProductSelectionDialog
          open={productDialogOpen}
          onClose={() => setProductDialogOpen(false)}
          onConfirm={handleProductsSelected}
          existingProductIds={effectiveExistingIds}
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

        {/* Excel Import Dialog */}
        <AffiliateProductCommissionExcelImportDialog
          open={importDialogOpen}
          onClose={() => setImportDialogOpen(false)}
          onComplete={() => {
            // Reload products after import job finishes
            loadProductCommissions();
            dispatch(getAffiliateProductIdsRequest({ affiliateId }));
          }}
          affiliateId={affiliateId}
        />
      </Box>
    );
  }
);

ProductsTableSection.displayName = 'ProductsTableSection';
