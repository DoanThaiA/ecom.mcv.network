import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LocationOption {
  id: number | string;
  name: string;
}

interface LocationState {
  cities: LocationOption[];
  districts: LocationOption[];
  wards: LocationOption[];
  loadingCities: boolean;
  loadingDistricts: boolean;
  loadingWards: boolean;
  error: string | null;
  selectedCity: string;
  selectedDistrict: string;
}

const initialState: LocationState = {
  cities: [],
  districts: [],
  wards: [],
  loadingCities: false,
  loadingDistricts: false,
  loadingWards: false,
  error: null,
  selectedCity: '',
  selectedDistrict: '',
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    // Fetch cities
    fetchCitiesRequest: (state) => {
      state.loadingCities = true;
      state.error = null;
    },
    fetchCitiesSuccess: (state, action: PayloadAction<LocationOption[]>) => {
      state.loadingCities = false;
      state.cities = action.payload;
    },
    fetchCitiesFailure: (state, action: PayloadAction<string>) => {
      state.loadingCities = false;
      state.error = action.payload;
    },

    // Fetch districts
    fetchDistrictsRequest: (state, action: PayloadAction<string>) => {
      state.loadingDistricts = true;
      state.selectedCity = action.payload;
      state.error = null;
      // Reset districts and wards when city changes
      state.districts = [];
      state.wards = [];
      state.selectedDistrict = '';
    },
    fetchDistrictsSuccess: (state, action: PayloadAction<LocationOption[]>) => {
      state.loadingDistricts = false;
      state.districts = action.payload;
    },
    fetchDistrictsFailure: (state, action: PayloadAction<string>) => {
      state.loadingDistricts = false;
      state.error = action.payload;
    },

    // Fetch wards
    fetchWardsRequest: (state, action: PayloadAction<string>) => {
      state.loadingWards = true;
      state.selectedDistrict = action.payload;
      state.error = null;
      // Reset wards when district changes
      state.wards = [];
    },
    fetchWardsSuccess: (state, action: PayloadAction<LocationOption[]>) => {
      state.loadingWards = false;
      state.wards = action.payload;
    },
    fetchWardsFailure: (state, action: PayloadAction<string>) => {
      state.loadingWards = false;
      state.error = action.payload;
    },

    // Reset location state
    resetLocationState: (state) => {
      state.districts = [];
      state.wards = [];
      state.selectedCity = '';
      state.selectedDistrict = '';
    },
  },
});

export const {
  fetchCitiesRequest,
  fetchCitiesSuccess,
  fetchCitiesFailure,
  fetchDistrictsRequest,
  fetchDistrictsSuccess,
  fetchDistrictsFailure,
  fetchWardsRequest,
  fetchWardsSuccess,
  fetchWardsFailure,
  resetLocationState,
} = locationSlice.actions;

export default locationSlice.reducer;
