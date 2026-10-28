'use client';

import { SavedAddress } from '@/types/order';
import { preventDialogCloseOnToast } from '@/lib/utils/dialog';
import { ChevronLeftIcon, Cross2Icon, StarFilledIcon } from '@radix-ui/react-icons';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  Flex,
  IconButton,
  Select,
  Text,
  TextField,
} from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface AddressBookDialogProps {
  open: boolean;
  onOpenChange: (_value: boolean) => void;
  onBack?: () => void;
  addresses: SavedAddress[];
  onSelectAddress: (_address: SavedAddress) => void;
  onAddAddress: (_address: Omit<SavedAddress, 'id'>) => void;
  onEditAddress: (_address: SavedAddress) => void;
}

type DialogView = 'list' | 'add' | 'edit';

interface AddressFormData {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  isDefault: boolean;
}

const initialFormData: AddressFormData = {
  fullName: '',
  phone: '',
  address: '',
  city: '',
  isDefault: false,
};

export function AddressBookDialog({
  open,
  onOpenChange,
  onBack,
  addresses,
  onSelectAddress,
  onAddAddress,
  onEditAddress,
}: AddressBookDialogProps) {
  const t = useTranslations('addressBook');
  const tCommon = useTranslations('common');
  const [view, setView] = useState<DialogView>('list');
  const [formData, setFormData] = useState<AddressFormData>(initialFormData);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Reset view and form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setView('list');
      setFormData(initialFormData);
      setEditingAddressId(null);
    }
  }, [open]);

  const handleAddClick = () => {
    setFormData(initialFormData);
    setEditingAddressId(null);
    setView('add');
  };

  const handleEditClick = (address: SavedAddress) => {
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city || '',
      isDefault: address.isDefault,
    });
    setEditingAddressId(address.id);
    setView('edit');
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setEditingAddressId(null);
    setView('list');
  };

  const handleSubmit = () => {
    if (!formData.fullName || !formData.phone || !formData.address) {
      return;
    }

    if (view === 'edit' && editingAddressId) {
      onEditAddress({
        id: editingAddressId,
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        isDefault: formData.isDefault,
      });
    } else {
      onAddAddress({
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        isDefault: formData.isDefault,
      });
    }

    setFormData(initialFormData);
    setEditingAddressId(null);
    setView('list');
  };

  const handleSelectAddress = (address: SavedAddress) => {
    onSelectAddress(address);
    onOpenChange(false);
  };

  const renderEmptyState = () => (
    <Flex direction="column" align="center" justify="center" py="6">
      <Text size="3" className="text-gray-600 mb-4">
        {t('empty')}
      </Text>
      <Button
        size="3"
        className="bg-black text-white hover:bg-gray-800 cursor-pointer px-6"
        onClick={handleAddClick}
      >
        {t('addAddress')}
      </Button>
    </Flex>
  );

  const renderAddressList = () => (
    <Box>
      <Box className="space-y-3 max-h-[400px] overflow-y-auto">
        {addresses.map((address) => (
          <Box
            key={address.id}
            className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => handleSelectAddress(address)}
          >
            <Flex justify="between" align="start">
              <Box className="flex-1">
                <Flex align="center" gap="2" mb="1">
                  <Text size="3" weight="medium" className="text-black">
                    {address.fullName}
                  </Text>
                  {address.isDefault && (
                    <StarFilledIcon className="text-blue-500" width={16} height={16} />
                  )}
                </Flex>
                <Text size="2" className="text-gray-600 block mb-1">
                  {address.phone}
                </Text>
                <Text size="2" className="text-gray-600">
                  {address.address}
                  {address.city && `, ${address.city}`}
                </Text>
              </Box>
              <Button
                variant="outline"
                size="1"
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(address);
                }}
              >
                {tCommon('buttons.edit')}
              </Button>
            </Flex>
          </Box>
        ))}
      </Box>
      <Flex justify="center" mt="4">
        <Button
          size="3"
          className="bg-black text-white hover:bg-gray-800 cursor-pointer px-6"
          onClick={handleAddClick}
        >
          {t('addAddress')}
        </Button>
      </Flex>
    </Box>
  );

  const renderAddressForm = () => (
    <Box className="space-y-4">
      {/* Full Name */}
      <Box>
        <Text size="2" weight="medium" className="text-black mb-2 block">
          {tCommon('form.fullName')}
        </Text>
        <TextField.Root
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          size="2"
        />
      </Box>

      {/* Phone */}
      <Box>
        <Text size="2" weight="medium" className="text-black mb-2 block">
          {tCommon('form.phone')}
        </Text>
        <TextField.Root
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          size="2"
        />
      </Box>

      {/* Address */}
      <Box>
        <Text size="2" weight="medium" className="text-black mb-2 block">
          {tCommon('form.address')}
        </Text>
        <TextField.Root
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          size="2"
        />
      </Box>

      {/* City Dropdown */}
      <Box>
        <Select.Root
          value={formData.city}
          onValueChange={(value) => setFormData({ ...formData, city: value })}
        >
          <Select.Trigger
            placeholder={tCommon('form.cityPlaceholder')}
            className="w-full"
          />
          <Select.Content position="popper">
            <Select.Item value="Hà Nội">Hà Nội</Select.Item>
            <Select.Item value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</Select.Item>
            <Select.Item value="Đà Nẵng">Đà Nẵng</Select.Item>
            <Select.Item value="Hải Phòng">Hải Phòng</Select.Item>
            <Select.Item value="Cần Thơ">Cần Thơ</Select.Item>
          </Select.Content>
        </Select.Root>
      </Box>

      {/* Default Checkbox */}
      <Box>
        <Text as="label" size="2">
          <Flex gap="2" align="center" className="cursor-pointer">
            <Checkbox
              checked={formData.isDefault}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isDefault: checked === true })
              }
            />
            <Text className="text-black">{tCommon('form.setAsDefault')}</Text>
          </Flex>
        </Text>
      </Box>

      {/* Buttons */}
      <Flex gap="3" mt="4">
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
          className="flex-1 bg-black text-white hover:bg-gray-800 cursor-pointer"
          onClick={handleSubmit}
        >
          {view === 'edit' ? t('saveChanges') : t('addAddress')}
        </Button>
      </Flex>
    </Box>
  );

  const getDialogTitle = () => {
    if (view === 'add') return t('addAddressTitle');
    if (view === 'edit') return t('editAddressTitle');
    return t('title');
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        onPointerDownOutside={preventDialogCloseOnToast}
        aria-describedby={undefined}
        className="rounded-[14px] w-[calc(100vw-32px)] sm:w-[420px] max-w-[420px] p-5"
        style={{ position: 'relative' }}
      >
        {/* Header with Back Button and Title */}
        <Flex
          justify="center"
          align="center"
          className="relative mb-4"
        >
          {/* Back Button - Always visible, behavior changes based on view */}
          <IconButton
            onClick={() => {
              if (view === 'list') {
                // On list view: navigate to previous page/screen
                onBack?.();
              } else {
                // On add/edit views: return to list view
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

        {/* Content based on view */}
        {view === 'list' && (
          addresses.length === 0 ? renderEmptyState() : renderAddressList()
        )}
        {(view === 'add' || view === 'edit') && renderAddressForm()}
      </Dialog.Content>
    </Dialog.Root>
  );
}
