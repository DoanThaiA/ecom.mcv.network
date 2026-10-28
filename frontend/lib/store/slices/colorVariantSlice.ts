import type { ColorVariant } from '@/types/colorVariant';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';
import forEach from 'lodash/forEach';

/**
 * Color Variant State
 */
export interface ColorVariantState {
  variants: ColorVariant[];
  variantsByName: Record<string, ColorVariant>;
}

const initialState: ColorVariantState = {
  variants: [],
  variantsByName: {},
};

/**
 * Saga Actions
 */
export const fetchColorVariantsRequest = createAction(
  'colorVariant/fetchColorVariantsRequest'
);

/**
 * Color Variant Slice
 */
export const colorVariantSlice = createSlice({
  name: 'colorVariant',
  initialState,
  reducers: {
    fetchColorVariantsSuccess: (
      state,
      action: PayloadAction<ColorVariant[]>
    ) => {
      const variants = action.payload || [];
      state.variants = variants;

      // Build variantsByName map for O(1) lookup
      state.variantsByName = {};
      forEach(variants, (variant) => {
        const normalizedName =
          variant.nameNormalized || variant.name.toLowerCase().trim();
        state.variantsByName[normalizedName] = variant;
      });
    },

    resetColorVariantState: () => initialState,
  },
});

export const { fetchColorVariantsSuccess, resetColorVariantState } =
  colorVariantSlice.actions;

/**
 * Selectors
 */
export const selectColorVariants = (state: {
  colorVariant: ColorVariantState;
}) => state.colorVariant.variants;

export const selectColorVariantsByName = (state: {
  colorVariant: ColorVariantState;
}) => state.colorVariant.variantsByName;

export const selectColorVariantByName =
  (name: string) =>
  (state: { colorVariant: ColorVariantState }): ColorVariant | undefined => {
    const normalizedName = name.toLowerCase().trim();
    return state.colorVariant.variantsByName[normalizedName];
  };

export default colorVariantSlice.reducer;
