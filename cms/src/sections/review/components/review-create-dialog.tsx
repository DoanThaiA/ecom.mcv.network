import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Select,
  MenuItem,
  Rating,
  Stack,
  Card,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProductSelectionDialog } from 'src/components/dialog';
import type { Product } from 'src/types/gen/shared/shared/products/product';
import type { CreateCmsProductReviewRequest, CreateCmsReviewRequest } from 'src/types/reviews';
import { ReviewMediaUpload } from './review-media-upload';

// ----------------------------------------------------------------------

interface ProductReviewFormData {
  productId: string;
  variantId?: string;
  productName: string;
  productImage?: string;
  rating: number;
  heightCm: number;
  weightKg: number;
  fitLevel: number;
  content: string;
  mediaIds: string[];
}

interface ReviewCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCmsReviewRequest) => void;
  loading?: boolean;
}

export function ReviewCreateDialog({
  open,
  onClose,
  onSubmit,
  loading = false,
}: ReviewCreateDialogProps) {
  const { t } = useTranslation();

  const [userName, setUserName] = useState('');
  const [productReviews, setProductReviews] = useState<ProductReviewFormData[]>([]);
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  const handleAddProducts = (products: Product[]) => {
    const newReviews: ProductReviewFormData[] = products.map((product) => ({
      productId: product.id,
      productName: product.name,
      productImage: product.images?.avatar || undefined,
      rating: 5,
      heightCm: 165,
      weightKg: 55,
      fitLevel: 1,
      content: '',
      mediaIds: [],
    }));
    setProductReviews((prev) => [...prev, ...newReviews]);
    setProductDialogOpen(false);
  };

  const handleRemoveProduct = (productId: string) => {
    setProductReviews((prev) => prev.filter((r) => r.productId !== productId));
  };

  const handleProductReviewChange = (
    productId: string,
    field: keyof ProductReviewFormData,
    value: number | string | string[]
  ) => {
    setProductReviews((prev) =>
      prev.map((r) => (r.productId === productId ? { ...r, [field]: value } : r))
    );
  };

  const handleSubmit = () => {
    const data: CreateCmsReviewRequest = {
      userName,
      productReviews: productReviews.map(
        (r): CreateCmsProductReviewRequest => ({
          productId: r.productId,
          variantId: r.variantId,
          rating: r.rating,
          heightCm: r.heightCm,
          weightKg: r.weightKg,
          fitLevel: r.fitLevel,
          content: r.content || undefined,
          mediaIds: r.mediaIds,
        })
      ),
    };
    onSubmit(data);
  };

  const handleClose = () => {
    setUserName('');
    setProductReviews([]);
    onClose();
  };

  const isFormValid: boolean = userName.trim() !== '' && productReviews.length > 0;

  const existingProductIds: string[] = productReviews.map((r) => r.productId);

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          {t('createReview')}
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            {/* User Name */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('reviewerName')}
                <Typography component="span" color="error">
                  *
                </Typography>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder={t('enterReviewerName')}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </Box>

            {/* Product Reviews */}
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="subtitle2">
                  {t('selectProductToReview')}
                  <Typography component="span" color="error">
                    *
                  </Typography>
                </Typography>
                <Button variant="outlined" size="small" onClick={() => setProductDialogOpen(true)}>
                  {t('addProduct')}
                </Button>
              </Box>

              {productReviews.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  {t('noProductsYet')}
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {productReviews.map((review) => (
                    <Card key={review.productId} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        {/* Product Image */}
                        <Avatar
                          src={review.productImage}
                          variant="rounded"
                          sx={{ width: 80, height: 80 }}
                        />

                        {/* Product Info & Form */}
                        <Box sx={{ flex: 1 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              mb: 1,
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {review.productName}
                            </Typography>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveProduct(review.productId)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>

                          {/* Rating */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {t('rating')}:
                            </Typography>
                            <Rating
                              value={review.rating}
                              onChange={(_, value) =>
                                handleProductReviewChange(review.productId, 'rating', value || 5)
                              }
                            />
                          </Box>

                          {/* Height, Weight, FitLevel */}
                          <Box sx={{ display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                            <TextField
                              label={t('height')}
                              type="number"
                              size="small"
                              value={review.heightCm}
                              onChange={(e) =>
                                handleProductReviewChange(
                                  review.productId,
                                  'heightCm',
                                  Number(e.target.value)
                                )
                              }
                              sx={{ width: 100 }}
                              inputProps={{ min: 50, max: 250 }}
                            />
                            <TextField
                              label={t('bodyWeight')}
                              type="number"
                              size="small"
                              value={review.weightKg}
                              onChange={(e) =>
                                handleProductReviewChange(
                                  review.productId,
                                  'weightKg',
                                  Number(e.target.value)
                                )
                              }
                              sx={{ width: 100 }}
                              inputProps={{ min: 20, max: 300 }}
                            />
                            <Select
                              size="small"
                              value={review.fitLevel}
                              onChange={(e) =>
                                handleProductReviewChange(
                                  review.productId,
                                  'fitLevel',
                                  e.target.value as number
                                )
                              }
                              sx={{ minWidth: 120 }}
                            >
                              <MenuItem value={1}>{t('fitLevelFit')}</MenuItem>
                              <MenuItem value={2}>{t('fitLevelLoose')}</MenuItem>
                              <MenuItem value={3}>{t('fitLevelTight')}</MenuItem>
                            </Select>
                          </Box>

                          {/* Content */}
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            size="small"
                            placeholder={t('reviewContent')}
                            value={review.content}
                            onChange={(e) =>
                              handleProductReviewChange(review.productId, 'content', e.target.value)
                            }
                            sx={{ mb: 2 }}
                          />

                          {/* Media Upload */}
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                              {t('reviewMedia')} ({t('optional')})
                            </Typography>
                            <ReviewMediaUpload
                              onMediaChange={(paths) =>
                                handleProductReviewChange(review.productId, 'mediaIds', paths)
                              }
                              maxFiles={5}
                            />
                          </Box>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} color="inherit">
            {t('cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {t('create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product Selection Dialog */}
      <ProductSelectionDialog
        open={productDialogOpen}
        onClose={() => setProductDialogOpen(false)}
        onConfirm={handleAddProducts}
        existingProductIds={existingProductIds}
        filterOutExisting
        title="selectProductToReview"
        confirmLabel="addProduct"
        variant="simple"
      />
    </>
  );
}
