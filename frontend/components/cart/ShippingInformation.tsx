'use client';

import { useState } from 'react';
import { Box, Flex, Text, TextField, Button, RadioGroup, Separator } from '@radix-ui/themes';
import {
  PersonIcon,
  EnvelopeClosedIcon,
  MobileIcon,
  HomeIcon,
  ClockIcon,
  CheckCircledIcon,
  RocketIcon,
} from '@radix-ui/react-icons';

interface ShippingInformationProps {
  translations: {
    title: string;
    fullName: string;
    fullNamePlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    address: string;
    addressPlaceholder: string;
    city: string;
    district: string;
    ward: string;
    notes: string;
    notesPlaceholder: string;
    shippingMethod: string;
    standard: string;
    express: string;
    standardDesc: string;
    expressDesc: string;
    estimatedDelivery: string;
    saveAddress: string;
    proceedToPayment: string;
  };
  onContinue?: () => void;
}

export function ShippingInformation({ translations, onContinue }: ShippingInformationProps) {
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [saveAddress, setSaveAddress] = useState(false);

  const getEstimatedDelivery = () => {
    const today = new Date();
    const deliveryDays = shippingMethod === 'express' ? 1 : 3;
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + deliveryDays);

    return deliveryDate.toLocaleDateString('vi-VN', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-fadeIn">
      {/* Header */}
      <Box className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <Flex align="center" gap="3">
          <Box className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <HomeIcon className="text-white" width="20" height="20" />
          </Box>
          <Box>
            <Text size="5" weight="bold" className="text-white block">
              {translations.title}
            </Text>
            <Text size="2" className="text-blue-100">
              {translations.estimatedDelivery}: {getEstimatedDelivery()}
            </Text>
          </Box>
        </Flex>
      </Box>

      {/* Content */}
      <Box className="p-6">
        <Flex direction="column" gap="5">
          {/* Contact Information Section */}
          <Box>
            <Text size="3" weight="bold" className="mb-4 block text-gray-900">
              Contact Information
            </Text>

            <Flex direction="column" gap="4">
              {/* Full Name */}
              <Box>
                <label className="flex items-center gap-2 mb-2">
                  <PersonIcon className="text-gray-600" width="16" height="16" />
                  <Text size="2" weight="medium" className="text-gray-700">
                    {translations.fullName}
                  </Text>
                </label>
                <TextField.Root
                  size="3"
                  placeholder={translations.fullNamePlaceholder}
                  className="w-full"
                />
              </Box>

              {/* Phone & Email Row */}
              <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
                <Box className="flex-1">
                  <label className="flex items-center gap-2 mb-2">
                    <MobileIcon className="text-gray-600" width="16" height="16" />
                    <Text size="2" weight="medium" className="text-gray-700">
                      {translations.phone}
                    </Text>
                  </label>
                  <TextField.Root
                    size="3"
                    placeholder={translations.phonePlaceholder}
                    type="tel"
                    className="w-full"
                  />
                </Box>

                <Box className="flex-1">
                  <label className="flex items-center gap-2 mb-2">
                    <EnvelopeClosedIcon className="text-gray-600" width="16" height="16" />
                    <Text size="2" weight="medium" className="text-gray-700">
                      {translations.email}
                    </Text>
                  </label>
                  <TextField.Root
                    size="3"
                    placeholder={translations.emailPlaceholder}
                    type="email"
                    className="w-full"
                  />
                </Box>
              </Flex>
            </Flex>
          </Box>

          <Separator size="4" />

          {/* Delivery Address Section */}
          <Box>
            <Text size="3" weight="bold" className="mb-4 block text-gray-900">
              Delivery Address
            </Text>

            <Flex direction="column" gap="4">
              {/* Address */}
              <Box>
                <label className="flex items-center gap-2 mb-2">
                  <HomeIcon className="text-gray-600" width="16" height="16" />
                  <Text size="2" weight="medium" className="text-gray-700">
                    {translations.address}
                  </Text>
                </label>
                <TextField.Root
                  size="3"
                  placeholder={translations.addressPlaceholder}
                  className="w-full"
                />
              </Box>

              {/* City, District, Ward */}
              <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
                <Box className="flex-1">
                  <Text size="2" weight="medium" className="text-gray-700 mb-2 block">
                    {translations.city}
                  </Text>
                  <select className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
                    <option value="">Select city</option>
                    <option value="hanoi">Hà Nội</option>
                    <option value="hcm">Hồ Chí Minh</option>
                    <option value="danang">Đà Nẵng</option>
                  </select>
                </Box>

                <Box className="flex-1">
                  <Text size="2" weight="medium" className="text-gray-700 mb-2 block">
                    {translations.district}
                  </Text>
                  <select className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
                    <option value="">Select district</option>
                  </select>
                </Box>

                <Box className="flex-1">
                  <Text size="2" weight="medium" className="text-gray-700 mb-2 block">
                    {translations.ward}
                  </Text>
                  <select className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
                    <option value="">Select ward</option>
                  </select>
                </Box>
              </Flex>

              {/* Notes */}
              <Box>
                <Text size="2" weight="medium" className="text-gray-700 mb-2 block">
                  {translations.notes}
                </Text>
                <textarea
                  placeholder={translations.notesPlaceholder}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                />
              </Box>
            </Flex>
          </Box>

          <Separator size="4" />

          {/* Shipping Method Section */}
          <Box>
            <Flex align="center" gap="2" className="mb-4">
              <RocketIcon className="text-gray-900" width="18" height="18" />
              <Text size="3" weight="bold" className="text-gray-900">
                {translations.shippingMethod}
              </Text>
            </Flex>

            <RadioGroup.Root value={shippingMethod} onValueChange={setShippingMethod}>
              <Flex direction="column" gap="3">
                {/* Standard Shipping */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    shippingMethod === 'standard'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <RadioGroup.Item value="standard" className="mt-1" />
                  <Box className="flex-1">
                    <Flex justify="between" align="start" className="mb-1">
                      <Text size="3" weight="bold" className="text-gray-900">
                        {translations.standard}
                      </Text>
                      <Flex align="center" gap="1" className="bg-green-100 px-2 py-1 rounded-md">
                        <CheckCircledIcon className="text-green-600" width="14" height="14" />
                        <Text size="1" weight="bold" className="text-green-700">
                          FREE
                        </Text>
                      </Flex>
                    </Flex>
                    <Text size="2" className="text-gray-600">
                      {translations.standardDesc}
                    </Text>
                    <Flex align="center" gap="1" className="mt-2">
                      <ClockIcon className="text-gray-500" width="14" height="14" />
                      <Text size="1" className="text-gray-500">
                        Estimated delivery: 3-5 business days
                      </Text>
                    </Flex>
                  </Box>
                </label>

                {/* Express Shipping */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    shippingMethod === 'express'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <RadioGroup.Item value="express" className="mt-1" />
                  <Box className="flex-1">
                    <Flex justify="between" align="start" className="mb-1">
                      <Flex align="center" gap="2">
                        <Text size="3" weight="bold" className="text-gray-900">
                          {translations.express}
                        </Text>
                        <Box className="bg-gradient-to-r from-orange-400 to-red-500 px-2 py-0.5 rounded-full">
                          <Text size="1" weight="bold" className="text-white">
                            Fast
                          </Text>
                        </Box>
                      </Flex>
                      <Text size="3" weight="bold" className="text-gray-900">
                        30,000đ
                      </Text>
                    </Flex>
                    <Text size="2" className="text-gray-600">
                      {translations.expressDesc}
                    </Text>
                    <Flex align="center" gap="1" className="mt-2">
                      <ClockIcon className="text-gray-500" width="14" height="14" />
                      <Text size="1" className="text-gray-500">
                        Estimated delivery: 1-2 business days
                      </Text>
                    </Flex>
                  </Box>
                </label>
              </Flex>
            </RadioGroup.Root>
          </Box>

          {/* Save Address Checkbox */}
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={saveAddress}
              onChange={(e) => setSaveAddress(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            />
            <Box>
              <Text size="2" weight="medium" className="text-gray-900 block">
                {translations.saveAddress}
              </Text>
              <Text size="1" className="text-gray-600">
                Save this address for faster checkout next time
              </Text>
            </Box>
          </label>

          {/* Continue Button */}
          <Button
            size="4"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg mt-2"
            onClick={onContinue}
          >
            <CheckCircledIcon width="18" height="18" />
            {translations.proceedToPayment}
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
