import { Box, Card, MenuItem, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { HtmlEditor } from 'src/components/html-editor';
import type { CreateComboRequest } from 'src/types/gen/cms/cms/combos/combo';
import { ComboStatus } from 'src/types/gen/shared/shared/common/enums';
import type { ProductImages } from 'src/types/gen/shared/shared/products/product';
import { ProductImagesUpload } from './product-images-upload';

// ----------------------------------------------------------------------

interface BasicInformationSectionProps {
  formData: Partial<CreateComboRequest>;
  onChange: (data: Partial<CreateComboRequest>) => void;
  loading?: boolean;
}

export function BasicInformationSection({
  formData,
  onChange,
  loading = false,
}: BasicInformationSectionProps) {
  const { t } = useTranslation();

  return (
    <Card
      sx={{
        p: { xs: 2, sm: 3 },
        mb: 3,
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 600, color: 'text.primary' }}>
        {t('basicInformation')}
      </Typography>

      {/* Row 1: Combo Name and Status */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: 2,
          mb: 2,
        }}
      >
        <TextField
          label={`${t('comboProductName')} *`}
          value={formData.name || ''}
          onChange={(e) => onChange({ ...formData, name: e.target.value })}
          fullWidth
          required
          disabled={loading}
        />
        <TextField
          label={`${t('status')} *`}
          value={formData.status || ComboStatus.COMBO_STATUS_ACTIVE}
          onChange={(e) => onChange({ ...formData, status: Number(e.target.value) as ComboStatus })}
          fullWidth
          required
          select
          disabled={loading}
        >
          <MenuItem value={ComboStatus.COMBO_STATUS_ACTIVE}>{t('comboActive')}</MenuItem>
          <MenuItem value={ComboStatus.COMBO_STATUS_INACTIVE}>{t('comboInactive')}</MenuItem>
        </TextField>
      </Box>

      {/* Row 2: Localization - Vietnamese and English Names */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          mb: 2,
        }}
      >
        <TextField
          label={t('comboNameVi')}
          value={formData.nameLocalization?.vi || ''}
          onChange={(e) =>
            onChange({
              ...formData,
              nameLocalization: {
                ...formData.nameLocalization,
                vi: e.target.value,
              },
            })
          }
          fullWidth
          disabled={loading}
          helperText={t('comboNameViHelper')}
        />
        <TextField
          label={t('comboNameEn')}
          value={formData.nameLocalization?.en || ''}
          onChange={(e) =>
            onChange({
              ...formData,
              nameLocalization: {
                ...formData.nameLocalization,
                en: e.target.value,
              },
            })
          }
          fullWidth
          disabled={loading}
          helperText={t('comboNameEnHelper')}
        />
      </Box>

      {/* Combo Image - use ProductImagesUpload with single image transform */}
      <ProductImagesUpload
        images={formData.image ? { avatar: formData.image, others: [] } : undefined}
        onChange={(images: ProductImages) => onChange({ ...formData, image: images.avatar })}
        disabled={loading}
      />

      {/* Description - HTML Editor */}
      <Box>
        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
          {t('description')}
        </Typography>
        <HtmlEditor
          value={formData.description || ''}
          onChange={(html) => onChange({ ...formData, description: html })}
          disabled={loading}
          minHeight={150}
        />
      </Box>
    </Card>
  );
}
