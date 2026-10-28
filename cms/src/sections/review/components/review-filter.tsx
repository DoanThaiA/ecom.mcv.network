import { Card, Grid, Button, Select, MenuItem, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

type Props = {
  keyword: string;
  setKeyword: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  rating: number | '';
  setRating: (value: number | '') => void;
  fitLevel: number | '';
  setFitLevel: (value: number | '') => void;
  height: number | '';
  setHeight: (value: number | '') => void;
  weight: number | '';
  setWeight: (value: number | '') => void;
  onSearch: () => void;
  onCreateReview: () => void;
};

export function ReviewFilter({
  keyword,
  setKeyword,
  status,
  setStatus,
  rating,
  setRating,
  fitLevel,
  setFitLevel,
  height,
  setHeight,
  weight,
  setWeight,
  onSearch,
  onCreateReview,
}: Props) {
  const { t } = useTranslation();

  return (
    <Card sx={{ mb: 2, mx: 2, mt: 2, p: 2, flexShrink: 0 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Dropdown: Rating */}
        <Grid item xs={12} sm={4} md={2}>
          <Select
            fullWidth
            size="small"
            value={rating}
            onChange={(e) => setRating(e.target.value as number | '')}
            displayEmpty
          >
            <MenuItem value="">{t('allRatingsWithPrefix')}</MenuItem>
            {[5, 4, 3, 2, 1].map((r) => (
              <MenuItem key={r} value={r}>
                {r} {t('star')}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        {/* Dropdown: Fit Level */}
        <Grid item xs={12} sm={4} md={2}>
          <Select
            fullWidth
            size="small"
            value={fitLevel}
            onChange={(e) => setFitLevel(e.target.value as number | '')}
            displayEmpty
          >
            <MenuItem value="">{t('allFitLevelsWithPrefix')}</MenuItem>
            <MenuItem value={1}>{t('fitLevelFit')}</MenuItem>
            <MenuItem value={2}>{t('fitLevelLoose')}</MenuItem>
            <MenuItem value={3}>{t('fitLevelTight')}</MenuItem>
          </Select>
        </Grid>

        {/* Dropdown: Visibility */}
        <Grid item xs={12} sm={4} md={2}>
          <Select
            fullWidth
            size="small"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">{t('allVisibilityWithPrefix')}</MenuItem>
            <MenuItem value="visible">{t('statusVisible')}</MenuItem>
            <MenuItem value="hidden">{t('statusHidden')}</MenuItem>
          </Select>
        </Grid>

        {/* Input: Keyword */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('searchPlaceholder')}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </Grid>

        {/* Input: Height */}
        <Grid item xs={6} sm={3} md={1.5}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('height')}
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </Grid>

        {/* Input: Weight */}
        <Grid item xs={6} sm={3} md={1.5}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('bodyWeight')}
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </Grid>

        {/* Actions */}
        <Grid item xs={12} md={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="contained" color="primary" onClick={onSearch}>
            {t('search')}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateReview}>
            {t('createReview')}
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
}
