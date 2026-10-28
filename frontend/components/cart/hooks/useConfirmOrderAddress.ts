import {
  Address,
  getMyShippingAddresses,
} from '@/lib/repositories/address.repository';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ShippingFormData } from '../CartShippingInfo';

interface UseConfirmOrderAddressProps {
  isAuthenticated: boolean;
  checkoutSessionId?: string;
  updateCheckoutSession: (_formData: ShippingFormData) => Promise<void>;
  shouldFetchAddresses?: boolean;
}

export function useConfirmOrderAddress({
  isAuthenticated,
  checkoutSessionId,
  updateCheckoutSession,
  shouldFetchAddresses = true,
}: UseConfirmOrderAddressProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string;

  const [shippingAddresses, setShippingAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [shippingFormData, setShippingFormData] = useState<ShippingFormData>({
    fullName: '',
    phone: '',
    email: '',
    notes: '',
    street: '',
    city: '',
    district: '',
    ward: '',
  });
  const [isAddressLoaded, setIsAddressLoaded] = useState(false);

  // Debounce ref for notes field (500ms delay)
  const debounceNotesTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load shipping addresses (for authenticated users)
  const loadAddresses = useCallback(async () => {
    // Only fetch addresses if explicitly allowed (prevents fetching on mobile cart page)
    if (isAuthenticated && shouldFetchAddresses) {
      try {
        const addresses = await getMyShippingAddresses();
        setShippingAddresses(addresses);
        console.log('[useConfirmOrderAddress] Addresses loaded:', addresses.length);

        const defaultAddr =
          addresses.find((addr) => addr.isDefault) || addresses[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
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
          setShippingFormData(formData);
          console.log('[useConfirmOrderAddress] Set default address, checkoutSessionId:', checkoutSessionId);
          // Auto-update checkout session with default address (only if session exists)
          if (checkoutSessionId) {
            console.log('[useConfirmOrderAddress] Updating checkout session with address');
            await updateCheckoutSession(formData);
          } else {
            console.log('[useConfirmOrderAddress] Skipping updateCheckoutSession (no session ID yet)');
          }
        }
        console.log('[useConfirmOrderAddress] Setting isAddressLoaded = true');
        setIsAddressLoaded(true);
      } catch {
        // Failed to load addresses - mark as loaded to proceed gracefully
        console.log('[useConfirmOrderAddress] Error loading addresses, setting isAddressLoaded = true anyway');
        setIsAddressLoaded(true);
      }
    } else {
      // Not fetching addresses (guest user or mobile), mark as immediately ready
      console.log('[useConfirmOrderAddress] Not fetching addresses (guest or mobile), setting isAddressLoaded = true');
      setIsAddressLoaded(true);
    }
  }, [isAuthenticated, shouldFetchAddresses, updateCheckoutSession, checkoutSessionId]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleSelectAddress = async (addressId: string) => {
    setSelectedAddressId(addressId);
    const address = shippingAddresses.find((addr) => addr.id === addressId);
    if (address) {
      const formData: ShippingFormData = {
        fullName: address.fullName,
        phone: address.phone,
        email: address.email || '',
        notes: address.notes || '',
        street: address.street,
        city: address.cityId?.toString() || '',
        district: address.districtId?.toString() || '',
        ward: address.wardId?.toString() || '',
      };
      setShippingFormData(formData);
      await updateCheckoutSession(formData);
    }
  };

  const handleEditAddress = (addressId: string) => {
    router.push(`/${locale}/account/addresses/${addressId}`);
  };

  const handleAddNewAddress = () => {
    router.push(`/${locale}/account/addresses/new`);
  };

  const handleNotesChange = (notes: string) => {
    const newData = { ...shippingFormData, notes };
    setShippingFormData(newData);

    // Clear previous timer
    if (debounceNotesTimerRef.current) {
      clearTimeout(debounceNotesTimerRef.current);
    }

    // Debounce notes update by 500ms
    debounceNotesTimerRef.current = setTimeout(() => {
      updateCheckoutSession(newData);
    }, 500);
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceNotesTimerRef.current) {
        clearTimeout(debounceNotesTimerRef.current);
      }
    };
  }, []);

  return {
    shippingAddresses,
    selectedAddressId,
    shippingFormData,
    setShippingFormData,
    handleSelectAddress,
    handleEditAddress,
    handleAddNewAddress,
    handleNotesChange,
    isAddressLoaded,
  };
}
