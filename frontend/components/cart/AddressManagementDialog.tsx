'use client';

import { Box, Button, Dialog, Flex, Heading, IconButton, Text } from '@radix-ui/themes';
import {
  Pencil1Icon,
  TrashIcon,
  StarIcon,
  StarFilledIcon,
  PlusCircledIcon,
  ChevronLeftIcon,
  Cross2Icon,
} from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
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
import { preventDialogCloseOnNestedRadix } from '@/lib/utils/dialog';
import { AddressFormFields } from '../account/AddressFormFields';
import { useAddressForm, initialFormData } from './hooks/useAddressForm';

type DialogView = 'list' | 'add' | 'edit';

interface AddressManagementDialogProps {
  open: boolean;
  onOpenChange: (_value: boolean) => void;
  onSelectAddress: (_addressId: string) => void;
  selectedAddressId?: string | null;
  locale: string;
}

export function AddressManagementDialog({
  open,
  onOpenChange,
  onSelectAddress,
  selectedAddressId,
  locale,
}: AddressManagementDialogProps) {
  const t = useTranslations('addressBook');
  const tCommon = useTranslations('common');
  const tCart = useTranslations('cart');

  const [view, setView] = useState<DialogView>('list');
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [shippingAddresses, setShippingAddresses] = useState<Address[]>([]);

  // State for list view address display
  const [listDistricts, setListDistricts] = useState<District[]>([]);
  const [listWards, setListWards] = useState<Ward[]>([]);

  // Initialize form hook
  const {
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
    handleSave,
    resetForm,
  } = useAddressForm({
    cities,
    editingAddressId,
    onSaveSuccess: async () => {
      await loadAddresses();
      setView('list');
    },
    isAuthenticated: storageService.isAuthenticated(),
    t: tCommon,
  });

  // Track if location data has been loaded to prevent duplicate API calls (for list view)
  const locationDataLoadedRef = useRef(false);
  const isLoadingLocationDataRef = useRef(false);

  // Load addresses when dialog opens
  useEffect(() => {
    if (open) {
      loadAddresses();
    }
  }, [open]);

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

        setListDistricts(allDistricts);
        setListWards(allWards);

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
    return listDistricts.find((d) => d.id === districtId)?.name || '';
  };

  const getWardName = (cityId: number, districtId: number, wardId: number) => {
    return listWards.find((w) => w.id === wardId)?.name || '';
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

  const handleSelectAddress = (address: Address) => {
    onSelectAddress(address.id);
    onOpenChange(false);
  };

  const handleAddNewClick = () => {
    resetForm();
    setEditingAddressId(null);
    setView('add');
  };

  const handleEditClick = (address: Address) => {
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
    setEditingAddressId(address.id);
    setView('edit');
  };

  const handleCancel = () => {
    resetForm();
    setEditingAddressId(null);
    setView('list');
  };

  const getDialogTitle = () => {
    if (view === 'add') return t('addNewAddress');
    if (view === 'edit') return t('editAddress');
    return t('title');
  };

  // Reset view when dialog closes
  useEffect(() => {
    if (!open) {
      setView('list');
      resetForm();
      setEditingAddressId(null);
    }
  }, [open, resetForm]);

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
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Content
          onPointerDownOutside={preventDialogCloseOnNestedRadix}
          aria-describedby={undefined}
          className={`rounded-[14px] p-0 max-h-[80vh] overflow-hidden ${
            view === 'list'
              ? 'w-[calc(100vw-32px)] sm:w-[600px] max-w-[600px]'
              : 'w-[calc(100vw-32px)] sm:w-[650px] max-w-[650px]'
          }`}
        >
          {/* Header */}
          <Box className="px-5 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <Flex
              justify="center"
              align="center"
              className="relative"
            >
              {/* Back Button */}
              <IconButton
                onClick={() => {
                  if (view === 'list') {
                    onOpenChange(false);
                  } else {
                    handleCancel();
                  }
                }}
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
              <Dialog.Title>
                <Text size="5" weight="bold" className="text-black">
                  {getDialogTitle()}
                </Text>
              </Dialog.Title>

              {/* Close Button */}
              <Dialog.Close>
                <IconButton
                  size="2"
                  variant="ghost"
                  className="absolute right-0 hover:bg-gray-100"
                  style={{
                    cursor: 'pointer',
                  }}
                >
                  <Cross2Icon width="16" height="16" />
                </IconButton>
              </Dialog.Close>
            </Flex>
          </Box>

          {/* List View */}
          {view === 'list' && (
            <Box className="px-5 py-6 overflow-y-auto max-h-[calc(80vh-80px)]">
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
                  {t('empty')}
                </Heading>
                <Text className="text-gray-500 text-center max-w-md">
                  {t('emptyDescription')}
                </Text>
                <Button
                  onClick={handleAddNewClick}
                  variant="ghost"
                  className="mt-4 bg-white hover:bg-[#FEF8F1] border border-[#FAA63E] text-[#FAA63E] cursor-pointer transition-colors"
                  size="3"
                >
                  <PlusCircledIcon width="20" height="20" />
                  {t('addNewAddress')}
                </Button>
              </Flex>
            )}

            {/* Address Grid */}
            {!isEmpty(shippingAddresses) && (
              <Box className="space-y-3">
                {shippingAddresses.map((address) => (
                  <Box
                    key={address.id}
                    className={`border rounded-lg p-4 relative transition-all cursor-pointer ${
                      selectedAddressId === address.id
                        ? 'border-[#FAA63E] bg-[#FEF8F1]'
                        : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                    }`}
                    onClick={() => handleSelectAddress(address)}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(address);
                            }}
                            className="cursor-pointer hover:bg-gray-100 transition-colors p-2 rounded"
                            style={{ padding: '6px', height: 'auto' }}
                            title={t('editAddress')}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetDefault(address.id);
                              }}
                              className="cursor-pointer hover:bg-gray-100 transition-colors p-2 rounded"
                              style={{ padding: '6px', height: 'auto' }}
                              title={t('setAsDefault')}
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
                              title={t('deleteAddress')}
                              description={t('deleteConfirm')}
                              confirmText={tCommon('buttons.delete')}
                              onConfirm={() => handleDeleteAddress(address.id)}
                              variant="danger"
                              trigger={
                                <Button
                                  variant="ghost"
                                  onClick={(e) => e.stopPropagation()}
                                  className="cursor-pointer hover:bg-gray-100 transition-colors p-2 rounded"
                                  style={{ padding: '6px', height: 'auto' }}
                                  title={t('deleteAddress')}
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
                              {tCommon('form.email')}: {address.email}
                            </Text>
                          )}
                          {address.notes && (
                            <Text className="text-gray-600 text-xs">
                              {tCart('notes')}: {address.notes}
                            </Text>
                          )}
                        </Flex>
                      )}

                      {/* Default Badge */}
                      {address.isDefault && (
                        <Box>
                          <Box className="inline-block px-2 py-1 bg-[#FEF8F1] rounded text-xs">
                            <Text className="text-[#FAA63E] font-medium">
                              {t('defaultBadge')}
                            </Text>
                          </Box>
                        </Box>
                      )}
                    </Flex>
                  </Box>
                ))}

                {/* Add New Button */}
                <Flex justify="center" className="mt-4">
                  <Button
                    onClick={handleAddNewClick}
                    variant="ghost"
                    className="bg-white hover:bg-[#FEF8F1] border border-[#FAA63E] text-[#FAA63E] cursor-pointer transition-colors"
                  >
                    <PlusCircledIcon width="20" height="20" />
                    {t('addNewAddress')}
                  </Button>
                </Flex>
              </Box>
            )}
            </Box>
          )}

          {/* Add/Edit View */}
          {(view === 'add' || view === 'edit') && (
            <Box className="px-5 py-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              <AddressFormFields
                formData={formData}
                onFormChange={setFormData}
                errors={errors}
                onErrorChange={setErrors}
                cities={cities}
                availableDistricts={availableDistricts}
                availableWards={availableWards}
                coordinates={coordinates}
                onCoordinatesChange={setCoordinates}
                isGeocoding={isGeocoding}
                showMapPicker={true}
                mapHeight="200px"
                mode="dialog"
              />

              {/* Action Buttons */}
              <Flex gap="3" className="mt-6">
                <Button
                  variant="outline"
                  size="3"
                  className="flex-1 cursor-pointer"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleCancel();
                  }}
                >
                  {tCommon('buttons.cancel')}
                </Button>
                <Button
                  size="3"
                  className="flex-1 cursor-pointer"
                  style={{
                    background: 'linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)',
                  }}
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? tCommon('status.saving') : (view === 'edit' ? t('saveChanges') : tCommon('buttons.confirm'))}
                </Button>
              </Flex>
            </Box>
          )}
        </Dialog.Content>
      </Dialog.Root>
  );
}
