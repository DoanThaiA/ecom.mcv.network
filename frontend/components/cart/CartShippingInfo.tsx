"use client";

import { SavedAddress } from "@/types/order";
import { Box, Button, Flex, Text } from "@radix-ui/themes";
import { ChevronUpIcon, ChevronRightIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { AddressBookDialog } from "./AddressBookDialog";
import {
  getCities,
  getDistricts,
  getWards,
  City,
  District,
  Ward,
  getMyShippingAddresses,
  deleteMyShippingAddress,
  Address,
} from "@/lib/repositories/address.repository";
import { storageService } from "@/lib/services/storage.service";
import { showSuccessToast, showErrorToast } from "@/lib/helpers/toastHelper";
import isEmpty from "lodash/isEmpty";
import uniq from "lodash/uniq";
import { ConfirmDialog } from "../common/ConfirmDialog";

export interface ShippingFormData {
  fullName: string;
  phone: string;
  email: string;
  notes: string;
  street: string;
  city: string;
  district: string;
  ward: string;
}

export const initialShippingFormData: ShippingFormData = {
  fullName: "",
  phone: "",
  email: "",
  notes: "",
  street: "",
  city: "",
  district: "",
  ward: "",
};

interface CartShippingInfoProps {
  formData: ShippingFormData;
  onFormDataChange: (_data: ShippingFormData) => void;
}

export function CartShippingInfo({
  formData,
  onFormDataChange,
}: CartShippingInfoProps) {
  const t = useTranslations("cart");
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string;
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddressBookOpen, setIsAddressBookOpen] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<District[]>([]);
  const [availableWards, setAvailableWards] = useState<Ward[]>([]);
  const [shippingAddresses, setShippingAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );

  // Mock saved addresses - TODO: Replace with API data
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  // Track if location data has been loaded to prevent duplicate API calls
  const locationDataLoadedRef = useRef(false);
  const isLoadingLocationDataRef = useRef(false);

  // Load shipping addresses from localStorage on mount
  useEffect(() => {
    const addresses = storageService.getShippingAddresses();
    const mapped = addresses.map((addr) => ({
      id: addr.id,
      userId: "",
      fullName: addr.fullName,
      phone: addr.phone,
      email: addr.email || undefined,
      notes: addr.notes || undefined,
      street: addr.street,
      cityId: parseInt(addr.city),
      cityName: addr.cityName || "",
      districtId: parseInt(addr.district),
      districtName: addr.districtName || "",
      wardId: parseInt(addr.ward),
      wardName: addr.wardName || "",
      isDefault: addr.isDefault,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    setShippingAddresses(mapped);

    // Select default or first address
    const defaultAddr = mapped.find((addr) => addr.isDefault) || mapped[0];
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr.id);
      onFormDataChange({
        fullName: defaultAddr.fullName,
        phone: defaultAddr.phone,
        email: defaultAddr.email || "",
        notes: defaultAddr.notes || "",
        street: defaultAddr.street,
        city: defaultAddr.cityId?.toString() ?? "",
        district: defaultAddr.districtId?.toString() ?? "",
        ward: defaultAddr.wardId?.toString() ?? "",
      });
    }
  }, []);

  // Fetch cities on mount
  useEffect(() => {
    getCities().then(setCities);
  }, []);

  // Load districts and wards for all shipping addresses to display names (only once)
  useEffect(() => {
    const loadLocationData = async () => {
      // Prevent duplicate calls
      if (
        isEmpty(shippingAddresses) ||
        isEmpty(cities) ||
        locationDataLoadedRef.current ||
        isLoadingLocationDataRef.current
      ) {
        return;
      }

      isLoadingLocationDataRef.current = true;

      try {
        // Collect all unique city/district IDs from addresses
        const cityIds = uniq(
          shippingAddresses
            .map((addr) => addr.cityId)
            .filter((id) => !isNaN(id) && id > 0)
        );
        const districtIds = uniq(
          shippingAddresses
            .map((addr) => addr.districtId)
            .filter((id) => !isNaN(id) && id > 0)
        );

        // Fetch all districts in parallel
        const districtsPromises = cityIds.map((cityId) => getDistricts(cityId));
        const districtsResults = await Promise.all(districtsPromises);
        const allDistricts = districtsResults.flat();

        // Fetch all wards in parallel
        const wardsPromises = districtIds.map((districtId) =>
          getWards(districtId)
        );
        const wardsResults = await Promise.all(wardsPromises);
        const allWards = wardsResults.flat();

        setAvailableDistricts(allDistricts);
        setAvailableWards(allWards);

        // Mark as loaded
        locationDataLoadedRef.current = true;
      } catch {
        // Failed to load location data
      } finally {
        isLoadingLocationDataRef.current = false;
      }
    };

    loadLocationData();
  }, [shippingAddresses, cities]);

  const handleSelectAddress = (address: SavedAddress) => {
    onFormDataChange({
      ...formData,
      fullName: address.fullName,
      phone: address.phone,
      street: address.address,
      city: address.city || "",
    });
  };

  const handleAddAddress = (newAddress: Omit<SavedAddress, "id">) => {
    const address: SavedAddress = {
      ...newAddress,
      id: `addr-${Date.now()}`,
    };

    // If this is set as default, unset other defaults
    if (address.isDefault) {
      setSavedAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: false }))
      );
    }

    setSavedAddresses((prev) => [...prev, address]);
  };

  const handleEditAddress = (updatedAddress: SavedAddress) => {
    setSavedAddresses((prev) =>
      prev.map((addr) => {
        if (addr.id === updatedAddress.id) {
          return updatedAddress;
        }
        // If updated address is now default, unset others
        if (updatedAddress.isDefault) {
          return { ...addr, isDefault: false };
        }
        return addr;
      })
    );
  };

  const getCityName = (cityId: string) => {
    const numericId = parseInt(cityId);
    return cities.find((c) => c.id === numericId)?.name || "";
  };

  const getDistrictName = (districtId: string) => {
    const numericId = parseInt(districtId);
    return availableDistricts.find((d) => d.id === numericId)?.name || "";
  };

  const getWardName = (wardId: string) => {
    const numericId = parseInt(wardId);
    return availableWards.find((w) => w.id === numericId)?.name || "";
  };

  const getFullAddress = (address: Address) => {
    const parts = [
      address.street,
      getWardName(address.wardId?.toString() ?? ""),
      getDistrictName(address.districtId?.toString() ?? ""),
      getCityName(address.cityId?.toString() ?? ""),
    ].filter(Boolean);
    return parts.join(", ");
  };

  const handleSelectShippingAddress = (address: Address) => {
    setSelectedAddressId(address.id);
    onFormDataChange({
      fullName: address.fullName,
      phone: address.phone,
      email: address.email || "",
      notes: address.notes || "",
      street: address.street,
      city: address.cityId?.toString() ?? "",
      district: address.districtId?.toString() ?? "",
      ward: address.wardId?.toString() ?? "",
    });
  };

  const loadAddresses = async () => {
    try {
      // Check if user is authenticated
      if (!storageService.isAuthenticated()) {
        // Fall back to localStorage for non-authenticated users
        const localAddresses = storageService.getShippingAddresses();
        const mapped = localAddresses.map((addr) => ({
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
        }));
        setShippingAddresses(mapped);
        // Select default or first address
        const defaultAddr = mapped.find((addr) => addr.isDefault) || mapped[0];
        if (defaultAddr && !selectedAddressId) {
          handleSelectShippingAddress(defaultAddr);
        }
        return;
      }
      const addresses = await getMyShippingAddresses();
      setShippingAddresses(addresses);
      // Select default or first address
      const defaultAddr =
        addresses.find((addr) => addr.isDefault) || addresses[0];
      if (defaultAddr && !selectedAddressId) {
        handleSelectShippingAddress(defaultAddr);
      }
    } catch {
      // Failed to load addresses
    }
  };

  const handleEditClick = (e: React.MouseEvent, addressId: string) => {
    e.stopPropagation(); // Prevent selecting the address when clicking edit
    router.push(`/${locale}/account/addresses/${addressId}`);
  };

  const handleDeleteClick = async (addressId: string) => {
    try {
      if (!storageService.isAuthenticated()) {
        storageService.deleteShippingAddress(addressId);
        await loadAddresses();
        showSuccessToast("Đã xóa địa chỉ");
        return;
      }
      await deleteMyShippingAddress(addressId);
      await loadAddresses();
      // If deleted address was selected, select another one
      if (selectedAddressId === addressId) {
        const addresses = await getMyShippingAddresses();
        const defaultAddr =
          addresses.find((addr) => addr.isDefault) || addresses[0];
        if (defaultAddr) {
          handleSelectShippingAddress(defaultAddr);
        } else {
          setSelectedAddressId(null);
        }
      }
      showSuccessToast("Đã xóa địa chỉ");
    } catch {
      showErrorToast("Không thể xóa địa chỉ");
    }
  };

  const handleAddNewClick = () => {
    router.push(`/${locale}/account/addresses/new`);
  };

  return (
    <Box className="bg-white" style={{ margin: 0 }}>
      {/* Expandable Header */}
      <Box
        className="p-4 cursor-pointer hover:bg-white transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Flex align="center" justify="between">
          <h2 className="text-[16px] sm:text-[22px] lg:text-[24px] font-bold text-black">
            {t("shippingInfoTitle")}
          </h2>
          <Flex gap="2" align="center">
            {/* Navigate to address page */}
            <Box
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/${locale}/account/addresses`);
              }}
              className="cursor-pointer hover:bg-gray-100 rounded p-1 transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-600 hover:text-[#FAA63E]" />
            </Box>

            {/* Existing expand/collapse chevron */}
            <Box
              className="transition-transform duration-300 ease-in-out"
              style={{
                transform: isExpanded ? "rotate(0deg)" : "rotate(180deg)",
              }}
            >
              <ChevronUpIcon width="20" height="20" />
            </Box>
          </Flex>
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
        <Box className="px-4 pb-4">
          {/* Saved Addresses Display */}
          {!isEmpty(shippingAddresses) && (
            <Flex direction="column" gap="3">
              {shippingAddresses.map((address) => (
                <Box
                  key={address.id}
                  className="bg-[#FEF8F1] rounded-lg p-4 cursor-pointer hover:bg-[#FEF0E0] transition-colors"
                  onClick={() => handleSelectShippingAddress(address)}
                >
                  <Flex align="start" gap="3">
                    {/* Radio button */}
                    <Box className="pt-1">
                      <Box
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                        style={{
                          borderWidth: "2px",
                          borderColor:
                            selectedAddressId === address.id
                              ? "#FAA63E"
                              : "#D1D5DB",
                        }}
                      >
                        {selectedAddressId === address.id && (
                          <Box className="w-3 h-3 rounded-full bg-[#FAA63E]" />
                        )}
                      </Box>
                    </Box>

                    {/* Address Info */}
                    <Box className="flex-1">
                      <Flex direction="column" gap="2">
                        {/* Name and Phone */}
                        <Flex align="center" gap="2" className="mb-1">
                          <Text weight="bold" className="text-black">
                            {address.fullName}
                          </Text>
                          <Text className="text-black">|</Text>
                          <Text className="text-black">{address.phone}</Text>
                        </Flex>

                        {/* Full Address */}
                        <Text className="text-gray-600 text-sm">
                          {getFullAddress(address)}
                        </Text>

                        {/* Default Badge */}
                        {address.isDefault && (
                          <Box>
                            <Box
                              className="inline-block px-2 py-1 border border-[#FAA63E] rounded text-xs"
                              style={{ borderWidth: "1px" }}
                            >
                              <Text className="text-[#FAA63E]">
                                {t("defaultAddress")}
                              </Text>
                            </Box>
                          </Box>
                        )}
                      </Flex>
                    </Box>

                    {/* Edit Button */}
                    <Box>
                      <Button
                        variant="ghost"
                        onClick={(e) => handleEditClick(e, address.id)}
                        className="cursor-pointer hover:bg-gray-100 transition-colors p-2 rounded"
                        style={{ padding: "8px", height: "auto" }}
                        title={t("updateAddress")}
                      >
                        <Pencil1Icon
                          width="18"
                          height="18"
                          className="text-[#4A90E2]"
                        />
                      </Button>
                      {shippingAddresses.length > 1 && (
                        <ConfirmDialog
                          title={t("deleteAddressTitle")}
                          description={t("deleteAddressConfirm")}
                          confirmText={t("deleteAddress")}
                          onConfirm={() => handleDeleteClick(address.id)}
                          variant="danger"
                          trigger={
                            <Button
                              variant="ghost"
                              className="cursor-pointer hover:bg-gray-100 transition-colors p-2 rounded"
                              style={{ padding: "8px", height: "auto" }}
                              title={t("deleteAddress")}
                              onClick={(e) => e.stopPropagation()}
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
                    </Box>
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
            <Box className="text-center py-6">
              <Text className="text-gray-600 mb-4 block">
                {t("noShippingAddresses")}
              </Text>
              <Button
                onClick={handleAddNewClick}
                className="py-3 px-6 bg-[#FAA63E] hover:bg-[#F99B2E] transition-colors cursor-pointer rounded-lg"
              >
                <Text className="text-white font-medium">
                  + {t("addShippingAddress")}
                </Text>
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Address Book Dialog */}
      <AddressBookDialog
        open={isAddressBookOpen}
        onOpenChange={setIsAddressBookOpen}
        addresses={savedAddresses}
        onSelectAddress={handleSelectAddress}
        onAddAddress={handleAddAddress}
        onEditAddress={handleEditAddress}
      />
    </Box>
  );
}
