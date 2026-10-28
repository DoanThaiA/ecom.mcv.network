import { Box, Flex, Text } from "@radix-ui/themes";
import { getTranslations } from "next-intl/server";

export async function BrandPersonalitySection() {
  const t = await getTranslations("about.brandPersonality");

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

      {/* Personality Table */}
      <Box className="self-stretch rounded-t-2xl overflow-hidden">
        {/* Table Header */}
        <Flex>
          <Flex
            justify="center"
            align="center"
            className="flex-1 py-2 px-3 border-r border-[#8B5A3C] bg-[#8B5A3C]"
          >
            <Text className="text-white text-sm leading-5 lg:text-base lg:leading-6 font-semibold text-center">
              {t("archetype1")}
            </Text>
          </Flex>
          <Flex
            justify="center"
            align="center"
            className="flex-1 py-2 px-3 bg-[#8B5A3C]"
          >
            <Text className="text-white text-sm leading-5 lg:text-base lg:leading-6 font-semibold text-center">
              {t("archetype2")}
            </Text>
          </Flex>
        </Flex>

        {/* Row 1: Linh hoạt / Thận thiện - Title */}
        <Flex>
          <Flex
            justify="center"
            align="center"
            className="flex-1 py-2 px-3 bg-[#F5B755] border-r border-[#8B5A3C]"
          >
            <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 font-semibold text-center">
              {t("traits.flexible.title")}
            </Text>
          </Flex>
          <Flex
            justify="center"
            align="center"
            className="flex-1 py-2 px-3 bg-[#F5B755]"
          >
            <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 font-semibold text-center">
              {t("traits.prudent.title")}
            </Text>
          </Flex>
        </Flex>
        {/* Row 1: Description */}
        <Flex>
          <Flex
            justify="center"
            align="center"
            className="flex-1 py-3 px-3 bg-[#FDF7F1] border-r border-[#8B5A3C]"
          >
            <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 text-center">
              {t("traits.flexible.desc")}
            </Text>
          </Flex>
          <Flex
            justify="center"
            align="center"
            className="flex-1 py-3 px-3 bg-[#FDF7F1]"
          >
            <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 text-center">
              {t("traits.prudent.desc")}
            </Text>
          </Flex>
        </Flex>

        {/* Row 2: Thông minh / Đáng tin cậy - Title */}
        <Flex>
          <Flex
            justify="center"
            align="center"
            className="flex-1 py-2 px-3 bg-[#F5B755] border-r border-[#8B5A3C]"
          >
            <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 font-semibold text-center">
              {t("traits.smart.title")}
            </Text>
          </Flex>
          <Flex
            justify="center"
            align="center"
            className="flex-1 py-2 px-3 bg-[#F5B755]"
          >
            <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 font-semibold text-center">
              {t("traits.reliable.title")}
            </Text>
          </Flex>
        </Flex>
        {/* Row 2: Description */}
        <Flex>
          <Flex
            justify="center"
            align="center"
            className="flex-1 py-3 px-3 bg-[#FDF7F1] border-r border-[#8B5A3C]"
          >
            <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 text-center">
              {t("traits.smart.desc")}
            </Text>
          </Flex>
          <Flex
            justify="center"
            align="center"
            className="flex-1 py-3 px-3 bg-[#FDF7F1]"
          >
            <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 text-center">
              {t("traits.reliable.desc")}
            </Text>
          </Flex>
        </Flex>

        {/* Row 3: Lôi cuốn / Thực tế - Title */}
        <Flex>
          <Flex
            justify="center"
            align="center"
            className="flex-1 py-2 px-3 bg-[#F5B755] border-r border-[#8B5A3C]"
          >
            <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 font-semibold text-center">
              {t("traits.attractive.title")}
            </Text>
          </Flex>
          <Flex
            justify="center"
            align="center"
            className="flex-1 py-2 px-3 bg-[#F5B755]"
          >
            <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 font-semibold text-center">
              {t("traits.courteous.title")}
            </Text>
          </Flex>
        </Flex>
        {/* Row 3: Description */}
        <Flex>
          <Flex
            justify="center"
            align="center"
            className="flex-1 py-3 px-3 bg-[#FDF7F1] border-r border-[#8B5A3C]"
          >
            <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 text-center">
              {t("traits.attractive.desc")}
            </Text>
          </Flex>
          <Flex
            justify="center"
            align="center"
            className="flex-1 py-3 px-3 bg-[#FDF7F1]"
          >
            <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 text-center">
              {t("traits.courteous.desc")}
            </Text>
          </Flex>
        </Flex>

        {/* Row 4: Năng động - Title */}
        <Flex>
          <Flex
            justify="center"
            align="center"
            className="flex-1 py-2 px-3 bg-[#F5B755] border-r border-[#8B5A3C]"
          >
            <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 font-semibold text-center">
              {t("traits.energetic.title")}
            </Text>
          </Flex>
          <Flex
            justify="center"
            align="center"
            className="flex-1 py-2 px-3 bg-[#F5B755]"
          ></Flex>
        </Flex>
        {/* Row 4: Description */}
        <Flex className="border-t border-[#8B5A3C]">
          <Flex
            justify="center"
            align="center"
            className="flex-1 py-3 px-3 bg-[#FDF7F1] border-r border-[#8B5A3C]"
          >
            <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 text-center">
              {t("traits.energetic.desc")}
            </Text>
          </Flex>
          <Flex
            justify="center"
            align="center"
            className="flex-1 py-3 px-3 bg-[#FDF7F1]"
          ></Flex>
        </Flex>
      </Box>
    </Flex>
  );
}
