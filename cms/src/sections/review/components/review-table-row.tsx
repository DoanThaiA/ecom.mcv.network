import { Box, Typography, IconButton, Chip } from '@mui/material';
import {
  Visibility as VisibleIcon,
  VisibilityOff as HiddenIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CmsProductReview } from 'src/types/reviews';
import { getFitLevelKey } from 'src/types/reviews';

import { getColumnStyle } from '../review-config';
import { ReviewMediaViewer } from './review-media-viewer';

// ----------------------------------------------------------------------

type Props = {
  review: CmsProductReview;
  index: number;
  onToggleVisibility: (review: CmsProductReview) => void;
};

export function ReviewTableRow({ review, index, onToggleVisibility }: Props) {
  const { t } = useTranslation();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const handleMediaClick = (mediaIndex: number) => {
    setSelectedMediaIndex(mediaIndex);
    setViewerOpen(true);
  };

  // Render Rating Stars (moved inside to access helper or just keep local)

  const renderRatingStars = (ratingValue: number) => {
    return (
      <Box sx={{ display: 'flex' }}>
        {[1, 2, 3, 4, 5].map((star) =>
          star <= ratingValue ? (
            <StarIcon key={star} sx={{ color: '#FFC107', fontSize: 16 }} />
          ) : (
            <StarBorderIcon key={star} sx={{ color: '#E0E0E0', fontSize: 16 }} />
          )
        )}
      </Box>
    );
  };

  return (
    <Box
      key={`${review.reviewId}-${review.productId}`}
      sx={{
        display: 'flex',
        bgcolor: index % 2 === 0 ? 'white' : '#FAFBFC',
        borderBottom: '1px solid #E5E6EB',
        minHeight: 80,
        '&:hover': { bgcolor: '#F5F7FA' },
      }}
    >
      {/* 1. ID Order CMS - Link */}
      <Box
        sx={{
          ...getColumnStyle('orderId'),
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        <Typography
          component={RouterLink}
          to={`/order/${review.orderId || review.orderNumber}`}
          variant="subtitle2"
          sx={{
            color: '#235AFF',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {review.orderNumber}
        </Typography>
      </Box>

      {/* 2. ID Nhanh - Text */}
      <Box sx={{ ...getColumnStyle('nhanhId'), justifyContent: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {review.nhanhOrderId || '--'}
        </Typography>
      </Box>

      {/* 3. Product - Link */}
      <Box
        sx={{
          ...getColumnStyle('product'),
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: 0.5,
        }}
      >
        <Typography
          component={RouterLink}
          to={`/product/${review.productId}`}
          variant="subtitle2"
          sx={{
            color: '#235AFF',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.3,
          }}
        >
          {review.productName}
        </Typography>
      </Box>

      {/* 4. Height - Number */}
      <Box sx={{ ...getColumnStyle('height'), justifyContent: 'center' }}>
        <Typography variant="body2">{review.heightCm}</Typography>
      </Box>

      {/* 5. Weight - Number */}
      <Box sx={{ ...getColumnStyle('weight'), justifyContent: 'center' }}>
        <Typography variant="body2">{review.weightKg}</Typography>
      </Box>

      {/* 6. Fit Level - Text */}
      <Box sx={{ ...getColumnStyle('fitLevel'), justifyContent: 'center' }}>
        <Chip
          label={t(getFitLevelKey(review.fitLevel))}
          size="small"
          color={review.fitLevel === 1 ? 'success' : 'default'}
          sx={{ fontWeight: 500 }}
        />
      </Box>

      {/* 7. Content - Stars + Text + Media */}
      <Box
        sx={{
          ...getColumnStyle('content'),
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          py: 2,
        }}
      >
        <Box sx={{ mb: 1 }}>{renderRatingStars(review.rating)}</Box>
        <Typography
          variant="body2"
          sx={{ mb: 1.5, color: 'text.secondary', lineHeight: 1.6, display: 'block' }}
        >
          {review.content || ''}
        </Typography>
        {/* Media Thumbnails */}
        {review.media && review.media.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {review.media.slice(0, 5).map((media, i) => (
              <Box
                key={i}
                onClick={() => handleMediaClick(i)}
                sx={{
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: '1px solid #E5E6EB',
                  lineHeight: 0,
                  cursor: 'pointer',
                  position: 'relative',
                  '&:hover': {
                    opacity: 0.8,
                    borderColor: 'primary.main',
                  },
                }}
              >
                <Box
                  component="img"
                  src={media.type === 'video' ? media.thumbnail || media.url : media.url}
                  alt={`Review media ${i}`}
                  sx={{
                    width: 64,
                    height: 64,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                {/* Video play icon overlay */}
                {media.type === 'video' && (
                  <PlayCircleOutlineIcon
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: 32,
                      color: 'common.white',
                      opacity: 0.9,
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* 8. Status - Icon Toggle */}
      <Box sx={{ ...getColumnStyle('status', true), justifyContent: 'center' }}>
        <IconButton onClick={() => onToggleVisibility(review)}>
          {review.status === 'visible' ? (
            <VisibleIcon sx={{ color: 'success.main' }} />
          ) : (
            <HiddenIcon sx={{ color: 'error.main' }} />
          )}
        </IconButton>
      </Box>

      {/* Media Viewer */}
      <ReviewMediaViewer
        media={review.media || []}
        initialIndex={selectedMediaIndex}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </Box>
  );
}
