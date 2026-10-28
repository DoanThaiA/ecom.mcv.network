import { Box, Flex, Text } from "@radix-ui/themes";
import { getTranslations } from "next-intl/server";

export async function HeroSection() {
  const t = await getTranslations("about.hero");

  return (
    <Box className="flex flex-col justify-center items-start border-b border-[#F0F0F0] pt-12 pb-6 gap-4 lg:pt-20 lg:pb-8 lg:gap-6">
      {/* Title */}
      <Text className="text-black font-semibold uppercase self-stretch whitespace-pre-line text-3xl leading-9 lg:text-5xl lg:leading-[56px]">
        {t("title")}
      </Text>

      {/* Description */}
      <Flex
        justify="center"
        align="center"
        className="w-[calc(100%+40px)] -mx-5 p-6 bg-[#FDF7F1] md:w-[calc(100%+80px)] md:-mx-10 md:p-8 lg:w-auto lg:mx-0 lg:self-stretch"
      >
        <Text className="text-black text-base leading-6 lg:text-lg lg:leading-7 text-center">
          {t("descriptionPart1")}
          <Text
            as="span"
            className="bg-clip-text text-transparent font-semibold"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)",
            }}
          >
            {t("smartCasual")}
          </Text>
          {t("descriptionPart2")}
        </Text>
      </Flex>

      {/* Slogan */}
      <Flex
        justify="center"
        align="center"
        className="self-stretch px-4 py-2 border border-[#F0F0F0] rounded-[100px]"
      >
        <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 text-center whitespace-nowrap">
          {t("slogan")}
        </Text>
      </Flex>
    </Box>
  );
}
