import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { ProductSelectionDialog } from 'src/components/dialog/product-selection-dialog';
import { TableImagePreview } from 'src/components/table-image-preview';
import { FormattedNumberInput } from 'src/components/input';
import { formatNumber } from 'src/utils/format';
import type { Product } from 'src/types/gen/shared/shared/products/product';
import { ProductStatus } from 'src/types/gen/shared/shared/common/enums';

import { AdditionalConditionsSection } from './additional-conditions-section';

// ----------------------------------------------------------------------

export interface FormProduct {
  productId: string;
  name: string;
  image: string;
  code?: string;
  sellingPrice?: number;
  stockQuantity?: number;
  isActive?: boolean;
}

interface AdditionalConditionsProps {
  minimumOrderValue?: number;
  maxGiftQuantity?: number;
  notApplicableWithOtherPromotions: boolean;
  onMinimumOrderValueChange: (value: number | undefined) => void;
  onMaxGiftQuantityChange: (value: number | undefined) => void;
  onNotApplicableChange: (value: boolean) => void;
}

interface BuyXGetYProductsSectionProps {
  title: string;
  quantityLabel: string;
  quantity: number;
  onQuantityChange: (value: number) => void;
  products: FormProduct[];
  onProductsChange: (products: FormProduct[]) => void;
  disabled?: boolean;
  /** When true, shows additional conditions section inside this card */
  showAdditionalConditions?: boolean;
  /** Props for additional conditions (required when showAdditionalConditions is true) */
  additionalConditions?: AdditionalConditionsProps;
}

export function BuyXGetYProductsSection({
  title,
  quantityLabel,
  quantity,
  onQuantityChange,
  products,
  onProductsChange,
  disabled = false,
  showAdditionalConditions = false,
  additionalConditions,
}: BuyXGetYProductsSectionProps) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  const handleProductSelect = useCallback(
    (selectedProducts: Product[]) => {
      const newProducts: FormProduct[] = selectedProducts.map((p) => ({
        productId: p.id,
        name: p.name,
        image: p.images?.avatar || '',
        code: p.code,
        sellingPrice: p.prices?.retail,
        stockQuantity: p.inventory?.available,
        isActive: p.status === ProductStatus.PRODUCT_STATUS_ACTIVE,
      }));

      // Merge with existing products, avoiding duplicates
      const existingIds = new Set(products.map((p) => p.productId));
      const merged = [...products, ...newProducts.filter((p) => !existingIds.has(p.productId))];
      onProductsChange(merged);
      setDialogOpen(false);
    },
    [products, onProductsChange]
  );

  const handleRemoveProduct = useCallback(
    (productId: string) => {
      onProductsChange(products.filter((p) => p.productId !== productId));
    },
    [products, onProductsChange]
  );

  const handleQuantityChange = useCallback(
    (value: number | undefined) => {
      onQuantityChange(value || 1);
    },
    [onQuantityChange]
  );

  const existingProductIds = products.map((p) => p.productId);

  // Check if any product has status info (from ProductSelectionDialog)
  // Products loaded from existing promotions don't have isActive field from API
  const hasStatusInfo = products.some((p) => p.isActive !== undefined);

  return (
    <Card
      sx={{
        p: 2.5,
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        borderRadius: 2,
        mb: 2,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          {t(title)} <span style={{ color: 'red' }}>*</span>
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          disabled={disabled}
          sx={{
            borderColor: '#0165FC',
            color: '#0165FC',
            '&:hover': {
              borderColor: '#0052CC',
              bgcolor: 'rgba(1, 101, 252, 0.04)',
            },
          }}
        >
          {t('addProduct')}
        </Button>
      </Stack>

      {/* Quantity input */}
      <Box sx={{ mb: 1.5, maxWidth: 300 }}>
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
          {t(quantityLabel)} <span style={{ color: 'red' }}>*</span>
        </Typography>
        <FormattedNumberInput
          value={quantity}
          onChange={handleQuantityChange}
          min={1}
          allowEmpty={false}
          size="small"
          fullWidth
          disabled={disabled}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
            },
          }}
        />
      </Box>

      {/* Products table */}
      {products.length === 0 ? (
        <Typography
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            py: 2,
            fontSize: 14,
          }}
        >
          {t('noProductsYet')}
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F5F6FA' }}>
                <TableCell
                  sx={{ fontWeight: 600, width: 50, textAlign: 'center', borderBottom: 'none' }}
                >
                  STT
                </TableCell>
                <TableCell sx={{ fontWeight: 600, width: 120, borderBottom: 'none' }}>
                  {t('productCode')}
                </TableCell>
                <TableCell sx={{ fontWeight: 600, width: 70, borderBottom: 'none' }}>
                  {t('image')}
                </TableCell>
                <TableCell sx={{ fontWeight: 600, borderBottom: 'none' }}>
                  {t('productName')}
                </TableCell>
                <TableCell sx={{ fontWeight: 600, width: 130, borderBottom: 'none' }}>
                  {t('sellingPrice')}
                </TableCell>
                <TableCell sx={{ fontWeight: 600, width: 110, borderBottom: 'none' }}>
                  {t('inWarehouse')}
                </TableCell>
                {hasStatusInfo && (
                  <TableCell sx={{ fontWeight: 600, width: 110, borderBottom: 'none' }}>
                    {t('status')}
                  </TableCell>
                )}
                <TableCell
                  sx={{ fontWeight: 600, width: 70, textAlign: 'center', borderBottom: 'none' }}
                >
                  {t('actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product, index) => (
                <TableRow key={product.productId}>
                  <TableCell sx={{ textAlign: 'center' }}>{index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{product.code || '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    <TableImagePreview
                      src={product.image}
                      alt={product.name}
                      width={40}
                      height={40}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 250,
                      }}
                    >
                      {product.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {product.sellingPrice != null
                        ? `${formatNumber(product.sellingPrice)}đ`
                        : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Typography variant="body2">{product.stockQuantity ?? '-'}</Typography>
                  </TableCell>
                  {hasStatusInfo && (
                    <TableCell>
                      <Chip
                        label={product.isActive ? t('active') : t('inactive')}
                        size="small"
                        color={product.isActive ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </TableCell>
                  )}
                  <TableCell sx={{ textAlign: 'center' }}>
                    {!disabled && (
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveProduct(product.productId)}
                        sx={{ color: '#F62E2E' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Additional Conditions Section (inline) */}
      {showAdditionalConditions && additionalConditions && (
        <AdditionalConditionsSection
          minimumOrderValue={additionalConditions.minimumOrderValue}
          maxGiftQuantity={additionalConditions.maxGiftQuantity}
          notApplicableWithOtherPromotions={additionalConditions.notApplicableWithOtherPromotions}
          onMinimumOrderValueChange={additionalConditions.onMinimumOrderValueChange}
          onMaxGiftQuantityChange={additionalConditions.onMaxGiftQuantityChange}
          onNotApplicableChange={additionalConditions.onNotApplicableChange}
          disabled={disabled}
          inline
        />
      )}

      <ProductSelectionDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleProductSelect}
        existingProductIds={existingProductIds}
        variant="detailed"
        filterOutExisting={true}
        preSelectExisting={false}
        singleSelect={false}
        title="productList"
        confirmLabel="addProduct"
      />
    </Card>
  );
}
