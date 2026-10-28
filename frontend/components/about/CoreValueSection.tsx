import { Box, Flex, Text } from "@radix-ui/themes";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export async function CoreValueSection() {
  const t = await getTranslations("about.coreValue");

  return (
    <Flex
      direction="column"
      align="center"
      className="py-6 gap-4 border-b border-[#F0F0F0] lg:py-8 lg:gap-6"
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
        <Text className="text-black text-lg leading-6 lg:text-2xl lg:leading-7 font-semibold flex-1 px-4 uppercase">
          {t("title")}
        </Text>
      </Flex>

      {/* Description */}
      <Text className="text-black text-base leading-6 lg:text-lg lg:leading-7 self-stretch">
        {t("intro")}
      </Text>

      {/* Core Values Diagram - break out of container padding */}
      <Box className="w-[calc(100%+40px)] -mx-5 md:w-[calc(100%+80px)] md:-mx-10 lg:w-full lg:mx-0">
        <Image
          src="/assets/images/core values.png"
          alt="CCHAT Core Values"
          width={402}
          height={512}
          className="w-full h-auto"
                  />
      </Box>

      {/* Conclusion */}
      <Text className="text-black text-base leading-6 lg:text-lg lg:leading-7 self-stretch">
        {t("conclusion")}
      </Text>
    </Flex>
  );
}
