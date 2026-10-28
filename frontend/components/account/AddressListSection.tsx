'use client';

import { Box, Button, Flex, Heading, IconButton, Text } from '@radix-ui/themes';
import {
  Pencil1Icon,
  TrashIcon,
  StarIcon,
  StarFilledIcon,
  PlusCircledIcon,
  ChevronLeftIcon,
} from '@radix-ui/react-icons';
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
  deleteMyShippingAddress,
  setDefaultMyShippingAddress,
  Address,
} from '@/lib/repositories/address.repository';
import { storageService } from '@/lib/services/storage.service';
import { showSuccessToast, showErrorToast } from '@/lib/helpers/toastHelper';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AddressListSectionProps {
  locale: string;
}

export function AddressListSection({ locale }: AddressListSectionProps) {
  const t = useTranslations('addressBook');
  const tCommon = useTranslations('common');
  const tCart = useTranslations('cart');
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<District[]>([]);
  const [availableWards, setAvailableWards] = useState<Ward[]>([]);
  const [shippingAddresses, setShippingAddresses] = useState<Address[]>([]);

  // Track if location data has been loaded to prevent duplicate API calls
  const locationDataLoadedRef = useRef(false);
  const isLoadingLocationDataRef = useRef(false);

  // Load shipping addresses on mount
  useEffect(() => {
    loadAddresses();
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

  const loadAddresses = async () => {
    try {
      // Check if user is authenticated
      if (!storageService.isAuthenticated()) {
        // Fall back to localStorage for non-authenticated users
        const localAddresses = storageService.getShippingAddresses();
        setShippingAddresses(
          localAddresses.map((addr) => ({
            id: addr.id,
            userId: '',
            fullName: addr.fullName,
            phone: addr.phone,
            email: addr.email || undefined,
            notes: addr.notes || undefined,
            street: addr.street,
            cityId: addr.city ? parseInt(addr.city) : 0,
            cityName: addr.cityName || '',
            districtId: addr.district ? parseInt(addr.district) : 0,
            districtName: addr.districtName || '',
            wardId: addr.ward ? parseInt(addr.ward) : 0,
            wardName: addr.wardName || '',
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

  const getCityName = (cityId: number) => {
    return cities.find((c) => c.id === cityId)?.name || '';
  };

  const getDistrictName = (cityId: number, districtId: number) => {
    return availableDistricts.find((d) => d.id === districtId)?.name || '';
  };

  const getWardName = (cityId: number, districtId: number, wardId: number) => {
    return availableWards.find((w) => w.id === wardId)?.name || '';
  };

  const getFullAddress = (address: Address) => {
    const parts = [
      address.street,
      address.wardName ||
        getWardName(address.cityId, address.districtId, address.wardId),
      address.districtName ||
        getDistrictName(address.cityId, address.districtId),
      address.cityName || getCityName(address.cityId),
    ].filter(Boolean);
    return parts.join(', ');
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
        showSuccessToast(tCommon('success.deleted'));
        return;
      }
      await deleteMyShippingAddress(addressId);
      await loadAddresses();
      showSuccessToast(tCommon('success.deleted'));
    } catch {
      showErrorToast(tCommon('errors.deleteAddressFailed'));
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
      showErrorToast(tCommon('errors.setDefaultFailed'));
    }
  };

  return (
    <Box className="flex-1">
      {/* Header */}
      <Box className="px-4 sm:px-8 lg:px-[60px] py-4 sm:py-5 lg:py-6 border-b border-gray-200">
        <Flex
          justify="center"
          align="center"
          className="relative"
        >
          {/* Back Button */}
          <IconButton
            onClick={() => router.back()}
            size="2"
            variant="ghost"
            className="absolute left-0 hover:bg-gray-100"
            style={{
              cursor: 'pointer',
            }}
          >
            <ChevronLeftIcon width="18" height="18" />
          </IconButton>

          {/* Title */}
          <Heading className="text-xl sm:text-2xl lg:text-[28px] font-bold leading-[1.21] uppercase text-black">
            {t("title")}
          </Heading>
        </Flex>
      </Box>

      {/* Content */}
      <Box className="px-4 sm:px-8 lg:px-[60px] py-6 sm:py-10 lg:py-[60px]">
        {/* Empty State */}
        {isEmpty(shippingAddresses) && (
          <Flex
            direction="column"
            align="center"
            justify="center"
            className="py-12"
            gap="4"
          >
            <Box className="text-6xl">📍</Box>
            <Heading size="5" className="text-gray-700">
              {t("empty")}
            </Heading>
            <Text className="text-gray-500 text-center max-w-md">
              {t("emptyDescription")}
            </Text>
            <Button
              onClick={handleAddNewClick}
              variant="ghost"
              className="mt-4 bg-white hover:bg-[#FEF8F1] border border-[#FAA63E] text-[#FAA63E] cursor-pointer transition-colors"
              size="3"
            >
              <PlusCircledIcon width="20" height="20" />
              {t("addNewAddress")}
            </Button>
          </Flex>
        )}

        {/* Address Grid */}
        {!isEmpty(shippingAddresses) && (
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shippingAddresses.map((address) => (
              <Box
                key={address.id}
                className="border border-gray-200 rounded-lg p-4 relative hover:shadow-md transition-shadow"
              >
                <Flex direction="column" gap="3">
                  {/* Header: Name, Phone, Actions */}
                  <Flex justify="between" align="start">
                    <Box className="flex-1">
                      <Flex align="center" gap="2" className="mb-1">
                        {address.isDefault && (
                          <StarFilledIcon
                            width="16"
                            height="16"
                            className="text-[#FAA63E]"
                          />
                        )}
                        <Text weight="bold" className="text-black text-base">
                          {address.fullName}
                        </Text>
                      </Flex>
                      <Text className="text-gray-600 text-sm">
                        {address.phone}
                      </Text>
                    </Box>
                    <Flex gap="1">
                      <Button
                        variant="ghost"
                        onClick={() => handleEditClick(address.id)}
                        className="cursor-pointer hover:bg-gray-100 transition-colors p-2 rounded"
                        style={{ padding: "6px", height: "auto" }}
                        title={t("editAddress")}
                      >
                        <Pencil1Icon
                          width="16"
                          height="16"
                          className="text-[#4A90E2]"
                        />
                      </Button>
                      {!address.isDefault && (
                        <Button
                          variant="ghost"
                          onClick={() => handleSetDefault(address.id)}
                          className="cursor-pointer hover:bg-gray-100 transition-colors p-2 rounded"
                          style={{ padding: "6px", height: "auto" }}
                          title={t("setAsDefault")}
                        >
                          <StarIcon
                            width="16"
                            height="16"
                            className="text-[#FAA63E]"
                          />
                        </Button>
                      )}
                      {shippingAddresses.length > 1 && (
                        <ConfirmDialog
                          title={t("deleteAddress")}
                          description={t("deleteConfirm")}
                          confirmText={tCommon("buttons.delete")}
                          onConfirm={() => handleDeleteAddress(address.id)}
                          variant="danger"
                          trigger={
                            <Button
                              variant="ghost"
                              className="cursor-pointer hover:bg-gray-100 transition-colors p-2 rounded"
                              style={{ padding: "6px", height: "auto" }}
                              title={t("deleteAddress")}
                            >
                              <TrashIcon
                                width="16"
                                height="16"
                                className="text-red-500"
                              />
                            </Button>
                          }
                        />
                      )}
                    </Flex>
                  </Flex>

                  {/* Address */}
                  <Text className="text-gray-700 text-sm">
                    {getFullAddress(address)}
                  </Text>

                  {/* Email and Notes */}
                  {(address.email || address.notes) && (
                    <Flex direction="column" gap="1">
                      {address.email && (
                        <Text className="text-gray-600 text-xs">
                          {tCommon("form.email")}: {address.email}
                        </Text>
                      )}
                      {address.notes && (
                        <Text className="text-gray-600 text-xs">
                          {tCart("notes")}: {address.notes}
                        </Text>
                      )}
                    </Flex>
                  )}

                  {/* Default Badge */}
                  {address.isDefault && (
                    <Box>
                      <Box className="inline-block px-2 py-1 bg-[#FEF8F1] rounded text-xs">
                        <Text className="text-[#FAA63E] font-medium">
                          {t("defaultBadge")}
                        </Text>
                      </Box>
                    </Box>
                  )}
                </Flex>
              </Box>
            ))}
          </Box>
        )}
        <Flex justify="center" className="mt-4">
          <Button
            onClick={handleAddNewClick}
            variant="ghost"
            className="bg-white hover:bg-[#FEF8F1] border border-[#FAA63E] text-[#FAA63E] cursor-pointer transition-colors"
          >
            <PlusCircledIcon width="20" height="20" />
            {t("addNewAddress")}
          </Button>
        </Flex>
      </Box>

    </Box>
  );
}
