import { Box, Flex, Text } from '@radix-ui/themes';

interface FeatureItemProps {
  iconSrc: string;
  iconAlt: string;
  title: string;
  description: string;
}

export function FeatureItem({
  iconSrc,
  iconAlt,
  title,
  description,
}: FeatureItemProps) {
  return (
    <Flex gap="2" align="start" className="flex-1 min-w-[140px] lg:min-w-[200px]">
      <img src={iconSrc} alt={iconAlt} className="w-5 h-5 lg:w-7 lg:h-7 flex-shrink-0" />
      <Box>
        <Text
          size="3"
          weight="medium"
          className="block text-black text-sm lg:text-base lg:leading-6"
        >
          {title}
        </Text>
        <Text
          size="2"
          className="text-black text-xs lg:text-sm lg:leading-5"
        >
          {description}
        </Text>
      </Box>
    </Flex>
  );
}
