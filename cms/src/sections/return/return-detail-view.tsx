import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  ImageList,
  ImageListItem,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getReturnByIdRequest,
  selectCurrentReturn,
  selectCurrentReturnLoading,
  clearCurrentReturn,
} from 'src/redux/store/returnSlice';
import { TableImagePreview } from 'src/components/table-image-preview';
import { ReturnStatusChip } from './components';
import { formatPrice, formatDate } from 'src/utils/format';
import { getReturnReasonKey } from 'src/types/returns';

// ----------------------------------------------------------------------

export function ReturnDetailView() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const returnRequest = useAppSelector(selectCurrentReturn);
  const loading = useAppSelector(selectCurrentReturnLoading);

  useEffect(() => {
    if (id) {
      dispatch(getReturnByIdRequest({ id }));
    }

    return () => {
      dispatch(clearCurrentReturn());
    };
  }, [dispatch, id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!returnRequest) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">{t('noData')}</Typography>
      </Box>
    );
  }

  // Build full address if available
  const fullAddress = returnRequest.customer?.address || '--';

  // Calculate totals
  const subtotal = returnRequest.items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalQuantity = returnRequest.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Box sx={{ p: 2 }}>
      {/* Page Title */}
      <Typography variant="h5" fontWeight={600} mb={2}>
        {t('returnDetail')}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Left Column */}
        <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Customer Info */}
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              {t('customer')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ fontSize: 20, color: '#637381' }} />
                  <Typography variant="body2">{returnRequest.customer?.name || '--'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon sx={{ fontSize: 20, color: '#637381' }} />
                  <Typography variant="body2">{returnRequest.customer?.phone || '--'}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationOnIcon sx={{ fontSize: 20, color: '#637381', mt: 0.25 }} />
                <Typography variant="body2">{fullAddress}</Typography>
              </Box>
            </Box>
          </Card>

          {/* Order Info - Thông tin đơn hàng */}
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              {t('orderInfo')}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F7F8FA' }}>
                    <TableCell sx={{ fontWeight: 600, width: 50 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('productName')}</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: 80, textAlign: 'center' }}>
                      SL
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, width: 140, textAlign: 'right' }}>
                      {t('sellingPrice')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, width: 200, textAlign: 'right' }}>
                      {t('payment')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {returnRequest.items.map((item, index) => (
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
                          <Typography variant="body2">{item.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right">
                        <Box>
                          <Typography variant="body2">{formatPrice(item.price)}</Typography>
                          {item.price > item.subtotal / item.quantity && (
                            <Typography variant="body2" sx={{ color: '#F62E2E' }}>
                              -{formatPrice(item.price - item.subtotal / item.quantity)}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      {index === 0 && (
                        <TableCell
                          align="right"
                          rowSpan={returnRequest.items.length}
                          sx={{ verticalAlign: 'top', borderLeft: '1px solid #E5E6EB' }}
                        >
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">
                                {t('subtotal')}
                              </Typography>
                              <Typography variant="body2">{formatPrice(subtotal)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">
                                {t('shippingFee')}
                              </Typography>
                              <Typography variant="body2">0đ</Typography>
                            </Box>
                            {returnRequest.amount < subtotal && (
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">
                                  {t('discount')}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#F62E2E' }}>
                                  -{formatPrice(subtotal - returnRequest.amount)}
                                </Typography>
                              </Box>
                            )}
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                borderTop: '1px solid #E5E6EB',
                                pt: 1,
                              }}
                            >
                              <Typography variant="body2" fontWeight={600}>
                                {t('total')}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: '#178B30', fontWeight: 600 }}
                              >
                                {formatPrice(returnRequest.amount)}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          {/* Return Request Info - Yêu cầu trả hàng/hoàn tiền */}
          <Card sx={{ p: 2 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                {t('returnRefund')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('status')}:
                </Typography>
                <ReturnStatusChip status={returnRequest.status} />
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {/* Left side */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ width: 140 }}>
                    {t('orderNumber')}:
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {returnRequest.orderNumber}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ width: 140 }}>
                    {t('returnReason')}:
                  </Typography>
                  <Typography variant="body2">
                    {returnRequest.reasonDetail || t(getReturnReasonKey(returnRequest.reason))}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ width: 140 }}>
                    {t('bankName')}:
                  </Typography>
                  <Typography variant="body2">{returnRequest.bankName || '--'}</Typography>
                </Box>
                <Box sx={{ display: 'flex' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ width: 140 }}>
                    {t('bankAccountNumber')}:
                  </Typography>
                  <Typography variant="body2">{returnRequest.bankAccountNumber || '--'}</Typography>
                </Box>
                <Box sx={{ display: 'flex' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ width: 140 }}>
                    {t('bankAccountName')}:
                  </Typography>
                  <Typography variant="body2">{returnRequest.bankAccountName || '--'}</Typography>
                </Box>
              </Box>

              {/* Right side */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ width: 140 }}>
                    {t('shippingCarrier')}:
                  </Typography>
                  <Typography variant="body2">{returnRequest.shippingCarrier || '--'}</Typography>
                </Box>
                <Box sx={{ display: 'flex' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ width: 140 }}>
                    {t('requestDate')}:
                  </Typography>
                  <Typography variant="body2">{formatDate(returnRequest.createdAt)}</Typography>
                </Box>
                {returnRequest.processedAt && (
                  <Box sx={{ display: 'flex' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ width: 140 }}>
                      {t('processedDate')}:
                    </Typography>
                    <Typography variant="body2">{formatDate(returnRequest.processedAt)}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Card>
        </Box>

        {/* Right Column - Product Images */}
        <Box sx={{ width: 320, flexShrink: 0 }}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              {t('productImages')}
            </Typography>
            {returnRequest.images && returnRequest.images.length > 0 ? (
              <ImageList cols={2} gap={8} sx={{ maxHeight: 400, overflow: 'auto' }}>
                {returnRequest.images.map((img, index) => (
                  <ImageListItem key={index}>
                    <Box
                      component="img"
                      src={img}
                      alt={`Complaint Image ${index + 1}`}
                      sx={{
                        width: '100%',
                        height: 130,
                        objectFit: 'cover',
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.9 },
                      }}
                      onClick={() => window.open(img, '_blank')}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: 200,
                  bgcolor: '#F5F5F5',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {t('noImages')}
                </Typography>
              </Box>
            )}
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
