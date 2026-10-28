import { Flex, Text } from "@radix-ui/themes";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

const highlightText = (chunks: React.ReactNode) => (
  <span
    className="bg-clip-text text-transparent whitespace-nowrap"
    style={{
      backgroundImage:
        "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)",
    }}
  >
    {chunks}
  </span>
);

export async function Section1() {
  const t = await getTranslations("deliveryPolicy.section1");

  return (
    <Flex
      direction="column"
      align="center"
      className="py-6 gap-4 border-b border-[#F0F0F0] lg:py-8 lg:gap-6"
    >
      {/* Section Header - full width with negative margin */}
      <Flex
        align="center"
        className="w-[calc(100%+40px)] -mx-5 bg-[#FDF7F1] md:w-[calc(100%+80px)] md:-mx-10 lg:w-auto lg:mx-0 lg:self-stretch"
      >
        {/* Icon box with gradient */}
        <Flex
          direction="column"
          justify="center"
          align="center"
          className="h-16 px-6 py-2 rounded-r-[32px] lg:h-20 lg:px-8 lg:rounded-r-[48px]"
          style={{
            background:
              "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)",
          }}
        >
          <Image
            src="/assets/svg/policy/delivery-icon.svg"
            alt="Delivery icon"
            width={35}
            height={24}
            className="lg:w-[45px] lg:h-[30px]"
          />
        </Flex>
        {/* Title */}
        <Text className="text-black text-sm leading-5 lg:text-lg lg:leading-7 font-semibold flex-1 px-4">
          {t.rich("title", { highlight: highlightText })}
        </Text>
      </Flex>

      {/* Description Card with background */}
      <Flex
        direction="row"
        justify="center"
        align="center"
        className="self-stretch py-8 px-4 bg-[#FDF7F1] rounded-3xl lg:py-10 lg:px-6"
      >
        <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 text-center">
          {t.rich("description", { highlight: highlightText })}
        </Text>
      </Flex>

      {/* Delivery Time Info */}
      <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 self-stretch">
        {t.rich("deliveryTimeInfo", { highlight: highlightText })}
      </Text>
    </Flex>
  );
}
