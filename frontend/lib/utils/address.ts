import {
  getCities,
  getDistricts,
  getWards,
} from '@/lib/repositories/address.repository';
import { CheckoutSessionAddress } from '@/types/gen/shop/shared/checkout-sessions/checkout-session';
import { ShippingFormData } from '@/components/cart/CartShippingInfo';

/**
 * Builds shipping address payload with progressive enhancement
 * - Sends partial data if available (e.g., city + street without district/ward)
 * - Uses hierarchical validation (district requires city, ward requires district)
 * - Gracefully handles location name fetch failures
 */
export async function buildPartialShippingAddress(
  formData: ShippingFormData,
): Promise<CheckoutSessionAddress | undefined> {
  const cityId = formData.city ? parseInt(formData.city) : NaN;
  const districtId = formData.district ? parseInt(formData.district) : NaN;
  const wardId = formData.ward ? parseInt(formData.ward) : NaN;
  const street = formData.street?.trim();

  // Check if we have ANY address data to send
  const hasAnyAddressData =
    !isNaN(cityId) || !isNaN(districtId) || !isNaN(wardId) || street;

  if (!hasAnyAddressData) {
    return undefined; // No address data at all
  }

  // Initialize address payload
  const address: CheckoutSessionAddress = {};

  // Always include street if provided (independent of location IDs)
  if (street) {
    address.address = street;
  }

  // Level 1: City (independent - can exist alone)
  if (!isNaN(cityId) && cityId > 0) {
    address.cityId = cityId;

    try {
      const cities = await getCities();
      const city = cities.find((c) => c.id === cityId);
      if (city) {
        address.city = city.name;
      }
    } catch {
      // Failed to fetch city name - send ID only
    }
  }

  // Level 2: District (requires valid city)
  if (!isNaN(districtId) && districtId > 0 && !isNaN(cityId) && cityId > 0) {
    address.districtId = districtId;

    try {
      const districts = await getDistricts(cityId);
      const district = districts.find((d) => d.id === districtId);
      if (district) {
        address.district = district.name;
      }
    } catch {
      // Failed to fetch district name - send ID only
    }
  }

  // Level 3: Ward (requires valid district and city)
  if (
    !isNaN(wardId) &&
    wardId > 0 &&
    !isNaN(districtId) &&
    districtId > 0 &&
    !isNaN(cityId) &&
    cityId > 0
  ) {
    address.wardId = wardId;

    try {
      const wards = await getWards(districtId);
      const ward = wards.find((w) => w.id === wardId);
      if (ward) {
        address.ward = ward.name;
      }
    } catch {
      // Failed to fetch ward name - send ID only
    }
  }

  // Return undefined if address object is empty (all fetches failed and no street)
  return Object.keys(address).length > 0 ? address : undefined;
}
