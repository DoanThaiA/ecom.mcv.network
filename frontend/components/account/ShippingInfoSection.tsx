"use client";

import { Box, Button, Flex, Heading, Text } from "@radix-ui/themes";
import {
  ChevronUpIcon,
  Pencil1Icon,
  TrashIcon,
  StarIcon,
} from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getMyShippingAddresses,
  deleteMyShippingAddress,
  setDefaultMyShippingAddress,
  Address,
} from "@/lib/repositories/address.repository";
import { storageService } from "@/lib/services/storage.service";
import { showSuccessToast, showErrorToast } from "@/lib/helpers/toastHelper";
import isEmpty from "lodash/isEmpty";
import { ConfirmDialog } from "../common/ConfirmDialog";

export function ShippingInfoSection() {
  const t = useTranslations("cart");
  const tCommon = useTranslations("common");
  const tAccount = useTranslations("account");
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string;
  const [isExpanded, setIsExpanded] = useState(true);
  const [shippingAddresses, setShippingAddresses] = useState<Address[]>([]);

  // Load shipping addresses from localStorage on mount
  useEffect(() => {
    loadAddresses();
  }, []);

  // Reload addresses when window regains focus (after navigating back)
  useEffect(() => {
    const handleFocus = () => {
      loadAddresses();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadAddresses = async () => {
    try {
      // Check if user is authenticated
      if (!storageService.isAuthenticated()) {
        // Fall back to localStorage for non-authenticated users
        const localAddresses = storageService.getShippingAddresses();
        setShippingAddresses(
          localAddresses.map((addr) => ({
            id: addr.id,
            userId: "",
            fullName: addr.fullName,
            phone: addr.phone,
            email: addr.email || undefined,
            notes: addr.notes || undefined,
            street: addr.street,
            cityId: addr.city ? parseInt(addr.city) : 0,
            cityName: addr.cityName || "",
            districtId: addr.district ? parseInt(addr.district) : 0,
            districtName: addr.districtName || "",
            wardId: addr.ward ? parseInt(addr.ward) : 0,
            wardName: addr.wardName || "",
            isDefault: addr.isDefault,
            createdAt: new Date(),
            updatedAt: new Date(),
          }))
        );
        return;
      }
      const addresses = await getMyShippingAddresses();
      setShippingAddresses(addresses);
    } catch {
      // Failed to load addresses
    }
  };

  const getFullAddress = (address: Address) => {
    const parts = [
      address.street,
      address.wardName,
      address.districtName,
      address.cityName,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const handleEditClick = (addressId: string) => {
    router.push(`/${locale}/account/addresses/${addressId}`);
  };

  const handleAddNewClick = () => {
    router.push(`/${locale}/account/addresses/new`);
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      if (!storageService.isAuthenticated()) {
        storageService.deleteShippingAddress(addressId);
        loadAddresses();
        showSuccessToast(tCommon("success.deleted"));
        return;
      }
      await deleteMyShippingAddress(addressId);
      await loadAddresses();
      showSuccessToast(tCommon("success.deleted"));
    } catch {
      showErrorToast(tCommon("errors.deleteAddressFailed"));
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      if (!storageService.isAuthenticated()) {
        storageService.setDefaultShippingAddress(addressId);
        loadAddresses();
        return;
      }
      await setDefaultMyShippingAddress(addressId);
      await loadAddresses();
    } catch {
      showErrorToast(tCommon("errors.setDefaultFailed"));
    }
  };

  return (
    <Box className="flex-1 bg-white rounded-[14px] border border-[rgba(164,161,170,0.2)] shadow-[0px_4px_8px_0px_rgba(29,33,41,0.12)]">
      {/* Expandable Header */}
      <Box
        className="px-4 sm:px-8 lg:px-[60px] py-4 sm:py-5 lg:py-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Flex align="center" justify="between">
          <Heading className="text-xl sm:text-2xl lg:text-[28px] font-bold leading-[1.21] uppercase text-black">
            {t("shippingInfoTitle")}
          </Heading>
          <Box
            className="transition-transform duration-300 ease-in-out"
            style={{
              transform: isExpanded ? "rotate(0deg)" : "rotate(180deg)",
            }}
          >
            <ChevronUpIcon width="20" height="20" />
          </Box>
        </Flex>
      </Box>

      {/* Collapsible Content */}
      <Box
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isExpanded ? "2000px" : "0",
          opacity: isExpanded ? 1 : 0,
        }}
      >
        <Box className="px-4 sm:px-8 lg:px-[60px] pb-6 sm:pb-10 lg:pb-[60px]">
          {/* Saved Addresses Display */}
          {!isEmpty(shippingAddresses) && (
            <Flex direction="column" gap="4">
              {shippingAddresses.map((address) => (
                <Box
                  key={address.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <Flex direction="column" gap="3">
                    {/* Name and Phone */}
                    <Flex justify="between" align="start">
                      <Box>
                        <Flex align="center" gap="2" className="mb-2">
                          <Text weight="bold" className="text-black text-base">
                            {address.fullName}
                          </Text>
                          <Text className="text-gray-400">|</Text>
                          <Text className="text-black text-base">
                            {address.phone}
                          </Text>
                        </Flex>
                      </Box>
                      <Flex gap="2">
                        {!address.isDefault && (
                          <Button
                            variant="ghost"
                            onClick={() => handleSetDefault(address.id)}
                            className="cursor-pointer hover:bg-gray-100 transition-colors p-2 rounded"
                            style={{ padding: "8px", height: "auto" }}
                            title={tCommon("form.setAsDefault")}
                          >
                            <StarIcon
                              width="18"
                              height="18"
                              className="text-[#FAA63E]"
                            />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          onClick={() => handleEditClick(address.id)}
                          className="cursor-pointer hover:bg-gray-100 transition-colors p-2 rounded"
                          style={{ padding: "8px", height: "auto" }}
                          title={tAccount("editButton")}
                        >
                          <Pencil1Icon
                            width="18"
                            height="18"
                            className="text-[#4A90E2]"
                          />
                        </Button>
                        {shippingAddresses.length > 1 && (
                          <ConfirmDialog
                            title={tCommon("deleteAddressTitle")}
                            description={tCommon("confirmDelete")}
                            confirmText={tCommon("buttons.delete")}
                            onConfirm={() => handleDeleteAddress(address.id)}
                            variant="danger"
                            trigger={
                              <Button
                                variant="ghost"
                                className="cursor-pointer hover:bg-gray-100 transition-colors p-2 rounded"
                                style={{ padding: "8px", height: "auto" }}
                                title={t("deleteAddress")}
                              >
                                <TrashIcon
                                  width="18"
                                  height="18"
                                  className="text-red-500"
                                />
                              </Button>
                            }
                          />
                        )}
                      </Flex>
                    </Flex>

                    {/* Full Address */}
                    <Text className="text-gray-600 text-sm">
                      {getFullAddress(address)}
                    </Text>

                    {/* Email and Notes */}
                    {(address.email || address.notes) && (
                      <Flex direction="column" gap="1">
                        {address.email && (
                          <Text className="text-gray-600 text-sm">
                            {tCommon("form.email")}: {address.email}
                          </Text>
                        )}
                        {address.notes && (
                          <Text className="text-gray-600 text-sm">
                            {t("notes")}: {address.notes}
                          </Text>
                        )}
                      </Flex>
                    )}

                    {/* Default Badge */}
                    {address.isDefault && (
                      <Box>
                        <Box
                          className="inline-block px-3 py-1 border border-[#FAA63E] rounded text-xs"
                          style={{ borderWidth: "1px" }}
                        >
                          <Text className="text-[#FAA63E] font-medium">
                            {t("defaultAddress")}
                          </Text>
                        </Box>
                      </Box>
                    )}
                  </Flex>
                </Box>
              ))}

              {/* Add New Address Button */}
              <Button
                onClick={handleAddNewClick}
                className="w-full py-3 border-2 border-dashed border-[#FAA63E] bg-white hover:bg-[#FEF8F1] transition-colors cursor-pointer rounded-lg"
                variant="ghost"
              >
                <Text className="text-[#FAA63E] font-medium">
                  + {t("addNewAddress")}
                </Text>
              </Button>
            </Flex>
          )}

          {/* No Addresses - Show Add Button */}
          {isEmpty(shippingAddresses) && (
            <Button
              onClick={handleAddNewClick}
              className="w-full py-4 bg-[#FAA63E] hover:bg-[#F99B2E] transition-colors cursor-pointer rounded-lg"
            >
              <Text className="text-white font-medium">
                + {t("addShippingAddress")}
              </Text>
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
