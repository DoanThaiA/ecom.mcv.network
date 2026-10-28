'use client';

import { useState } from 'react';
import { Box, Flex, Text } from '@radix-ui/themes';
import { ChevronDownIcon } from '@radix-ui/react-icons';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Box className="border-b border-gray-200 md:border-none">
      {/* Mobile: Collapsible header */}
      <Flex
        justify="between"
        align="center"
        className="py-4 cursor-pointer md:cursor-default"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Text className="text-sm font-semibold text-black md:text-white md:text-base md:font-bold">
          {title}
        </Text>
        <Box className="md:hidden">
          <ChevronDownIcon
            width={20}
            height={20}
            className={`text-gray-600 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </Box>
      </Flex>

      {/* Mobile: Collapsible content */}
      <Box
        className={`overflow-hidden transition-all duration-300 md:block ${
          isOpen ? 'max-h-96 pb-4' : 'max-h-0 md:max-h-none'
        }`}
      >
        {children}
      </Box>
    </Box>
  );
}
