import { Box, CircularProgress } from '@mui/material';
import { useEffect, useCallback, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getPromotionByIdRequest,
  updatePromotionRequest,
  selectCurrentPromotion,
  selectCurrentPromotionLoading,
  selectUpdatePromotionLoading,
  clearCurrentPromotion,
} from 'src/redux/store/promotionSlice';
import { ProductDiscountSubType } from 'src/types/promotion';
import { promotionRepository } from 'src/repositories/promotion.repository';
import { parseDiscountType, DISCOUNT_TYPE_API } from 'src/utils/enum-converter';
import { ProductDiscountForm, type ProductDiscountFormData } from './product-discount-form';
import type { ProductDiscountChanges } from './components/products-table-section';
import type { PromotionProductsPage, ProductDiscountProductForm } from 'src/types/promotion';

// ----------------------------------------------------------------------

function mapDocsToProducts(docs: any[]): ProductDiscountProductForm[] {
  return (docs || []).map((p: any) => ({
    productId: p.productId,
    name: p.name || '',
    image: p.images?.avatar ?? '',
    code: p.code || '',
    originalPrice: p.originalPrice || 0,
    discountType: parseDiscountType(p.discountType),
    discountValue: p.discountValue || 0,
    discountedPrice: p.discountedPrice || 0,
    soldCount: p.soldCount || 0,
    isEnabled: p.isEnabled ?? true,
  }));
}

export function ProductDiscountEditView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();

  const [searchParams, setSearchParams] = useSearchParams();
  const [autoOpenExcelImport] = useState(() => searchParams.get('openExcelImport') === 'true');

  const currentPromotion = useAppSelector(selectCurrentPromotion);
  const fetchLoading = useAppSelector(selectCurrentPromotionLoading);
  const updateLoading = useAppSelector(selectUpdatePromotionLoading);

  // Server-side pagination state
  const [products, setProducts] = useState<ProductDiscountProductForm[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsPagination, setProductsPagination] = useState<PromotionProductsPage | undefined>(
    undefined
  );
  const [productPage, setProductPage] = useState(1);
  const [productPageSize, setProductPageSize] = useState(10);
  const [productSearch, setProductSearch] = useState<string | undefined>(undefined);

  // All product IDs for pre-selecting in ProductSelectionDialog
  const [allProductIds, setAllProductIds] = useState<string[]>([]);

  // Clear openExcelImport query param after reading
  useEffect(() => {
    if (searchParams.get('openExcelImport')) {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (id) {
      dispatch(getPromotionByIdRequest({ id }));
    }

    return () => {
      dispatch(clearCurrentPromotion());
    };
  }, [dispatch, id]);

  // Fetch all product IDs for pre-selecting in dialog
  useEffect(() => {
    const fetchProductIds = async () => {
      if (!id) return;
      try {
        const ids = await promotionRepository.getPromotionProductIds(id);
        setAllProductIds(ids);
      } catch (error) {
        console.error('Failed to load product IDs:', error);
        setAllProductIds([]);
      }
    };
    fetchProductIds();
  }, [id]);

  const fetchProducts = useCallback(
    async (page?: number, limit?: number, search?: string) => {
      if (!id) return;
      setProductsLoading(true);
      try {
        const p = page ?? productPage;
        const l = limit ?? productPageSize;
        const s = search !== undefined ? search : productSearch;
        const result = await promotionRepository.getPromotionProducts(id, {
          page: p,
          limit: l,
          filters: {
            search: s || undefined,
            categoryIds: [],
            productIds: [],
          },
        });
        setProducts(mapDocsToProducts(result.docs));
        setProductsPagination({
          total: result.totalDocs,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        });
      } catch (error) {
        console.error('Failed to load promotion products:', error);
      } finally {
        setProductsLoading(false);
      }
    },
    [id, productPage, productPageSize, productSearch]
  );

  // Initial load
  useEffect(() => {
    fetchProducts(1, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleProductPageChange = useCallback(
    (page: number) => {
      setProductPage(page);
      fetchProducts(page, productPageSize, productSearch);
    },
    [fetchProducts, productPageSize, productSearch]
  );

  const handleProductPageSizeChange = useCallback(
    (pageSize: number) => {
      setProductPageSize(pageSize);
      setProductPage(1);
      fetchProducts(1, pageSize, productSearch);
    },
    [fetchProducts, productSearch]
  );

  const handleProductSearch = useCallback(
    (search: string) => {
      setProductSearch(search || undefined);
      setProductPage(1);
      fetchProducts(1, productPageSize, search);
    },
    [fetchProducts, productPageSize]
  );

  const handleRefreshProducts = useCallback(() => {
    fetchProducts(productPage, productPageSize, productSearch);
  }, [fetchProducts, productPage, productPageSize, productSearch]);

  const handleSubmit = useCallback(
    (formData: ProductDiscountFormData, productChanges?: ProductDiscountChanges) => {
      if (!id) return;

      dispatch(
        updatePromotionRequest({
          id,
          data: {
            name: formData.name,
            startTime: formData.startTime,
            endTime: formData.endTime,
            isEnabled: formData.isEnabled,
            productDiscountConfig: {
              subType: formData.subType,
              voucherCode: formData.voucherCode,
              minimumOrderValue: formData.minimumOrderValue,
              products: [],
              totalUsageLimit: formData.totalUsageLimit,
              maxUsagePerCustomer: formData.maxUsagePerCustomer,
              notApplicableWithOtherPromotions: formData.notApplicableWithOtherPromotions,
            },
          },
          onSuccess: async () => {
            if (!productChanges) {
              navigate('/promotion');
              return;
            }

            const { edited, added, deletedIds } = productChanges;
            const tasks: Promise<unknown>[] = [];

            if (edited.length > 0) {
              tasks.push(
                promotionRepository.bulkUpdatePromotionProducts(
                  id,
                  edited.map((p) => ({
                    productId: p.productId,
                    discountType: DISCOUNT_TYPE_API[p.discountType],
                    discountValue: p.discountValue,
                    isEnabled: p.isEnabled,
                  }))
                )
              );
            }

            if (added.length > 0) {
              tasks.push(
                promotionRepository.bulkAddPromotionProducts(
                  id,
                  added.map((p) => ({
                    productId: p.productId,
                    isEnabled: p.isEnabled,
                    discountType: DISCOUNT_TYPE_API[p.discountType],
                    discountValue: p.discountValue,
                  }))
                )
              );
            }

            if (deletedIds.length > 0) {
              deletedIds.forEach((productId) => {
                tasks.push(promotionRepository.removePromotionProduct(id, productId));
              });
            }

            try {
              await Promise.all(tasks);
            } catch (error) {
              console.error('Failed to update promotion products:', error);
            }

            navigate('/promotion');
          },
        })
      );
    },
    [dispatch, id, navigate]
  );

  const handleCancel = useCallback(() => {
    navigate('/promotion');
  }, [navigate]);

  if (fetchLoading || !currentPromotion) {
    return (
      <Box
        sx={{
          height: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const productDiscountData = currentPromotion.productDiscountConfig;

  const formData: ProductDiscountFormData = {
    name: currentPromotion.name,
    subType:
      productDiscountData?.subType || ProductDiscountSubType.PRODUCT_DISCOUNT_SUB_TYPE_AUTO_APPLY,
    startTime: currentPromotion.startTime ? new Date(currentPromotion.startTime) : undefined,
    endTime: currentPromotion.endTime ? new Date(currentPromotion.endTime) : undefined,
    isEnabled: currentPromotion.isEnabled ?? true,
    voucherCode: productDiscountData?.voucherCode,
    minimumOrderValue: productDiscountData?.minimumOrderValue || 0,
    products,
    totalUsageLimit: productDiscountData?.totalUsageLimit,
    maxUsagePerCustomer: productDiscountData?.maxUsagePerCustomer,
    notApplicableWithOtherPromotions:
      productDiscountData?.notApplicableWithOtherPromotions || false,
  };

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ProductDiscountForm
        mode="edit"
        initialData={formData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        autoOpenExcelImport={autoOpenExcelImport}
        loading={updateLoading}
        promotionId={id}
        productsLoading={productsLoading}
        productsPagination={productsPagination}
        allProductIds={allProductIds}
        onProductPageChange={handleProductPageChange}
        onProductPageSizeChange={handleProductPageSizeChange}
        onProductSearch={handleProductSearch}
        onRefreshProducts={handleRefreshProducts}
      />
    </Box>
  );
}
