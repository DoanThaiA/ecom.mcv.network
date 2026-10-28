/* eslint-disable no-console */
import axiosInstance from "@/lib/axios";
import type {
  Address as ProtoAddress,
  CreateAddress as ProtoCreateAddress,
  UpdateAddress as ProtoUpdateAddress,
} from "@/types/gen/shop/shop/addresses/address";

// Re-export proto types with Date conversion
export interface Address extends Omit<ProtoAddress, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAddress extends Omit<ProtoCreateAddress, "isDefault"> {
  isDefault?: boolean;
}

export interface UpdateAddress extends ProtoUpdateAddress {}

/**
 * Address/Location types
 */
export interface City {
  id: number;
  name: string;
}

export interface District {
  id: number;
  name: string;
}

export interface Ward {
  id: number;
  name: string;
}

interface LocationListResponse {
  data?: Array<{ id: number; name: string }>;
}

/**
 * Cache structure with TTL (24 hours to match server-side cache)
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// In-memory cache
const locationCache = {
  cities: null as CacheEntry<City[]> | null,
  districts: new Map<number, CacheEntry<District[]>>(), // cityId -> districts
  wards: new Map<number, CacheEntry<Ward[]>>(), // districtId -> wards
};

// In-flight request tracking (to prevent duplicate API calls)
const inFlightRequests = {
  cities: null as Promise<City[]> | null,
  districts: new Map<number, Promise<District[]>>(), // cityId -> promise
  wards: new Map<number, Promise<Ward[]>>(), // districtId -> promise
};

/**
 * Check if cache entry is still valid
 */
function isCacheValid<T>(
  entry: CacheEntry<T> | null | undefined
): entry is CacheEntry<T> {
  if (!entry) return false;
  return Date.now() - entry.timestamp < CACHE_TTL;
}

/**
 * Clear all location cache (useful for testing or manual refresh)
 */
export function clearLocationCache() {
  locationCache.cities = null;
  locationCache.districts.clear();
  locationCache.wards.clear();
  inFlightRequests.cities = null;
  inFlightRequests.districts.clear();
  inFlightRequests.wards.clear();
}

/**
 * Fetch all cities for shipping address selection
 * GET /shop/shipping/locations/cities
 * Data is cached for 24 hours with request deduplication
 */
export async function getCities(): Promise<City[]> {
  // Return cached data if valid
  if (isCacheValid(locationCache.cities)) {
    console.log("Using cached cities data");
    return locationCache.cities.data;
  }

  // Return in-flight request if one exists (prevents duplicate calls)
  if (inFlightRequests.cities) {
    console.log("Waiting for in-flight cities request");
    return inFlightRequests.cities;
  }

  // Create new request and track it
  const request = (async () => {
    try {
      console.log("Fetching cities from API");
      const response = await axiosInstance.get<LocationListResponse>(
        "/shop/shipping/locations/cities"
      );
      // Handle both response.data.data and response.data formats
      const cities =
        response.data.data ||
        (Array.isArray(response.data) ? response.data : []);

      // Cache the result
      locationCache.cities = {
        data: cities as City[],
        timestamp: Date.now(),
      };

      return cities as City[];
    } catch (error) {
      console.error("Failed to fetch cities:", error);
      // Return empty array on error, or cached data if available (even if expired)
      return locationCache.cities?.data || [];
    } finally {
      // Clear in-flight request
      inFlightRequests.cities = null;
    }
  })();

  // Track the in-flight request
  inFlightRequests.cities = request;
  return request;
}

/**
 * Fetch districts for a specific city
 * GET /shop/shipping/locations/districts?cityId={cityId}
 * Data is cached for 24 hours with request deduplication
 */
export async function getDistricts(cityId: number): Promise<District[]> {
  // Return cached data if valid
  const cachedEntry = locationCache.districts.get(cityId);
  if (isCacheValid(cachedEntry)) {
    return cachedEntry.data;
  }

  // Return in-flight request if one exists (prevents duplicate calls)
  const inFlightRequest = inFlightRequests.districts.get(cityId);
  if (inFlightRequest) {
    return inFlightRequest;
  }

  // Create new request and track it
  const request = (async () => {
    try {
      const response = await axiosInstance.get<LocationListResponse>(
        "/shop/shipping/locations/districts",
        {
          params: { cityId },
        }
      );
      // Handle both response.data.data and response.data formats
      const districts =
        response.data.data ||
        (Array.isArray(response.data) ? response.data : []);

      // Cache the result
      locationCache.districts.set(cityId, {
        data: districts as District[],
        timestamp: Date.now(),
      });

      return districts as District[];
    } catch (error) {
      // Return empty array on error, or cached data if available (even if expired)
      const fallbackEntry = locationCache.districts.get(cityId);
      return fallbackEntry?.data || [];
    } finally {
      // Clear in-flight request
      inFlightRequests.districts.delete(cityId);
    }
  })();

  // Track the in-flight request
  inFlightRequests.districts.set(cityId, request);
  return request;
}

/**
 * Fetch wards for a specific district
 * GET /shop/shipping/locations/wards?districtId={districtId}
 * Data is cached for 24 hours with request deduplication
 */
export async function getWards(districtId: number): Promise<Ward[]> {
  // Return cached data if valid
  const cachedEntry = locationCache.wards.get(districtId);
  if (isCacheValid(cachedEntry)) {
    return cachedEntry.data;
  }

  // Return in-flight request if one exists (prevents duplicate calls)
  const inFlightRequest = inFlightRequests.wards.get(districtId);
  if (inFlightRequest) {
    return inFlightRequest;
  }

  // Create new request and track it
  const request = (async () => {
    try {
      const response = await axiosInstance.get<LocationListResponse>(
        "/shop/shipping/locations/wards",
        {
          params: { districtId },
        }
      );
      // Handle both response.data.data and response.data formats
      const wards =
        response.data.data ||
        (Array.isArray(response.data) ? response.data : []);

      // Cache the result
      locationCache.wards.set(districtId, {
        data: wards as Ward[],
        timestamp: Date.now(),
      });

      return wards as Ward[];
    } catch (error) {
      console.error(
        `Failed to fetch wards for districtId ${districtId}:`,
        error
      );
      // Return empty array on error, or cached data if available (even if expired)
      const fallbackEntry = locationCache.wards.get(districtId);
      return fallbackEntry?.data || [];
    } finally {
      // Clear in-flight request
      inFlightRequests.wards.delete(districtId);
    }
  })();

  // Track the in-flight request
  inFlightRequests.wards.set(districtId, request);
  return request;
}

/**
 * Get all addresses for the current user
 * GET /addresses
 */
export async function getMyShippingAddresses(): Promise<Address[]> {
  try {
    const response = await axiosInstance.get<Address[]>("/addresses");
    return response.data || [];
  } catch (error) {
    console.error("Failed to get addresses:", error);
    return [];
  }
}

/**
 * Add a new address for the current user
 * POST /addresses
 */
export async function addMyShippingAddress(
  data: CreateAddress
): Promise<Address> {
  try {
    const response = await axiosInstance.post<Address>("/addresses", data);
    return response.data;
  } catch (error) {
    console.error("Failed to add address:", error);
    throw error;
  }
}

/**
 * Update an existing address
 * PUT /addresses/:id
 */
export async function updateMyShippingAddress(
  id: string,
  data: Partial<CreateAddress>
): Promise<Address> {
  try {
    const response = await axiosInstance.put<Address>(`/addresses/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to update address:", error);
    throw error;
  }
}

/**
 * Delete an address
 * DELETE /addresses/:id
 */
export async function deleteMyShippingAddress(id: string): Promise<void> {
  try {
    await axiosInstance.delete(`/addresses/${id}`);
  } catch (error) {
    console.error("Failed to delete address:", error);
    throw error;
  }
}

/**
 * Set an address as default
 * PUT /addresses/:id/set-default
 */
export async function setDefaultMyShippingAddress(
  id: string
): Promise<Address> {
  try {
    const response = await axiosInstance.put<Address>(
      `/addresses/${id}/set-default`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to set default address:", error);
    throw error;
  }
}
