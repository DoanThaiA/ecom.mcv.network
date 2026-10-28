import {
  Box,
  Card,
  Typography,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getOrderByIdRequest,
  selectCurrentOrder,
  selectCurrentOrderLoading,
  clearCurrentOrder,
} from 'src/redux/store/orderSlice';
import { TableImagePreview } from 'src/components/table-image-preview';
import { OrderStatusChip, PaymentStatusChip } from './components';
import { formatPrice, formatDate } from 'src/utils/format';
import { getPaymentMethodKey } from 'src/types/orders';

// ----------------------------------------------------------------------

type DetailTab = 'info' | 'print_pack' | 'send_shipping';

export function OrderDetailView() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const order = useAppSelector(selectCurrentOrder);
  const loading = useAppSelector(selectCurrentOrderLoading);

  const [activeTab, setActiveTab] = useState<DetailTab>('info');

  useEffect(() => {
    if (id) {
      dispatch(getOrderByIdRequest({ id }));
    }

    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">{t('noData')}</Typography>
      </Box>
    );
  }

  // Build full address
  const fullAddress = [
    order.shippingAddress?.street,
    order.shippingAddress?.ward,
    order.shippingAddress?.district,
    order.shippingAddress?.city,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Box sx={{ p: 2 }}>
      {/* Header with Order Number and Status */}
      <Card sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {t('orderNumber')}: {order.orderNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('createdAt')}: {formatDate(order.createdAt)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <OrderStatusChip status={order.status} />
            <PaymentStatusChip status={order.paymentStatus} />
          </Box>
        </Box>
      </Card>

      {/* Tabs */}
      <Card sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: 14,
              fontWeight: 500,
            },
          }}
        >
          <Tab value="info" label={t('information')} />
          <Tab value="print_pack" label={t('printAndPack')} />
          <Tab value="send_shipping" label={t('sendShipping')} />
        </Tabs>
      </Card>

      {/* Content */}
      {activeTab === 'info' && (
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Left Column */}
          <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Customer Info */}
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                {t('customer')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ fontSize: 20, color: '#637381' }} />
                  <Typography variant="body2">{order.customer?.name || '--'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon sx={{ fontSize: 20, color: '#637381' }} />
                  <Typography variant="body2">{order.customer?.phone || '--'}</Typography>
                </Box>
                {order.customer?.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon sx={{ fontSize: 20, color: '#637381' }} />
                    <Typography variant="body2">{order.customer.email}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <LocationOnIcon sx={{ fontSize: 20, color: '#637381', mt: 0.25 }} />
                  <Typography variant="body2">{fullAddress || '--'}</Typography>
                </Box>
              </Box>
            </Card>

            {/* Note */}
            {order.note && (
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  {t('description')}
                </Typography>
                <Typography variant="body2">{order.note}</Typography>
              </Card>
            )}

            {/* Products Table */}
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                {t('products')}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F7F8FA' }}>
                      <TableCell sx={{ fontWeight: 600, width: 50 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t('products')}</TableCell>
                      <TableCell sx={{ fontWeight: 600, width: 100 }}>{t('code')}</TableCell>
                      <TableCell sx={{ fontWeight: 600, width: 80, textAlign: 'center' }}>
                        SL
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, width: 120, textAlign: 'right' }}>
                        {t('price')}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, width: 120, textAlign: 'right' }}>
                        {t('total')}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.map((item, index) => (
                      <TableRow key={item.productId + (item.variantId || '')}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TableImagePreview
                              src={item.image}
                              alt={item.name}
                              width={50}
                              height={50}
                            />
                            <Box>
                              <Typography variant="body2">{item.name}</Typography>
                              {item.comboName && (
                                <Chip
                                  label={item.comboName}
                                  size="small"
                                  sx={{
                                    mt: 0.5,
                                    bgcolor: '#E8F4FF',
                                    color: '#0165FC',
                                    fontSize: 11,
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {item.code}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{formatPrice(item.price)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ color: '#178B30', fontWeight: 500 }}>
                            {formatPrice(item.subtotal)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>

            {/* Discount Details */}
            {order.discountDetails && order.discountDetails.length > 0 && (
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  {t('discountDetails')}
                </Typography>
                {order.discountDetails.map((discount, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      py: 1,
                      borderBottom:
                        index < order.discountDetails!.length - 1 ? '1px solid #E5E6EB' : 'none',
                    }}
                  >
                    <Typography variant="body2">
                      {discount.referenceName} ({discount.type})
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#F62E2E' }}>
                      -{formatPrice(discount.discountAmount)}
                    </Typography>
                  </Box>
                ))}
              </Card>
            )}
          </Box>

          {/* Right Column */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Payment Summary */}
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                {t('paymentInfo')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('subtotal')}
                  </Typography>
                  <Typography variant="body2">{formatPrice(order.subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('shippingFee')}
                  </Typography>
                  <Typography variant="body2">
                    {order.shippingFee > 0 ? formatPrice(order.shippingFee) : t('freeShipping')}
                  </Typography>
                </Box>
                {order.discount && order.discount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('discount')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#F62E2E' }}>
                      -{formatPrice(order.discount)}
                    </Typography>
                  </Box>
                )}
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight={600}>
                    {t('total')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#178B30', fontWeight: 600 }}>
                    {formatPrice(order.total)}
                  </Typography>
                </Box>
              </Box>
            </Card>

            {/* Payment Method */}
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                {t('paymentMethod')}
              </Typography>
              <Chip
                label={t(getPaymentMethodKey(order.paymentMethod))}
                sx={{ bgcolor: '#F7F8FA' }}
              />
            </Card>

            {/* Order Info */}
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                {t('orderInfo')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('orderNumber')}
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {order.orderNumber}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('createdAt')}
                  </Typography>
                  <Typography variant="body2">{formatDate(order.createdAt)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('updatedAt')}
                  </Typography>
                  <Typography variant="body2">{formatDate(order.updatedAt)}</Typography>
                </Box>
                {order.cancelledAt && (
                  <>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('cancelledAt')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#F62E2E' }}>
                        {formatDate(order.cancelledAt)}
                      </Typography>
                    </Box>
                    {order.cancellationReason && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" mb={0.5}>
                          {t('cancellationReason')}
                        </Typography>
                        <Typography variant="body2">{order.cancellationReason}</Typography>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Card>

            {/* Shipping Info */}
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                {t('shippingInfo')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ fontSize: 18, color: '#637381' }} />
                  <Typography variant="body2">{order.customer?.name || '--'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon sx={{ fontSize: 18, color: '#637381' }} />
                  <Typography variant="body2">{order.customer?.phone || '--'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <LocationOnIcon sx={{ fontSize: 18, color: '#637381', mt: 0.25 }} />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {fullAddress || '--'}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        </Box>
      )}

      {/* Print & Pack Tab Content */}
      {activeTab === 'print_pack' && (
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('noData')}</Typography>
        </Card>
      )}

      {/* Send Shipping Tab Content */}
      {activeTab === 'send_shipping' && (
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('noData')}</Typography>
        </Card>
      )}
    </Box>
  );
}
