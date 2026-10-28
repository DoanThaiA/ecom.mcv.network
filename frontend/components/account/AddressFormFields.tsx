'use client';

import { Box, Flex, Text, Select, Switch } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { GoogleMapPicker } from '../map/GoogleMapPicker';
import { City, District, Ward } from '@/lib/repositories/address.repository';

export interface FormData {
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

interface AddressFormFieldsProps {
  formData: FormData;
  onFormChange: (_data: FormData) => void;
  errors: Record<string, string>;
  onErrorChange: (_errors: Record<string, string>) => void;
  cities: City[];
  availableDistricts: District[];
  availableWards: Ward[];
  coordinates: { lat: number; lng: number } | null;
  onCoordinatesChange: (_coords: { lat: number; lng: number } | null) => void;
  isGeocoding: boolean;
  showMapPicker?: boolean;
  mapHeight?: string;
  mode?: 'page' | 'dialog';
}

export function AddressFormFields({
  formData,
  onFormChange,
  errors,
  onErrorChange,
  cities,
  availableDistricts,
  availableWards,
  coordinates,
  onCoordinatesChange,
  isGeocoding,
  showMapPicker = true,
  mapHeight = '300px',
  mode = 'page',
}: AddressFormFieldsProps) {
  const t = useTranslations('addressBook');
  const tCommon = useTranslations('common');
  const tCart = useTranslations('cart');

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    onFormChange({ ...formData, [field]: value });
    // Clear error when user edits field
    if (errors[field]) {
      onErrorChange({ ...errors, [field]: '' });
    }
  };

  const inputClassName = (fieldName: string) => `
    w-full p-3 border rounded-lg
    ${errors[fieldName] ? 'border-red-500' : 'border-gray-200'}
  `.trim();

  const selectClassName = (fieldName: string) => `
    w-full h-10 rounded-lg
    ${errors[fieldName] ? 'border-red-500' : ''}
  `.trim();

  return (
    <Box className={mode === "dialog" ? "space-y-4" : ""}>
      {/* Full Name */}
      <Box className={mode === "page" ? "mb-4" : ""}>
        <Text className="text-sm text-gray-500 mb-2">
          {tCommon("form.fullName")} <span className="text-red-500">*</span>
        </Text>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => handleInputChange("fullName", e.target.value)}
          placeholder={tCommon("form.fullNamePlaceholder")}
          className={inputClassName("fullName")}
        />
        {errors.fullName && (
          <Text className="text-red-500 text-xs mt-1">{errors.fullName}</Text>
        )}
      </Box>

      {/* Phone Number */}
      <Box className={mode === "page" ? "mb-4" : ""}>
        <Text className="text-sm text-gray-500 mb-2">
          {tCommon("form.phone")} <span className="text-red-500">*</span>
        </Text>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          placeholder={tCommon("form.phonePlaceholder")}
          className={inputClassName("phone")}
        />
        {errors.phone && (
          <Text className="text-red-500 text-xs mt-1">{errors.phone}</Text>
        )}
      </Box>

      {/* Email */}
      <Box className={mode === "page" ? "mb-4" : ""}>
        <Text className="text-sm text-gray-500 mb-2">
          {tCommon("form.email")}
        </Text>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          placeholder={tCommon("form.emailPlaceholder")}
          className={inputClassName("email")}
        />
        {errors.email && (
          <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
        )}
      </Box>

      {/* Notes */}
      <Box className={mode === "page" ? "mb-4" : ""}>
        <Text className="text-sm text-gray-500 mb-2">{tCart("notes")}</Text>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          placeholder={tCart("notesPlaceholder")}
          className="w-full p-3 border border-gray-200 rounded-lg resize-none"
          rows={3}
        />
      </Box>

      {/* City */}
      <Box className={mode === "page" ? "mb-4" : ""}>
        <Text className="text-sm text-gray-500 mb-2">
          {tCommon("form.city")} <span className="text-red-500">*</span>
        </Text>
        <Select.Root
          value={formData.city}
          onValueChange={(value) => {
            const selectedCity = cities.find((c) => String(c.id) === value);
            onFormChange({
              ...formData,
              city: value,
              cityName: selectedCity?.name || "",
              district: "",
              districtName: "",
              ward: "",
              wardName: "",
            });
            if (errors.city) {
              onErrorChange({ ...errors, city: "" });
            }
          }}
        >
          <Select.Trigger
            placeholder={tCommon("form.cityPlaceholder")}
            className={selectClassName("city")}
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
      <Box className={mode === "page" ? "mb-4" : ""}>
        <Text className="text-sm text-gray-500 mb-2">
          {tCommon("form.district")} <span className="text-red-500">*</span>
        </Text>
        <Select.Root
          value={formData.district}
          onValueChange={(value) => {
            const selectedDistrict = availableDistricts.find(
              (d) => String(d.id) === value
            );
            onFormChange({
              ...formData,
              district: value,
              districtName: selectedDistrict?.name || "",
              ward: "",
              wardName: "",
            });
            if (errors.district) {
              onErrorChange({ ...errors, district: "" });
            }
          }}
          disabled={!formData.city || availableDistricts.length === 0}
        >
          <Select.Trigger
            placeholder={tCommon("form.districtPlaceholder")}
            className={selectClassName("district")}
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
      <Box className={mode === "page" ? "mb-4" : ""}>
        <Text className="text-sm text-gray-500 mb-2">
          {tCommon("form.ward")} <span className="text-red-500">*</span>
        </Text>
        <Select.Root
          value={formData.ward}
          onValueChange={(value) => {
            const selectedWard = availableWards.find(
              (w) => String(w.id) === value
            );
            onFormChange({
              ...formData,
              ward: value,
              wardName: selectedWard?.name || "",
            });
            if (errors.ward) {
              onErrorChange({ ...errors, ward: "" });
            }
          }}
          disabled={!formData.district || availableWards.length === 0}
        >
          <Select.Trigger
            placeholder={tCommon("form.wardPlaceholder")}
            className={selectClassName("ward")}
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
      <Box className={mode === "page" ? "mb-4" : ""}>
        <Text className="text-sm text-gray-500 mb-2">
          {t("streetAddress")} <span className="text-red-500">*</span>
        </Text>
        <input
          type="text"
          value={formData.street}
          onChange={(e) => handleInputChange("street", e.target.value)}
          placeholder={tCommon("form.streetPlaceholder")}
          className={inputClassName("street")}
        />
        {errors.street && (
          <Text className="text-red-500 text-xs mt-1">{errors.street}</Text>
        )}
      </Box>

      {/* Google Map */}
      {showMapPicker && (
        <Box className={mode === "page" ? "mb-4" : ""}>
          <Flex justify="between" align="center" className="mb-2">
            {isGeocoding && (
              <Text className="text-xs text-gray-400">
                {tCommon("status.geocoding")}
              </Text>
            )}
          </Flex>
          <Box className="w-full rounded-lg overflow-hidden border border-gray-200">
            <GoogleMapPicker
              onLocationSelect={(location) => onCoordinatesChange(location)}
              initialLocation={coordinates || undefined}
              height={mapHeight}
              showConfirmButton={false}
            />
          </Box>
        </Box>
      )}

      {/* Set as Default Toggle */}
      <Flex
        justify="between"
        align="center"
        className={mode === "page" ? "mb-4" : ""}
      >
        <Text className="text-sm text-gray-500">{t("setAsDefault")}</Text>
        <Switch
          checked={formData.isDefault}
          onCheckedChange={(checked) => handleInputChange("isDefault", checked)}
        />
      </Flex>
    </Box>
  );
}
