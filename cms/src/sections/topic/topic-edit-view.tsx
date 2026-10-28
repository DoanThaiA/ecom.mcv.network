import { Box, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getTopicByIdRequest,
  updateTopicWithProductsRequest,
  selectCurrentTopic,
  selectCurrentTopicLoading,
  selectUpdateTopicLoading,
  clearCurrentTopic,
} from 'src/redux/store/topicSlice';
import type { CreateTopicRequest, UpdateTopicRequest } from 'src/types/gen/cms/cms/topics/topic';
import { TopicForm } from './topic-form';
import type { TopicProductItem } from './components/topic-products-tab';
import type { TopicCategoryItem } from './components/topic-categories-tab';
import type { TopicBannerItem } from './components/topic-banners-tab';
import type { TopicFormData } from './components/topic-general-tab';
import type { ProductDiff } from './utils/product-diff';
import type { CategoryDiff } from './utils/category-diff';
import type { BannerDiff } from './utils/banner-diff';
import { BannerMediaType } from 'src/types/gen/shared/shared/common/enums';

// ----------------------------------------------------------------------

export function TopicEditView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();

  const [searchParams, setSearchParams] = useSearchParams();
  const [autoOpenExcelImport, setAutoOpenExcelImport] = useState(
    () => searchParams.get('openExcelImport') === 'true'
  );

  const currentTopic = useAppSelector(selectCurrentTopic);
  const fetchLoading = useAppSelector(selectCurrentTopicLoading);
  const updateLoading = useAppSelector(selectUpdateTopicLoading);

  // Fetch topic data on mount
  useEffect(() => {
    if (id) {
      dispatch(getTopicByIdRequest({ id }));
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentTopic());
    };
  }, [dispatch, id]);

  // Clear openExcelImport query param after reading
  useEffect(() => {
    if (searchParams.get('openExcelImport')) {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleSubmit = (
    data: CreateTopicRequest | Omit<UpdateTopicRequest, 'topicId'>,
    _products: TopicProductItem[],
    _categories: TopicCategoryItem[],
    productDiff: ProductDiff,
    categoryDiff: CategoryDiff,
    _banners: TopicBannerItem[],
    bannerDiff: BannerDiff
  ) => {
    if (id) {
      dispatch(
        updateTopicWithProductsRequest({
          id,
          data: {
            name: data.name,
            localization: data.localization,
            order: data.order,
            status: data.status,
          },
          productDiff,
          categoryDiff,
          bannerDiff,
          onSuccess: () => {
            navigate('/topic');
          },
        })
      );
    }
  };

  const handleCancel = () => {
    navigate('/topic');
  };

  // Show loading state while fetching
  if (fetchLoading || !currentTopic) {
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

  // Transform Topic to form data format
  const formData: TopicFormData = {
    name: currentTopic.name,
    localization: currentTopic.localization || { vi: '', en: '' },
    type: currentTopic.type,
    order: currentTopic.order,
    status: currentTopic.status,
  };

  // Transform products to form format
  const initialProducts: TopicProductItem[] = (currentTopic.products || []).map((p) => ({
    productId: p.productId,
    order: p.order,
    productCode: p.productCode,
    productName: p.productName,
    productImage: p.productImage,
    productPrice: p.productPrice,
  }));

  // Transform categories to form format
  const initialCategories = (currentTopic.categories || []).map((c) => ({
    categoryId: c.categoryId,
    order: c.order,
    categoryName: c.categoryName,
    categoryImage: c.categoryImage,
    categorySlug: c.categorySlug,
  }));

  // Transform banners to form format
  const initialBanners: TopicBannerItem[] = ((currentTopic as any).banners || []).map((b: any) => ({
    id: b.id,
    tempId: b.id || `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    mediaType: b.mediaType ?? BannerMediaType.BANNER_MEDIA_TYPE_IMAGE,
    media: {
      mobile: b.media?.mobile,
      tablet: b.media?.tablet,
      desktop: b.media?.desktop,
    },
    link: b.link,
    order: b.order,
  }));

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <TopicForm
        mode="edit"
        topicId={id}
        initialData={formData}
        initialProducts={initialProducts}
        initialCategories={initialCategories}
        initialBanners={initialBanners}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onImportComplete={() => id && dispatch(getTopicByIdRequest({ id }))}
        autoOpenImport={autoOpenExcelImport}
        onAutoOpenImportConsumed={() => setAutoOpenExcelImport(false)}
        loading={updateLoading}
      />
    </Box>
  );
}
