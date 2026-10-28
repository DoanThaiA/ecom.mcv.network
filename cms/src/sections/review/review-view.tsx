import { Box, Card, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { showSuccess } from 'src/utils/toast';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getReviewsRequest,
  toggleVisibilityRequest,
  createReviewRequest,
  selectReviews,
  selectReviewLoading,
  selectReviewCreating,
  selectReviewPagination,
  selectReviewFilters,
  setFilters,
} from 'src/redux/store/reviewSlice';
import type { CmsProductReview, ReviewFilters, CreateCmsReviewRequest } from 'src/types/reviews';
import { TablePagination } from 'src/components/table';

import { ReviewFilter } from './components/review-filter';
import { ReviewTableRow } from './components/review-table-row';
import { ReviewCreateDialog } from './components/review-create-dialog';
import { getColumnStyle } from './review-config';

// ----------------------------------------------------------------------

export function ReviewView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // Redux state
  const reviews = useAppSelector(selectReviews);
  const loading = useAppSelector(selectReviewLoading);
  const creating = useAppSelector(selectReviewCreating);
  const pagination = useAppSelector(selectReviewPagination);
  const appliedFilters = useAppSelector(selectReviewFilters); // Get applied filters from Redux

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Filter state
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<string>('');
  const [rating, setRating] = useState<number | ''>('');
  const [fitLevel, setFitLevel] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Initial fetch
  useEffect(() => {
    dispatch(getReviewsRequest({ page: 1, limit: pageSize, filters: { sortBy: 'newest' } }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // Handlers
  const handleSearch = () => {
    const filters: ReviewFilters = { sortBy: 'newest' };
    if (keyword) filters.keyword = keyword;
    if (status) filters.status = status;
    if (rating) filters.rating = rating;
    if (fitLevel) filters.fitLevel = fitLevel;
    if (height) filters.height = Number(height);
    if (weight) filters.weight = Number(weight);

    setCurrentPage(1);
    dispatch(setFilters(filters));
    dispatch(getReviewsRequest({ page: 1, limit: pageSize, filters }));
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Use applied filters from Redux for pagination to ensure stability
    dispatch(getReviewsRequest({ page: newPage, limit: pageSize, filters: appliedFilters }));
  };

  const handleToggleVisibility = (review: CmsProductReview) => {
    const newVisible = review.status !== 'visible';
    dispatch(
      toggleVisibilityRequest({
        reviewId: review.reviewId,
        productId: review.productId,
        visible: newVisible,
      })
    );

    // Optimistic UI update notification (actual state update handled by Saga/Slice)
    if (newVisible) {
      showSuccess(t('reviewVisible'));
    } else {
      showSuccess(t('reviewHidden'));
    }
  };

  const handleCreateReview = (data: CreateCmsReviewRequest) => {
    dispatch(createReviewRequest(data));
    setCreateDialogOpen(false);
    showSuccess(t('createReviewSuccess'));
  };

  // Table Headers
  const headers = [
    { key: 'orderId', label: t('orderIdCms') },
    { key: 'nhanhId', label: t('orderIdNhanh') },
    { key: 'product', label: t('product') },
    { key: 'height', label: t('height') },
    { key: 'weight', label: t('bodyWeight') },
    { key: 'fitLevel', label: t('fitLevel') },
    { key: 'content', label: t('reviewContent') },
    { key: 'status', label: t('visible') },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - var(--layout-header-desktop-height) - 16px)',
        overflow: 'hidden',
      }}
    >
      {/* Filter Section */}
      <ReviewFilter
        keyword={keyword}
        setKeyword={setKeyword}
        status={status}
        setStatus={setStatus}
        rating={rating}
        setRating={setRating}
        fitLevel={fitLevel}
        setFitLevel={setFitLevel}
        height={height}
        setHeight={setHeight}
        weight={weight}
        setWeight={setWeight}
        onSearch={handleSearch}
        onCreateReview={() => setCreateDialogOpen(true)}
      />

      {/* Table Section */}
      <Card sx={{ mx: 2, flex: 1, overflow: 'auto' }}>
        <Box sx={{ width: '100%', minWidth: 1200 }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              bgcolor: '#F7F8FA',
              borderBottom: '2px solid #E5E6EB',
              position: 'sticky',
              top: 0,
              zIndex: 1,
            }}
          >
            {headers.map((header, index) => (
              <Box
                key={header.key}
                sx={{
                  ...getColumnStyle(header.key, index === headers.length - 1),
                  fontWeight: 600,
                  fontSize: 14,
                  color: '#1C252E',
                  justifyContent: header.key === 'content' ? 'flex-start' : 'center',
                }}
              >
                {header.label}
              </Box>
            ))}
          </Box>

          {/* Body */}
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">{t('loading')}...</Typography>
            </Box>
          ) : reviews.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">{t('reviewsNotFound')}</Typography>
            </Box>
          ) : (
            reviews.map((review, index) => (
              <ReviewTableRow
                key={`${review.reviewId}-${review.productId}`}
                review={review}
                index={index}
                onToggleVisibility={handleToggleVisibility}
              />
            ))
          )}
        </Box>
      </Card>

      {/* Pagination */}
      <Box sx={{ px: 2 }}>
        <TablePagination
          totalItems={pagination.total}
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
            // Use applied filters to respect "Buffered Search"
            dispatch(getReviewsRequest({ page: 1, limit: newSize, filters: appliedFilters }));
          }}
        />
      </Box>

      {/* Create Review Dialog */}
      <ReviewCreateDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateReview}
        loading={creating}
      />
    </Box>
  );
}
