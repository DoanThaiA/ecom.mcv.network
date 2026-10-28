import { Box, Flex, Text } from "@radix-ui/themes";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

function EyeIcon() {
  return (
    <Box className="w-6 h-6 lg:w-7 lg:h-7 bg-white border border-[#F0F0F0] rounded-full flex items-center justify-center flex-shrink-0">
      <Image
        src="/assets/svg/eye-icon.svg"
        alt="eye icon"
        width={16}
        height={10}
      />
    </Box>
  );
}

export async function VisionMissionSection() {
  const t = await getTranslations("about.visionMission");

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

      {/* Vision Tab */}
      <Flex
        align="center"
        gap="2"
        className="px-4 py-2 bg-[#F0F0F0] rounded-3xl self-start"
      >
        <EyeIcon />
        <Text className="text-black text-base leading-6 lg:text-lg lg:leading-7 font-semibold uppercase">
          {t("tabs.vision")}
        </Text>
      </Flex>

      {/* Vision Content */}
      <Text className="text-black text-base leading-6 lg:text-lg lg:leading-7 self-stretch">
        {t("vision.part1")}
        <span
          className="bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)",
          }}
        >
          {t("vision.highlight1")}
        </span>
        {t("vision.part2")}
        <span
          className="bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)",
          }}
        >
          {t("vision.highlight2")}
        </span>
        {t("vision.part3")}
        <span
          className="bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)",
          }}
        >
          {t("vision.highlight3")}
        </span>
        {t("vision.part4")}
      </Text>

      {/* Mission Tab */}
      <Flex
        align="center"
        gap="2"
        className="px-4 py-2 bg-[#F0F0F0] rounded-3xl self-start"
      >
        <EyeIcon />
        <Text className="text-black text-base leading-6 lg:text-lg lg:leading-7 font-semibold uppercase">
          {t("tabs.mission")}
        </Text>
      </Flex>

      {/* Mission Content */}
      <Text
        className="text-base leading-6 lg:text-lg lg:leading-7 self-stretch bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)",
        }}
      >
        {t("mission.description")}
      </Text>
    </Flex>
  );
}
