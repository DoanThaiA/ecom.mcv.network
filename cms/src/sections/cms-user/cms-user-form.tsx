import {
  Box,
  Button,
  Card,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Iconify } from 'src/components/iconify';
import { useTranslation } from 'react-i18next';
import {
  AccountTypeEnum,
  ModulePermission,
  VISIBLE_MODULE_PERMISSIONS,
} from 'src/repositories/cms-user.repository';
import { AffiliateSearch } from './components/affiliate-search';
import { showWarning } from 'src/utils/toast';

// ─── Types ────────────────────────────────────────────────────────────────

export interface CmsUserFormData {
  accountType: AccountTypeEnum;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  permissions: ModulePermission[];
  affiliateId: string;
  status: number;
}

interface CmsUserFormProps {
  mode: 'create' | 'edit';
  initialData?: CmsUserFormData;
  onSubmit: (data: CmsUserFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

// Permission label helper
const getPermissionLabel = (permission: ModulePermission, t: (key: string) => string) => {
  const map: Record<number, string> = {
    [ModulePermission.product_management]: t('productManagementPermission'),
    [ModulePermission.order_management]: t('orderManagementPermission'),
    [ModulePermission.return_management]: t('returnManagementPermission'),
    [ModulePermission.flash_sale_management]: t('flashSaleManagementPermission'),
    [ModulePermission.promotion_management]: t('promotionManagementPermission'),
    [ModulePermission.news_management]: t('newsManagementPermission'),
    [ModulePermission.homepage_management]: t('homepageManagementPermission'),
    [ModulePermission.settings]: t('settingsPermission'),
    [ModulePermission.push_notification_management]: t('pushNotificationManagementPermission'),
    [ModulePermission.affiliate_management]: t('affiliateManagementPermission'),
    [ModulePermission.account_management]: t('accountManagementPermission'),
    [ModulePermission.shipping_management]: t('shippingManagementPermission'),
  };
  return map[permission] ?? String(permission);
};

type FormErrors = Partial<Record<keyof CmsUserFormData, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const defaultFormData: CmsUserFormData = {
  accountType: AccountTypeEnum.website_admin,
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  password: '',
  permissions: [],
  affiliateId: '',
  status: 1, // active
};

// ─── Component ────────────────────────────────────────────────────────────

export function CmsUserForm({ mode, initialData, onSubmit, onCancel, loading }: CmsUserFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CmsUserFormData>(initialData ?? defaultFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const initialDataRef = useRef(initialData);

  useEffect(() => {
    // Only sync when initialData actually changes (not just reference)
    if (initialData && initialData !== initialDataRef.current) {
      initialDataRef.current = initialData;
      setFormData(initialData);
    }
  }, [initialData]);

  const isEdit = mode === 'edit';
  const isAffiliate = formData.accountType === AccountTypeEnum.affiliate;

  const validate = useCallback(
    (data: CmsUserFormData): FormErrors => {
      const errs: FormErrors = {};
      if (!isAffiliate) {
        if (!data.firstName.trim()) errs.firstName = t('fieldRequired');
        if (!data.email.trim()) {
          errs.email = t('emailRequired');
        } else if (!EMAIL_REGEX.test(data.email)) {
          errs.email = t('emailInvalid');
        }
        if (!isEdit && !data.password) {
          errs.password = t('passwordRequired');
        } else if (!isEdit && data.password.length < 6) {
          errs.password = t('minLength', { min: 6 });
        }
      }
      return errs;
    },
    [isAffiliate, isEdit, t]
  );

  const handleFieldChange = useCallback(
    (field: keyof CmsUserFormData, value: CmsUserFormData[keyof CmsUserFormData]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );

  const handlePhoneChange = useCallback(
    (value: string) => {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length > 10) {
        showWarning(t('maxLength', { max: 10 }));
        return;
      }
      setFormData((prev) => ({ ...prev, phone: digitsOnly }));
    },
    [t]
  );

  const handleAccountTypeChange = useCallback((value: AccountTypeEnum) => {
    setFormData((prev) => ({
      ...prev,
      accountType: value,
      // Reset related fields when switching type
      permissions: value === AccountTypeEnum.affiliate ? [] : prev.permissions,
      affiliateId: value === AccountTypeEnum.website_admin ? '' : prev.affiliateId,
      password: '',
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
    }));
    setErrors({});
  }, []);

  const handlePermissionToggle = useCallback((permission: ModulePermission) => {
    setFormData((prev) => {
      const has = prev.permissions.includes(permission);
      return {
        ...prev,
        permissions: has
          ? prev.permissions.filter((p) => p !== permission)
          : [...prev.permissions, permission],
      };
    });
  }, []);

  const handleAllPermissionsToggle = useCallback(() => {
    setFormData((prev) => {
      const allSelected = prev.permissions.length === VISIBLE_MODULE_PERMISSIONS.length;
      return {
        ...prev,
        permissions: allSelected ? [] : [...VISIBLE_MODULE_PERMISSIONS],
      };
    });
  }, []);

  const handleAffiliateSelect = useCallback(
    (affiliate: { id: string; name: string; email?: string; phone?: string }) => {
      setFormData((prev) => ({
        ...prev,
        affiliateId: affiliate.id,
        firstName: affiliate.name || prev.firstName,
        email: affiliate.email || prev.email,
        phone: affiliate.phone || prev.phone,
      }));
    },
    []
  );

  const handleSubmit = useCallback(() => {
    const errs = validate(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(formData);
  }, [formData, onSubmit, validate]);

  const allPermissionsSelected = formData.permissions.length === VISIBLE_MODULE_PERMISSIONS.length;
  const somePermissionsSelected =
    formData.permissions.length > 0 &&
    formData.permissions.length < VISIBLE_MODULE_PERMISSIONS.length;

  return (
    <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
      <Card sx={{ p: 3, boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)' }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          {isEdit ? t('editAccount') : t('createAccount')}
        </Typography>

        <Stack spacing={3}>
          {/* Account Type */}
          <FormControl fullWidth disabled={isEdit}>
            <InputLabel>{t('accountType')}</InputLabel>
            <Select
              value={formData.accountType}
              label={t('accountType')}
              onChange={(e) => handleAccountTypeChange(e.target.value as AccountTypeEnum)}
            >
              <MenuItem value={AccountTypeEnum.website_admin}>{t('websiteAdmin')}</MenuItem>
              <MenuItem value={AccountTypeEnum.affiliate}>{t('affiliateAgent')}</MenuItem>
            </Select>
          </FormControl>

          {/* Conditional fields based on account type */}
          {isAffiliate && !isEdit ? (
            <>
              {/* Affiliate Search */}
              <AffiliateSearch
                value={formData.affiliateId}
                onSelect={handleAffiliateSelect}
                disabled={isEdit}
              />

              {/* Auto-filled fields (read-only) */}
              {formData.affiliateId && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t('email')}
                      value={formData.email}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t('name')}
                      value={formData.firstName}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t('phone')}
                      value={formData.phone}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
              )}
            </>
          ) : (
            <>
              {/* Website Admin fields */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('fullName')}
                    value={formData.firstName}
                    onChange={(e) => handleFieldChange('firstName', e.target.value)}
                    required
                    disabled={isEdit}
                    autoComplete="off"
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('email')}
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    required
                    disabled={isEdit}
                    autoComplete="off"
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('phone')}
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    disabled={isEdit}
                    inputProps={{ inputMode: 'numeric' }}
                    autoComplete="off"
                  />
                </Grid>
                {!isEdit && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t('password')}
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleFieldChange('password', e.target.value)}
                      required
                      helperText={errors.password ?? t('minLength', { min: 6 })}
                      error={!!errors.password}
                      autoComplete="new-password"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                              <Iconify
                                icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                              />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                )}
              </Grid>
            </>
          )}

          {/* Status */}
          <FormControl component="fieldset">
            <FormLabel component="legend">{t('status')}</FormLabel>
            <RadioGroup
              row
              value={String(formData.status)}
              onChange={(e) => handleFieldChange('status', Number(e.target.value))}
            >
              <FormControlLabel value="1" control={<Radio />} label={t('active')} />
              <FormControlLabel value="2" control={<Radio />} label={t('inactive')} />
            </RadioGroup>
          </FormControl>

          {/* Permissions (only for website admin) */}
          {!isAffiliate && (
            <FormControl component="fieldset">
              <FormLabel component="legend">{t('cmsPermissions')}</FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={allPermissionsSelected}
                      indeterminate={somePermissionsSelected}
                      onChange={handleAllPermissionsToggle}
                    />
                  }
                  label={<Typography fontWeight="bold">{t('allPermissions')}</Typography>}
                />
                <Grid container spacing={1} sx={{ pl: 3 }}>
                  {VISIBLE_MODULE_PERMISSIONS.map((permission) => (
                    <Grid item xs={12} sm={6} md={4} key={permission}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.permissions.includes(permission)}
                            onChange={() => handlePermissionToggle(permission)}
                          />
                        }
                        label={getPermissionLabel(permission, t)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </FormGroup>
            </FormControl>
          )}
        </Stack>

        {/* Actions */}
        <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={onCancel} disabled={loading}>
            {t('cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              bgcolor: '#0165FC',
              '&:hover': { bgcolor: '#0052CC' },
            }}
          >
            {loading ? t('saving') : isEdit ? t('save') : t('create')}
          </Button>
        </Stack>
      </Card>
    </Box>
  );
}
