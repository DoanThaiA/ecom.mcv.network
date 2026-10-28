import _ from 'lodash';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Box,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  createMenuRequest,
  updateMenuRequest,
  selectCreateMenuLoading,
  selectUpdateMenuLoading,
} from 'src/redux/store/menuSlice';
import {
  getProductCategoriesRequest,
  selectProductCategories,
} from 'src/redux/store/productCategorySlice';
import { getTopicsRequest, selectTopics } from 'src/redux/store/topicSlice';
import type { Menu } from 'src/types/gen/shared/shared/menus/menu';
import type { CreateMenuRequest } from 'src/types/gen/cms/cms/menus/menu';
import { MenuStatus, MenuType } from 'src/types/gen/shared/shared/common/enums';

// ----------------------------------------------------------------------

interface MenuDialogProps {
  open: boolean;
  menu: Menu | null;
  allMenus: Menu[];
  onClose: () => void;
  onSuccess: () => void;
}

export function MenuDialog({ open, menu, allMenus, onClose, onSuccess }: MenuDialogProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const createLoading = useAppSelector(selectCreateMenuLoading);
  const updateLoading = useAppSelector(selectUpdateMenuLoading);
  const categories = useAppSelector(selectProductCategories);
  const topics = useAppSelector(selectTopics);

  const isEdit = !!menu;
  const loading = createLoading || updateLoading;

  // Form state
  const [name, setName] = useState('');
  const [localization, setLocalization] = useState<{ vi?: string; en?: string }>({});
  const [parentId, setParentId] = useState<string>('');
  const [type, setType] = useState<MenuType>(MenuType.MENU_TYPE_CATEGORY);
  const [categoryId, setCategoryId] = useState<string>('');
  const [topicId, setTopicId] = useState<string>('');
  const [url, setUrl] = useState('');
  const [order, setOrder] = useState<number | ''>('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Fetch categories and topics
  useEffect(() => {
    if (open) {
      dispatch(getProductCategoriesRequest({ limit: 1000 }));
      dispatch(getTopicsRequest({ limit: 1000 }));
    }
  }, [dispatch, open]);

  // Helper to convert API type value to MenuType enum
  const parseMenuType = (apiType: MenuType | number | string | undefined): MenuType => {
    if (
      apiType === MenuType.MENU_TYPE_CATEGORY ||
      apiType === 1 ||
      apiType === 'MENU_TYPE_CATEGORY' ||
      apiType === 'category'
    ) {
      return MenuType.MENU_TYPE_CATEGORY;
    }
    if (
      apiType === MenuType.MENU_TYPE_TOPIC ||
      apiType === 2 ||
      apiType === 'MENU_TYPE_TOPIC' ||
      apiType === 'topic'
    ) {
      return MenuType.MENU_TYPE_TOPIC;
    }
    if (
      apiType === MenuType.MENU_TYPE_URL ||
      apiType === 3 ||
      apiType === 'MENU_TYPE_URL' ||
      apiType === 'url'
    ) {
      return MenuType.MENU_TYPE_URL;
    }
    return MenuType.MENU_TYPE_CATEGORY;
  };

  // Helper to convert API status value to 'active' | 'inactive'
  const parseMenuStatus = (
    apiStatus: MenuStatus | number | string | undefined
  ): 'active' | 'inactive' => {
    if (
      apiStatus === MenuStatus.MENU_STATUS_ACTIVE ||
      apiStatus === 1 ||
      apiStatus === 'MENU_STATUS_ACTIVE' ||
      apiStatus === 'active'
    ) {
      return 'active';
    }
    return 'inactive';
  };

  // Reset form when dialog opens/closes or menu changes
  useEffect(() => {
    if (open && menu) {
      // Edit mode - populate form
      setName(menu.name || '');
      setLocalization({
        vi: menu.localization?.vi || '',
        en: menu.localization?.en || '',
      });
      setParentId(menu.parentId || '');
      setType(parseMenuType(menu.type));
      setCategoryId(menu.categoryId || '');
      setTopicId(menu.topicId || '');
      setUrl(menu.url || '');
      setOrder(menu.order || '');
      setStatus(parseMenuStatus(menu.status));
    } else if (open) {
      // Create mode - reset form
      setName('');
      setLocalization({ vi: '', en: '' });
      setParentId('');
      setType(MenuType.MENU_TYPE_CATEGORY);
      setCategoryId('');
      setTopicId('');
      setUrl('');
      setOrder('');
      setStatus('active');
    }
  }, [open, menu]);

  const handleSubmit = () => {
    const data: CreateMenuRequest = {
      name,
      localization:
        localization.vi || localization.en
          ? {
              vi: localization.vi || undefined,
              en: localization.en || undefined,
            }
          : null,
      parentId: parentId || undefined,
      type,
      categoryId: type === MenuType.MENU_TYPE_CATEGORY ? categoryId || undefined : undefined,
      topicId: type === MenuType.MENU_TYPE_TOPIC ? topicId || undefined : undefined,
      url: type === MenuType.MENU_TYPE_URL ? url || undefined : undefined,
      order: order !== '' ? Number(order) : undefined,
      status: status === 'active' ? MenuStatus.MENU_STATUS_ACTIVE : MenuStatus.MENU_STATUS_INACTIVE,
    };

    if (isEdit && menu) {
      dispatch(
        updateMenuRequest({
          id: menu.id,
          data,
          onSuccess: () => {
            onSuccess();
          },
        })
      );
    } else {
      dispatch(
        createMenuRequest({
          data,
          onSuccess: () => {
            onSuccess();
          },
        })
      );
    }
  };

  // Filter out current menu from parent options to avoid circular reference - use lodash for null safety
  const availableParents = _.filter(allMenus, (m) => m.id !== menu?.id);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E5E6EB',
          pb: 2,
        }}
      >
        {isEdit ? t('editMenu') : t('addMenu')}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Menu Name */}
          <FormControl fullWidth>
            <FormLabel required sx={{ mb: 1, fontWeight: 500 }}>
              {t('menuName')}
            </FormLabel>
            <TextField
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('enterMenuName')}
              size="small"
              fullWidth
            />
          </FormControl>

          {/* Menu Name (Vietnamese) */}
          <FormControl fullWidth>
            <FormLabel sx={{ mb: 1, fontWeight: 500 }}>{t('menuNameVi')}</FormLabel>
            <TextField
              value={localization.vi || ''}
              onChange={(e) => setLocalization({ ...localization, vi: e.target.value })}
              placeholder={t('enterMenuNameVi')}
              size="small"
              fullWidth
            />
          </FormControl>

          {/* Menu Name (English) */}
          <FormControl fullWidth>
            <FormLabel sx={{ mb: 1, fontWeight: 500 }}>{t('menuNameEn')}</FormLabel>
            <TextField
              value={localization.en || ''}
              onChange={(e) => setLocalization({ ...localization, en: e.target.value })}
              placeholder={t('enterMenuNameEn')}
              size="small"
              fullWidth
            />
          </FormControl>

          {/* Parent Menu */}
          <FormControl fullWidth>
            <FormLabel sx={{ mb: 1, fontWeight: 500 }}>{t('parentMenu')}</FormLabel>
            <Select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              displayEmpty
              size="small"
            >
              <MenuItem value="">{t('selectParentMenu')}</MenuItem>
              {availableParents.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Menu Type */}
          <FormControl fullWidth>
            <FormLabel required sx={{ mb: 1, fontWeight: 500 }}>
              {t('menuType')}
            </FormLabel>
            <Select value={type} onChange={(e) => setType(e.target.value as MenuType)} size="small">
              <MenuItem value={MenuType.MENU_TYPE_CATEGORY}>{t('menuTypeCategory')}</MenuItem>
              <MenuItem value={MenuType.MENU_TYPE_TOPIC}>{t('menuTypeTopic')}</MenuItem>
              <MenuItem value={MenuType.MENU_TYPE_URL}>{t('menuTypeUrl')}</MenuItem>
            </Select>
          </FormControl>

          {/* Category Select - show when type is CATEGORY */}
          {type === MenuType.MENU_TYPE_CATEGORY && (
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1, fontWeight: 500 }}>{t('productCategory')}</FormLabel>
              <Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                displayEmpty
                size="small"
              >
                <MenuItem value="">{t('selectCategory')}</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Topic Select - show when type is TOPIC */}
          {type === MenuType.MENU_TYPE_TOPIC && (
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1, fontWeight: 500 }}>{t('topic')}</FormLabel>
              <Select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                displayEmpty
                size="small"
              >
                <MenuItem value="">{t('selectTopic')}</MenuItem>
                {topics.map((topic) => (
                  <MenuItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* URL Input - show when type is URL */}
          {type === MenuType.MENU_TYPE_URL && (
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1, fontWeight: 500 }}>{t('url')}</FormLabel>
              <TextField
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t('enterUrl')}
                size="small"
                fullWidth
              />
            </FormControl>
          )}

          {/* Order */}
          <FormControl fullWidth>
            <FormLabel sx={{ mb: 1, fontWeight: 500 }}>{t('order')}</FormLabel>
            <Select
              value={order}
              onChange={(e) => setOrder(e.target.value as number | '')}
              displayEmpty
              size="small"
            >
              <MenuItem value="">{t('selectOrder')}</MenuItem>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <MenuItem key={num} value={num}>
                  {num}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Status */}
          <FormControl>
            <FormLabel required sx={{ mb: 1, fontWeight: 500 }}>
              {t('status')}
            </FormLabel>
            <RadioGroup
              row
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
            >
              <FormControlLabel value="active" control={<Radio />} label={t('active')} />
              <FormControlLabel value="inactive" control={<Radio />} label={t('inactive')} />
            </RadioGroup>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E5E6EB' }}>
        <Button onClick={onClose} variant="outlined" sx={{ minWidth: 100 }}>
          {t('cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!name || loading}
          sx={{
            minWidth: 100,
            bgcolor: '#0165FC',
            '&:hover': {
              bgcolor: '#0052CC',
            },
          }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : isEdit ? t('save') : t('add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
