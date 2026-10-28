import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getDistricts,
  getWards,
  City,
  District,
  Ward,
  CreateAddress,
  addMyShippingAddress,
  updateMyShippingAddress,
} from '@/lib/repositories/address.repository';
import { storageService } from '@/lib/services/storage.service';
import { showSuccessToast, showErrorToast } from '@/lib/helpers/toastHelper';
import { geocodeAddress } from '@/lib/utils/geocoding';
import { isValidVNPhone, isValidEmail } from '@/lib/utils/validation';
import isEmpty from 'lodash/isEmpty';
import { FormData } from '@/components/account/AddressFormFields';

export const initialFormData: FormData = {
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
};

interface UseAddressFormProps {
  cities: City[];
  editingAddressId: string | null;
  onSaveSuccess: () => Promise<void>;
  isAuthenticated: boolean;
  t: (_key: string) => string;
}

export function useAddressForm({
  cities,
  editingAddressId,
  onSaveSuccess,
  isAuthenticated,
  t,
}: UseAddressFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableDistricts, setAvailableDistricts] = useState<District[]>([]);
  const [availableWards, setAvailableWards] = useState<Ward[]>([]);
  const lastGeocodedAddress = useRef<string>('');

  // Fetch districts when city changes
  useEffect(() => {
    const fetchDistricts = async () => {
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
      }
    };

    fetchDistricts();
  }, [formData.city]);

  // Fetch wards when district changes
  useEffect(() => {
    const fetchWards = async () => {
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
      }
    };

    fetchWards();
  }, [formData.district]);

  // Auto-geocode when all address fields are complete
  useEffect(() => {
    const autoGeocode = async () => {
      if (
        formData.street &&
        formData.cityName &&
        formData.districtName &&
        formData.wardName
      ) {
        const addressKey = `${formData.street}|${formData.wardName}|${formData.districtName}|${formData.cityName}`;

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

    const timeoutId = setTimeout(autoGeocode, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData.street, formData.cityName, formData.districtName, formData.wardName]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t('errors.required');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('errors.required');
    } else if (!isValidVNPhone(formData.phone.trim())) {
      newErrors.phone = t('errors.phoneInvalid');
    }

    if (formData.email.trim() && !isValidEmail(formData.email.trim())) {
      newErrors.email = t('errors.emailInvalid');
    }

    if (!formData.street.trim()) {
      newErrors.street = t('errors.required');
    }

    if (!formData.city) {
      newErrors.city = t('errors.required');
    }

    if (!formData.district) {
      newErrors.district = t('errors.required');
    }

    if (!formData.ward) {
      newErrors.ward = t('errors.required');
    }

    setErrors(newErrors);
    return isEmpty(newErrors);
  }, [formData, t]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      showErrorToast(t('errors.saveFailed'));
      return false;
    }

    setIsSaving(true);

    try {
      if (!isAuthenticated) {
        // Save to localStorage for non-authenticated users
        if (editingAddressId) {
          storageService.updateShippingAddress(editingAddressId, formData);
        } else {
          storageService.addShippingAddress(formData);
        }
      } else {
        // Save via API for authenticated users
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

        if (editingAddressId) {
          await updateMyShippingAddress(editingAddressId, addressData);
        } else {
          await addMyShippingAddress(addressData);
        }
      }

      showSuccessToast(t('success.saved'));
      await onSaveSuccess();
      return true;
    } catch {
      showErrorToast(t('errors.saveAddressFailed'));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [formData, editingAddressId, isAuthenticated, validateForm, onSaveSuccess, t]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    setCoordinates(null);
    setAvailableDistricts([]);
    setAvailableWards([]);
    lastGeocodedAddress.current = '';
  }, []);

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    coordinates,
    setCoordinates,
    isGeocoding,
    isSaving,
    availableDistricts,
    availableWards,
    validateForm,
    handleSave,
    resetForm,
  };
}
