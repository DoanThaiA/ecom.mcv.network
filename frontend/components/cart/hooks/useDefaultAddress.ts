import { getMyShippingAddresses } from '@/lib/repositories/address.repository';
import { useCallback, useEffect, useState } from 'react';
import { ShippingFormData } from '../CartShippingInfo';

export interface UseDefaultAddressReturn {
  addressFormData: ShippingFormData | null;
  isLoadingAddress: boolean;
}

export function useDefaultAddress(
  isAuthenticated: boolean,
  shouldFetch: boolean,
): UseDefaultAddressReturn {
  const [addressFormData, setAddressFormData] =
    useState<ShippingFormData | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const loadDefaultAddress = useCallback(async () => {
    // Only fetch if authenticated and explicitly allowed
    if (!isAuthenticated || !shouldFetch) {
      setAddressFormData(null);
      return;
    }

    setIsLoadingAddress(true);
    try {
      const addresses = await getMyShippingAddresses();

      // Find default address or use first one
      const defaultAddr =
        addresses.find((addr) => addr.isDefault) || addresses[0];

      if (defaultAddr) {
        const formData: ShippingFormData = {
          fullName: defaultAddr.fullName,
          phone: defaultAddr.phone,
          email: defaultAddr.email || '',
          notes: defaultAddr.notes || '',
          street: defaultAddr.street,
          city: defaultAddr.cityId?.toString() || '',
          district: defaultAddr.districtId?.toString() || '',
          ward: defaultAddr.wardId?.toString() || '',
        };
        setAddressFormData(formData);
      } else {
        setAddressFormData(null);
      }
    } catch {
      // Failed to load default address
      setAddressFormData(null);
    } finally {
      setIsLoadingAddress(false);
    }
  }, [isAuthenticated, shouldFetch]);

  useEffect(() => {
    loadDefaultAddress();
  }, [loadDefaultAddress]);

  return {
    addressFormData,
    isLoadingAddress,
  };
}
