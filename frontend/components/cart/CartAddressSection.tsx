'use client';

import { Box, Flex, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { OrderAddress as CreateOrderAddress } from '@/types/gen/shop/shared/orders/order';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  fetchCitiesRequest,
  fetchDistrictsRequest,
  fetchWardsRequest,
} from '@/lib/store/slices/locationSlice';

interface CartAddressSectionProps {
  address: CreateOrderAddress;
  onAddressChange: (_newAddress: CreateOrderAddress) => void;
}

export function CartAddressSection({
  address,
  onAddressChange,
}: CartAddressSectionProps) {
  const tCommon = useTranslations('common');
  const dispatch = useAppDispatch();

  // Get location data from Redux store
  const {
    cities,
    districts,
    wards,
    loadingCities,
    loadingDistricts,
    loadingWards,
  } = useAppSelector((state) => state.location);

  // Fetch cities on mount
  useEffect(() => {
    dispatch(fetchCitiesRequest());
  }, [dispatch]);

  // Fetch districts when city changes
  useEffect(() => {
    if (address.city) {
      dispatch(fetchDistrictsRequest(address.city));
      // Reset district and ward when city changes
      if (address.district) {
        onAddressChange({ ...address, district: '', ward: '' });
      }
    }
  }, [address.city, dispatch]);

  // Fetch wards when district changes
  useEffect(() => {
    if (address.district) {
      dispatch(fetchWardsRequest(address.district));
      // Reset ward when district changes
      if (address.ward) {
        onAddressChange({ ...address, ward: '' });
      }
    }
  }, [address.district, dispatch]);

  const handleChange = (field: keyof CreateOrderAddress, value: string) => {
    onAddressChange({
      ...address,
      [field]: value,
    });
  };

  return (
    <Box className="bg-white p-4">
      <Text weight="medium" className="text-black mb-3">
        {tCommon('order.shippingAddress')}
      </Text>

      <Flex direction="column" gap="3">
        {/* Street */}
        <Box>
          <Text size="2" className="text-gray-700 mb-1">
            {tCommon('form.street')} <span className="text-red-500">*</span>
          </Text>
          <input
            type="text"
            value={address.street}
            onChange={(e) => handleChange('street', e.target.value)}
            placeholder={tCommon('form.streetPlaceholder')}
            className="w-full p-3 border border-gray-300 rounded-lg text-black placeholder-gray-400"
            style={{
              backgroundColor: 'white',
              borderWidth: '1px',
            }}
          />
        </Box>

        {/* City */}
        <Box>
          <Text size="2" className="text-gray-700 mb-1">
            {tCommon('form.city')} <span className="text-red-500">*</span>
          </Text>
          <select
            value={address.city}
            onChange={(e) => handleChange('city', e.target.value)}
            disabled={loadingCities}
            className="w-full p-3 border border-gray-300 rounded-lg text-black"
            style={{
              backgroundColor: 'white',
              borderWidth: '1px',
            }}
          >
            <option value="">{loadingCities ? tCommon('status.loading') : tCommon('form.cityPlaceholder')}</option>
            {cities.map((city) => (
              <option key={city.id} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        </Box>

        {/* District */}
        <Box>
          <Text size="2" className="text-gray-700 mb-1">
            {tCommon('form.district')}
          </Text>
          <select
            value={address.district || ''}
            onChange={(e) => handleChange('district', e.target.value)}
            disabled={loadingDistricts || !address.city}
            className="w-full p-3 border border-gray-300 rounded-lg text-black"
            style={{
              backgroundColor: 'white',
              borderWidth: '1px',
            }}
          >
            <option value="">{loadingDistricts ? tCommon('status.loading') : tCommon('form.districtPlaceholder')}</option>
            {districts.map((district) => (
              <option key={district.id} value={district.name}>
                {district.name}
              </option>
            ))}
          </select>
        </Box>

        {/* Ward */}
        <Box>
          <Text size="2" className="text-gray-700 mb-1">
            {tCommon('form.ward')}
          </Text>
          <select
            value={address.ward || ''}
            onChange={(e) => handleChange('ward', e.target.value)}
            disabled={loadingWards || !address.district}
            className="w-full p-3 border border-gray-300 rounded-lg text-black"
            style={{
              backgroundColor: 'white',
              borderWidth: '1px',
            }}
          >
            <option value="">{loadingWards ? tCommon('status.loading') : tCommon('form.wardPlaceholder')}</option>
            {wards.map((ward) => (
              <option key={ward.id} value={ward.name}>
                {ward.name}
              </option>
            ))}
          </select>
        </Box>
      </Flex>
    </Box>
  );
}
