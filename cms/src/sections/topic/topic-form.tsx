import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Button, Card, Stack, Tab } from '@mui/material';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateTopicRequest, UpdateTopicRequest } from 'src/types/gen/cms/cms/topics/topic';
import { TopicType } from 'src/types/gen/shared/shared/common/enums';
import { showWarning } from 'src/utils/toast';
import { TopicGeneralTab, type TopicFormData } from './components/topic-general-tab';
import { TopicProductsTab, type TopicProductItem } from './components/topic-products-tab';
import { TopicCategoriesTab, type TopicCategoryItem } from './components/topic-categories-tab';
import { TopicBannersTab, type TopicBannerItem } from './components/topic-banners-tab';
import { calculateProductDiff, type ProductDiff } from './utils/product-diff';
import { calculateCategoryDiff, type CategoryDiff } from './utils/category-diff';
import { calculateBannerDiff, type BannerDiff } from './utils/banner-diff';

// ----------------------------------------------------------------------

interface TopicFormProps {
  mode: 'create' | 'edit';
  topicId?: string;
  initialData?: Partial<TopicFormData>;
  initialProducts?: TopicProductItem[];
  initialCategories?: TopicCategoryItem[];
  initialBanners?: TopicBannerItem[];
  onSubmit: (
    data: CreateTopicRequest | Omit<UpdateTopicRequest, 'topicId'>,
    products: TopicProductItem[],
    categories: TopicCategoryItem[],
    productDiff: ProductDiff,
    categoryDiff: CategoryDiff,
    banners: TopicBannerItem[],
    bannerDiff: BannerDiff
  ) => void;
  onCancel: () => void;
  onImportComplete?: () => void;
  onExcelImportRequest?: (formData: TopicFormData) => void;
  autoOpenImport?: boolean;
  onAutoOpenImportConsumed?: () => void;
  loading?: boolean;
}

export function TopicForm({
  mode,
  topicId,
  initialData = {},
  initialProducts = [],
  initialCategories = [],
  initialBanners = [],
  onSubmit,
  onCancel,
  onImportComplete,
  onExcelImportRequest,
  autoOpenImport = false,
  onAutoOpenImportConsumed,
  loading = false,
}: TopicFormProps) {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState('1');

  // Form state
  const [formData, setFormData] = useState<TopicFormData>({
    name: initialData.name || '',
    localization: initialData.localization || { vi: '', en: '' },
    type: initialData.type || TopicType.TOPIC_TYPE_PRODUCT,
    order: initialData.order || 0,
    status: initialData.status ?? 'active',
  });

  // Products state
  const [products, setProducts] = useState<TopicProductItem[]>(initialProducts);

  // Categories state
  const [categories, setCategories] = useState<TopicCategoryItem[]>(initialCategories);

  // Banners state
  const [banners, setBanners] = useState<TopicBannerItem[]>(initialBanners);

  // Track original products for diff calculation (edit mode)
  const originalProductsRef = useRef<TopicProductItem[]>(initialProducts);

  // Track original categories for diff calculation (edit mode)
  const originalCategoriesRef = useRef<TopicCategoryItem[]>(initialCategories);

  // Track original banners for diff calculation (edit mode)
  const originalBannersRef = useRef<TopicBannerItem[]>(initialBanners);

  // Track if initial sync has happened to avoid resetting user changes
  const hasInitializedProductsRef = useRef(initialProducts.length > 0);
  const hasInitializedCategoriesRef = useRef(initialCategories.length > 0);
  const hasInitializedBannersRef = useRef(initialBanners.length > 0);

  // Sync products when initialProducts changes (e.g., after fetch in edit mode)
  useEffect(() => {
    if (initialProducts.length > 0 && !hasInitializedProductsRef.current) {
      setProducts(initialProducts);
      originalProductsRef.current = initialProducts;
      hasInitializedProductsRef.current = true;
    }
  }, [initialProducts]);

  // Sync categories when initialCategories changes
  useEffect(() => {
    if (initialCategories.length > 0 && !hasInitializedCategoriesRef.current) {
      setCategories(initialCategories);
      originalCategoriesRef.current = initialCategories;
      hasInitializedCategoriesRef.current = true;
    }
  }, [initialCategories]);

  // Sync banners when initialBanners changes
  useEffect(() => {
    if (initialBanners.length > 0 && !hasInitializedBannersRef.current) {
      setBanners(initialBanners);
      originalBannersRef.current = initialBanners;
      hasInitializedBannersRef.current = true;
    }
  }, [initialBanners]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleAddProducts = useCallback((newProducts: TopicProductItem[]) => {
    setProducts((prev) => {
      const existingIds = new Set(prev.map((p) => p.productId));
      const filtered = newProducts.filter((p) => !existingIds.has(p.productId));
      // Update order for new products
      const maxOrder = prev.length > 0 ? Math.max(...prev.map((p) => p.order)) : 0;
      const updatedNewProducts = filtered.map((p, index) => ({
        ...p,
        order: maxOrder + index + 1,
      }));
      return [...prev, ...updatedNewProducts];
    });
  }, []);

  const handleRemoveProduct = useCallback((productId: string) => {
    setProducts((prev) => prev.filter((p) => p.productId !== productId));
  }, []);

  const handleReorderProducts = useCallback((reorderedProducts: TopicProductItem[]) => {
    setProducts(reorderedProducts);
  }, []);

  const handleAddCategories = useCallback((newCategories: TopicCategoryItem[]) => {
    setCategories((prev) => {
      const existingIds = new Set(prev.map((c) => c.categoryId));
      const filtered = newCategories.filter((c) => !existingIds.has(c.categoryId));
      // Update order for new categories
      const maxOrder = prev.length > 0 ? Math.max(...prev.map((c) => c.order)) : 0;
      const updatedNewCategories = filtered.map((c, index) => ({
        ...c,
        order: maxOrder + index + 1,
      }));
      return [...prev, ...updatedNewCategories];
    });
  }, []);

  const handleRemoveCategory = useCallback((categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.categoryId !== categoryId));
  }, []);

  const handleReorderCategories = useCallback((reorderedCategories: TopicCategoryItem[]) => {
    setCategories(reorderedCategories);
  }, []);

  const handleAddBanners = useCallback((newBanners: TopicBannerItem[]) => {
    setBanners((prev) => {
      const maxOrder = prev.length > 0 ? Math.max(...prev.map((b) => b.order)) : 0;
      const updated = newBanners.map((b, index) => ({
        ...b,
        order: maxOrder + index + 1,
      }));
      return [...prev, ...updated];
    });
  }, []);

  const handleRemoveBanner = useCallback((tempId: string) => {
    setBanners((prev) => prev.filter((b) => b.tempId !== tempId));
  }, []);

  const handleEditBanner = useCallback((updatedBanner: TopicBannerItem) => {
    setBanners((prev) => prev.map((b) => (b.tempId === updatedBanner.tempId ? updatedBanner : b)));
  }, []);

  const handleReorderBanners = useCallback((reorderedBanners: TopicBannerItem[]) => {
    setBanners(reorderedBanners);
  }, []);

  // Check topic type
  const isProductType = useMemo(() => {
    return formData.type === TopicType.TOPIC_TYPE_PRODUCT;
  }, [formData.type]);

  const isBannerType = useMemo(() => {
    return formData.type === TopicType.TOPIC_TYPE_BANNER;
  }, [formData.type]);

  const handleExcelImportRequest = useCallback(() => {
    if (!formData.name?.trim() || !formData.order || formData.order <= 0) {
      showWarning(t('pleaseFillRequiredTopicFieldsBeforeImport'));
      return;
    }
    onExcelImportRequest?.(formData);
  }, [formData, onExcelImportRequest, t]);

  const handleSubmit = () => {
    // Calculate diffs
    const productDiff = calculateProductDiff(originalProductsRef.current, products);
    const categoryDiff = calculateCategoryDiff(originalCategoriesRef.current, categories);
    const bannerDiff = calculateBannerDiff(originalBannersRef.current, banners);

    const submitData = {
      name: formData.name,
      localization:
        formData.localization?.vi || formData.localization?.en
          ? {
              vi: formData.localization.vi || undefined,
              en: formData.localization.en || undefined,
            }
          : null,
      type: formData.type,
      order: formData.order,
      status: formData.status,
      products: products.map((p) => ({
        productId: p.productId,
        order: p.order,
      })),
      categories: categories.map((c) => ({
        categoryId: c.categoryId,
        order: c.order,
      })),
      banners: banners.map((b) => ({
        mediaType: b.mediaType,
        media: b.media,
        link: b.link,
        order: b.order,
      })),
    };
    onSubmit(
      submitData as CreateTopicRequest,
      products,
      categories,
      productDiff,
      categoryDiff,
      banners,
      bannerDiff
    );
  };

  const isValid = formData.name && formData.order > 0;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      {/* Tabs Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: { xs: 2, sm: 3 },
        }}
      >
        <Card sx={{ boxShadow: 'none', border: 'none' }}>
          <TabContext value={tabValue}>
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: '#E5E6EB', px: 2 }}>
              <TabList
                onChange={handleTabChange}
                sx={{
                  minHeight: 44,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 400,
                    minHeight: 44,
                    minWidth: 'auto',
                    padding: '12px 16px',
                    color: '#000000',
                    '&.Mui-selected': {
                      color: '#000000',
                      fontWeight: 500,
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#3D54A0',
                    height: 2,
                  },
                }}
              >
                <Tab label={t('generalInfo')} value="1" />
                <Tab
                  label={
                    isProductType
                      ? t('productList')
                      : isBannerType
                        ? t('bannerList')
                        : t('categoryList')
                  }
                  value="2"
                />
              </TabList>
            </Box>

            {/* Tab Panels */}
            <TabPanel value="1" sx={{ p: 3 }}>
              <TopicGeneralTab
                formData={formData}
                onChange={setFormData}
                loading={loading}
                isEditMode={mode === 'edit'}
              />
            </TabPanel>

            <TabPanel value="2" sx={{ p: 0 }}>
              {isProductType ? (
                <TopicProductsTab
                  products={products}
                  onAddProducts={handleAddProducts}
                  onRemoveProduct={handleRemoveProduct}
                  onReorderProducts={handleReorderProducts}
                  loading={loading}
                  topicId={topicId}
                  onImportComplete={onImportComplete}
                  onExcelImportRequest={mode === 'create' ? handleExcelImportRequest : undefined}
                  autoOpenImport={autoOpenImport}
                  onAutoOpenImportConsumed={onAutoOpenImportConsumed}
                />
              ) : isBannerType ? (
                <TopicBannersTab
                  banners={banners}
                  onAddBanners={handleAddBanners}
                  onRemoveBanner={handleRemoveBanner}
                  onEditBanner={handleEditBanner}
                  onReorderBanners={handleReorderBanners}
                  loading={loading}
                />
              ) : (
                <TopicCategoriesTab
                  categories={categories}
                  onAddCategories={handleAddCategories}
                  onRemoveCategory={handleRemoveCategory}
                  onReorderCategories={handleReorderCategories}
                  loading={loading}
                />
              )}
            </TabPanel>
          </TabContext>
        </Card>
      </Box>

      {/* Sticky Action Buttons */}
      <Box
        sx={{
          flexShrink: 0,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
          p: 2,
        }}
      >
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
            sx={{
              borderColor: '#E5E6EB',
              color: 'text.primary',
              '&:hover': {
                borderColor: '#C4C6CF',
                bgcolor: 'grey.50',
              },
            }}
          >
            {t('goBack')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !isValid}
            sx={{
              bgcolor: '#0165FC',
              '&:hover': {
                bgcolor: '#0052CC',
              },
            }}
          >
            {mode === 'create' ? t('addNew') : t('update')}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
