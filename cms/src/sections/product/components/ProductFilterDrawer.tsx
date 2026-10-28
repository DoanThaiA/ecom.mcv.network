import { useTranslation } from 'react-i18next';

import { Box, Typography } from '@mui/material';

import {
  FilterCheckbox,
  FilterDrawer,
  FilterRangeInput,
  FilterSelect,
  type RangeValue,
  type SelectOption,
} from 'src/components/filter';
import { ProductStatus } from 'src/types/gen/shared/shared/common/enums';

import { CategoryMultiSelect } from './CategoryMultiSelect';

// ----------------------------------------------------------------------

export interface ProductFilterValues {
  // Category section
  categoryIds: string[];
  // Price section
  priceType: string;
  priceRange: RangeValue;
  // Stock section
  stockType: string;
  stockByParent: boolean;
  stockRange: RangeValue;
  // Status section
  inventoryStatus: string;
  sellingStatus: ProductStatus | '';
}

export const defaultProductFilterValues: ProductFilterValues = {
  categoryIds: [],
  priceType: '',
  priceRange: {},
  stockType: '',
  stockByParent: false,
  stockRange: {},
  inventoryStatus: '',
  sellingStatus: '',
};

interface ProductFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: ProductFilterValues;
  onFiltersChange: (filters: ProductFilterValues) => void;
  onApply: () => void;
  onClear: () => void;
}

// Price type options
const priceTypeOptions: SelectOption[] = [
  { value: 'import', label: 'costPrice' },
  { value: 'retail', label: 'sellingPrice' },
  { value: 'old', label: 'oldPrice' },
  { value: 'wholesale', label: 'wholesalePrice' },
];

// Stock type options
const stockTypeOptions: SelectOption[] = [
  { value: 'remain', label: 'stock' },
  { value: 'available', label: 'inStock' },
  { value: 'canSell', label: 'canSell' },
];

// Inventory status options
const inventoryStatusOptions: SelectOption[] = [
  { value: 'inTransit', label: 'inTransit' },
  { value: 'inWarehouse', label: 'inWarehouse' },
  { value: 'onHold', label: 'onHold' },
  { value: 'defective', label: 'defective' },
  { value: 'canSellZero', label: 'canSellZero' },
  { value: 'canSellPositive', label: 'canSellPositive' },
  { value: 'preOrder', label: 'pre_order' },
];

// Selling status options
const sellingStatusOptions: SelectOption[] = [
  { value: '', label: 'allStatus' },
  { value: 'unspecified', label: 'noStatus' },
  { value: ProductStatus.PRODUCT_STATUS_NEW, label: 'new' },
  { value: ProductStatus.PRODUCT_STATUS_ACTIVE, label: 'selling' },
  { value: ProductStatus.PRODUCT_STATUS_DISCONTINUED, label: 'stopped' },
  { value: ProductStatus.PRODUCT_STATUS_OUT_OF_STOCK, label: 'outOfStock' },
];

// Section Title component
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="subtitle2"
      sx={{
        fontWeight: 600,
        fontSize: '14px',
        color: 'text.primary',
        mb: 1.5,
      }}
    >
      {children}
    </Typography>
  );
}

export function ProductFilterDrawer({
  open,
  onClose,
  filters,
  onFiltersChange,
  onApply,
  onClear,
}: ProductFilterDrawerProps) {
  const { t } = useTranslation();

  const handleCategoryIdsChange = (ids: string[]) => {
    onFiltersChange({ ...filters, categoryIds: ids });
  };

  const handlePriceTypeChange = (value: string | number) => {
    onFiltersChange({ ...filters, priceType: value as string });
  };

  const handlePriceRangeChange = (value: RangeValue) => {
    onFiltersChange({ ...filters, priceRange: value });
  };

  const handleStockTypeChange = (value: string | number) => {
    onFiltersChange({ ...filters, stockType: value as string });
  };

  const handleStockByParentChange = (checked: boolean) => {
    onFiltersChange({ ...filters, stockByParent: checked });
  };

  const handleStockRangeChange = (value: RangeValue) => {
    onFiltersChange({ ...filters, stockRange: value });
  };

  const handleInventoryStatusChange = (value: string | number) => {
    onFiltersChange({ ...filters, inventoryStatus: value as string });
  };

  const handleSellingStatusChange = (value: string | number) => {
    onFiltersChange({
      ...filters,
      sellingStatus: value === '' ? '' : (value as ProductStatus),
    });
  };

  return (
    <FilterDrawer open={open} onClose={onClose} onApply={onApply} onClear={onClear}>
      {/* Category Section */}
      <Box sx={{ mb: 3 }}>
        <SectionTitle>{t('category')}</SectionTitle>
        <CategoryMultiSelect value={filters.categoryIds} onChange={handleCategoryIdsChange} />
      </Box>

      {/* Price Section */}
      <Box sx={{ mb: 3 }}>
        <SectionTitle>{t('price')}</SectionTitle>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <FilterSelect
            value={filters.priceType}
            options={priceTypeOptions}
            onChange={handlePriceTypeChange}
            placeholder="pleaseSelect"
          />
          <FilterRangeInput
            value={filters.priceRange}
            onChange={handlePriceRangeChange}
            placeholderFrom="priceFrom"
            placeholderTo="priceTo"
          />
        </Box>
      </Box>

      {/* Stock Section */}
      <Box sx={{ mb: 3 }}>
        <SectionTitle>{t('stock')}</SectionTitle>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <FilterSelect
            value={filters.stockType}
            options={stockTypeOptions}
            onChange={handleStockTypeChange}
            placeholder="pleaseSelect"
          />
          <FilterCheckbox
            label="stockByParent"
            checked={filters.stockByParent}
            onChange={handleStockByParentChange}
          />
          <FilterRangeInput
            value={filters.stockRange}
            onChange={handleStockRangeChange}
            placeholderFrom="stockFrom"
            placeholderTo="stockTo"
          />
        </Box>
      </Box>

      {/* Status Section */}
      <Box>
        <SectionTitle>{t('status')}</SectionTitle>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <FilterSelect
            value={filters.inventoryStatus}
            options={inventoryStatusOptions}
            onChange={handleInventoryStatusChange}
            placeholder="inventoryStatusFilter"
          />
          <FilterSelect
            value={filters.sellingStatus}
            options={sellingStatusOptions}
            onChange={handleSellingStatusChange}
            placeholder="sellingStatusFilter"
          />
        </Box>
      </Box>
    </FilterDrawer>
  );
}
