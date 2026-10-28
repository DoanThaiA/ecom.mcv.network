import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { ProductDescriptionMedia } from 'src/types/gen/shared/shared/products/product';
import { SingleDescriptionImageUpload } from './single-description-image-upload';
import { SortableDescriptionGallery } from './sortable-description-gallery';

interface ProductDescriptionMediaSectionProps {
  value: ProductDescriptionMedia;
  onChange: (value: ProductDescriptionMedia) => void;
  disabled?: boolean;
}

export function ProductDescriptionMediaSection({
  value,
  onChange,
  disabled = false,
}: ProductDescriptionMediaSectionProps) {
  const { t } = useTranslation();
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t('productDescriptionImages')}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <SingleDescriptionImageUpload
          label={t('descriptionTopImage')}
          dimensionHint={t('descriptionTopImageHelper')}
          helperText={t('imageUploadRequirements')}
          imageUrl={value.topImages[0]}
          onChange={(url) => onChange({ ...value, topImages: url ? [url] : [] })}
          disabled={disabled}
        />
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t('descriptionSliderImages')}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {t('descriptionSliderImagesHelper')}
          </Typography>
          <SortableDescriptionGallery
            images={value.sliderImages}
            onChange={(sliderImages) => onChange({ ...value, sliderImages })}
            disabled={disabled}
          />
        </Box>
        <SingleDescriptionImageUpload
          label={t('descriptionBottomImage')}
          dimensionHint={t('descriptionBottomImageHelper')}
          helperText={t('imageUploadRequirements')}
          imageUrl={value.bottomImages[0]}
          onChange={(url) => onChange({ ...value, bottomImages: url ? [url] : [] })}
          disabled={disabled}
        />
      </Box>
    </Box>
  );
}
