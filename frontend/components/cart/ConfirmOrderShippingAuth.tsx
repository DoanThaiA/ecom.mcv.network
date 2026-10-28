'use client';

import { Address } from '@/lib/repositories/address.repository';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { Box, Flex, Text } from '@radix-ui/themes';
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ShippingFormData } from "./CartShippingInfo";

interface ConfirmOrderShippingAuthProps {
  shippingAddresses: Address[];
  selectedAddressId: string | null;
  shippingFormData: ShippingFormData;
  onNavigateToAddressBook: () => void;
  onNotesChange: (_notes: string) => void;
  isPaymentProcessing?: boolean;
}

export function ConfirmOrderShippingAuth({
  shippingAddresses,
  selectedAddressId,
  shippingFormData,
  onNavigateToAddressBook,
  onNotesChange,
  isPaymentProcessing = false,
}: ConfirmOrderShippingAuthProps) {
  const t = useTranslations("orderDetail");
  const tCart = useTranslations("cart");

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "";

    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "");

    // Check if it starts with country code
    let countryCode = "84";
    let number = cleaned;

    if (cleaned.startsWith("84")) {
      number = cleaned.slice(2);
    } else if (cleaned.startsWith("0")) {
      number = cleaned.slice(1);
    }

    // Format: (+84) 969 *** ***
    if (number.length >= 3) {
      const first3 = number.slice(0, 3);
      return `(+${countryCode}) ${first3} *** ***`;
    }

    return phone;
  };

  // Get the selected address or default address
  const displayAddress = selectedAddressId
    ? shippingAddresses.find((addr) => addr.id === selectedAddressId)
    : shippingAddresses.find((addr) => addr.isDefault) || shippingAddresses[0];

  return (
    <Box className="rounded-2xl p-4 sm:p-6 mb-2">
      <Box className="mb-4">
        <Text className="text-base text-[24px] font-bold text-black uppercase">
          {t("shippingInfo")}
        </Text>
      </Box>

      {/* Display Single Address or Add Button */}
      {displayAddress ? (
        <Box className="mb-4">
          <Box
            className={`rounded-2xl p-4 bg-white border border-gray-200 transition-colors ${
              isPaymentProcessing
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:bg-[#FEF8F1]"
            }`}
            onClick={() => !isPaymentProcessing && onNavigateToAddressBook()}
          >
            <Flex align="start" gap="3">
              {/* Location Pin Icon */}
              <Box className="flex-shrink-0 pt-0.5">
                <Image
                  src="/assets/svg/location_pin.svg"
                  alt="Location"
                  width={20}
                  height={20}
                />
              </Box>

              {/* Address Info */}
              <Flex direction="column" className="flex-1 min-w-0" gap="1">
                {/* Name and Phone */}
                <Text className="text-sm font-medium text-black">
                  {displayAddress.fullName}{" "}
                  <Text as="span" className="text-gray-400">
                    {formatPhoneNumber(displayAddress.phone)}
                  </Text>
                </Text>

                {/* Full Address */}
                <Text className="text-sm text-gray-500 leading-relaxed">
                  {[
                    displayAddress.street,
                    displayAddress.wardName,
                    displayAddress.districtName,
                    displayAddress.cityName,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              </Flex>

              {/* Chevron Right - Navigate to Address Book */}
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isPaymentProcessing) onNavigateToAddressBook();
                }}
                className={`self-center rounded p-1 transition-colors ${
                  isPaymentProcessing
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:bg-gray-100"
                }`}
              >
                <ChevronRightIcon className={`w-5 h-5 ${isPaymentProcessing ? "text-gray-400" : "text-gray-600 hover:text-[#FAA63E]"}`} />
              </Box>
            </Flex>
          </Box>
        </Box>
      ) : (
        /* No Address - Show Add Button */
        <Box
          onClick={() => !isPaymentProcessing && onNavigateToAddressBook()}
          className={`rounded-lg p-4 mb-4 transition-colors border-gray-300 ${
            isPaymentProcessing
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer hover:border-[#FAA63E] hover:bg-[#FEF8F1]"
          }`}
        >
          <Flex align="center" direction="row" justify="center" gap="2">
            <Image
              src="/assets/svg/plus-circle.svg"
              alt="Add"
              width={24}
              height={24}
              className="w-[20px] h-[20px]"
            />
            <Text className="text-sm text-[#FAA63E] font-medium">
              {tCart('addNewAddress')}
            </Text>
          </Flex>
        </Box>
      )}

      {/* Notes Field */}
      <Box>
        <Text size="2" className="text-gray-700 mb-2 block font-medium">
          {tCart("notes")}
        </Text>
        <textarea
          value={shippingFormData.notes}
          onChange={(e) => onNotesChange(e.target.value)}
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
    </Box>
  );
}
