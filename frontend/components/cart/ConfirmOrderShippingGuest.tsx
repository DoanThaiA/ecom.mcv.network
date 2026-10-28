'use client';

import { City, District, Ward } from '@/lib/repositories/address.repository';
import { Box, Flex, Select, Text } from '@radix-ui/themes';
import isEmpty from 'lodash/isEmpty';
import { useTranslations } from 'next-intl';
import { ShippingFormData } from './CartShippingInfo';

interface ConfirmOrderShippingGuestProps {
  shippingFormData: ShippingFormData;
  cities: City[];
  availableDistricts: District[];
  availableWards: Ward[];
  onFormDataChange: (_data: ShippingFormData) => void;
  fieldErrors?: Record<string, string>;
  onClearFieldError?: (_fieldName: string) => void;
  isPaymentProcessing?: boolean;
}

export function ConfirmOrderShippingGuest({
  shippingFormData,
  cities,
  availableDistricts,
  availableWards,
  onFormDataChange,
  fieldErrors,
  onClearFieldError,
  isPaymentProcessing = false,
}: ConfirmOrderShippingGuestProps) {
  const t = useTranslations('orderDetail');
  const tCommon = useTranslations('common');
  const tCart = useTranslations('cart');

  const handleFieldChange = (field: keyof ShippingFormData, value: string) => {
    const newData = { ...shippingFormData, [field]: value };

    // Reset dependent fields when city/district changes
    if (field === 'city') {
      newData.district = '';
      newData.ward = '';
    } else if (field === 'district') {
      newData.ward = '';
    }

    onFormDataChange(newData);
  };

  return (
    <Box className="rounded-2xl p-4 sm:p-6 mb-4">
      <Text className="text-base sm:text-lg font-bold text-black mb-4">
        {t("shippingInfo") || "Thông tin vận chuyển"}
      </Text>

      <Flex direction="column" gap="4">
        {/* Full Name */}
        <Box>
          <Text size="2" className="text-gray-700 mb-1">
            {tCommon("form.fullName")} <Text color="red">*</Text>
          </Text>
          <input
            type="text"
            value={shippingFormData.fullName}
            onChange={(e) => {
              handleFieldChange("fullName", e.target.value);
              // Error will clear when API validates successfully
            }}
            placeholder={tCommon("form.fullNamePlaceholder")}
            disabled={isPaymentProcessing}
            className={`w-full p-3 border rounded-[32px] text-black placeholder-gray-400 ${
              fieldErrors?.fullName ? "border-red-500" : "border-gray-300"
            } ${isPaymentProcessing ? "bg-gray-100 cursor-not-allowed" : ""}`}
            style={{ backgroundColor: isPaymentProcessing ? "#f3f4f6" : "white", borderWidth: "1px" }}
          />
          {fieldErrors?.fullName && (
            <Text className="text-red-500 text-xs mt-1">
              {fieldErrors.fullName}
            </Text>
          )}
        </Box>

        {/* Phone */}
        <Box>
          <Text size="2" className="text-gray-700 mb-1">
            {tCommon("form.phone")} <Text color="red">*</Text>
          </Text>
          <input
            type="tel"
            value={shippingFormData.phone}
            onChange={(e) => {
              handleFieldChange("phone", e.target.value);
              // Error will clear when API validates successfully
            }}
            placeholder={tCommon("form.phonePlaceholder")}
            disabled={isPaymentProcessing}
            className={`w-full p-3 border rounded-[32px] text-black placeholder-gray-400 ${
              fieldErrors?.phone ? "border-red-500" : "border-gray-300"
            } ${isPaymentProcessing ? "bg-gray-100 cursor-not-allowed" : ""}`}
            style={{ backgroundColor: isPaymentProcessing ? "#f3f4f6" : "white", borderWidth: "1px" }}
          />
          {fieldErrors?.phone && (
            <Text className="text-red-500 text-xs mt-1">
              {fieldErrors.phone}
            </Text>
          )}
        </Box>

        {/* Email */}
        <Box>
          <Text size="2" className="text-gray-700 mb-1">
            {tCommon("form.email")}
          </Text>
          <input
            type="email"
            value={shippingFormData.email}
            onChange={(e) => {
              handleFieldChange("email", e.target.value);
              // Error will clear when API validates successfully
            }}
            placeholder={tCommon("form.emailPlaceholder")}
            disabled={isPaymentProcessing}
            className={`w-full p-3 border rounded-[32px] text-black placeholder-gray-400 ${
              fieldErrors?.email ? "border-red-500" : "border-gray-300"
            } ${isPaymentProcessing ? "bg-gray-100 cursor-not-allowed" : ""}`}
            style={{ backgroundColor: isPaymentProcessing ? "#f3f4f6" : "white", borderWidth: "1px" }}
          />
          {fieldErrors?.email && (
            <Text className="text-red-500 text-xs mt-1">
              {fieldErrors.email}
            </Text>
          )}
        </Box>

        {/* City */}
        <Box>
          <Text size="2" className="text-gray-700 mb-1">
            {tCommon("form.city")} <Text color="red">*</Text>
          </Text>
          <Select.Root
            value={shippingFormData.city}
            onValueChange={(value) => handleFieldChange("city", value)}
            disabled={isPaymentProcessing}
          >
            <Select.Trigger
              placeholder={tCommon("form.cityPlaceholder")}
              className={`w-full p-3 border border-gray-300 rounded-[32px] text-black ${
                isPaymentProcessing ? "cursor-not-allowed" : ""
              }`}
              style={{
                backgroundColor: isPaymentProcessing ? "#f3f4f6" : "white",
                borderWidth: "1px",
                height: "48px",
              }}
            />
            <Select.Content>
              {cities.map((city) => (
                <Select.Item key={city.id} value={String(city.id)}>
                  {city.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Box>

        {/* District */}
        <Box>
          <Text size="2" className="text-gray-700 mb-1">
            {tCommon("form.district")} <Text color="red">*</Text>
          </Text>
          <Select.Root
            value={shippingFormData.district}
            onValueChange={(value) => handleFieldChange("district", value)}
            disabled={isPaymentProcessing || !shippingFormData.city || isEmpty(availableDistricts)}
          >
            <Select.Trigger
              placeholder={tCommon("form.districtPlaceholder")}
              className={`w-full p-3 border border-gray-300 rounded-[32px] text-black ${
                isPaymentProcessing ? "cursor-not-allowed" : ""
              }`}
              style={{
                backgroundColor: isPaymentProcessing ? "#f3f4f6" : "white",
                borderWidth: "1px",
                height: "48px",
              }}
            />
            <Select.Content>
              {availableDistricts.map((district) => (
                <Select.Item key={district.id} value={String(district.id)}>
                  {district.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Box>

        {/* Ward */}
        <Box>
          <Text size="2" className="text-gray-700 mb-1">
            {tCommon("form.ward")} <Text color="red">*</Text>
          </Text>
          <Select.Root
            value={shippingFormData.ward}
            onValueChange={(value) => handleFieldChange("ward", value)}
            disabled={isPaymentProcessing || !shippingFormData.district || isEmpty(availableWards)}
          >
            <Select.Trigger
              placeholder={tCommon("form.wardPlaceholder")}
              className={`w-full p-3 border border-gray-300 rounded-[32px] text-black ${
                isPaymentProcessing ? "cursor-not-allowed" : ""
              }`}
              style={{
                backgroundColor: isPaymentProcessing ? "#f3f4f6" : "white",
                borderWidth: "1px",
                height: "48px",
              }}
            />
            <Select.Content>
              {availableWards.map((ward) => (
                <Select.Item key={ward.id} value={String(ward.id)}>
                  {ward.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Box>

        {/* Street Address */}
        <Box>
          <Text size="2" className="text-gray-700 mb-1">
            {tCommon("form.street")} <Text color="red">*</Text>
          </Text>
          <input
            type="text"
            value={shippingFormData.street}
            onChange={(e) => {
              handleFieldChange("street", e.target.value);
              // Error will clear when API validates successfully
            }}
            placeholder={tCommon("form.streetPlaceholder")}
            disabled={isPaymentProcessing}
            className={`w-full p-3 border rounded-[32px] text-black placeholder-gray-400 ${
              fieldErrors?.street ? "border-red-500" : "border-gray-300"
            } ${isPaymentProcessing ? "bg-gray-100 cursor-not-allowed" : ""}`}
            style={{ backgroundColor: isPaymentProcessing ? "#f3f4f6" : "white", borderWidth: "1px" }}
          />
          {fieldErrors?.street && (
            <Text className="text-red-500 text-xs mt-1">
              {fieldErrors.street}
            </Text>
          )}
        </Box>

        {/* Notes */}
        <Box>
          <Text size="2" className="text-gray-700 mb-1">
            {tCart("notes")}
          </Text>
          <textarea
            value={shippingFormData.notes}
            onChange={(e) => handleFieldChange("notes", e.target.value)}
            placeholder={tCart("notesPlaceholder")}
            disabled={isPaymentProcessing}
            className={`w-full h-[40px] px-3 py-2 border border-gray-300 rounded-[32px] text-black placeholder-gray-400 resize-none overflow-hidden flex items-center ${
              isPaymentProcessing ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
            rows={1}
            style={{
              backgroundColor: isPaymentProcessing ? "#f3f4f6" : "white",
              borderWidth: "1px",
              lineHeight: "24px",
            }}
          />
        </Box>
      </Flex>
    </Box>
  );
}
