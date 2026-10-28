import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Dialog, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ReviewMedia } from 'src/types/reviews';

// ----------------------------------------------------------------------

interface ReviewMediaViewerProps {
  media: ReviewMedia[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
}

export function ReviewMediaViewer({ media, initialIndex, open, onClose }: ReviewMediaViewerProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const currentMedia = media[currentIndex];
  const hasMultiple = media.length > 1;

  // Keyboard navigation
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentIndex, onClose]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  if (!currentMedia) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      PaperProps={{
        sx: {
          bgcolor: 'transparent',
          boxShadow: 'none',
          overflow: 'visible',
        },
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 2,
          bgcolor: 'rgba(0, 0, 0, 0.6)',
          color: 'common.white',
          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Navigation Arrows */}
      {hasMultiple && (
        <>
          <IconButton
            onClick={handlePrev}
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: 'rgba(0, 0, 0, 0.6)',
              color: 'common.white',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: 'rgba(0, 0, 0, 0.6)',
              color: 'common.white',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
        </>
      )}

      {/* Media Display */}
      <Box sx={{ position: 'relative' }}>
        {currentMedia.type === 'image' ? (
          <Box
            component="img"
            src={currentMedia.url}
            alt={`Review media ${currentIndex + 1}`}
            sx={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'block',
              borderRadius: 1,
            }}
          />
        ) : (
          <Box
            component="video"
            src={currentMedia.url}
            controls
            autoPlay
            sx={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'block',
              borderRadius: 1,
              bgcolor: 'black',
            }}
          />
        )}

        {/* Media Counter */}
        {hasMultiple && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: 'rgba(0, 0, 0, 0.6)',
              color: 'common.white',
              px: 2,
              py: 0.5,
              borderRadius: 1,
              fontSize: 14,
            }}
          >
            {t('mediaCounter', { current: currentIndex + 1, total: media.length })}
          </Box>
        )}
      </Box>
    </Dialog>
  );
}
