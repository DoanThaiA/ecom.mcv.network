import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  updateProductBannerRequest,
  getProductBannersRequest,
  selectUpdateProductBannerLoading,
} from 'src/redux/store/productBannerSlice';
import type { ProductBanner } from 'src/types/gen/shared/shared/product-banners/product-banner';
import { ProductBannerPosition } from 'src/types/gen/shared/shared/common/enums';
import { BannerImageUpload } from './banner-image-upload';
import { ProductSelectionDialog } from 'src/components/dialog';
import type { Product } from 'src/types';

// ----------------------------------------------------------------------

interface EditProductBannerDialogProps {
  open: boolean;
  banner?: ProductBanner;
  onClose: () => void;
}

// ----------------------------------------------------------------------

export function EditProductBannerDialog({ open, banner, onClose }: EditProductBannerDialogProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const updateLoading = useAppSelector(selectUpdateProductBannerLoading);

  // Form state
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [position, setPosition] = useState<ProductBannerPosition>(
    ProductBannerPosition.PRODUCT_BANNER_POSITION_BOTTOM
  );
  const [ratio, setRatio] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [showManualInput, setShowManualInput] = useState(false);

  // Product selection state
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  // Form errors
  const [nameError, setNameError] = useState(false);
  const [imageError, setImageError] = useState(false);
  // Compute product IDs for API
  const productIds = useMemo(() => {
    return selectedProducts.map((p) => p.id);
  }, [selectedProducts]);

  // Handle product selection
  const handleAddProducts = (products: Product[]) => {
    // Replace entire selection (dialog now returns full selection, not just new products)
    setSelectedProducts(products);
    setProductDialogOpen(false);
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Populate form when banner changes
  useEffect(() => {
    if (banner && open) {
      setName(banner.name);
      setImage(banner.image);
      setPosition(banner.position);
      setRatio(banner.ratio ? banner.ratio.toString() : '');
      setIsActive(banner.isActive);

      // Convert ProductBannerProduct to Product format
      if (banner.products && banner.products.length > 0) {
        const products: Product[] = banner.products.map((p) => ({
          id: p.id,
          name: p.name,
          code: p.code,
          images: p.avatar ? { avatar: p.avatar } : undefined,
        })) as Product[];
        setSelectedProducts(products);
      } else {
        setSelectedProducts([]);
      }

      setNameError(false);
      setImageError(false);
    }
  }, [banner, open]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setName('');
      setImage('');
      setPosition(ProductBannerPosition.PRODUCT_BANNER_POSITION_BOTTOM);
      setRatio('');
      setIsActive(true);
      setShowManualInput(false);
      setSelectedProducts([]);
      setNameError(false);
      setImageError(false);
    }
  }, [open]);

  // Handle image upload change
  const handleImageChange = (url: string) => {
    setImage(url);
    if (url.trim()) {
      setImageError(false);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const isNameValid = name.trim().length > 0;
    const isImageValid = image.trim().length > 0;

    setNameError(!isNameValid);
    setImageError(!isImageValid);

    return isNameValid && isImageValid;
  };

  // Handle submit
  const handleSubmit = () => {
    if (!banner || !validateForm()) {
      return;
    }

    const requestData: any = {
      name: name.trim(),
      image: image.trim(),
      position,
      isActive,
      productIds,
    };

    // Add ratio if provided
    if (ratio.trim()) {
      const ratioNum = parseFloat(ratio);
      if (!isNaN(ratioNum) && ratioNum >= 0) {
        requestData.ratio = ratioNum;
      }
    } else {
      requestData.ratio = null;
    }
    dispatch(
      updateProductBannerRequest({
        id: banner.id,
        data: requestData,
        onSuccess: () => {
          onClose();
          // Refresh the list
          dispatch(getProductBannersRequest({ page: 1, limit: 10 }));
        },
      })
    );
  };

  // Handle close
  const handleClose = () => {
    if (!updateLoading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>{t('editProductBanner')}</DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {/* Name Field */}
          <TextField
            label={t('name')}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (e.target.value.trim()) {
                setNameError(false);
              }
            }}
            error={nameError}
            helperText={nameError ? t('nameRequired') : ''}
            required
            fullWidth
          />

          {/* Image Upload Section */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t('image')} *
            </Typography>

            {!showManualInput ? (
              <>
                <BannerImageUpload
                  imageUrl={image}
                  onChange={handleImageChange}
                  disabled={updateLoading}
                />
                {imageError && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {t('imageRequired')}
                  </Typography>
                )}
                <Button size="small" onClick={() => setShowManualInput(true)} sx={{ mt: 1 }}>
                  {t('switchToManualUrl')}
                </Button>
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  label={t('imageUrl')}
                  value={image}
                  onChange={(e) => {
                    setImage(e.target.value);
                    if (e.target.value.trim()) {
                      setImageError(false);
                    }
                  }}
                  error={imageError}
                  helperText={imageError ? t('imageRequired') : ''}
                  required
                  placeholder="https://example.com/image.jpg"
                />
                <Button size="small" onClick={() => setShowManualInput(false)} sx={{ mt: 1 }}>
                  {t('switchToUpload')}
                </Button>
              </>
            )}
          </Box>

          {/* Position Select */}
          <FormControl fullWidth>
            <InputLabel>{t('position')}</InputLabel>
            <Select
              value={position}
              label={t('position')}
              onChange={(e) => setPosition(e.target.value as ProductBannerPosition)}
            >
              <MenuItem value={ProductBannerPosition.PRODUCT_BANNER_POSITION_TOP}>
                {t('top')}
              </MenuItem>
              <MenuItem value={ProductBannerPosition.PRODUCT_BANNER_POSITION_BOTTOM}>
                {t('bottom')}
              </MenuItem>
            </Select>
          </FormControl>

          {/* Ratio Field (Optional) */}
          <TextField
            label={t('ratio')}
            value={ratio}
            onChange={(e) => setRatio(e.target.value)}
            type="number"
            helperText={t('ratioHelper')}
            fullWidth
            inputProps={{
              step: '0.01',
              min: '0',
            }}
          />

          {/* Active Switch */}
          <FormControlLabel
            control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
            label={t('active')}
          />

          {/* Products Section */}
          <Box>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
            >
              <Typography variant="subtitle2">
                {t('products')} ({selectedProducts.length})
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setProductDialogOpen(true)}
                disabled={updateLoading}
              >
                {t('addProduct')}
              </Button>
            </Box>

            {selectedProducts.length === 0 && (
              <Box
                sx={{
                  p: 2,
                  textAlign: 'center',
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  color: 'text.secondary',
                }}
              >
                <Typography variant="body2">{t('noProductsSelected')}</Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={updateLoading} color="inherit">
          {t('cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={updateLoading}
          startIcon={updateLoading && <CircularProgress size={20} color="inherit" />}
          sx={{
            bgcolor: '#235AFF',
            '&:hover': { bgcolor: '#1B4ACC' },
            minWidth: 100,
          }}
        >
          {updateLoading ? t('updating') : t('update')}
        </Button>
      </DialogActions>

      {/* Product Selection Dialog */}
      <ProductSelectionDialog
        open={productDialogOpen}
        onClose={() => setProductDialogOpen(false)}
        onConfirm={handleAddProducts}
        existingProductIds={productIds}
        variant="simple"
        confirmLabel="addProductToBanner"
        preSelectExisting={true}
      />
    </Dialog>
  );
}
