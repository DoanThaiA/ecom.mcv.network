import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  getAffiliateRequest,
  updateAffiliateRequest,
  selectCurrentAffiliate,
  selectLoading,
  setCurrentAffiliate,
} from 'src/redux/store/affiliatesSlice';
import { AffiliateType, AffiliateStatus } from 'src/types/gen/shared/shared/common/enums';
import { formatDate } from 'src/utils/format';
import { showSuccess } from 'src/utils/toast';
import { CommissionSettingsSection } from './components/commission-settings-section';
import {
  CommissionProductTable,
  type CommissionProduct,
} from './components/commission-product-table';
import { EditCommissionDialog } from './components/edit-commission-dialog';
import { useDialog } from 'src/hooks';
import type { Product } from 'src/types/products';
import { commissionRepository } from 'src/repositories';
import { AffiliatesPerformanceView } from './affiliates-performance-view';
import { AffiliatesOrdersTab } from './components/affiliates-orders-tab';
import { getCurrentBaseUrl } from 'src/utils/environment';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`affiliate-tabpanel-${index}`}
      aria-labelledby={`affiliate-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export function AffiliatesDetailView() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const affiliate = useSelector(selectCurrentAffiliate);
  const loading = useSelector(selectLoading);

  // Local state
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState<CommissionProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
  });
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingProductRate, setEditingProductRate] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryNamesFilter, setCategoryNamesFilter] = useState<string[]>([]);

  // Ref to prevent duplicate requests
  const pendingRequestsRef = useRef<Set<string>>(new Set());

  // Dialogs
  const bulkEditDialog = useDialog();
  const editDialog = useDialog();
  const productDialog = useDialog();
  const editDefaultRateDialog = useDialog();

  // Load affiliate data
  useEffect(() => {
    if (id) {
      dispatch(getAffiliateRequest({ affiliateId: id }));
    }

    return () => {
      dispatch(setCurrentAffiliate(null));
    };
  }, [dispatch, id]);

  // Load product commissions when affiliate is loaded
  const loadProductCommissions = useCallback(
    async (
      params: { page?: number; limit?: number; search?: string; categoryNames?: string[] } = {}
    ) => {
      if (!id) return;

      const page = params.page ?? pagination.page;
      const limit = params.limit ?? pagination.limit;
      const search = params.search ?? searchQuery;
      const categoryNames = params.categoryNames ?? categoryNamesFilter;

      const requestKey = `affiliate-products-${id}-${page}-${limit}-${search}-${categoryNames.join(',')}`;

      if (pendingRequestsRef.current.has(requestKey)) {
        return;
      }

      pendingRequestsRef.current.add(requestKey);
      setProductsLoading(true);

      try {
        const response = await commissionRepository.getAffiliateProductCommissions(id, {
          page,
          limit,
          search,
          categoryNames,
        });

        // Transform ProductCommission[] to CommissionProduct[]
        const transformedProducts: CommissionProduct[] = (response.data || []).map((item) => ({
          id: item.id,
          productId: item.productId,
          productCode: item.code,
          productName: item.name,
          productImage: item.images?.avatar || '',
          costPrice: item.costPrice,
          stock: item.stock,
          commissionRate: item.commissionRate,
          estimatedCommission: item.estimatedCommission,
        }));

        setProducts(transformedProducts);
        setPagination({
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
          hasNextPage: response.hasNextPage,
        });
      } catch (error) {
        console.error('Error loading product commissions:', error);
      } finally {
        setProductsLoading(false);
        setTimeout(() => {
          pendingRequestsRef.current.delete(requestKey);
        }, 100);
      }
    },
    [id, pagination.page, pagination.limit, searchQuery, categoryNamesFilter]
  );

  useEffect(() => {
    if (affiliate && id) {
      loadProductCommissions({ page: 1, limit: 10 });
    }
  }, [affiliate, id]);

  // Helper functions
  const getTypeLabel = (type: AffiliateType): string => {
    const typeMap: Partial<Record<AffiliateType, string>> = {
      [AffiliateType.AFFILIATE_TYPE_KOL]: t('kol'),
      [AffiliateType.AFFILIATE_TYPE_CTV]: t('ctv'),
      [AffiliateType.AFFILIATE_TYPE_PUBLISHER]: t('publisher'),
    };
    return typeMap[type] || '-';
  };

  const getTypeColor = (type: AffiliateType): 'primary' | 'info' | 'secondary' | 'default' => {
    const colorMap: Partial<Record<AffiliateType, 'primary' | 'info' | 'secondary' | 'default'>> = {
      [AffiliateType.AFFILIATE_TYPE_KOL]: 'primary',
      [AffiliateType.AFFILIATE_TYPE_CTV]: 'info',
      [AffiliateType.AFFILIATE_TYPE_PUBLISHER]: 'secondary',
    };
    return colorMap[type] || 'default';
  };

  const generateAffiliateLink = () => {
    if (!affiliate) return '';
    return `${getCurrentBaseUrl()}/?ref=${affiliate.affiliateCode}`;
  };

  const handleCopyLink = () => {
    const link = generateAffiliateLink();
    navigator.clipboard.writeText(link);
    showSuccess(t('linkCopied'));
  };

  // Commission settings handlers
  const handleDefaultRateChange = (rate: number) => {
    if (!id) return;
    dispatch(
      updateAffiliateRequest({
        data: {
          affiliateId: id,
          defaultCommissionRate: rate,
        },
        onSuccess: () => {
          showSuccess(t('updateAffiliateSuccess'));
        },
      })
    );
  };

  const handleAutoAddChange = (enabled: boolean) => {
    if (!id) return;
    dispatch(
      updateAffiliateRequest({
        data: {
          affiliateId: id,
          autoUpdateProducts: enabled,
        },
        onSuccess: () => {
          showSuccess(t('updateAffiliateSuccess'));
        },
      })
    );
  };

  const handleEditDefaultRate = () => {
    editDefaultRateDialog.open();
  };

  // Product commission handlers
  const handleAddProducts = () => {
    productDialog.open();
  };

  const handleProductsSelected = useCallback(
    async (selectedProducts: Product[]) => {
      if (!id) return;

      try {
        const productsToAdd = selectedProducts.map((p) => ({
          productId: p.id,
          commissionRate: affiliate?.defaultCommissionRate || 10,
        }));

        await commissionRepository.addAffiliateProductCommissions(id, productsToAdd);
        showSuccess(t('addProductsSuccess'));
        loadProductCommissions();
        productDialog.close();
      } catch (error) {
        console.error('Error adding products:', error);
      }
    },
    [id, affiliate, productDialog, loadProductCommissions, t]
  );

  const handleEditProduct = (productId: string, currentRate: number) => {
    setEditingProductId(productId);
    setEditingProductRate(currentRate);
    editDialog.open();
  };

  const handleSaveProductEdit = useCallback(
    async (productId: string, newRate: number) => {
      if (!id) return;

      try {
        await commissionRepository.updateAffiliateProductCommission(id, productId, newRate);
        showSuccess(t('updateCommissionSuccess'));
        loadProductCommissions();
        editDialog.close();
      } catch (error) {
        console.error('Error updating commission:', error);
      }
    },
    [id, editDialog, loadProductCommissions, t]
  );

  const handleDeleteProduct = useCallback(
    async (productId: string) => {
      if (!id) return;

      try {
        await commissionRepository.deleteAffiliateProductCommission(id, productId);
        showSuccess(t('deleteProductSuccess'));
        loadProductCommissions();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    },
    [id, loadProductCommissions, t]
  );

  const handleBulkEdit = () => {
    const selectedIds = Object.keys(rowSelection).filter((key) => rowSelection[key]);
    setSelectedProductIds(selectedIds);
    bulkEditDialog.open();
  };

  const handleBulkEditSave = useCallback(
    async (productIds: string[], newRate: number) => {
      if (!id) return;

      try {
        await commissionRepository.bulkUpdateAffiliateProductCommissions(id, productIds, newRate);
        showSuccess(t('updateCommissionSuccess'));
        setRowSelection({});
        loadProductCommissions();
        bulkEditDialog.close();
      } catch (error) {
        console.error('Error bulk updating commissions:', error);
      }
    },
    [id, bulkEditDialog, loadProductCommissions, t]
  );

  const handleSearch = useCallback(
    (search: string) => {
      setSearchQuery(search);
      loadProductCommissions({ page: 1, search });
    },
    [loadProductCommissions]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      loadProductCommissions({ page });
    },
    [loadProductCommissions]
  );

  const handlePageSizeChange = useCallback(
    (limit: number) => {
      loadProductCommissions({ page: 1, limit });
    },
    [loadProductCommissions]
  );

  const handleCategoryChange = useCallback(
    (categoryNames: string[]) => {
      setCategoryNamesFilter(categoryNames);
      loadProductCommissions({ page: 1, categoryNames });
    },
    [loadProductCommissions]
  );

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  // No data state
  if (!affiliate) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">{t('noData')}</Typography>
      </Box>
    );
  }

  const isActive = affiliate.status === AffiliateStatus.AFFILIATE_STATUS_ACTIVE;
  const affiliateLink = generateAffiliateLink();

  const InfoRow = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
    <Stack direction="row" spacing={2} mb={1.5}>
      <Typography sx={{ fontWeight: 500, color: 'text.secondary', minWidth: 220 }}>
        {label}:
      </Typography>
      <Typography sx={{ fontWeight: 400 }}>{value}</Typography>
    </Stack>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={600}>
          {t('affiliateDetail')}
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/affiliates')}>
          {t('back')}
        </Button>
      </Stack>

      {/* Affiliate Information Card */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={3}>
          {t('basicInformation')}
        </Typography>

        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} md={6}>
            <InfoRow label={t('affiliateName')} value={affiliate.name} />
            <InfoRow label={t('joinDate')} value={formatDate(affiliate.createdAt)} />
            <InfoRow label={t('email')} value={affiliate.email} />
            <InfoRow label={t('recipientName')} value={affiliate.bankAccountHolder || '-'} />
            <InfoRow label={t('bankAccountNumber')} value={affiliate.bankAccountNumber || '-'} />
            <InfoRow label={t('branch')} value={affiliate.bankName || '-'} />
            <Stack direction="row" spacing={2} mb={1.5} alignItems="center">
              <Typography sx={{ fontWeight: 500, color: 'text.secondary', minWidth: 220 }}>
                {t('affiliateLink')}:
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography sx={{ fontWeight: 400, color: 'primary.main' }}>
                  {affiliateLink}
                </Typography>
                <IconButton size="small" onClick={handleCopyLink}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={2} mb={1.5} alignItems="center">
              <Typography sx={{ fontWeight: 500, color: 'text.secondary', minWidth: 220 }}>
                {t('affiliateType')}:
              </Typography>
              <Chip
                label={getTypeLabel(affiliate.type)}
                color={getTypeColor(affiliate.type)}
                size="small"
              />
            </Stack>
            <InfoRow label={t('affiliateCode')} value={affiliate.affiliateCode} />
            <InfoRow label={t('phone')} value={affiliate.phone} />
            <InfoRow label={t('citizenId')} value={affiliate.citizenId || '-'} />
            <InfoRow label={t('bankName')} value={affiliate.bankName || '-'} />
            <Stack direction="row" spacing={2} mb={1.5} alignItems="center">
              <Typography sx={{ fontWeight: 500, color: 'text.secondary', minWidth: 220 }}>
                {t('status')}:
              </Typography>
              <Chip
                label={isActive ? t('active') : t('inactive')}
                size="small"
                sx={{
                  bgcolor: isActive ? '#E6F7ED' : '#F5F5F5',
                  color: isActive ? '#22C55E' : '#6B7280',
                  fontWeight: 500,
                }}
              />
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label={t('commissionSettings')} />
          <Tab label={t('performanceStatistics')} />
          <Tab label={t('orderList')} />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        {/* Commission Settings */}
        <CommissionSettingsSection
          defaultRate={affiliate.defaultCommissionRate || 0}
          autoAddEnabled={affiliate.autoUpdateProducts}
          onDefaultRateChange={handleDefaultRateChange}
          onAutoAddChange={handleAutoAddChange}
          onEditDefaultRate={handleEditDefaultRate}
          disabled={true}
          readOnly={true}
        />

        {/* Product Commission Table */}
        <CommissionProductTable
          products={products}
          pagination={pagination}
          onAddProducts={handleAddProducts}
          onEditProduct={handleEditProduct}
          onRemoveProduct={handleDeleteProduct}
          onBulkEdit={handleBulkEdit}
          onSearchChange={handleSearch}
          onCategoryChange={handleCategoryChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          readOnly={true}
          affiliateCode={affiliate.affiliateCode}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {id && <AffiliatesPerformanceView affiliateId={id} />}
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {id && <AffiliatesOrdersTab affiliateId={id} />}
      </TabPanel>

      <EditCommissionDialog
        open={editDialog.isOpen}
        onClose={editDialog.close}
        productId={editingProductId || ''}
        currentRate={editingProductRate}
        onSave={handleSaveProductEdit}
      />
    </Box>
  );
}
