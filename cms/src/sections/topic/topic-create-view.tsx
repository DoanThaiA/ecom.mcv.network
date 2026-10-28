import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import { createTopicRequest, selectCreateTopicLoading } from 'src/redux/store/topicSlice';
import type { CreateTopicRequest, UpdateTopicRequest } from 'src/types/gen/cms/cms/topics/topic';
import { TopicForm } from './topic-form';
import type { TopicFormData } from './components/topic-general-tab';
import type { TopicProductItem } from './components/topic-products-tab';
import type { TopicCategoryItem } from './components/topic-categories-tab';
import type { TopicBannerItem } from './components/topic-banners-tab';
import type { ProductDiff } from './utils/product-diff';
import type { CategoryDiff } from './utils/category-diff';
import type { BannerDiff } from './utils/banner-diff';

// ----------------------------------------------------------------------

export function TopicCreateView() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const loading = useAppSelector(selectCreateTopicLoading);

  // Excel import from create page: confirm + create + navigate to edit with auto-open flag
  const [showCreateConfirmDialog, setShowCreateConfirmDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<TopicFormData | null>(null);

  const handleExcelImportRequest = useCallback((formData: TopicFormData) => {
    setPendingFormData(formData);
    setShowCreateConfirmDialog(true);
  }, []);

  const handleConfirmCreateForExcel = useCallback(() => {
    if (!pendingFormData) return;
    setShowCreateConfirmDialog(false);

    dispatch(
      createTopicRequest({
        data: {
          name: pendingFormData.name,
          localization:
            pendingFormData.localization?.vi || pendingFormData.localization?.en
              ? {
                  vi: pendingFormData.localization.vi || undefined,
                  en: pendingFormData.localization.en || undefined,
                }
              : undefined,
          type: pendingFormData.type,
          order: pendingFormData.order,
          status: pendingFormData.status,
          products: [],
          categories: [],
        } as unknown as CreateTopicRequest,
        onSuccess: (topic) => {
          navigate(`/topic/edit/${topic.id}?openExcelImport=true`);
        },
      })
    );
    setPendingFormData(null);
  }, [dispatch, navigate, pendingFormData]);

  const handleSubmit = (
    data: CreateTopicRequest | Omit<UpdateTopicRequest, 'topicId'>,
    _products: TopicProductItem[],
    _categories: TopicCategoryItem[],
    _productDiff: ProductDiff,
    _categoryDiff: CategoryDiff,
    _banners: TopicBannerItem[],
    _bannerDiff: BannerDiff
  ) => {
    // For create mode, products and categories are included in the data directly
    dispatch(
      createTopicRequest({
        data: data as CreateTopicRequest,
        onSuccess: () => {
          navigate('/topic');
        },
      })
    );
  };

  const handleCancel = () => {
    navigate('/topic');
  };

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <TopicForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onExcelImportRequest={handleExcelImportRequest}
        loading={loading}
      />

      <Dialog open={showCreateConfirmDialog} onClose={() => setShowCreateConfirmDialog(false)}>
        <DialogTitle>{t('importExcel')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('topicWillBeCreatedImmediately')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateConfirmDialog(false)} color="inherit">
            {t('cancel')}
          </Button>
          <Button onClick={handleConfirmCreateForExcel} variant="contained" disabled={loading}>
            {t('confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
