import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { productRepository } from 'src/repositories/product.repository';
import type { Product } from 'src/types/gen/shared/shared/products/product';

// ----------------------------------------------------------------------

// Extended type for display purposes
export interface ComboItemWithDetails {
  productId: string;
  quantity: number;
  code?: string;
  name?: string;
  image?: string;
}

interface SkuListSectionProps {
  products: ComboItemWithDetails[];
  onAddProduct: (product: ComboItemWithDetails) => void;
  onRemoveProduct: (productId: string) => void;
  loading?: boolean;
}

export function SkuListSection({
  products,
  onAddProduct,
  onRemoveProduct,
  loading = false,
}: SkuListSectionProps) {
  const { t } = useTranslation();

  const [searchOptions, setSearchOptions] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [inputValue, setInputValue] = useState('');

  const handleSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchOptions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await productRepository.getProducts({
        page: 1,
        limit: 5,
        filters: {
          search: searchTerm,
          categoryIds: [],
          productIds: [],
        },
      });
      setSearchOptions(response.data || []);
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchOptions([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleAddProduct = () => {
    if (selectedProduct) {
      const existingProduct = products.find((p) => p.productId === selectedProduct.id);
      if (existingProduct) {
        return;
      }

      onAddProduct({
        productId: selectedProduct.id,
        quantity: 1,
        code: selectedProduct.code,
        name: selectedProduct.name,
        image: selectedProduct.images?.avatar,
      });

      setSelectedProduct(null);
      setInputValue('');
      setSearchOptions([]);
    }
  };

  return (
    <Card
      sx={{
        p: { xs: 2, sm: 3 },
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
        {t('skuInCombo')}
      </Typography>

      {/* Add Product Section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          mb: 2,
          p: 2,
          bgcolor: 'grey.50',
          borderRadius: 1.5,
          border: '1px dashed',
          borderColor: 'grey.300',
        }}
      >
        {/* Product Search */}
        <Box>
          <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: 'text.secondary' }}>
            {t('childProduct')}
          </Typography>
          <Autocomplete
            size="small"
            options={searchOptions}
            getOptionLabel={(option) => `${option.code} - ${option.name}`}
            value={selectedProduct}
            inputValue={inputValue}
            onChange={(_, newValue) => {
              setSelectedProduct(newValue);
            }}
            onInputChange={(_, newInputValue, reason) => {
              setInputValue(newInputValue);
              if (reason === 'input') {
                handleSearch(newInputValue);
              }
            }}
            loading={searchLoading}
            disabled={loading}
            filterOptions={(x) => x}
            noOptionsText={inputValue ? t('noProductsFound') : t('typeToSearch')}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={t('searchProduct')}
                sx={{ bgcolor: 'background.paper' }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
                  <Avatar
                    src={option.images?.avatar}
                    variant="rounded"
                    sx={{ width: 40, height: 40, bgcolor: 'grey.200' }}
                  >
                    {option.name?.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                      {option.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.code}
                    </Typography>
                  </Box>
                </Stack>
              </li>
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        </Box>

        {/* Add Button */}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddProduct}
          disabled={!selectedProduct || loading}
          sx={{
            height: 40,
            alignSelf: 'flex-start',
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          {t('addProduct')}
        </Button>
      </Box>

      {/* Products List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {products.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 120,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1.5,
              bgcolor: 'grey.50',
            }}
          >
            <Typography color="text.secondary" variant="body2">
              {t('noProductsYet')}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {products.map((item) => (
              <Box
                key={item.productId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: { xs: 1.5, sm: 2 },
                  p: { xs: 1.5, sm: 2 },
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  bgcolor: 'background.paper',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  },
                }}
              >
                {/* Product Image */}
                <Avatar
                  src={item.image}
                  variant="rounded"
                  sx={{
                    width: { xs: 48, sm: 56 },
                    height: { xs: 48, sm: 56 },
                    bgcolor: 'grey.200',
                    flexShrink: 0,
                  }}
                >
                  {item.name?.charAt(0) || 'P'}
                </Avatar>

                {/* Product Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      mb: 0.25,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.name || '--'}
                  </Typography>
                  {item.code && (
                    <Typography variant="caption" color="text.secondary">
                      {item.code}
                    </Typography>
                  )}
                </Box>

                {/* Delete Button */}
                <IconButton
                  size="small"
                  onClick={() => onRemoveProduct(item.productId)}
                  disabled={loading}
                  sx={{
                    color: 'error.main',
                    bgcolor: 'error.lighter',
                    flexShrink: 0,
                    '&:hover': {
                      bgcolor: 'error.light',
                      color: 'error.dark',
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      {/* Products Count */}
      {products.length > 0 && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 2, display: 'block', textAlign: 'right' }}
        >
          {t('totalProducts')}: {products.length}
        </Typography>
      )}
    </Card>
  );
}
