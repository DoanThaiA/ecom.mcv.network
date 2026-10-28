'use client';

import { Box, Text } from '@radix-ui/themes';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';

interface FilterSectionProps {
  title: string;
  sectionKey?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function FilterSection({
  title,
  isOpen,
  onToggle,
  children,
}: FilterSectionProps) {
  return (
    <Box className="border-b border-gray-200 pb-4 mb-4">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex justify-between items-center mb-3 cursor-pointer bg-transparent border-none p-0"
      >
        <Text className="font-semibold text-base">{title}</Text>
        {isOpen ? (
          <ChevronUpIcon width="20" height="20" />
        ) : (
          <ChevronDownIcon width="20" height="20" />
        )}
      </button>
      {isOpen && <Box>{children}</Box>}
    </Box>
  );
}
