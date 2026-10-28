import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { ShippingFeeSettingsData } from 'src/types/shipping-fee-config';
import { getDefaultShippingFeeSettings } from 'src/types/shipping-fee-config';

/**
 * Shipping Fee Config State - Simplified for settings page only
 */
export interface ShippingFeeConfigState {
  isEditMode: boolean;
  settings: ShippingFeeSettingsData;
  originalSettings: ShippingFeeSettingsData | null;
  settingsLoading: boolean;
}

const initialState: ShippingFeeConfigState = {
  isEditMode: false,
  settings: getDefaultShippingFeeSettings(),
  originalSettings: null,
  settingsLoading: false,
};

/**
 * Shipping Fee Config Slice
 */
export const shippingFeeConfigSlice = createSlice({
  name: 'shippingFeeConfig',
  initialState,
  reducers: {
    // Edit mode
    setEditMode: (state, action: PayloadAction<boolean>) => {
      state.isEditMode = action.payload;
      if (action.payload) {
        // Entering edit mode - save original settings for cancel
        state.originalSettings = { ...state.settings };
      }
    },

    cancelEdit: (state) => {
      state.isEditMode = false;
      // Restore original settings
      if (state.originalSettings) {
        state.settings = state.originalSettings;
      }
      state.originalSettings = null;
    },

    // Settings
    setSettings: (state, action: PayloadAction<ShippingFeeSettingsData>) => {
      state.settings = action.payload;
    },

    setSettingsLoading: (state, action: PayloadAction<boolean>) => {
      state.settingsLoading = action.payload;
    },

    saveSettingsSuccess: (state) => {
      state.isEditMode = false;
      state.originalSettings = null;
      state.settingsLoading = false;
    },
  },
});

export const { setEditMode, cancelEdit, setSettings, setSettingsLoading, saveSettingsSuccess } =
  shippingFeeConfigSlice.actions;

/**
 * Selectors
 */
export const selectIsEditMode = (state: { shippingFeeConfig: ShippingFeeConfigState }) =>
  state.shippingFeeConfig.isEditMode;

export const selectSettings = (state: { shippingFeeConfig: ShippingFeeConfigState }) =>
  state.shippingFeeConfig.settings;

export const selectSettingsLoading = (state: { shippingFeeConfig: ShippingFeeConfigState }) =>
  state.shippingFeeConfig.settingsLoading;

export default shippingFeeConfigSlice.reducer;
