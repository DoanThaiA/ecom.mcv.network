import { Box } from '@mui/material';
import { useState } from 'react';
import type { CreateComboRequest } from 'src/types/gen/cms/cms/combos/combo';
import { ComboStatus, DiscountType } from 'src/types/gen/shared/shared/common/enums';
import { BasicInformationSection } from './components/basic-information-section';
import { ComboPricingSection } from './components/combo-pricing-section';
import { FormActionButtons } from './components/form-action-buttons';
import { SkuListSection, type ComboItemWithDetails } from './components/sku-list-section';

// ----------------------------------------------------------------------

interface ProductComboFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<CreateComboRequest>;
  onSubmit: (data: CreateComboRequest) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ProductComboForm({
  mode,
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
}: ProductComboFormProps) {
  // Form state using CreateComboRequest structure with enums
  const [formData, setFormData] = useState<Partial<CreateComboRequest>>({
    name: initialData.name || '',
    description: initialData.description,
    image: initialData.image,
    items: initialData.items || [],
    discountType: initialData.discountType || DiscountType.DISCOUNT_TYPE_FIXED,
    discountValue: initialData.discountValue || 0,
    status: initialData.status || ComboStatus.COMBO_STATUS_ACTIVE,
    validFrom: initialData.validFrom,
    validTo: initialData.validTo,
    nameLocalization: initialData.nameLocalization,
  });

  // Extended items with display details
  const [itemsWithDetails, setItemsWithDetails] = useState<ComboItemWithDetails[]>(
    initialData.items?.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
      name: item.productName || item.name,
      image: item.productImage || item.image,
    })) || []
  );

  const handleAddProduct = (product: ComboItemWithDetails) => {
    setItemsWithDetails([...itemsWithDetails, product]);
    setFormData({
      ...formData,
      items: [
        ...(formData.items || []),
        {
          productId: product.productId,
          quantity: product.quantity,
        },
      ],
    });
  };

  const handleRemoveProduct = (productId: string) => {
    setItemsWithDetails(itemsWithDetails.filter((item) => item.productId !== productId));
    setFormData({
      ...formData,
      items: formData.items?.filter((item) => item.productId !== productId) || [],
    });
  };

  const handleSubmit = (status: ComboStatus) => {
    onSubmit({
      ...formData,
      status,
    } as CreateComboRequest);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      {/* Scrollable Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: { xs: 2, sm: 3 },
        }}
      >
        {/* Basic Information Section */}
        <BasicInformationSection formData={formData} onChange={setFormData} loading={loading} />

        {/* Two column layout for desktop/tablet */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: 3,
          }}
        >
          {/* SKU in Combo Section */}
          <SkuListSection
            products={itemsWithDetails}
            onAddProduct={handleAddProduct}
            onRemoveProduct={handleRemoveProduct}
            loading={loading}
          />

          {/* Combo Pricing Section */}
          <ComboPricingSection formData={formData} onChange={setFormData} loading={loading} />
        </Box>
      </Box>

      {/* Sticky Action Buttons */}
      <Box
        sx={{
          flexShrink: 0,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
        }}
      >
        <FormActionButtons
          onCancel={onCancel}
          onSaveAndHide={() => handleSubmit(ComboStatus.COMBO_STATUS_INACTIVE)}
          onSaveAndShow={() => handleSubmit(ComboStatus.COMBO_STATUS_ACTIVE)}
          loading={loading}
        />
      </Box>
    </Box>
  );
}
