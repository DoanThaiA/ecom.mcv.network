import {
  Box,
  Card,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useUnsavedChangesWarning } from 'src/hooks';
import { AffiliateType, AffiliateStatus } from 'src/types/gen/shared/shared/common/enums';
import type { Affiliate } from 'src/types/gen/shared/shared/affiliates/affiliate';
import { FormattedNumberInput } from 'src/components/input';
import {
  ProductsTableSection,
  type ProductsTableSectionRef,
} from './components/products-table-section';
import { LocalProductsManager } from './components/local-products-manager';

// ----------------------------------------------------------------------

export interface AffiliateFormData {
  name: string;
  type: AffiliateType;
  email: string;
  phone: string;
  status: AffiliateStatus;
  bankAccountHolder?: string;
  bankName?: string;
  bankAccountNumber?: string;
  citizenId?: string;
  notes?: string;
  defaultCommissionRate?: number;
  autoUpdateProducts?: boolean;
}

interface AffiliatesFormProps {
  isEditMode?: boolean;
  initialData?: Affiliate;
  loading?: boolean;
  onSubmit: (
    data: AffiliateFormData,
    pendingProducts?: Array<{ productId: string; commissionRate: number }>
  ) => void;
  onCancel: () => void;
  /**
   * Create-mode only: triggered when the admin clicks "Import Excel" in the
   * product section. The handler should create the affiliate then redirect to
   * the edit page with the auto-open flag. Called only after form validation
   * passes.
   */
  onExcelImportRequest?: (formData: AffiliateFormData) => void;
  /**
   * Edit-mode only: when true, the product import dialog opens automatically
   * once on mount (used by the create → edit redirect trick).
   */
  autoOpenImport?: boolean;
}

export function AffiliatesForm({
  isEditMode = false,
  initialData,
  loading = false,
  onSubmit,
  onCancel,
  onExcelImportRequest,
  autoOpenImport = false,
}: AffiliatesFormProps) {
  const { t } = useTranslation();

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<AffiliateType>(AffiliateType.AFFILIATE_TYPE_KOL);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<AffiliateStatus>(AffiliateStatus.AFFILIATE_STATUS_ACTIVE);
  const [bankAccountHolder, setBankAccountHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [citizenId, setCitizenId] = useState('');
  const [notes, setNotes] = useState('');
  const [defaultCommissionRate, setDefaultCommissionRate] = useState<number | undefined>(0);
  const [autoUpdateProducts, setAutoUpdateProducts] = useState(false);

  // Pending products for create mode
  const [pendingProducts, setPendingProducts] = useState<
    Array<{ productId: string; commissionRate: number }>
  >([]);

  // Product dirty state for edit mode
  const [productsDirty, setProductsDirty] = useState(false);
  const commitProductChangesRef = useRef<ProductsTableSectionRef>(null);

  // Warning dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Error states
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [bankAccountNumberError, setBankAccountNumberError] = useState('');

  // Load initial data in edit mode
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setEmail(initialData.email);
      setPhone(initialData.phone);
      setStatus(initialData.status);
      setBankAccountHolder(initialData.bankAccountHolder || '');
      setBankName(initialData.bankName || '');
      setBankAccountNumber(initialData.bankAccountNumber || '');
      setCitizenId(initialData.citizenId || '');
      setNotes(initialData.notes || '');
      setDefaultCommissionRate(initialData.defaultCommissionRate || 0);
      setAutoUpdateProducts(initialData.autoUpdateProducts || false);
    }
  }, [initialData]);

  // Track form dirty state
  const [formDirty, setFormDirty] = useState(false);

  useEffect(() => {
    if (initialData) {
      const hasChanges =
        name !== initialData.name ||
        email !== initialData.email ||
        phone !== initialData.phone ||
        type !== initialData.type ||
        status !== initialData.status ||
        bankAccountHolder !== (initialData.bankAccountHolder || '') ||
        bankName !== (initialData.bankName || '') ||
        bankAccountNumber !== (initialData.bankAccountNumber || '') ||
        citizenId !== (initialData.citizenId || '') ||
        notes !== (initialData.notes || '') ||
        defaultCommissionRate !== (initialData.defaultCommissionRate || 0) ||
        autoUpdateProducts !== (initialData.autoUpdateProducts || false);

      setFormDirty(hasChanges);
    }
  }, [
    name,
    email,
    phone,
    type,
    status,
    bankAccountHolder,
    bankName,
    bankAccountNumber,
    citizenId,
    notes,
    defaultCommissionRate,
    autoUpdateProducts,
    initialData,
  ]);

  // Combined unsaved changes state
  const hasUnsavedChanges = formDirty || productsDirty;

  // Navigation blocking for unsaved changes
  const {
    showDialog: showNavigationDialog,
    handleDialogClose: handleNavigationCancel,
    handleDialogConfirm: handleNavigationConfirm,
  } = useUnsavedChangesWarning({
    when: hasUnsavedChanges && !confirmDialogOpen,
  });

  // Handle product state changes from ProductsTableSection
  const handleProductsStateChange = (hasChanges: boolean) => {
    setProductsDirty(hasChanges);
  };

  const validateForm = (): boolean => {
    let valid = true;

    // Reset errors
    setNameError('');
    setEmailError('');
    setPhoneError('');
    setBankAccountNumberError('');

    if (!name.trim()) {
      setNameError(t('nameRequired'));
      valid = false;
    }

    if (!email.trim()) {
      setEmailError(t('emailRequired'));
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError(t('emailInvalid'));
      valid = false;
    }

    // Phone validation with format check
    if (!phone.trim()) {
      setPhoneError(t('phoneRequired'));
      valid = false;
    } else {
      // Strip non-digits for validation
      const digitsOnly = phone.replace(/\D/g, '');

      // Vietnamese phone: 10 digits starting with 0
      if (digitsOnly.length !== 10 || !digitsOnly.startsWith('0')) {
        setPhoneError(t('phoneInvalid'));
        valid = false;
      }
    }

    // Bank account number validation
    if (!bankAccountNumber.trim()) {
      setBankAccountNumberError(t('bankAccountNumberRequired'));
      valid = false;
    } else {
      // Bank account: 8-20 digits, numeric only
      const digitsOnly = bankAccountNumber.replace(/\D/g, '');

      if (digitsOnly.length < 8 || digitsOnly.length > 20) {
        setBankAccountNumberError(t('bankAccountNumberInvalid'));
        valid = false;
      } else if (digitsOnly !== bankAccountNumber) {
        // Contains non-numeric characters
        setBankAccountNumberError(t('bankAccountNumberInvalid'));
        valid = false;
      }
    }

    return valid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Save affiliate details
    onSubmit(
      {
        name,
        type,
        email,
        phone,
        status,
        bankAccountHolder: bankAccountHolder || undefined,
        bankName: bankName || undefined,
        bankAccountNumber: bankAccountNumber || undefined,
        citizenId: citizenId || undefined,
        notes: notes || undefined,
        defaultCommissionRate:
          typeof defaultCommissionRate === 'number' ? defaultCommissionRate : null,
        autoUpdateProducts,
      },
      isEditMode ? undefined : pendingProducts
    );

    // Commit product changes if in edit mode
    if (isEditMode && commitProductChangesRef.current) {
      try {
        await commitProductChangesRef.current.commitChanges();
      } catch (error) {
        // Error already handled by saga with toast
        console.error('Failed to commit product changes:', error);
      }
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setConfirmDialogOpen(true);
    } else {
      onCancel();
    }
  };

  const handleExcelImportRequest = () => {
    if (!validateForm()) return;
    onExcelImportRequest?.({
      name,
      type,
      email,
      phone,
      status,
      bankAccountHolder: bankAccountHolder || undefined,
      bankName: bankName || undefined,
      bankAccountNumber: bankAccountNumber || undefined,
      citizenId: citizenId || undefined,
      notes: notes || undefined,
      defaultCommissionRate:
        typeof defaultCommissionRate === 'number' ? defaultCommissionRate : undefined,
      autoUpdateProducts,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with title */}
      <Stack mb={3}>
        <Typography variant="h4">
          {isEditMode ? t('updateAffiliate') : t('createAffiliate')}
        </Typography>
      </Stack>

      {/* Basic Info Section - Two Column Grid */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <TextField
                label={t('name')}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value.trim()) setNameError('');
                }}
                error={!!nameError}
                helperText={nameError}
                required
                fullWidth
              />
              <TextField
                label={t('email')}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (e.target.value.trim()) setEmailError('');
                }}
                error={!!emailError}
                helperText={emailError}
                required
                fullWidth
              />
              <TextField
                label={t('bankAccountHolder')}
                value={bankAccountHolder}
                onChange={(e) => setBankAccountHolder(e.target.value)}
                fullWidth
              />
              <TextField
                label={t('bankAccountNumber')}
                value={bankAccountNumber}
                onChange={(e) => {
                  setBankAccountNumber(e.target.value);
                  // Clear error when user starts typing
                  if (bankAccountNumberError && e.target.value.trim()) {
                    setBankAccountNumberError('');
                  }
                }}
                error={!!bankAccountNumberError}
                helperText={bankAccountNumberError}
                fullWidth
              />
              <TextField
                label={t('notes')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                rows={3}
                fullWidth
              />
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <FormControl fullWidth required>
                <InputLabel>{t('affiliateType')}</InputLabel>
                <Select
                  value={type}
                  label={t('affiliateType')}
                  onChange={(e) => setType(e.target.value as AffiliateType)}
                >
                  <MenuItem value={AffiliateType.AFFILIATE_TYPE_KOL}>{t('kol')}</MenuItem>
                  <MenuItem value={AffiliateType.AFFILIATE_TYPE_CTV}>{t('ctv')}</MenuItem>
                  <MenuItem value={AffiliateType.AFFILIATE_TYPE_PUBLISHER}>
                    {t('publisher')}
                  </MenuItem>
                </Select>
              </FormControl>
              <TextField
                label={t('phone')}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (e.target.value.trim()) setPhoneError('');
                }}
                error={!!phoneError}
                helperText={phoneError}
                required
                fullWidth
              />
              <TextField
                label={t('bankName')}
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                fullWidth
              />
              <TextField
                label={t('citizenId')}
                value={citizenId}
                onChange={(e) => setCitizenId(e.target.value)}
                fullWidth
              />
            </Stack>
          </Grid>

          {/* Status Field - Full Width Row */}
          <Grid item xs={12}>
            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {t('status')}
              </Typography>
              <RadioGroup
                row
                value={status}
                onChange={(e) => setStatus(Number(e.target.value) as AffiliateStatus)}
              >
                <FormControlLabel
                  value={AffiliateStatus.AFFILIATE_STATUS_ACTIVE}
                  control={<Radio />}
                  label={t('active')}
                />
                <FormControlLabel
                  value={AffiliateStatus.AFFILIATE_STATUS_INACTIVE}
                  control={<Radio />}
                  label={t('inactive')}
                />
              </RadioGroup>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* Product Management Section with Commission Settings */}
      <Card sx={{ p: 3, mb: 3 }}>
        {/* Commission Settings Header */}
        <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600 }}>
          {t('setupCommission')}
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <FormattedNumberInput
              value={defaultCommissionRate}
              onChange={setDefaultCommissionRate}
              suffix="%"
              min={0}
              max={100}
              label={t('defaultCommissionRate')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoUpdateProducts}
                  onChange={(e) => setAutoUpdateProducts(e.target.checked)}
                />
              }
              label={t('autoAddNewProducts')}
            />
          </Grid>
        </Grid>

        {/* Product Management */}
        {isEditMode && initialData ? (
          <>
            {/* Warning for unsaved product changes */}
            {productsDirty && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {t('unsavedProductsWarning')}
              </Alert>
            )}

            <ProductsTableSection
              ref={commitProductChangesRef}
              affiliateId={initialData.id}
              defaultCommissionRate={defaultCommissionRate}
              onProductsStateChange={handleProductsStateChange}
              autoOpenImport={autoOpenImport}
            />
          </>
        ) : (
          <LocalProductsManager
            products={pendingProducts}
            onProductsChange={setPendingProducts}
            defaultCommissionRate={defaultCommissionRate || 10}
            onImportExcel={onExcelImportRequest ? handleExcelImportRequest : undefined}
          />
        )}
      </Card>

      {/* Action Buttons - Bottom of Page */}
      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button onClick={handleCancel} disabled={loading} color="inherit">
          {t('cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
          sx={{
            bgcolor: '#235AFF',
            '&:hover': { bgcolor: '#1B4ACC' },
          }}
        >
          {t('save')}
        </Button>
      </Stack>

      {/* Unsaved Changes Warning Dialog */}
      <Dialog
        open={confirmDialogOpen || showNavigationDialog}
        onClose={() => {
          if (confirmDialogOpen) {
            setConfirmDialogOpen(false);
          } else {
            handleNavigationCancel();
          }
        }}
      >
        <DialogTitle>{t('unsavedChanges')}</DialogTitle>
        <DialogContent>
          <Typography>{t('unsavedChangesWarning')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              if (confirmDialogOpen) {
                setConfirmDialogOpen(false);
              } else {
                handleNavigationCancel();
              }
            }}
            color="inherit"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={() => {
              if (confirmDialogOpen) {
                onCancel();
              } else {
                handleNavigationConfirm();
              }
            }}
            color="error"
            variant="contained"
          >
            {t('discardChanges')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
