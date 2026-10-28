import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  createPopupAdsRequest,
  updatePopupAdsRequest,
  selectCreatePopupAdsLoading,
  selectUpdatePopupAdsLoading,
} from 'src/redux/store/popupAdsSlice';
import { uploadFileRequest, selectUploadLoading } from 'src/redux/store/fileSlice';
import type { PopupAdsListItem } from 'src/types/gen/shared/shared/popup-ads/popup-ads';
import type { File as FileType } from 'src/types/gen/shared/shared/files/file';

interface PopupAdsFormProps {
  open: boolean;
  onClose: () => void;
  editData?: PopupAdsListItem | null;
  onSuccess?: () => void;
}

export function PopupAdsForm({ open, onClose, editData, onSuccess }: PopupAdsFormProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const createLoading = useAppSelector(selectCreatePopupAdsLoading);
  const updateLoading = useAppSelector(selectUpdatePopupAdsLoading);
  const uploadLoading = useAppSelector(selectUploadLoading);
  const isLoading = editData ? updateLoading : createLoading;

  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [startAt, setStartAt] = useState<Date | null>(null);
  const [endAt, setEndAt] = useState<Date | null>(null);
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [order, setOrder] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!editData;

  useEffect(() => {
    if (open) {
      if (editData) {
        setImage(editData.image ?? '');
        setImagePreview(editData.image ?? '');
        setStartAt(editData.startAt ? new Date(editData.startAt) : null);
        setEndAt(editData.endAt ? new Date(editData.endAt) : null);
        setName(editData.name ?? '');
        setLink(editData.link ?? '');
        setOrder(String(editData.order ?? ''));
        setIsActive(editData.isActive ?? true);
      } else {
        setImage('');
        setImagePreview('');
        setStartAt(null);
        setEndAt(null);
        setName('');
        setLink('');
        setOrder('');
        setIsActive(true);
      }
    }
  }, [open, editData]);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      dispatch(
        uploadFileRequest({
          file,
          driver: 'local',
          onSuccess: (uploadedFile: FileType) => {
            setImage(uploadedFile.path);
          },
        })
      );
    },
    [dispatch]
  );

  const handleSubmit = useCallback(() => {
    if (!image || !startAt || !endAt || !name.trim()) return;

    const payload = {
      image,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      name: name.trim(),
      link: link.trim() || undefined,
      order: order !== '' ? Number(order) : 0,
      isActive,
      onSuccess: () => {
        onSuccess?.();
        onClose();
      },
    };

    if (isEdit && editData) {
      dispatch(
        updatePopupAdsRequest({
          popupAdsId: editData.id,
          ...payload,
        })
      );
    } else {
      dispatch(createPopupAdsRequest(payload));
    }
  }, [
    image,
    startAt,
    endAt,
    name,
    link,
    order,
    isActive,
    isEdit,
    editData,
    dispatch,
    onSuccess,
    onClose,
  ]);

  const isFormValid = image && startAt && endAt && name.trim();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">{isEdit ? t('editPopupAds') : t('createPopupAds')}</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {/* Image Upload */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('displayImage')}
                <Typography component="span" color="error">
                  *
                </Typography>
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpg,image/jpeg,image/png"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  width: 200,
                  height: 120,
                  border: '1.5px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <>
                    <AddPhotoAlternateIcon color="disabled" sx={{ mb: 0.5 }} />
                    <Typography variant="caption" color="text.secondary">
                      {uploadLoading ? t('uploading') : t('chooseImage')}
                    </Typography>
                  </>
                )}
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: 'block' }}
              >
                {t('imageSpec')}
              </Typography>
            </Box>

            {/* Date Range */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('displayTime')}
                <Typography component="span" color="error">
                  *
                </Typography>
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <DateTimePicker
                  label={t('startTime')}
                  value={startAt}
                  onChange={setStartAt}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
                <Typography>-</Typography>
                <DateTimePicker
                  label={t('endTime')}
                  value={endAt}
                  onChange={setEndAt}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Stack>
            </Box>

            {/* Popup Name */}
            <TextField
              label={
                <>
                  {t('popupName')}
                  <Typography component="span" color="error">
                    *
                  </Typography>
                </>
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
              size="small"
              fullWidth
            />

            {/* Link */}
            <TextField
              label={t('link')}
              value={link}
              onChange={(e) => setLink(e.target.value)}
              size="small"
              fullWidth
              placeholder="https://"
            />

            {/* Order */}
            <TextField
              label={t('order')}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              size="small"
              fullWidth
              type="number"
              inputProps={{ min: 0 }}
            />

            {/* Status */}
            <FormControl>
              <FormLabel sx={{ fontSize: 14, fontWeight: 600, mb: 0.5 }}>
                {t('status')}
                <Typography component="span" color="error">
                  *
                </Typography>
              </FormLabel>
              <RadioGroup
                row
                value={isActive ? 'active' : 'inactive'}
                onChange={(e) => setIsActive(e.target.value === 'active')}
              >
                <FormControlLabel value="active" control={<Radio />} label={t('active')} />
                <FormControlLabel value="inactive" control={<Radio />} label={t('inactive')} />
              </RadioGroup>
            </FormControl>
          </Stack>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={isLoading}>
          {t('cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isFormValid || isLoading || uploadLoading}
          sx={{ bgcolor: '#0165FC', '&:hover': { bgcolor: '#0052CC' } }}
        >
          {isEdit ? t('save') : t('addNew')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
