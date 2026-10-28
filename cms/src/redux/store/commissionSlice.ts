import { createAction, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CommissionSettingsResponse } from 'src/types/gen/shared/shared/commission-settings/commission-settings';
import type { ProductCommission } from 'src/types/gen/shared/shared/product-commissions/product-commission';

// ----------------------------------------------------------------------
// State Interface
// ----------------------------------------------------------------------

export interface CommissionState {
  // Settings
  settings: CommissionSettingsResponse | null;
  settingsLoading: boolean;

  // Products (Global)
  products: ProductCommission[];
  productsLoading: boolean;

  // Pagination (Global)
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };

  // Search
  searchQuery: string;

  // Operation loadings (Global)
  updateSettingsLoading: boolean;
  addProductsLoading: boolean;
  updateProductLoading: boolean;
  bulkUpdateLoading: boolean;
  deleteProductLoading: boolean;

  // Recalculation
  recalculationJobId: string | null;

  // Affiliate-specific products
  affiliateProducts: ProductCommission[];
  affiliateProductsLoading: boolean;

  // Affiliate pagination
  affiliatePagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };

  // Affiliate operation loadings
  affiliateAddProductsLoading: boolean;
  affiliateUpdateProductLoading: boolean;
  affiliateBulkUpdateLoading: boolean;
  affiliateDeleteProductLoading: boolean;

  // All affiliate product IDs (for dialog pre-selection, no pagination)
  affiliateAllProductIds: string[];
  affiliateAllProductIdsLoading: boolean;
}

const initialState: CommissionState = {
  settings: null,
  settingsLoading: false,
  products: [],
  productsLoading: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
  },
  searchQuery: '',
  updateSettingsLoading: false,
  addProductsLoading: false,
  updateProductLoading: false,
  bulkUpdateLoading: false,
  deleteProductLoading: false,
  recalculationJobId: null,
  // Affiliate-specific
  affiliateProducts: [],
  affiliateProductsLoading: false,
  affiliatePagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
  },
  affiliateAddProductsLoading: false,
  affiliateUpdateProductLoading: false,
  affiliateBulkUpdateLoading: false,
  affiliateDeleteProductLoading: false,
  affiliateAllProductIds: [],
  affiliateAllProductIdsLoading: false,
};

// ----------------------------------------------------------------------
// Saga Action Payload Types
// ----------------------------------------------------------------------

export type GetCommissionSettingsPayload = {
  onSuccess?: () => void;
};

export type UpdateCommissionSettingsPayload = {
  data: {
    defaultCommissionRate?: number;
    autoUpdateProducts?: boolean;
    commissionTrigger?: string;
  };
  onSuccess?: () => void;
};

export type GetProductCommissionsPayload = {
  page?: number;
  limit?: number;
  search?: string;
  categoryNames?: string[];
};

export type AddProductCommissionsPayload = {
  products: Array<{ productId: string }>;
  onSuccess?: () => void;
};

export type UpdateProductCommissionPayload = {
  productId: string;
  rate: number;
  onSuccess?: () => void;
};

export type BulkUpdateProductCommissionsPayload = {
  productIds: string[];
  rate: number;
  onSuccess?: () => void;
};

export type DeleteProductCommissionPayload = {
  productId: string;
};

// Affiliate-specific payload types
export type GetAffiliateProductCommissionsPayload = {
  affiliateId: string;
  page?: number;
  limit?: number;
  search?: string;
};

export type AddAffiliateProductCommissionsPayload = {
  affiliateId: string;
  products: Array<{ productId: string; commissionRate: number }>;
  onSuccess?: () => void;
};

export type UpdateAffiliateProductCommissionPayload = {
  affiliateId: string;
  productId: string;
  rate: number;
  onSuccess?: () => void;
};

export type BulkUpdateAffiliateProductCommissionsPayload = {
  affiliateId: string;
  productIds: string[];
  rate: number;
  onSuccess?: () => void;
};

export type DeleteAffiliateProductCommissionPayload = {
  affiliateId: string;
  productId: string;
  onSuccess?: () => void;
};

export type BulkDeleteAffiliateProductCommissionsPayload = {
  affiliateId: string;
  productIds: string[];
  onSuccess?: () => void;
};

// ----------------------------------------------------------------------
// Saga Actions
// ----------------------------------------------------------------------

export const getCommissionSettingsRequest = createAction<GetCommissionSettingsPayload>(
  'commission/getSettingsRequest'
);

export const updateCommissionSettingsRequest = createAction<UpdateCommissionSettingsPayload>(
  'commission/updateSettingsRequest'
);

export const getProductCommissionsRequest = createAction<GetProductCommissionsPayload>(
  'commission/getProductsRequest'
);

export const addProductCommissionsRequest = createAction<AddProductCommissionsPayload>(
  'commission/addProductsRequest'
);

export const updateProductCommissionRequest = createAction<UpdateProductCommissionPayload>(
  'commission/updateProductRequest'
);

export const bulkUpdateProductCommissionsRequest =
  createAction<BulkUpdateProductCommissionsPayload>('commission/bulkUpdateRequest');

export const deleteProductCommissionRequest = createAction<DeleteProductCommissionPayload>(
  'commission/deleteProductRequest'
);

// Affiliate-specific saga actions
export const getAffiliateProductCommissionsRequest =
  createAction<GetAffiliateProductCommissionsPayload>('commission/getAffiliateProductsRequest');

export const addAffiliateProductCommissionsRequest =
  createAction<AddAffiliateProductCommissionsPayload>('commission/addAffiliateProductsRequest');

export const updateAffiliateProductCommissionRequest =
  createAction<UpdateAffiliateProductCommissionPayload>('commission/updateAffiliateProductRequest');

export const bulkUpdateAffiliateProductCommissionsRequest =
  createAction<BulkUpdateAffiliateProductCommissionsPayload>(
    'commission/bulkUpdateAffiliateProductsRequest'
  );

export const deleteAffiliateProductCommissionRequest =
  createAction<DeleteAffiliateProductCommissionPayload>('commission/deleteAffiliateProductRequest');

export const bulkDeleteAffiliateProductCommissionsRequest =
  createAction<BulkDeleteAffiliateProductCommissionsPayload>(
    'commission/bulkDeleteAffiliateProductsRequest'
  );

export type GetAffiliateProductIdsPayload = {
  affiliateId: string;
  onSuccess?: () => void;
};

export const getAffiliateProductIdsRequest = createAction<GetAffiliateProductIdsPayload>(
  'commission/getAffiliateProductIdsRequest'
);

// ----------------------------------------------------------------------
// Redux Slice
// ----------------------------------------------------------------------

export const commissionSlice = createSlice({
  name: 'commission',
  initialState,
  reducers: {
    // Settings reducers
    setSettingsLoading: (state, action: PayloadAction<boolean>) => {
      state.settingsLoading = action.payload;
    },

    setSettingsSuccess: (state, action: PayloadAction<CommissionSettingsResponse>) => {
      state.settings = action.payload;
      state.settingsLoading = false;
    },

    setSettingsError: (state) => {
      state.settingsLoading = false;
    },

    // Update settings reducers
    setUpdateSettingsLoading: (state, action: PayloadAction<boolean>) => {
      state.updateSettingsLoading = action.payload;
    },

    setUpdateSettingsSuccess: (state, action: PayloadAction<CommissionSettingsResponse>) => {
      state.settings = action.payload;
      state.updateSettingsLoading = false;
    },

    setUpdateSettingsError: (state) => {
      state.updateSettingsLoading = false;
    },

    // Products reducers
    setProductsLoading: (state, action: PayloadAction<boolean>) => {
      state.productsLoading = action.payload;
    },

    setProductsSuccess: (
      state,
      action: PayloadAction<{
        products: ProductCommission[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNextPage: boolean;
        };
      }>
    ) => {
      state.products = action.payload.products;
      state.pagination = action.payload.pagination;
      state.productsLoading = false;
    },

    setProductsError: (state) => {
      state.productsLoading = false;
    },

    // Add products reducers
    setAddProductsLoading: (state, action: PayloadAction<boolean>) => {
      state.addProductsLoading = action.payload;
    },

    setAddProductsSuccess: (state) => {
      state.addProductsLoading = false;
    },

    setAddProductsError: (state) => {
      state.addProductsLoading = false;
    },

    // Update product reducers
    setUpdateProductLoading: (state, action: PayloadAction<boolean>) => {
      state.updateProductLoading = action.payload;
    },

    setUpdateProductSuccess: (state) => {
      state.updateProductLoading = false;
    },

    setUpdateProductError: (state) => {
      state.updateProductLoading = false;
    },

    // Bulk update reducers
    setBulkUpdateLoading: (state, action: PayloadAction<boolean>) => {
      state.bulkUpdateLoading = action.payload;
    },

    setBulkUpdateSuccess: (state) => {
      state.bulkUpdateLoading = false;
    },

    setBulkUpdateError: (state) => {
      state.bulkUpdateLoading = false;
    },

    // Delete product reducers
    setDeleteProductLoading: (state, action: PayloadAction<boolean>) => {
      state.deleteProductLoading = action.payload;
    },

    setDeleteProductSuccess: (state) => {
      state.deleteProductLoading = false;
    },

    setDeleteProductError: (state) => {
      state.deleteProductLoading = false;
    },

    // Recalculation job
    setRecalculationJobId: (state, action: PayloadAction<string | null>) => {
      state.recalculationJobId = action.payload;
    },

    // Search query
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    // Reset state
    resetCommissionState: (state) => {
      state.settings = null;
      state.products = [];
      state.pagination = initialState.pagination;
      state.searchQuery = '';
      state.recalculationJobId = null;
    },

    // ----------------------------------------------------------------------
    // Affiliate-specific reducers
    // ----------------------------------------------------------------------

    // Get affiliate products reducers
    setAffiliateProductsLoading: (state, action: PayloadAction<boolean>) => {
      state.affiliateProductsLoading = action.payload;
    },

    setAffiliateProductsSuccess: (
      state,
      action: PayloadAction<{
        products: ProductCommission[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNextPage: boolean;
        };
      }>
    ) => {
      state.affiliateProducts = action.payload.products;
      state.affiliatePagination = action.payload.pagination;
      state.affiliateProductsLoading = false;
    },

    setAffiliateProductsError: (state) => {
      state.affiliateProductsLoading = false;
    },

    // Add affiliate products reducers
    setAffiliateAddProductsLoading: (state, action: PayloadAction<boolean>) => {
      state.affiliateAddProductsLoading = action.payload;
    },

    setAffiliateAddProductsSuccess: (state) => {
      state.affiliateAddProductsLoading = false;
    },

    setAffiliateAddProductsError: (state) => {
      state.affiliateAddProductsLoading = false;
    },

    // Update affiliate product reducers
    setAffiliateUpdateProductLoading: (state, action: PayloadAction<boolean>) => {
      state.affiliateUpdateProductLoading = action.payload;
    },

    setAffiliateUpdateProductSuccess: (state) => {
      state.affiliateUpdateProductLoading = false;
    },

    setAffiliateUpdateProductError: (state) => {
      state.affiliateUpdateProductLoading = false;
    },

    // Bulk update affiliate products reducers
    setAffiliateBulkUpdateLoading: (state, action: PayloadAction<boolean>) => {
      state.affiliateBulkUpdateLoading = action.payload;
    },

    setAffiliateBulkUpdateSuccess: (state) => {
      state.affiliateBulkUpdateLoading = false;
    },

    setAffiliateBulkUpdateError: (state) => {
      state.affiliateBulkUpdateLoading = false;
    },

    // Delete affiliate product reducers
    setAffiliateDeleteProductLoading: (state, action: PayloadAction<boolean>) => {
      state.affiliateDeleteProductLoading = action.payload;
    },

    setAffiliateDeleteProductSuccess: (state) => {
      state.affiliateDeleteProductLoading = false;
    },

    setAffiliateDeleteProductError: (state) => {
      state.affiliateDeleteProductLoading = false;
    },

    // Reset affiliate products
    resetAffiliateProducts: (state) => {
      state.affiliateProducts = [];
      state.affiliatePagination = initialState.affiliatePagination;
    },

    // Affiliate all product IDs reducers (for dialog pre-selection)
    setAffiliateAllProductIdsLoading: (state, action: PayloadAction<boolean>) => {
      state.affiliateAllProductIdsLoading = action.payload;
    },

    setAffiliateAllProductIdsSuccess: (state, action: PayloadAction<string[]>) => {
      state.affiliateAllProductIds = action.payload;
      state.affiliateAllProductIdsLoading = false;
    },

    setAffiliateAllProductIdsError: (state) => {
      state.affiliateAllProductIdsLoading = false;
    },
  },
});

// ----------------------------------------------------------------------
// Export Actions
// ----------------------------------------------------------------------

export const {
  setSettingsLoading,
  setSettingsSuccess,
  setSettingsError,
  setUpdateSettingsLoading,
  setUpdateSettingsSuccess,
  setUpdateSettingsError,
  setProductsLoading,
  setProductsSuccess,
  setProductsError,
  setAddProductsLoading,
  setAddProductsSuccess,
  setAddProductsError,
  setUpdateProductLoading,
  setUpdateProductSuccess,
  setUpdateProductError,
  setBulkUpdateLoading,
  setBulkUpdateSuccess,
  setBulkUpdateError,
  setDeleteProductLoading,
  setDeleteProductSuccess,
  setDeleteProductError,
  setRecalculationJobId,
  setSearchQuery,
  resetCommissionState,
  // Affiliate-specific actions
  setAffiliateProductsLoading,
  setAffiliateProductsSuccess,
  setAffiliateProductsError,
  setAffiliateAddProductsLoading,
  setAffiliateAddProductsSuccess,
  setAffiliateAddProductsError,
  setAffiliateUpdateProductLoading,
  setAffiliateUpdateProductSuccess,
  setAffiliateUpdateProductError,
  setAffiliateBulkUpdateLoading,
  setAffiliateBulkUpdateSuccess,
  setAffiliateBulkUpdateError,
  setAffiliateDeleteProductLoading,
  setAffiliateDeleteProductSuccess,
  setAffiliateDeleteProductError,
  resetAffiliateProducts,
  setAffiliateAllProductIdsLoading,
  setAffiliateAllProductIdsSuccess,
  setAffiliateAllProductIdsError,
} = commissionSlice.actions;

// ----------------------------------------------------------------------
// Selectors
// ----------------------------------------------------------------------

export const selectCommissionSettings = (state: { commission: CommissionState }) =>
  state.commission.settings;

export const selectCommissionProducts = (state: { commission: CommissionState }) =>
  state.commission.products;

export const selectSettingsLoading = (state: { commission: CommissionState }) =>
  state.commission.settingsLoading;

export const selectProductsLoading = (state: { commission: CommissionState }) =>
  state.commission.productsLoading;

export const selectPagination = (state: { commission: CommissionState }) =>
  state.commission.pagination;

export const selectSearchQuery = (state: { commission: CommissionState }) =>
  state.commission.searchQuery;

export const selectUpdateSettingsLoading = (state: { commission: CommissionState }) =>
  state.commission.updateSettingsLoading;

export const selectAddProductsLoading = (state: { commission: CommissionState }) =>
  state.commission.addProductsLoading;

export const selectUpdateProductLoading = (state: { commission: CommissionState }) =>
  state.commission.updateProductLoading;

export const selectBulkUpdateLoading = (state: { commission: CommissionState }) =>
  state.commission.bulkUpdateLoading;

export const selectDeleteProductLoading = (state: { commission: CommissionState }) =>
  state.commission.deleteProductLoading;

export const selectRecalculationJobId = (state: { commission: CommissionState }) =>
  state.commission.recalculationJobId;

export const selectIsRecalculating = (state: { commission: CommissionState }) =>
  state.commission.settings?.isRecalculating || false;

// Affiliate-specific selectors
export const selectAffiliateProducts = (state: { commission: CommissionState }) =>
  state.commission.affiliateProducts;

export const selectAffiliateProductsLoading = (state: { commission: CommissionState }) =>
  state.commission.affiliateProductsLoading;

export const selectAffiliatePagination = (state: { commission: CommissionState }) =>
  state.commission.affiliatePagination;

export const selectAffiliateAddProductsLoading = (state: { commission: CommissionState }) =>
  state.commission.affiliateAddProductsLoading;

export const selectAffiliateUpdateProductLoading = (state: { commission: CommissionState }) =>
  state.commission.affiliateUpdateProductLoading;

export const selectAffiliateBulkUpdateLoading = (state: { commission: CommissionState }) =>
  state.commission.affiliateBulkUpdateLoading;

export const selectAffiliateDeleteProductLoading = (state: { commission: CommissionState }) =>
  state.commission.affiliateDeleteProductLoading;

export const selectAffiliateAllProductIds = (state: { commission: CommissionState }) =>
  state.commission.affiliateAllProductIds;

export const selectAffiliateAllProductIdsLoading = (state: { commission: CommissionState }) =>
  state.commission.affiliateAllProductIdsLoading;

export default commissionSlice.reducer;
