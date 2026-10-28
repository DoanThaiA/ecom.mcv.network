import {
  Box,
  Card,
  IconButton,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { ProductSelectionDialog } from 'src/components/dialog/product-selection-dialog';
import { TableImagePreview } from 'src/components/table-image-preview';
import type { FormTier } from '../shock-deal-form';
import { GiftProduct } from 'src/types/promotion';

// ----------------------------------------------------------------------

interface BenefitTiersSectionProps {
  tiers: FormTier[];
  onTiersChange: (tiers: FormTier[]) => void;
  disabled?: boolean;
}

export function BenefitTiersSection({
  tiers,
  onTiersChange,
  disabled = false,
}: BenefitTiersSectionProps) {
  const { t } = useTranslation();
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [selectedTierIndex, setSelectedTierIndex] = useState<number | null>(null);

  const handleAddTier = useCallback(() => {
    const newTier: FormTier = {
      id: `tier-${Date.now()}`,
      minOrderValue: 0,
      giftProducts: [],
    };
    onTiersChange([...tiers, newTier]);
  }, [tiers, onTiersChange]);

  const handleRemoveTier = useCallback(
    (index: number) => {
      const newTiers = tiers.filter((_, i) => i !== index);
      onTiersChange(newTiers);
    },
    [tiers, onTiersChange]
  );

  const handleMinOrderValueChange = useCallback(
    (index: number, value: string) => {
      const numValue = parseFloat(value) || 0;
      const newTiers = tiers.map((tier, i) =>
        i === index ? { ...tier, minOrderValue: numValue } : tier
      );
      onTiersChange(newTiers);
    },
    [tiers, onTiersChange]
  );

  const handleOpenProductDialog = useCallback((tierIndex: number) => {
    setSelectedTierIndex(tierIndex);
    setProductDialogOpen(true);
  }, []);

  const handleCloseProductDialog = useCallback(() => {
    setProductDialogOpen(false);
    setSelectedTierIndex(null);
  }, []);

  const handleProductSelect = useCallback(
    (products: any[]) => {
      if (selectedTierIndex === null || !products || products.length === 0) return;

      // Only take first product (single select mode)
      const selectedProduct = products[0];
      const newProduct: GiftProduct = {
        productId: selectedProduct.id,
        name: selectedProduct.name,
        image: selectedProduct.images?.avatar,
      };

      // Replace existing products with the new one
      const newTiers = tiers.map((tier, i) =>
        i === selectedTierIndex ? { ...tier, giftProducts: [newProduct] } : tier
      );

      // Update state first, then close dialog
      onTiersChange(newTiers);
      setProductDialogOpen(false);
      setSelectedTierIndex(null);
    },
    [selectedTierIndex, tiers, onTiersChange]
  );

  const handleRemoveGiftProduct = useCallback(
    (tierIndex: number, productIndex: number) => {
      const newTiers = tiers.map((tier, i) =>
        i === tierIndex
          ? { ...tier, giftProducts: tier.giftProducts.filter((_, pi) => pi !== productIndex) }
          : tier
      );
      onTiersChange(newTiers);
    },
    [tiers, onTiersChange]
  );

  // Get existing product IDs for current tier to filter in dialog
  const existingProductIds =
    selectedTierIndex !== null
      ? tiers[selectedTierIndex]?.giftProducts.map((p) => p.productId)
      : [];

  return (
    <Card
      sx={{
        p: 3,
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        borderRadius: 2,
        mb: 3,
      }}
    >
      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 600,
          color: 'text.primary',
          mb: 2,
        }}
      >
        {t('benefitCondition')}
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#F5F6FA' }}>
              <TableCell
                sx={{ fontWeight: 600, width: 50, textAlign: 'center', borderBottom: 'none' }}
              >
                #
              </TableCell>
              <TableCell sx={{ fontWeight: 600, width: 200, borderBottom: 'none' }}>
                {t('benefitCondition')}
              </TableCell>
              <TableCell sx={{ fontWeight: 600, borderBottom: 'none' }}>
                {t('giftProduct')}
              </TableCell>
              <TableCell sx={{ fontWeight: 600, width: 60, borderBottom: 'none' }} />
            </TableRow>
            <TableRow sx={{ bgcolor: '#F5F6FA' }}>
              <TableCell sx={{ borderBottom: 'none' }} />
              <TableCell sx={{ fontWeight: 500, fontSize: 13, borderBottom: 'none' }}>
                {t('minOrderValue')}
              </TableCell>
              <TableCell sx={{ fontWeight: 500, fontSize: 13, borderBottom: 'none' }} />
              <TableCell sx={{ borderBottom: 'none' }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {tiers.map((tier, index) => (
              <TableRow key={tier.id}>
                <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  {index + 1}
                </TableCell>
                <TableCell sx={{ verticalAlign: 'middle' }}>
                  <TextField
                    size="small"
                    type="number"
                    value={tier.minOrderValue || ''}
                    onChange={(e) => handleMinOrderValueChange(index, e.target.value)}
                    disabled={disabled}
                    placeholder="0"
                    InputProps={{
                      endAdornment: (
                        <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>VND</Typography>
                      ),
                    }}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                      },
                    }}
                  />
                </TableCell>
                <TableCell sx={{ verticalAlign: 'middle' }}>
                  <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
                    {tier.giftProducts.map((product, productIndex) => (
                      <Box
                        key={product.productId}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          bgcolor: 'background.paper',
                        }}
                      >
                        <TableImagePreview
                          src={product.image || ''}
                          alt={product.name || ''}
                          width={40}
                          height={40}
                        />
                        <Typography variant="body2" sx={{ fontSize: 13 }}>
                          {product.name || product.productId}
                        </Typography>
                        {!disabled && (
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveGiftProduct(index, productIndex)}
                            sx={{ ml: 'auto', p: 0.5 }}
                          >
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => !disabled && handleOpenProductDialog(index)}
                      sx={{
                        color: '#0165FC',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        fontSize: 13,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <AddIcon sx={{ fontSize: 16 }} />
                      {tier.giftProducts.length > 0 ? t('changeProduct') : t('addProduct')}
                    </Link>
                  </Stack>
                </TableCell>
                <TableCell sx={{ verticalAlign: 'middle', textAlign: 'center' }}>
                  {tiers.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveTier(index)}
                      disabled={disabled}
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

      <Box sx={{ mt: 2 }}>
        <Link
          component="button"
          variant="body2"
          onClick={handleAddTier}
          disabled={disabled}
          sx={{
            color: '#0165FC',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          + {t('addBenefitTier')}
        </Link>
      </Box>

      <ProductSelectionDialog
        open={productDialogOpen}
        onClose={handleCloseProductDialog}
        onConfirm={handleProductSelect}
        existingProductIds={existingProductIds}
        variant="detailed"
        filterOutExisting={true}
        preSelectExisting={false}
        singleSelect={true}
        title="productList"
        confirmLabel="addProduct"
      />
    </Card>
  );
}
