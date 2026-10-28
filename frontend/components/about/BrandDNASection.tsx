import { Box, Flex, Text } from "@radix-ui/themes";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export async function BrandDNASection() {
  const t = await getTranslations("about.brandDNA");

  return (
    <Flex
      direction="column"
      align="center"
      className="py-6 gap-8 border-b border-[#F0F0F0] lg:py-8 lg:gap-8"
    >
      {/* Section Header */}
      <Flex
        align="center"
        className="w-[calc(100%+40px)] -mx-5 bg-[#FDF7F1] md:w-[calc(100%+80px)] md:-mx-10 lg:w-auto lg:mx-0 lg:self-stretch"
      >
        <Flex
          justify="center"
          align="center"
          className="px-8 py-2 rounded-r-[32px]"
          style={{
            background:
              "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)",
          }}
        >
          <Text className="text-white text-[32px] leading-[48px] lg:text-[40px] lg:leading-[56px] font-semibold">
            {t("number")}
          </Text>
        </Flex>
        {/* Title */}
        <Text className="text-black text-lg leading-6 lg:text-2xl lg:leading-7 font-semibold flex-1 px-6 lg:px-8 py-2 uppercase">
          {t("title")}
        </Text>
      </Flex>

      {/* Brand DNA Content */}
      <Box className="w-[calc(100%+32px)] -mx-4 relative md:w-[calc(100%+80px)] md:-mx-10 lg:w-auto lg:mx-0 lg:self-stretch lg:my-6 overflow-visible">
        {/* DNA Image */}
        <Flex
          justify="center"
          align="center"
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-[40px] lg:w-[70px] h-[calc(100%+48px)] z-10 pointer-events-none"
        >
          <Image
            src="/assets/images/DNA.png"
            alt="DNA Helix"
            width={100}
            height={600}
            className="w-full h-full object-contain"
          />
        </Flex>

        {/* Cards Grid */}
        <Flex
          direction="column"
          className="gap-6 lg:gap-12 relative z-0 px-4 md:px-10 lg:px-0"
        >
          {/* Row 1 - 2 cards side by side on all screens */}
          <Flex className="gap-1 lg:gap-6 items-stretch">
            {/* Card 1: Định vị thương hiệu*/}
            <Flex
              direction="column"
              justify="center"
              className="flex-1 bg-[#FDF7F1] rounded-3xl rounded-br-sm p-3 lg:p-6 shadow-sm relative before:content-[''] before:absolute before:bottom-0 before:right-0 before:border-[9px] before:border-transparent before:border-t-[#FDF7F1] before:border-r-0 before:translate-x-[9px]"
            >
              <Text
                as="p"
                className="text-[#C0752F] text-xs leading-[18px] lg:text-base lg:leading-6 font-semibold mb-2 lg:mb-4 uppercase block break-words max-w-[90px] lg:max-w-none lg:break-normal lg:whitespace-nowrap"
              >
                {t("positioning.title")}
              </Text>
              <Text
                as="p"
                className="text-black text-xs leading-[18px] lg:text-sm lg:leading-5 block"
              >
                {t("positioning.description")}
              </Text>
            </Flex>

            {/* Spacer for DNA */}
            <Box className="flex-shrink-0 w-[50px] lg:w-[85px]" />

            {/* Card 2: Tính cách thương hiệu*/}
            <Flex
              direction="column"
              justify="center"
              className="flex-1 bg-[#FDF7F1] rounded-3xl rounded-bl-sm p-3 lg:p-6 shadow-sm relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:border-[9px] after:border-transparent after:border-t-[#FDF7F1] after:border-l-0 after:-translate-x-[9px]"
            >
              <Text
                as="p"
                className="text-[#C0752F] text-xs leading-[18px] lg:text-base lg:leading-6 font-semibold mb-2 lg:mb-4 uppercase block break-words max-w-[90px] lg:max-w-none lg:break-normal lg:whitespace-nowrap"
              >
                {t("personality.title")}
              </Text>
              <Text
                as="p"
                className="text-black text-xs leading-[18px] lg:text-sm lg:leading-5 block"
              >
                {t("personality.description")}
              </Text>
            </Flex>
          </Flex>

          {/* Row 2 - 2 cards side by side on all screens */}
          <Flex className="gap-1 lg:gap-6 items-stretch">
            {/* Card 3: Đặc tính cốt lõi*/}
            <Flex
              direction="column"
              justify="center"
              className="flex-1 bg-[#FDF7F1] rounded-3xl rounded-br-sm p-3 lg:p-6 shadow-sm relative before:content-[''] before:absolute before:bottom-0 before:right-0 before:border-[9px] before:border-transparent before:border-t-[#FDF7F1] before:border-r-0 before:translate-x-[9px]"
            >
              <Text
                as="p"
                className="text-[#C0752F] text-xs leading-[18px] lg:text-base lg:leading-6 font-semibold mb-2 lg:mb-4 uppercase block"
              >
                {t("coreAttribute.title")}
              </Text>
              <Text
                as="p"
                className="text-black text-xs leading-[18px] lg:text-base lg:leading-6 block"
              >
                {t("coreAttribute.description")}
              </Text>
            </Flex>

            {/* Spacer for DNA */}
            <Box className="flex-shrink-0 w-[50px] lg:w-[85px]" />

            {/* Card 4: Triết lý vận hành*/}
            <Flex
              direction="column"
              justify="center"
              className="flex-1 bg-[#FDF7F1] rounded-3xl rounded-bl-sm p-3 lg:p-6 shadow-sm relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:border-[9px] after:border-transparent after:border-t-[#FDF7F1] after:border-l-0 after:-translate-x-[9px]"
            >
              <Text
                as="p"
                className="text-[#C0752F] text-xs leading-[18px] lg:text-base lg:leading-6 font-semibold mb-2 lg:mb-4 uppercase block whitespace-normal lg:whitespace-nowrap"
              >
                {t("philosophy.title")}
              </Text>
              <Text
                as="p"
                className="text-[#C0752F] text-xs leading-[18px] lg:text-base lg:leading-6 font-semibold uppercase block"
              >
                {t("philosophy.description")}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </Flex>
  );
}
