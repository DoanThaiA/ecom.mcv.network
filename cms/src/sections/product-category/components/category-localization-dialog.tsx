import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  updateProductCategoryLocalizationRequest,
  selectUpdateProductCategoryLoading,
} from 'src/redux/store/productCategorySlice';
import type { ProductCategory } from 'src/types/gen/shared/shared/product-categories/product-category';

// ----------------------------------------------------------------------

interface CategoryLocalizationDialogProps {
  open: boolean;
  category: ProductCategory | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CategoryLocalizationDialog({
  open,
  category,
  onClose,
  onSuccess,
}: CategoryLocalizationDialogProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const loading = useAppSelector(selectUpdateProductCategoryLoading);
  const [localization, setLocalization] = useState<{ vi?: string; en?: string }>({});

  // Initialize form when category changes
  useEffect(() => {
    if (category) {
      setLocalization({
        vi: category.nameLocalization?.vi || '',
        en: category.nameLocalization?.en || '',
      });
    } else {
      setLocalization({ vi: '', en: '' });
    }
  }, [category]);

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) return;

    dispatch(
      updateProductCategoryLocalizationRequest({
        data: {
          categoryId: category.id,
          nameLocalization: localization,
        },
        onSuccess: () => {
          onSuccess();
          handleClose();
        },
      })
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{t('editCategoryLocalization')}</Typography>
          <IconButton onClick={handleClose} disabled={loading} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('defaultName')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {category?.name}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Vietnamese Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('categoryNameVi')}
                value={localization.vi || ''}
                onChange={(e) => setLocalization({ ...localization, vi: e.target.value })}
                disabled={loading}
                helperText={t('categoryNameViHelper')}
              />
            </Grid>

            {/* English Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('categoryNameEn')}
                value={localization.en || ''}
                onChange={(e) => setLocalization({ ...localization, en: e.target.value })}
                disabled={loading}
                helperText={t('categoryNameEnHelper')}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            {t('cancel')}
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : t('save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
