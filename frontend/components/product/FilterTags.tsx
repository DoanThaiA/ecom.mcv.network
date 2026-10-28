'use client';

import { Cross2Icon } from '@radix-ui/react-icons';
import { Flex, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';

export interface FilterTag {
  type: string;
  value: string;
  label: string;
}

interface FilterTagsProps {
  activeFilterTags: FilterTag[];
  onClearAllFilters: () => void;
  onRemoveFilter: (_type: string, _value: string) => void;
  className?: string;
}

export function FilterTags({
  activeFilterTags,
  onClearAllFilters,
  onRemoveFilter,
  className = '',
}: FilterTagsProps) {
  const t = useTranslations('productListing');

  if (activeFilterTags.length === 0) {
    return null;
  }

  return (
    <Flex className={`gap-2 flex-wrap ${className}`}>
      <Flex
        asChild
        align="center"
        className="text-sm cursor-pointer hover:underline transition-colors"
      >
        <button
          type="button"
          onClick={onClearAllFilters}
          className="text-sm font-semibold text-[#1564DA]"
        >
          <Text>{t('clearFilters')}</Text>
        </button>
      </Flex>
      {activeFilterTags.map((tag) => (
        <Flex
          key={`${tag.type}-${tag.value}`}
          align="center"
          justify="center"
          gap="2"
          className="px-3 py-1.5 text-sm bg-[#E3E3E3] text-black rounded-full"
        >
          <Text>{tag.label}</Text>
          <Flex
            asChild
            align="center"
            justify="center"
            className="cursor-pointer rounded-[50%] bg-[#777777] p-1"
          >
            <button
              type="button"
              onClick={() => onRemoveFilter(tag.type, tag.value)}
            >
              <Cross2Icon
                width="12"
                height="12"
                color="#FFFFFF"
                fontWeight={600}
              />
            </button>
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
}
