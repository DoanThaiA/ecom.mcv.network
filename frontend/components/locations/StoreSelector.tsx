'use client';

import { useState, useRef, useEffect } from 'react';
import { Box, Text, Flex } from '@radix-ui/themes';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { Store, getStoresByCity } from '@/lib/constants';
import { useTranslations } from 'next-intl';

interface StoreSelectorProps {
  selectedStore: Store;
  onSelectStore: (store: Store) => void;
}

export function StoreSelector({
  selectedStore,
  onSelectStore,
}: StoreSelectorProps) {
  const t = useTranslations('locations');
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const storeGroups = getStoresByCity();

  const handleSelectStore = (store: Store) => {
    onSelectStore(store);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <Box ref={dropdownRef} className="relative">
      {/* Title - Desktop: with border-bottom */}
      <Box className="lg:pb-4 lg:mb-4 lg:border-b lg:border-[#F0F0F0]">
        <Text className="block text-center font-semibold text-xl leading-6 mb-4 lg:mb-0 bg-gradient-to-r from-[#FAA63E] via-[#C0752F] to-[#9B5526] bg-clip-text text-transparent">
          {t('selectStore')}
        </Text>
      </Box>

      {/* Mobile: Dropdown Button */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden w-full h-10 rounded-full bg-gradient-to-r from-[#FAA63E] via-[#C0752F] to-[#9B5526] flex items-center justify-center gap-2.5 px-6 py-2 cursor-pointer hover:opacity-90 transition-opacity"
      >
        <Text className="text-white text-sm leading-6">
          {selectedStore.name}
        </Text>
        <ChevronDownIcon
          className={`w-6 h-6 text-white transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Mobile: Dropdown Menu - Popup */}
      {open && (
        <Flex
          direction="column"
          justify="center"
          align="center"
          className="lg:hidden absolute top-full left-0 right-0 mt-2 p-4 gap-2 bg-[#FDF7F1] rounded-2xl z-50 shadow-lg"
        >
          {storeGroups.map((group) => (
            <div
              key={group.city}
              className="w-full flex flex-col items-center gap-2"
            >
              {/* Group Label */}
              <Text className="text-xs leading-4 text-[#AFAFAF]">
                {group.city === 'Hà Nội'
                  ? t('storesInHanoi')
                  : t('storesInOtherCities')}
              </Text>

              {/* Store Items */}
              <div className="w-full flex flex-col gap-2">
                {group.stores.map((store) => {
                  const isSelected = store.id === selectedStore.id;
                  return (
                    <button
                      key={store.id}
                      onClick={() => handleSelectStore(store)}
                      className={`
                        w-full h-10 rounded-full flex items-center justify-center
                        px-6 py-2 gap-2.5 cursor-pointer transition-all duration-200
                        ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#FAA63E] via-[#C0752F] to-[#9B5526] text-white'
                            : 'bg-white text-black border border-[#F0F0F0] hover:border-[#FAA63E]'
                        }
                      `}
                    >
                      <Text className="text-sm leading-6">{store.name}</Text>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </Flex>
      )}

      {/* Desktop: Always visible grid */}
      <Flex
        direction="column"
        justify="center"
        align="center"
        className="hidden lg:flex gap-4"
      >
        {storeGroups.map((group) => (
          <div
            key={group.city}
            className="w-full flex flex-col items-center gap-4"
          >
            {/* Group Label */}
            <Text className="text-sm leading-5 text-[#AFAFAF]">
              {group.city === 'Hà Nội'
                ? t('storesInHanoi')
                : t('storesInOtherCities')}
            </Text>

            {/* Store Items - 2 columns grid with gap-4 */}
            <div className="w-full grid grid-cols-2 gap-4">
              {group.stores.map((store) => {
                const isSelected = store.id === selectedStore.id;
                return (
                  <button
                    key={store.id}
                    onClick={() => handleSelectStore(store)}
                    className={`
                      h-10 rounded-full flex items-center justify-center
                      px-6 py-2 gap-2.5 cursor-pointer transition-all duration-200
                      ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#FAA63E] via-[#C0752F] to-[#9B5526] text-white'
                          : 'bg-white text-black border border-[#F0F0F0] hover:border-[#FAA63E]'
                      }
                    `}
                  >
                    <Text className="text-sm leading-6">{store.name}</Text>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </Flex>
    </Box>
  );
}
