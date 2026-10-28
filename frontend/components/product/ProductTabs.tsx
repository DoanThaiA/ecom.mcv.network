'use client';

import { Box, Text, Tabs } from '@radix-ui/themes';

interface ProductTabsProps {
  translations: {
    description: string;
    material: string;
    careInstructions: string;
    sizeGuide: string;
  };
  product: {
    description: string;
    material: string;
    careInstructions: string;
  };
}

export function ProductTabs({ translations, product }: ProductTabsProps) {
  return (
    <Tabs.Root defaultValue="description">
      <Tabs.List size="1" className="border-b border-gray-200">
        <Tabs.Trigger value="description" className="text-sm font-medium">
          {translations.description}
        </Tabs.Trigger>
        <Tabs.Trigger value="material" className="text-sm font-medium">
          {translations.material}
        </Tabs.Trigger>
        <Tabs.Trigger value="care" className="text-sm font-medium">
          {translations.careInstructions}
        </Tabs.Trigger>
        <Tabs.Trigger value="size" className="text-sm font-medium">
          {translations.sizeGuide}
        </Tabs.Trigger>
      </Tabs.List>

      <Box className="pt-5">
        <Tabs.Content value="description">
          <Text className="text-gray-700 leading-relaxed text-sm">
            {product.description}
          </Text>
        </Tabs.Content>

        <Tabs.Content value="material">
          <Text className="text-gray-700 leading-relaxed text-sm">
            {product.material}
          </Text>
        </Tabs.Content>

        <Tabs.Content value="care">
          <Text className="text-gray-700 leading-relaxed text-sm">
            {product.careInstructions}
          </Text>
        </Tabs.Content>

        <Tabs.Content value="size">
          <Box>
            <Text className="text-gray-700 leading-relaxed text-sm mb-4">
              Hướng dẫn chọn size:
            </Text>
            <Box className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Box className="border border-gray-200 rounded-md p-3 text-center">
                <Text className="font-bold text-base mb-1">XS</Text>
                <Text className="text-xs text-gray-600">Vòng ngực: 80-84cm</Text>
              </Box>
              <Box className="border border-gray-200 rounded-md p-3 text-center">
                <Text className="font-bold text-base mb-1">S</Text>
                <Text className="text-xs text-gray-600">Vòng ngực: 84-88cm</Text>
              </Box>
              <Box className="border border-gray-200 rounded-md p-3 text-center">
                <Text className="font-bold text-base mb-1">M</Text>
                <Text className="text-xs text-gray-600">Vòng ngực: 88-92cm</Text>
              </Box>
              <Box className="border border-gray-200 rounded-md p-3 text-center">
                <Text className="font-bold text-base mb-1">L</Text>
                <Text className="text-xs text-gray-600">Vòng ngực: 92-96cm</Text>
              </Box>
            </Box>
          </Box>
        </Tabs.Content>
      </Box>
    </Tabs.Root>
  );
}
