import { Box, Button, CircularProgress, MenuItem, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HtmlEditor } from 'src/components/html-editor';
import { BannerImageUpload } from 'src/sections/product-banner/components/banner-image-upload';
import { selectUpdateProductLoading, updateProductRequest } from 'src/redux/store/productSlice';
import { selectUploadLoading } from 'src/redux/store/fileSlice';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import type { ProductDescriptionMedia } from 'src/types/gen/shared/shared/products/product';
import { Localization } from 'src/types/gen/shared/shared/common/localization';
import { ProductBadge } from 'src/types/gen/shared/shared/common/enums';
import type { ProductExtended } from 'src/types/products';
import { convertBadgeFromApi } from 'src/utils/enum-helpers';
import { ProductDescriptionMediaSection } from './components/product-description-media-section';

// ----------------------------------------------------------------------

interface ProductWebsiteSettingsTabProps {
  product: ProductExtended;
}

export function ProductWebsiteSettingsTab({ product }: ProductWebsiteSettingsTabProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isUpdating = useAppSelector(selectUpdateProductLoading);
  const isUploading = useAppSelector(selectUploadLoading);

  // Localization state
  const [nameLocalization, setNameLocalization] = useState<Localization>({
    vi: product.nameLocalization?.vi ?? '',
    en: product.nameLocalization?.en ?? '',
  });
  const [descriptionLocalization, setDescriptionLocalization] = useState<Localization>({
    vi: product.descriptionLocalization?.vi ?? '',
    en: product.descriptionLocalization?.en ?? '',
  });
  const [detailsLocalization, setDetailsLocalization] = useState({
    material: {
      vi: product.detailsLocalization?.material?.vi ?? '',
      en: product.detailsLocalization?.material?.en ?? '',
    },
    style: {
      vi: product.detailsLocalization?.style?.vi ?? '',
      en: product.detailsLocalization?.style?.en ?? '',
    },
    highlights: {
      vi: product.detailsLocalization?.highlights?.vi ?? '',
      en: product.detailsLocalization?.highlights?.en ?? '',
    },
    suitableFor: {
      vi: product.detailsLocalization?.suitableFor?.vi ?? '',
      en: product.detailsLocalization?.suitableFor?.en ?? '',
    },
    careInstructions: {
      vi: product.detailsLocalization?.careInstructions?.vi ?? '',
      en: product.detailsLocalization?.careInstructions?.en ?? '',
    },
  });

  // Product badge state
  const [badge, setBadge] = useState<ProductBadge>(convertBadgeFromApi(product.badge as any));

  // Size guide image state
  const [sizeGuide, setSizeGuide] = useState<string>(product.sizeGuide ?? '');
  const [descriptionMedia, setDescriptionMedia] = useState<ProductDescriptionMedia>({
    topImages: product.descriptionMedia?.topImages ?? [],
    sliderImages: product.descriptionMedia?.sliderImages ?? [],
    bottomImages: product.descriptionMedia?.bottomImages ?? [],
  });

  const handleSave = () => {
    dispatch(
      updateProductRequest({
        id: product.id,
        data: {
          nameLocalization,
          descriptionLocalization,
          detailsLocalization,
          badge,
          sizeGuide: sizeGuide || undefined,
          descriptionMedia,
        },
      })
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 3,
          mx: 3,
          my: 3,
          border: '1px solid #E5E6EB',
          borderRadius: 1,
          bgcolor: '#FFFFFF',
        }}
      >
        {/* Product Name Localization */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('productName')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('productNameVi')}
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder={t('enterProductNameVi')}
                value={nameLocalization.vi}
                onChange={(e) => setNameLocalization({ ...nameLocalization, vi: e.target.value })}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('productNameEn')}
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder={t('enterProductNameEn')}
                value={nameLocalization.en}
                onChange={(e) => setNameLocalization({ ...nameLocalization, en: e.target.value })}
              />
            </Box>
          </Box>
        </Box>

        {/* Size Guide Image */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('sizeGuideImage')}
          </Typography>
          <BannerImageUpload
            imageUrl={sizeGuide || undefined}
            onChange={(url) => setSizeGuide(url)}
          />
        </Box>

        <ProductDescriptionMediaSection
          value={descriptionMedia}
          onChange={setDescriptionMedia}
          disabled={isUpdating || isUploading}
        />

        {/* Product Details Localization */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('productDetails')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Left Column - Vietnamese */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t('vietnamese')}
            </Typography>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('material')}
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder={t('pleaseEnter')}
                value={detailsLocalization.material.vi}
                onChange={(e) =>
                  setDetailsLocalization({
                    ...detailsLocalization,
                    material: { ...detailsLocalization.material, vi: e.target.value },
                  })
                }
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('style')}
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder={t('pleaseEnter')}
                value={detailsLocalization.style.vi}
                onChange={(e) =>
                  setDetailsLocalization({
                    ...detailsLocalization,
                    style: { ...detailsLocalization.style, vi: e.target.value },
                  })
                }
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('highlights')}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder={t('pleaseEnter')}
                value={detailsLocalization.highlights.vi}
                onChange={(e) =>
                  setDetailsLocalization({
                    ...detailsLocalization,
                    highlights: { ...detailsLocalization.highlights, vi: e.target.value },
                  })
                }
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('suitable')}
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder={t('pleaseEnter')}
                value={detailsLocalization.suitableFor.vi}
                onChange={(e) =>
                  setDetailsLocalization({
                    ...detailsLocalization,
                    suitableFor: { ...detailsLocalization.suitableFor, vi: e.target.value },
                  })
                }
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('preservation')}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder={t('pleaseEnter')}
                value={detailsLocalization.careInstructions.vi}
                onChange={(e) =>
                  setDetailsLocalization({
                    ...detailsLocalization,
                    careInstructions: {
                      ...detailsLocalization.careInstructions,
                      vi: e.target.value,
                    },
                  })
                }
              />
            </Box>
          </Box>

          {/* Right Column - English */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t('english')}
            </Typography>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('material')}
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder={t('pleaseEnter')}
                value={detailsLocalization.material.en}
                onChange={(e) =>
                  setDetailsLocalization({
                    ...detailsLocalization,
                    material: { ...detailsLocalization.material, en: e.target.value },
                  })
                }
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('style')}
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder={t('pleaseEnter')}
                value={detailsLocalization.style.en}
                onChange={(e) =>
                  setDetailsLocalization({
                    ...detailsLocalization,
                    style: { ...detailsLocalization.style, en: e.target.value },
                  })
                }
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('highlights')}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder={t('pleaseEnter')}
                value={detailsLocalization.highlights.en}
                onChange={(e) =>
                  setDetailsLocalization({
                    ...detailsLocalization,
                    highlights: { ...detailsLocalization.highlights, en: e.target.value },
                  })
                }
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('suitable')}
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder={t('pleaseEnter')}
                value={detailsLocalization.suitableFor.en}
                onChange={(e) =>
                  setDetailsLocalization({
                    ...detailsLocalization,
                    suitableFor: { ...detailsLocalization.suitableFor, en: e.target.value },
                  })
                }
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('preservation')}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder={t('pleaseEnter')}
                value={detailsLocalization.careInstructions.en}
                onChange={(e) =>
                  setDetailsLocalization({
                    ...detailsLocalization,
                    careInstructions: {
                      ...detailsLocalization.careInstructions,
                      en: e.target.value,
                    },
                  })
                }
              />
            </Box>
          </Box>
        </Box>

        {/* Product Badge */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('productBadge')}
          </Typography>
          <TextField
            label={t('productBadge')}
            value={badge}
            onChange={(e) => setBadge(Number(e.target.value) as ProductBadge)}
            fullWidth
            select
            helperText={t('productBadgeHelper')}
            size="small"
          >
            <MenuItem value={ProductBadge.PRODUCT_BADGE_UNSPECIFIED}>{t('noBadge')}</MenuItem>
            <MenuItem value={ProductBadge.PRODUCT_BADGE_SALE}>{t('badgeSale')}</MenuItem>
            <MenuItem value={ProductBadge.PRODUCT_BADGE_NEW}>{t('badgeNew')}</MenuItem>
            <MenuItem value={ProductBadge.PRODUCT_BADGE_HOT}>{t('badgeHot')}</MenuItem>
            <MenuItem value={ProductBadge.PRODUCT_BADGE_BEST_SELLER}>
              {t('badgeBestSeller')}
            </MenuItem>
            <MenuItem value={ProductBadge.PRODUCT_BADGE_CLEARANCE_SALE}>
              {t('badgeClearanceSale')}
            </MenuItem>
          </TextField>
        </Box>

        {/* Product Description Localization */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('productDescription')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('productDescriptionVi')}
              </Typography>
              <HtmlEditor
                value={descriptionLocalization.vi}
                onChange={(html) =>
                  setDescriptionLocalization({ ...descriptionLocalization, vi: html })
                }
                placeholder={t('enterProductDescriptionVi')}
                minHeight={300}
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('productDescriptionEn')}
              </Typography>
              <HtmlEditor
                value={descriptionLocalization.en}
                onChange={(html) =>
                  setDescriptionLocalization({ ...descriptionLocalization, en: html })
                }
                placeholder={t('enterProductDescriptionEn')}
                minHeight={300}
              />
            </Box>
          </Box>
        </Box>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isUpdating || isUploading}
            startIcon={isUpdating && <CircularProgress size={20} color="inherit" />}
            sx={{ minWidth: 94 }}
          >
            {t('save')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
