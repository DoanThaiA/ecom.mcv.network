import { useState } from 'react';
import { Box, Dialog, IconButton } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export interface TableImagePreviewProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sx?: SxProps<Theme>;
}

export function TableImagePreview({
  src,
  alt,
  width = 40,
  height = 40,
  sx,
}: TableImagePreviewProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleClose = () => setOpen(false);

  const handleError = () => {
    setHasError(true);
  };

  const showFallback = hasError || !src;

  return (
    <>
      {/* Thumbnail Image */}
      {showFallback ? (
        <Box
          sx={{
            width,
            minWidth: width,
            height,
            borderRadius: '8px',
            bgcolor: '#D9D9D9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...((sx as object) || {}),
          }}
        >
          <Box
            component="img"
            src="/logo.svg"
            alt="logo"
            sx={{
              width: width * 0.6,
              height: height * 0.6,
              objectFit: 'contain',
            }}
          />
        </Box>
      ) : (
        <Box
          component="img"
          src={src}
          alt={alt}
          sx={{
            width,
            minWidth: width,
            height,
            objectFit: 'cover',
            borderRadius: '8px',
            bgcolor: '#D9D9D9',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
            ...((sx as object) || {}),
          }}
          onClick={() => setOpen(true)}
          onError={handleError}
        />
      )}

      {/* Preview Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            overflow: 'hidden',
          },
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'white',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1,
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.7)',
            },
          }}
          aria-label={t('close')}
        >
          <CloseIcon />
        </IconButton>

        {/* Full Size Image */}
        <Box
          component="img"
          src={src}
          alt={alt}
          sx={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            objectFit: 'contain',
            borderRadius: '8px',
          }}
          onClick={handleClose}
        />
      </Dialog>
    </>
  );
}
