import {
  Box,
  Card,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TopicStatus, TopicType } from 'src/types/gen/shared/shared/common/enums';

// ----------------------------------------------------------------------

export interface TopicFormData {
  name: string;
  localization?: { vi?: string; en?: string };
  type: TopicType;
  order: number;
  status: TopicStatus | 'active' | 'inactive';
  description?: string;
}

// Helper to check if status is active (handles both enum and string)
const isStatusActive = (status: TopicStatus | string): boolean => {
  return status === TopicStatus.TOPIC_STATUS_ACTIVE || status === 'active';
};

// Helper to check if type is product
const isTypeProduct = (type: TopicType): boolean => {
  return type === TopicType.TOPIC_TYPE_PRODUCT;
};

interface TopicGeneralTabProps {
  formData: TopicFormData;
  onChange: (data: TopicFormData) => void;
  loading?: boolean;
  isEditMode?: boolean;
}

export function TopicGeneralTab({
  formData,
  onChange,
  loading = false,
  isEditMode = false,
}: TopicGeneralTabProps) {
  const { t } = useTranslation();

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...formData, name: event.target.value });
  };

  const handleNameViChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...formData,
      localization: { ...formData.localization, vi: event.target.value },
    });
  };

  const handleNameEnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...formData,
      localization: { ...formData.localization, en: event.target.value },
    });
  };

  const handleOrderChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    onChange({ ...formData, order: event.target.value as number });
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const typeMap: Record<string, TopicType> = {
      product: TopicType.TOPIC_TYPE_PRODUCT,
      category: TopicType.TOPIC_TYPE_CATEGORY,
      banner: TopicType.TOPIC_TYPE_BANNER,
    };
    onChange({
      ...formData,
      type: typeMap[value] ?? TopicType.TOPIC_TYPE_PRODUCT,
    });
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...formData,
      status: event.target.value as 'active' | 'inactive',
    });
  };

  // Generate order options (1-100)
  const orderOptions = Array.from({ length: 100 }, (_, i) => i + 1);

  return (
    <Card
      sx={{
        p: 3,
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        borderRadius: 2,
      }}
    >
      <Stack spacing={3}>
        {/* Topic Title */}
        <Box>
          <Typography
            component="label"
            sx={{
              display: 'block',
              mb: 1,
              fontSize: 14,
              fontWeight: 500,
              color: 'text.primary',
            }}
          >
            {t('topicTitle')} <span style={{ color: 'red' }}>*</span>
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder={t('topicTitle')}
            value={formData.name}
            onChange={handleNameChange}
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              },
            }}
          />
        </Box>

        {/* Topic Title (Vietnamese) */}
        <Box>
          <Typography
            component="label"
            sx={{
              display: 'block',
              mb: 1,
              fontSize: 14,
              fontWeight: 500,
              color: 'text.primary',
            }}
          >
            {t('topicTitleVi')}
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder={t('enterTopicTitleVi')}
            value={formData.localization?.vi || ''}
            onChange={handleNameViChange}
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              },
            }}
          />
        </Box>

        {/* Topic Title (English) */}
        <Box>
          <Typography
            component="label"
            sx={{
              display: 'block',
              mb: 1,
              fontSize: 14,
              fontWeight: 500,
              color: 'text.primary',
            }}
          >
            {t('topicTitleEn')}
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder={t('enterTopicTitleEn')}
            value={formData.localization?.en || ''}
            onChange={handleNameEnChange}
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              },
            }}
          />
        </Box>

        {/* Order */}
        <Box>
          <Typography
            component="label"
            sx={{
              display: 'block',
              mb: 1,
              fontSize: 14,
              fontWeight: 500,
              color: 'text.primary',
            }}
          >
            {t('order')} <span style={{ color: 'red' }}>*</span>
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={formData.order}
              onChange={handleOrderChange as any}
              disabled={loading}
              displayEmpty
              sx={{
                borderRadius: 1,
              }}
            >
              <MenuItem value={0} disabled>
                {t('pleaseSelect')}
              </MenuItem>
              {orderOptions.map((num) => (
                <MenuItem key={num} value={num}>
                  {num}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Topic Type */}
        <FormControl component="fieldset">
          <FormLabel
            component="legend"
            sx={{
              fontSize: 14,
              fontWeight: 500,
              color: 'text.primary',
              '&.Mui-focused': {
                color: 'text.primary',
              },
            }}
          >
            {t('topicType')} <span style={{ color: 'red' }}>*</span>
          </FormLabel>
          <RadioGroup
            row
            value={
              formData.type === TopicType.TOPIC_TYPE_PRODUCT
                ? 'product'
                : formData.type === TopicType.TOPIC_TYPE_CATEGORY
                  ? 'category'
                  : 'banner'
            }
            onChange={handleTypeChange}
          >
            <FormControlLabel
              value="product"
              control={<Radio size="small" />}
              label={t('productTopic')}
              disabled={loading || isEditMode}
            />
            <FormControlLabel
              value="category"
              control={<Radio size="small" />}
              label={t('categoryTopic')}
              disabled={loading || isEditMode}
            />
            <FormControlLabel
              value="banner"
              control={<Radio size="small" />}
              label={t('bannerTopic')}
              disabled={loading || isEditMode}
            />
          </RadioGroup>
          {isEditMode && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              {t('topicTypeCannotBeChangedAfterCreation')}
            </Typography>
          )}
        </FormControl>

        {/* Status */}
        <FormControl component="fieldset">
          <FormLabel
            component="legend"
            sx={{
              fontSize: 14,
              fontWeight: 500,
              color: 'text.primary',
              '&.Mui-focused': {
                color: 'text.primary',
              },
            }}
          >
            {t('status')} <span style={{ color: 'red' }}>*</span>
          </FormLabel>
          <RadioGroup
            row
            value={isStatusActive(formData.status) ? 'active' : 'inactive'}
            onChange={handleStatusChange}
          >
            <FormControlLabel
              value="active"
              control={<Radio size="small" />}
              label={t('active')}
              disabled={loading}
            />
            <FormControlLabel
              value="inactive"
              control={<Radio size="small" />}
              label={t('inactive')}
              disabled={loading}
            />
          </RadioGroup>
        </FormControl>
      </Stack>
    </Card>
  );
}
