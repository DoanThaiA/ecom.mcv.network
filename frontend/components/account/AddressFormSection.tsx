'use client';

import { Box, Flex, Text, Button, Select, Switch } from '@radix-ui/themes';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCities,
  getDistricts,
  getWards,
  City,
  District,
  Ward,
  getMyShippingAddresses,
  addMyShippingAddress,
  updateMyShippingAddress,
  deleteMyShippingAddress,
  CreateAddress,
} from '@/lib/repositories/address.repository';
import { showSuccessToast, showErrorToast } from '@/lib/helpers/toastHelper';
import { GoogleMapPicker } from '../map/GoogleMapPicker';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { storageService } from '@/lib/services/storage.service';
import { geocodeAddress } from '@/lib/utils/geocoding';
import { isValidVNPhone, isValidEmail } from '@/lib/utils/validation';
import isEmpty from 'lodash/isEmpty';

interface AddressFormSectionProps {
  addressId?: string;
  locale: string;
}

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  notes: string;
  street: string;
  city: string;
  cityName: string;
  district: string;
  districtName: string;
  ward: string;
  wardName: string;
  isDefault: boolean;
}

export function AddressFormSection({ addressId, locale }: AddressFormSectionProps) {
  const t = useTranslations('addressBook');
  const tCommon = useTranslations('common');
  const tCart = useTranslations('cart');
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    notes: '',
    street: '',
    city: '',
    cityName: '',
    district: '',
    districtName: '',
    ward: '',
    wardName: '',
    isDefault: false,
  });

  const [cities, setCities] = useState<City[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<District[]>([]);
  const [availableWards, setAvailableWards] = useState<Ward[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const lastGeocodedAddress = useRef<string>('');

  // Load address data for edit mode
  useEffect(() => {
    const loadAddress = async () => {
      if (addressId) {
        setIsLoading(true);
        try {
          if (!storageService.isAuthenticated()) {
            const localAddresses = storageService.getShippingAddresses();
            const address = localAddresses.find((a) => a.id === addressId);
            if (address) {
              setFormData({
                fullName: address.fullName,
                phone: address.phone,
                email: address.email || '',
                notes: address.notes || '',
                street: address.street,
                city: address.city,
                cityName: address.cityName || '',
                district: address.district,
                districtName: address.districtName || '',
                ward: address.ward,
                wardName: address.wardName || '',
                isDefault: address.isDefault,
              });
            }
          } else {
            const addresses = await getMyShippingAddresses();
            const address = addresses.find((a) => a.id === addressId);
            if (address) {
              setFormData({
                fullName: address.fullName,
                phone: address.phone,
                email: address.email || '',
                notes: address.notes || '',
                street: address.street,
                city: String(address.cityId),
                cityName: address.cityName,
                district: String(address.districtId),
                districtName: address.districtName,
                ward: String(address.wardId),
                wardName: address.wardName,
                isDefault: address.isDefault,
              });
            }
          }
        } catch {
          showErrorToast(tCommon('errors.loadFailed'));
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadAddress();
  }, [addressId]);

  // Fetch cities on mount
  useEffect(() => {
    getCities().then(setCities);
  }, []);

  // Fetch districts when city changes
  useEffect(() => {
    const fetchDistrictsForCity = async () => {
      if (formData.city) {
        const cityId = parseInt(formData.city);
        if (!isNaN(cityId)) {
          const districts = await getDistricts(cityId);
          setAvailableDistricts(districts);
        } else {
          setAvailableDistricts([]);
        }
      } else {
        setAvailableDistricts([]);
        setFormData((prev) => ({ ...prev, district: '', ward: '' }));
      }
    };

    fetchDistrictsForCity();
  }, [formData.city]);

  // Fetch wards when district changes
  useEffect(() => {
    const fetchWardsForDistrict = async () => {
      if (formData.district) {
        const districtId = parseInt(formData.district);
        if (!isNaN(districtId)) {
          const wards = await getWards(districtId);
          setAvailableWards(wards);
        } else {
          setAvailableWards([]);
        }
      } else {
        setAvailableWards([]);
        setFormData((prev) => ({ ...prev, ward: '' }));
      }
    };

    fetchWardsForDistrict();
  }, [formData.district]);

  // Auto-geocode when all address fields are complete
  useEffect(() => {
    const autoGeocode = async () => {
      // Only geocode if all required fields are filled
      if (
        formData.street &&
        formData.cityName &&
        formData.districtName &&
        formData.wardName
      ) {
        // Create a unique key for this address
        const addressKey = `${formData.street}|${formData.wardName}|${formData.districtName}|${formData.cityName}`;

        // Skip if we already geocoded this exact address
        if (addressKey === lastGeocodedAddress.current) {
          return;
        }

        setIsGeocoding(true);

        const result = await geocodeAddress(
          formData.street,
          formData.wardName,
          formData.districtName,
          formData.cityName
        );

        if (result) {
          setCoordinates({
            lat: result.lat,
            lng: result.lng,
          });
          lastGeocodedAddress.current = addressKey;
        }

        setIsGeocoding(false);
      }
    };

    // Debounce to avoid too many API calls
    const timeoutId = setTimeout(autoGeocode, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData.street, formData.cityName, formData.districtName, formData.wardName]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = tCommon('errors.required');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = tCommon('errors.required');
    } else if (!isValidVNPhone(formData.phone.trim())) {
      newErrors.phone = tCommon('errors.phoneInvalid');
    }

    if (formData.email.trim() && !isValidEmail(formData.email.trim())) {
      newErrors.email = tCommon('errors.emailInvalid');
    }

    if (!formData.street.trim()) {
      newErrors.street = tCommon('errors.required');
    }

    if (!formData.city) {
      newErrors.city = tCommon('errors.required');
    }

    if (!formData.district) {
      newErrors.district = tCommon('errors.required');
    }

    if (!formData.ward) {
      newErrors.ward = tCommon('errors.required');
    }

    setErrors(newErrors);
    return isEmpty(newErrors);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showErrorToast(tCommon('errors.saveFailed'));
      return;
    }

    setIsSaving(true);

    try {
      if (!storageService.isAuthenticated()) {
        // Save to localStorage for non-authenticated users
        if (addressId) {
          storageService.updateShippingAddress(addressId, formData);
        } else {
          storageService.addShippingAddress(formData);
        }
        showSuccessToast(tCommon('success.saved'));
        router.push(`/${locale}/account/addresses`);
        return;
      }

      const addressData: CreateAddress = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email || undefined,
        notes: formData.notes || undefined,
        street: formData.street,
        cityId: parseInt(formData.city),
        cityName: formData.cityName,
        districtId: parseInt(formData.district),
        districtName: formData.districtName,
        wardId: parseInt(formData.ward),
        wardName: formData.wardName,
        isDefault: formData.isDefault,
      };

      if (addressId) {
        await updateMyShippingAddress(addressId, addressData);
      } else {
        await addMyShippingAddress(addressData);
      }

      showSuccessToast(tCommon('success.saved'));
      router.push(`/${locale}/account/addresses`);
    } catch {
      showErrorToast(tCommon('errors.saveAddressFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!addressId) return;

    try {
      if (!storageService.isAuthenticated()) {
        storageService.deleteShippingAddress(addressId);
        showSuccessToast(tCommon('success.deleted'));
        router.push(`/${locale}/account/addresses`);
        return;
      }

      await deleteMyShippingAddress(addressId);
      showSuccessToast(tCommon('success.deleted'));
      router.push(`/${locale}/account/addresses`);
    } catch {
      showErrorToast(tCommon('errors.deleteAddressFailed'));
    }
  };

  if (isLoading) {
    return (
      <Box className="min-h-screen bg-white flex items-center justify-center">
        <Text>{tCommon('status.loading')}</Text>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-white">
      <Box className="max-w-[800px] mx-auto">
        {/* Header */}
        <Box className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <Flex align="center" className="px-4 py-4 sm:px-8 lg:px-[60px]">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="cursor-pointer"
          >
            <ChevronLeftIcon width="24" height="24" />
          </Button>
          <Text className="flex-1 text-center text-base font-semibold">
            {t('pageTitle')}
          </Text>
          <Box className="w-6" />
        </Flex>
      </Box>

      {/* Form Content */}
      <Box className="px-4 py-6 sm:px-8 lg:px-[60px]">
        {/* Full Name */}
        <Box className="mb-4">
          <Text className="text-sm text-gray-500 mb-2">
            {tCommon('form.fullName')} <span className="text-red-500">*</span>
          </Text>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => {
              setFormData({ ...formData, fullName: e.target.value });
              if (errors.fullName) {
                setErrors({ ...errors, fullName: '' });
              }
            }}
            placeholder={tCommon('form.fullNamePlaceholder')}
            className={`w-full p-3 border rounded-lg ${
              errors.fullName ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.fullName && (
            <Text className="text-red-500 text-xs mt-1">{errors.fullName}</Text>
          )}
        </Box>

        {/* Phone Number */}
        <Box className="mb-4">
          <Text className="text-sm text-gray-500 mb-2">
            {tCommon('form.phone')} <span className="text-red-500">*</span>
          </Text>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => {
              setFormData({ ...formData, phone: e.target.value });
              if (errors.phone) {
                setErrors({ ...errors, phone: '' });
              }
            }}
            placeholder={tCommon('form.phonePlaceholder')}
            className={`w-full p-3 border rounded-lg ${
              errors.phone ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.phone && (
            <Text className="text-red-500 text-xs mt-1">{errors.phone}</Text>
          )}
        </Box>

        {/* Email */}
        <Box className="mb-4">
          <Text className="text-sm text-gray-500 mb-2">
            {tCommon('form.email')}
          </Text>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (errors.email) {
                setErrors({ ...errors, email: '' });
              }
            }}
            placeholder={tCommon('form.emailPlaceholder')}
            className={`w-full p-3 border rounded-lg ${
              errors.email ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.email && (
            <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
          )}
        </Box>

        {/* Notes */}
        <Box className="mb-4">
          <Text className="text-sm text-gray-500 mb-2">
            {tCart('notes')}
          </Text>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder={tCart('notesPlaceholder')}
            className="w-full p-3 border border-gray-200 rounded-lg resize-none"
            rows={3}
          />
        </Box>

        {/* City */}
        <Box className="mb-4">
          <Text className="text-sm text-gray-500 mb-2">
            {tCommon('form.city')} <span className="text-red-500">*</span>
          </Text>
          <Select.Root
            value={formData.city}
            onValueChange={(value) => {
              const selectedCity = cities.find((c) => String(c.id) === value);
              setFormData({
                ...formData,
                city: value,
                cityName: selectedCity?.name || '',
                district: '',
                districtName: '',
                ward: '',
                wardName: '',
              });
              if (errors.city) {
                setErrors({ ...errors, city: '' });
              }
            }}
          >
            <Select.Trigger
              placeholder={tCommon('form.cityPlaceholder')}
              className={`w-full h-10 rounded-lg ${errors.city ? 'border-red-500' : ''}`}
            />
            <Select.Content>
              {cities.map((city) => (
                <Select.Item key={city.id} value={String(city.id)}>
                  {city.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          {errors.city && (
            <Text className="text-red-500 text-xs mt-1">{errors.city}</Text>
          )}
        </Box>

        {/* District */}
        <Box className="mb-4">
          <Text className="text-sm text-gray-500 mb-2">
            {tCommon('form.district')} <span className="text-red-500">*</span>
          </Text>
          <Select.Root
            value={formData.district}
            onValueChange={(value) => {
              const selectedDistrict = availableDistricts.find(
                (d) => String(d.id) === value
              );
              setFormData({
                ...formData,
                district: value,
                districtName: selectedDistrict?.name || '',
                ward: '',
                wardName: '',
              });
              if (errors.district) {
                setErrors({ ...errors, district: '' });
              }
            }}
            disabled={!formData.city || isEmpty(availableDistricts)}
          >
            <Select.Trigger
              placeholder={tCommon('form.districtPlaceholder')}
              className={`w-full h-10 rounded-lg ${errors.district ? 'border-red-500' : ''}`}
            />
            <Select.Content>
              {availableDistricts.map((district) => (
                <Select.Item key={district.id} value={String(district.id)}>
                  {district.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          {errors.district && (
            <Text className="text-red-500 text-xs mt-1">{errors.district}</Text>
          )}
        </Box>

        {/* Ward */}
        <Box className="mb-4">
          <Text className="text-sm text-gray-500 mb-2">
            {tCommon('form.ward')} <span className="text-red-500">*</span>
          </Text>
          <Select.Root
            value={formData.ward}
            onValueChange={(value) => {
              const selectedWard = availableWards.find((w) => String(w.id) === value);
              setFormData({
                ...formData,
                ward: value,
                wardName: selectedWard?.name || '',
              });
              if (errors.ward) {
                setErrors({ ...errors, ward: '' });
              }
            }}
            disabled={!formData.district || isEmpty(availableWards)}
          >
            <Select.Trigger
              placeholder={tCommon('form.wardPlaceholder')}
              className={`w-full h-10 rounded-lg ${errors.ward ? 'border-red-500' : ''}`}
            />
            <Select.Content>
              {availableWards.map((ward) => (
                <Select.Item key={ward.id} value={String(ward.id)}>
                  {ward.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          {errors.ward && (
            <Text className="text-red-500 text-xs mt-1">{errors.ward}</Text>
          )}
        </Box>

        {/* Street Address */}
        <Box className="mb-4">
          <Text className="text-sm text-gray-500 mb-2">
            {t('streetAddress')} <span className="text-red-500">*</span>
          </Text>
          <input
            type="text"
            value={formData.street}
            onChange={(e) => {
              setFormData({ ...formData, street: e.target.value });
              if (errors.street) {
                setErrors({ ...errors, street: '' });
              }
            }}
            placeholder={tCommon('form.streetPlaceholder')}
            className={`w-full p-3 border rounded-lg ${
              errors.street ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.street && (
            <Text className="text-red-500 text-xs mt-1">{errors.street}</Text>
          )}
        </Box>

        {/* Google Map */}
        <Box className="mb-4">
          <Flex justify="between" align="center" className="mb-2">
            {isGeocoding && (
              <Text className="text-xs text-gray-400">
                {tCommon('status.geocoding')}
              </Text>
            )}
          </Flex>
          <Box className="w-full rounded-lg overflow-hidden border border-gray-200">
            <GoogleMapPicker
              onLocationSelect={(location) => {
                setCoordinates(location);
              }}
              initialLocation={coordinates || undefined}
              height="300px"
              showConfirmButton={false}
            />
          </Box>
        </Box>

        {/* Set as Default Toggle */}
        <Flex justify="between" align="center" className="mb-4">
          <Text className="text-sm text-gray-500">{t('setAsDefault')}</Text>
          <Switch
            checked={formData.isDefault}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isDefault: checked })
            }
          />
        </Flex>
      </Box>

      {/* Bottom Actions */}
      <Box className="bg-white border-t border-gray-200 p-4 sm:px-8 lg:px-[60px]">
        <Flex gap="3" justify="center">
          {addressId && (
            <ConfirmDialog
              title={t('deleteAddress')}
              description={t('deleteConfirm')}
              confirmText={tCommon('buttons.delete')}
              onConfirm={handleDelete}
              variant="danger"
              trigger={
                <Button
                  variant="outline"
                  className="w-[181px] h-12 rounded-[40px] px-4 py-3 border border-[#F0F0F0] text-black uppercase cursor-pointer"
                >
                  {t('deleteAddress').toUpperCase()}
                </Button>
              }
            />
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-[181px] h-12 rounded-[40px] px-4 py-3 text-white uppercase cursor-pointer"
            style={{
              background: 'linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)',
              border: '1px solid transparent'
            }}
          >
            {isSaving ? tCommon('status.saving') : tCommon('buttons.confirm').toUpperCase()}
          </Button>
        </Flex>
      </Box>
      </Box>
    </Box>
  );
}
