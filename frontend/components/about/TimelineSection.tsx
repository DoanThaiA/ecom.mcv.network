import { Box, Flex, Text } from "@radix-ui/themes";
import { getTranslations } from "next-intl/server";

export async function TimelineSection() {
  const t = await getTranslations("about.timeline");

  const milestones = [
    { yearKey: "years.2018", itemKey: "items.2018" },
    { yearKey: "years.2019", itemKey: "items.2019" },
    { yearKey: "years.2020", itemKey: "items.2020" },
    { yearKey: "years.2021-now", itemKey: "items.2021-now" },
  ];

  return (
    <Flex
      id="timeline"
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
      <Text className="text-black self-stretch text-base leading-6 lg:text-lg lg:leading-7">
        {t("description")}
      </Text>

      {/* Milestones List */}
      <Box className="self-stretch">
        {milestones.map((milestone, index) => (
          <Flex key={index} align="start" className="gap-2 mb-2">
            <Text className="text-black text-base leading-6 lg:text-lg lg:leading-7">
              •{" "}
              <Text as="span" weight="bold">
                {t(milestone.yearKey)}:
              </Text>{" "}
              {t(milestone.itemKey)}
            </Text>
          </Flex>
        ))}
      </Box>
    </Flex>
  );
}
